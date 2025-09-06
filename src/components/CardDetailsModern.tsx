import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  Lock, 
  Shield, 
  Check, 
  AlertTriangle,
  X,
  Loader2,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Initialize Stripe - Add your publishable key to .env
const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface CardDetailsModernProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentIntentId: string) => void;
  amount: number;
  bookingId: string;
  listingName: string;
  nights: number;
}

interface BillingData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

const CardDetailsForm = ({ 
  onClose, 
  onSuccess, 
  amount, 
  bookingId, 
  listingName, 
  nights 
}: Omit<CardDetailsModernProps, 'isOpen'>) => {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [billingData, setBillingData] = useState<BillingData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Syria'
  });

  const isRTL = language === 'ar';

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: '400',
        letterSpacing: '0.025em',
        '::placeholder': {
          color: '#6b7280',
        },
        iconColor: '#6b7280',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
      complete: {
        color: '#10b981',
        iconColor: '#10b981',
      },
    },
    hidePostalCode: true,
    iconStyle: 'solid' as const,
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!billingData.name.trim()) {
      newErrors.name = language === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    }

    if (!billingData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingData.email)) {
      newErrors.email = language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address';
    }

    if (!billingData.phone || billingData.phone.length < 8) {
      newErrors.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    }

    if (!cardComplete) {
      newErrors.card = language === 'ar' ? 'بيانات البطاقة مطلوبة' : 'Card details are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      // Create payment intent through your Supabase function
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          bookingId,
          totalAmount: amount,
          listingName,
          nights,
          billingData
        }
      });

      if (paymentError) throw paymentError;

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.clientSecret,
        {
          payment_method: {
            card: cardElement!,
            billing_details: {
              name: billingData.name,
              email: billingData.email,
              phone: billingData.phone,
              address: {
                line1: billingData.address,
                city: billingData.city,
                country: 'SY', // Syria
              },
            },
          }
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        // Update booking status
        await supabase
          .from('bookings')
          .update({ 
            stripe_payment_intent_id: paymentIntent.id,
            status: 'confirmed'
          })
          .eq('id', bookingId);

        // Send booking confirmation email
        try {
          const { data: bookingData } = await supabase
            .from('bookings')
            .select(`
              *,
              listing:listings!bookings_listing_id_fkey(name, location),
              guest:profiles!bookings_guest_id_fkey(email, full_name)
            `)
            .eq('id', bookingId)
            .single();

          if (bookingData) {
            await supabase.functions.invoke('send-booking-confirmation', {
              body: {
                guestEmail: bookingData.guest.email,
                guestName: bookingData.guest.full_name || bookingData.guest.email,
                listingName: bookingData.listing.name,
                listingLocation: bookingData.listing.location,
                checkInDate: bookingData.check_in_date,
                checkOutDate: bookingData.check_out_date,
                totalNights: bookingData.total_nights,
                totalAmount: bookingData.total_amount_usd,
                paymentMethod: 'stripe',
                bookingId: bookingData.id
              }
            });
          }
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the payment if email fails
        }

        toast({
          title: language === 'ar' ? "تم الدفع بنجاح!" : "Payment Successful!",
          description: language === 'ar' ? "تم تأكيد حجزك" : "Your booking has been confirmed",
          variant: "default",
        });

        onSuccess(paymentIntent.id);
        onClose();
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: language === 'ar' ? "خطأ في الدفع" : "Payment Failed",
        description: error.message || (language === 'ar' ? "حدث خطأ أثناء معالجة الدفع" : "An error occurred while processing payment"),
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleInputChange = (field: keyof BillingData, value: string) => {
    setBillingData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {language === 'ar' ? 'تأكيد الحجز والدفع' : 'Confirm and Pay'}
              </h1>
              <p className="text-gray-600">
                {language === 'ar' ? `${nights} ليلة في ${listingName}` : `${nights} nights in ${listingName}`}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Price Summary */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}
              </p>
              <p className="text-3xl font-bold text-gray-900">${amount}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {language === 'ar' ? `${nights} ليلة` : `${nights} nights`}
              </p>
              <p className="text-sm text-green-600 font-medium">
                {language === 'ar' ? 'أفضل سعر مضمون' : 'Best price guaranteed'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-xl">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {language === 'ar' ? 'بيانات الدفع' : 'Payment Details'}
            </h2>
          </div>

          {/* Card Element */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">
              {language === 'ar' ? 'بيانات البطاقة' : 'Card Information'}
            </Label>
            <div className="relative">
              <div className="border border-gray-300 rounded-xl p-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                <CardElement
                  options={cardElementOptions}
                  onChange={(event) => {
                    setCardComplete(event.complete);
                    if (event.error) {
                      setErrors(prev => ({ ...prev, card: event.error!.message }));
                    } else {
                      setErrors(prev => ({ ...prev, card: '' }));
                    }
                  }}
                />
              </div>
              {errors.card && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 text-red-500 text-sm"
                >
                  <AlertTriangle className="h-4 w-4" />
                  {errors.card}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Lock className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {language === 'ar' ? 'معلومات الفاتورة' : 'Billing Information'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              </Label>
              <Input
                id="name"
                value={billingData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`mt-2 h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : ''
                }`}
                placeholder={language === 'ar' ? 'أحمد محمد' : 'John Smith'}
              />
              {errors.name && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 text-red-500 text-sm"
                >
                  <AlertTriangle className="h-4 w-4" />
                  {errors.name}
                </motion.div>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </Label>
              <Input
                id="email"
                type="email"
                value={billingData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`mt-2 h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : ''
                }`}
                placeholder={language === 'ar' ? 'ahmed@example.com' : 'john@example.com'}
              />
              {errors.email && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 text-red-500 text-sm"
                >
                  <AlertTriangle className="h-4 w-4" />
                  {errors.email}
                </motion.div>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={billingData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`mt-2 h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : ''
                }`}
                placeholder="+963 123 456 789"
              />
              {errors.phone && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 text-red-500 text-sm"
                >
                  <AlertTriangle className="h-4 w-4" />
                  {errors.phone}
                </motion.div>
              )}
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'العنوان' : 'Address'}
              </Label>
              <Input
                id="address"
                value={billingData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="mt-2 h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder={language === 'ar' ? 'شارع الثورة 123' : '123 Main Street'}
              />
            </div>

            {/* City */}
            <div>
              <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'المدينة' : 'City'}
              </Label>
              <Input
                id="city"
                value={billingData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="mt-2 h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder={language === 'ar' ? 'دمشق' : 'Damascus'}
              />
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-green-100 rounded-xl flex-shrink-0">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {language === 'ar' ? 'الدفع الآمن' : 'Secure Payment'}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {language === 'ar' 
                  ? 'معلوماتك محمية بأعلى معايير الأمان. نحن نستخدم تشفير SSL وتقنيات Stripe المتقدمة لحماية بياناتك المالية.'
                  : 'Your information is protected with bank-level security. We use SSL encryption and advanced Stripe technology to keep your financial data safe.'
                }
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Lock className="h-3 w-3" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Zap className="h-3 w-3" />
                  <span>Powered by Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 h-14 rounded-xl border-2 font-medium"
            disabled={processing}
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            type="submit"
            disabled={processing || !stripe || !cardComplete}
            className="flex-1 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium text-lg shadow-lg transition-all duration-200"
          >
            <AnimatePresence mode="wait">
              {processing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                </motion.div>
              ) : (
                <motion.div
                  key="pay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <Check className="h-5 w-5" />
                  {language === 'ar' ? `ادفع $${amount}` : `Pay $${amount}`}
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </form>
    </div>
  );
};

const CardDetailsModern: React.FC<CardDetailsModernProps> = (props) => {
  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-gray-50">
        <div className="p-8">
          <Elements stripe={stripePromise}>
            <CardDetailsForm {...props} />
          </Elements>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardDetailsModern;
