import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  bookingId: string;
  totalAmount: number;
  listingName: string;
  nights: number;
  cardData?: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
    name: string;
    email: string;
    phone: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, totalAmount, listingName, nights, cardData }: CheckoutRequest = await req.json();

    console.log("Processing payment for booking:", bookingId, cardData ? "with card data" : "creating checkout session");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    if (cardData) {
      // Direct card processing
      try {
        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(totalAmount * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            booking_id: bookingId,
            listing_name: listingName,
            nights: nights.toString(),
          },
          description: `حجز ${listingName} - ${nights} ليلة`,
        });

        // Create payment method
        const paymentMethod = await stripe.paymentMethods.create({
          type: 'card',
          card: {
            number: cardData.number,
            exp_month: cardData.exp_month,
            exp_year: cardData.exp_year,
            cvc: cardData.cvc,
          },
          billing_details: {
            name: cardData.name,
            email: cardData.email,
            phone: cardData.phone,
          },
        });

        // Attach payment method to payment intent
        await stripe.paymentIntents.update(paymentIntent.id, {
          payment_method: paymentMethod.id,
        });

        // Confirm the payment
        const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id);

        if (confirmedPaymentIntent.status === 'succeeded') {
          console.log("Payment successful:", confirmedPaymentIntent.id);
          
          return new Response(JSON.stringify({ 
            success: true,
            paymentIntentId: confirmedPaymentIntent.id,
            status: 'succeeded'
          }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          });
        } else {
          throw new Error(`Payment failed: ${confirmedPaymentIntent.status}`);
        }

      } catch (cardError: any) {
        console.error("Card processing error:", cardError);
        return new Response(
          JSON.stringify({ 
            error: cardError.message || "Card processing failed",
            details: cardError.decline_code || cardError.code
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    } else {
      // Create checkout session (existing flow)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `حجز ${listingName}`,
                description: `إقامة لمدة ${nights} ليلة`,
              },
              unit_amount: Math.round(totalAmount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.get('origin')}/payment-success?booking_id=${bookingId}`,
        cancel_url: `${req.headers.get('origin')}/property-details?payment=cancelled`,
        metadata: {
          booking_id: bookingId,
        },
      });

      // Update booking with Stripe session ID
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      await supabaseClient
        .from('bookings')
        .update({ stripe_payment_intent_id: session.id })
        .eq('id', bookingId);

      console.log("Stripe checkout session created:", session.id);

      return new Response(JSON.stringify({ url: session.url }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
  } catch (error: any) {
    console.error("Error in create-stripe-checkout function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);