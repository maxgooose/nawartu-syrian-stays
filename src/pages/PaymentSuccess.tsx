import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, MapPin, Users, CreditCard, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
        title: "تم الدفع بنجاح",
        description: "تم تأكيد حجزك وسيتواصل معك فريقنا قريباً",
      });

    } catch (error: any) {
      console.error('Error fetching booking details:', error);
      toast({
        title: "خطأ",
        description: "لم يتم العثور على تفاصيل الحجز",
        variant: "destructive",
      });
      navigate('/guest-dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pattern-subtle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <p>لم يتم العثور على تفاصيل الحجز</p>
          <Button onClick={() => navigate('/guest-dashboard')} className="mt-4">
            العودة للحجوزات
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pattern-subtle">
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
              العودة للحجوزات
            </Button>
          </div>

          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              تم الدفع بنجاح!
            </h1>
            <p className="text-muted-foreground">
              تم تأكيد حجزك وسيتواصل معك فريقنا قريباً لتأكيد التفاصيل النهائية
            </p>
          </div>

          {/* Booking Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-center" dir="rtl">
                تفاصيل حجزك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" dir="rtl">
              {/* Property Info */}
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
                    <p className="text-sm text-muted-foreground">تاريخ الوصول</p>
                    <p className="font-semibold">
                      {new Date(booking.check_in_date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ المغادرة</p>
                    <p className="font-semibold">
                      {new Date(booking.check_out_date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">عدد الليالي</p>
                    <p className="font-semibold">{booking.total_nights} ليلة</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">المبلغ المدفوع</p>
                    <p className="font-semibold">${booking.total_amount_usd}</p>
                  </div>
                </div>
              </div>

              {/* Booking Reference */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">رقم الحجز</p>
                <p className="font-mono text-lg font-semibold text-primary">{booking.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg" dir="rtl">
                الخطوات التالية
              </CardTitle>
            </CardHeader>
            <CardContent dir="rtl">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">تأكيد من فريقنا</h4>
                    <p className="text-sm text-muted-foreground">
                      سيتواصل معك فريق نوارتو خلال 24 ساعة لتأكيد تفاصيل الحجز
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">معلومات الوصول</h4>
                    <p className="text-sm text-muted-foreground">
                      ستصلك تعليمات الوصول وتفاصيل الاتصال قبل موعد الإقامة
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">الاستمتاع بإقامتك</h4>
                    <p className="text-sm text-muted-foreground">
                      نتمنى لك إقامة مريحة وممتعة في عقارنا
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
              مراجعة حجوزاتي
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/property-browse')}
              className="flex-1"
            >
              تصفح المزيد من العقارات
            </Button>
          </div>

          {/* Contact Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              هل لديك أسئلة حول حجزك؟ 
              <Button variant="link" className="text-primary p-0 ml-1">
                تواصل معنا
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;