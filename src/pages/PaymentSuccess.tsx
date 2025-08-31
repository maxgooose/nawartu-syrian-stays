import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, MapPin, Users, CreditCard, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface BookingDetails {
  id: string;
  check_in_date: string;
  check_out_date: string;
  total_nights: number;
  total_amount_usd: number;
  payment_method: string;
  listing: {
    name: string;
    location: string;
  };
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else {
      navigate('/guest-dashboard');
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          listing:listings!bookings_listing_id_fkey(name, location)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;

      setBooking(data);

      // Update booking status to confirmed if it was a Stripe payment
      if (data.payment_method === 'stripe' && data.status === 'pending') {
        await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', bookingId);
      }

      toast({
        title: language === 'ar' ? "تم الدفع بنجاح" : "Payment Successful",
        description: language === 'ar' 
          ? "تم تأكيد حجزك وسيتواصل معك فريقنا قريباً"
          : "Your booking has been confirmed and our team will contact you soon",
      });

    } catch (error: any) {
      console.error('Error fetching booking details:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' 
          ? "لم يتم العثور على تفاصيل الحجز"
          : "Booking details not found",
        variant: "destructive",
      });
      navigate('/guest-dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pattern-subtle" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="text-center p-8">
          <p>{language === 'ar' ? 'لم يتم العثور على تفاصيل الحجز' : 'Booking details not found'}</p>
          <Button onClick={() => navigate('/guest-dashboard')} className="mt-4">
            {language === 'ar' ? 'العودة للحجوزات' : 'Back to Bookings'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pattern-subtle" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container-custom py-12">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/guest-dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === 'ar' ? 'العودة للحجوزات' : 'Back to Bookings'}
            </Button>
          </div>

          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {language === 'ar' ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'تم تأكيد حجزك وسيتواصل معك فريقنا قريباً لتأكيد التفاصيل النهائية'
                : 'Your booking has been confirmed and our team will contact you soon to finalize the details'
              }
            </p>
          </div>

          {/* Booking Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                {language === 'ar' ? 'تفاصيل حجزك' : 'Your Booking Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Listing Info */}
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">{booking.listing.name}</h3>
                  <p className="text-sm text-muted-foreground">{booking.listing.location}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'تاريخ الوصول' : 'Check-in Date'}
                    </p>
                    <p className="font-semibold">
                      {new Date(booking.check_in_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'تاريخ المغادرة' : 'Check-out Date'}
                    </p>
                    <p className="font-semibold">
                      {new Date(booking.check_out_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'عدد الليالي' : 'Number of Nights'}
                    </p>
                    <p className="font-semibold">
                      {booking.total_nights} {language === 'ar' ? 'ليلة' : 'nights'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'المبلغ المدفوع' : 'Amount Paid'}
                    </p>
                    <p className="font-semibold">${booking.total_amount_usd}</p>
                  </div>
                </div>
              </div>

              {/* Booking Reference */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">
                  {language === 'ar' ? 'رقم الحجز' : 'Booking Reference'}
                </p>
                <p className="font-mono text-lg font-semibold text-primary">{booking.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'ar' ? 'الخطوات التالية' : 'Next Steps'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {language === 'ar' ? 'تأكيد من فريقنا' : 'Confirmation from Our Team'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' 
                        ? 'سيتواصل معك فريق نورتوا خلال 24 ساعة لتأكيد تفاصيل الحجز'
                        : 'Our Nawartu team will contact you within 24 hours to confirm booking details'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {language === 'ar' ? 'معلومات الوصول' : 'Access Information'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' 
                        ? 'ستصلك تعليمات الوصول وتفاصيل الاتصال قبل موعد الإقامة'
                        : 'You will receive access instructions and contact details before your stay'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {language === 'ar' ? 'الاستمتاع بإقامتك' : 'Enjoy Your Stay'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' 
                        ? 'نتمنى لك إقامة مريحة وممتعة في عقارنا'
                        : 'We hope you have a comfortable and enjoyable stay at our listing'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => navigate('/guest-dashboard')}
              className="flex-1"
            >
              {language === 'ar' ? 'مراجعة حجوزاتي' : 'Review My Bookings'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/browse')}
              className="flex-1"
            >
              {language === 'ar' ? 'تصفح المزيد من العقارات' : 'Browse More Properties'}
            </Button>
          </div>

          {/* Contact Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              {language === 'ar' ? 'هل لديك أسئلة حول حجزك؟' : 'Have questions about your booking?'}
              <Button 
                variant="link" 
                className="text-primary p-0 ml-1"
                onClick={() => navigate('/contact')}
              >
                {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;