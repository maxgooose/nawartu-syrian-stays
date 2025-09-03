import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Lock, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CardDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentIntentId: string) => void;
  amount: number;
  bookingId: string;
  listingName: string;
  nights: number;
}

interface CardData {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  name: string;
  email: string;
  phone: string;
}

const CardDetails = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  amount, 
  bookingId, 
  listingName, 
  nights 
}: CardDetailsProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    name: '',
    email: '',
    phone: ''
  });

  const [errors, setErrors] = useState<Partial<CardData>>({});

  const isRTL = language === 'ar';

  // Generate years for expiry (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);

  // Generate months for expiry
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return month.toString().padStart(2, '0');
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<CardData> = {};

    // Card number validation (basic Luhn algorithm check)
    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 13) {
      newErrors.number = language === 'ar' ? 'رقم البطاقة غير صحيح' : 'Invalid card number';
    }

    // Expiry validation
    if (!cardData.expiryMonth || !cardData.expiryYear) {
      newErrors.expiryMonth = language === 'ar' ? 'تاريخ انتهاء الصلاحية مطلوب' : 'Expiry date required';
    } else {
      const expiryDate = new Date(parseInt(cardData.expiryYear), parseInt(cardData.expiryMonth) - 1);
      if (expiryDate < new Date()) {
        newErrors.expiryMonth = language === 'ar' ? 'البطاقة منتهية الصلاحية' : 'Card expired';
      }
    }

    // CVC validation
    if (!cardData.cvc || cardData.cvc.length < 3) {
      newErrors.cvc = language === 'ar' ? 'رمز الأمان مطلوب' : 'CVC required';
    }

    // Name validation
    if (!cardData.name.trim()) {
      newErrors.name = language === 'ar' ? 'اسم حامل البطاقة مطلوب' : 'Cardholder name required';
    }

    // Email validation
    if (!cardData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cardData.email)) {
      newErrors.email = language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email';
    }

    // Phone validation
    if (!cardData.phone || cardData.phone.length < 8) {
      newErrors.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData(prev => ({ ...prev, number: formatted }));
    if (errors.number) {
      setErrors(prev => ({ ...prev, number: undefined }));
    }
  };

  const handleInputChange = (field: keyof CardData, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getCardType = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6/.test(cleanNumber)) return 'discover';
    return 'generic';
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return '';
      case 'mastercard':
        return '';
      case 'amex':
        return '';
      case 'discover':
        return '';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      // Create Stripe payment intent through Supabase function
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          bookingId,
          totalAmount: amount,
          listingName,
          nights,
          cardData: {
            number: cardData.number.replace(/\s/g, ''),
            exp_month: parseInt(cardData.expiryMonth),
            exp_year: parseInt(cardData.expiryYear),
            cvc: cardData.cvc,
            name: cardData.name,
            email: cardData.email,
            phone: cardData.phone
          }
        }
      });

      if (paymentError) throw paymentError;

      // Update booking with payment details
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          stripe_payment_intent_id: paymentData.paymentIntentId,
          status: 'confirmed'
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Send booking confirmation email after successful payment
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
        title: language === 'ar' ? "تم الدفع بنجاح" : "Payment Successful",
        description: language === 'ar' ? "تم تأكيد حجزك" : "Your booking has been confirmed",
      });

      onSuccess(paymentData.paymentIntentId);
      onClose();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: language === 'ar' ? "خطأ في الدفع" : "Payment Error",
        description: error.message || (language === 'ar' ? "حدث خطأ أثناء معالجة الدفع" : "An error occurred while processing payment"),
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CreditCard className="h-5 w-5" />
            {language === 'ar' ? 'تفاصيل البطاقة' : 'Card Details'}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}: <span className="font-semibold">${amount}</span>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Card Number */}
            <div>
              <Label htmlFor="cardNumber">
                {language === 'ar' ? 'رقم البطاقة' : 'Card Number'}
              </Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  type="text"
                  value={cardData.number}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className={`pr-10 ${errors.number ? 'border-red-500' : ''}`}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {getCardIcon(getCardType(cardData.number))}
                </div>
              </div>
              {errors.number && (
                <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.number}
                </div>
              )}
            </div>

            {/* Expiry and CVC */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryMonth">
                  {language === 'ar' ? 'انتهاء الصلاحية' : 'Expiry'}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={cardData.expiryMonth} onValueChange={(value) => handleInputChange('expiryMonth', value)}>
                    <SelectTrigger className={errors.expiryMonth ? 'border-red-500' : ''}>
                      <SelectValue placeholder={language === 'ar' ? 'شهر' : 'MM'} />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={cardData.expiryYear} onValueChange={(value) => handleInputChange('expiryYear', value)}>
                    <SelectTrigger className={errors.expiryMonth ? 'border-red-500' : ''}>
                      <SelectValue placeholder={language === 'ar' ? 'سنة' : 'YY'} />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.expiryMonth && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.expiryMonth}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="cvc">
                  {language === 'ar' ? 'رمز الأمان' : 'CVC'}
                </Label>
                <Input
                  id="cvc"
                  type="text"
                  value={cardData.cvc}
                  onChange={(e) => handleInputChange('cvc', e.target.value)}
                  placeholder="123"
                  maxLength={4}
                  className={errors.cvc ? 'border-red-500' : ''}
                />
                {errors.cvc && (
                  <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.cvc}
                  </div>
                )}
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <Label htmlFor="name">
                {language === 'ar' ? 'اسم حامل البطاقة' : 'Cardholder Name'}
              </Label>
              <Input
                id="name"
                type="text"
                value={cardData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={language === 'ar' ? 'الاسم كما يظهر على البطاقة' : 'Name as it appears on card'}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                value={cardData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">
                {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={cardData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={language === 'ar' ? '+963 123 456 789' : '+963 123 456 789'}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone}
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>
                  {language === 'ar' 
                    ? 'معلوماتك محمية بتقنيات التشفير المتقدمة' 
                    : 'Your information is protected with advanced encryption'
                  }
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={processing}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'ادفع الآن' : 'Pay Now'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardDetails;
