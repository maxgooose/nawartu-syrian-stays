import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ListingConfirmationRequest {
  hostEmail: string;
  hostName: string;
  listingName: string;
  listingLocation: string;
  listingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hostEmail, hostName, listingName, listingLocation, listingId }: ListingConfirmationRequest = await req.json();

    console.log("Sending listing confirmation email to:", hostEmail);

    const emailResponse = await resend.emails.send({
      from: "Nawartu <onboarding@resend.dev>",
      to: [hostEmail],
      subject: "تأكيد استلام طلب إضافة العقار - نوارتو",
      html: `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">نوارتو</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">منصة الضيافة الأولى</p>
          </div>
          
          <div style="padding: 40px 20px;">
            <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">مرحباً ${hostName}!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              شكراً لك على إضافة عقارك إلى منصة نوارتو. لقد تم استلام طلبك بنجاح ونحن نراجعه حالياً.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">تفاصيل العقار المُرسل:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>اسم العقار:</strong> ${listingName}</p>
              <p style="margin: 5px 0; color: #666;"><strong>الموقع:</strong> ${listingLocation}</p>
              <p style="margin: 5px 0; color: #666;"><strong>رقم المرجع:</strong> ${listingId}</p>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; border-right: 4px solid #2196f3; margin: 20px 0;">
              <h3 style="color: #1565c0; margin-bottom: 10px; font-size: 16px;">الخطوات التالية:</h3>
              <ul style="color: #666; line-height: 1.6; margin: 0; padding-right: 20px;">
                <li>سيتم مراجعة عقارك من قبل فريقنا خلال 24-48 ساعة</li>
                <li>سنتحقق من جودة الصور والمعلومات المقدمة</li>
                <li>بعد الموافقة، سيظهر عقارك على المنصة مباشرة</li>
                <li>ستتمكن من إدارة حجوزاتك من لوحة المضيف</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.app') || 'https://your-app-url.com'}/host-dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                انتقل إلى لوحة المضيف
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; line-height: 1.5; margin-top: 30px;">
              إذا كانت لديك أي أسئلة، لا تتردد في التواصل معنا. نحن هنا لمساعدتك في رحلة الضيافة.
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              © ${new Date().getFullYear()} نوارتو - منصة الضيافة الأولى
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-listing-confirmation function:", error);
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