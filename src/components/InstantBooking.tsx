import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAvailability, AvailabilityCheck } from "@/hooks/useAvailability";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { GuestSelector } from "@/components/GuestSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar as CalendarIcon,
  Users,
  CreditCard,
  Banknote,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Shield
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface InstantBookingProps {
  listing: {
    id: string;
    name: string;
    price_per_night_usd: number;
    max_guests: number;
    location: string;
  };
  initialDateRange?: DateRange;
  onBookingSuccess?: (bookingId: string) => void;
  className?: string;
}

export const InstantBooking: React.FC<InstantBookingProps> = ({
  listing,
  initialDateRange,
  onBookingSuccess,
  className
}) => {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  // State management
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>(initialDateRange);
  const [guests, setGuests] = useState({ adults: 2, children: 0, infants: 0 });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [availabilityCheck, setAvailabilityCheck] = useState<AvailabilityCheck | null>(null);
  const [reservationTimer, setReservationTimer] = useState<number>(0);
  const [isReserved, setIsReserved] = useState(false);

  // Availability hook
  const { checkAvailability, reserveDates, releaseReservation, confirmBooking } = useAvailability(listing.id);

  // Check availability whenever dates or guests change
  useEffect(() => {
    if (selectedDates?.from && selectedDates?.to) {
      const checkIn = selectedDates.from.toISOString().split('T')[0];
      const checkOut = selectedDates.to.toISOString().split('T')[0];
      const totalGuests = guests.adults + guests.children;
      
      checkAvailability(checkIn, checkOut, totalGuests).then(result => {
        setAvailabilityCheck(result);
      });
    } else {
      setAvailabilityCheck(null);
    }
  }, [selectedDates, guests, checkAvailability]);

  // Reservation timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (reservationTimer > 0) {
      interval = setInterval(() => {
        setReservationTimer(prev => {
          if (prev <= 1) {
            setIsReserved(false);
            toast({
              title: language === 'ar' ? "انتهت صلاحية الحجز" : "Reservation Expired",
              description: language === 'ar' ? "يرجى المحاولة مرة أخرى" : "Please try booking again",
              variant: "destructive",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [reservationTimer, language, toast]);

  // Calculate total nights
  const calculateTotalNights = useCallback(() => {
    if (!selectedDates?.from || !selectedDates?.to) return 0;
    return differenceInDays(selectedDates.to, selectedDates.from);
  }, [selectedDates]);

  // Calculate total price
  const calculateTotalPrice = useCallback(() => {
    if (!availabilityCheck) return 0;
    return availabilityCheck.total_price;
  }, [availabilityCheck]);

  // Format timer display
  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Reserve dates temporarily
  const handleReserveDates = async () => {
    if (!user || !selectedDates?.from || !selectedDates?.to) return;
    
    setLoading(true);
    
    try {
      const checkIn = selectedDates.from.toISOString().split('T')[0];
      const checkOut = selectedDates.to.toISOString().split('T')[0];
      
      const success = await reserveDates(checkIn, checkOut, user.id, 15); // 15 minute hold
      
      if (success) {
        setIsReserved(true);
        setReservationTimer(15 * 60); // 15 minutes in seconds
        toast({
          title: language === 'ar' ? "تم حجز التواريخ مؤقتاً" : "Dates Reserved",
          description: language === 'ar' ? "لديك 15 دقيقة لإتمام الحجز" : "You have 15 minutes to complete your booking",
        });
      } else {
        toast({
          title: language === 'ar' ? "فشل في حجز التواريخ" : "Failed to Reserve Dates", 
          description: language === 'ar' ? "التواريخ المحددة لم تعد متاحة" : "Selected dates are no longer available",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error reserving dates:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "حدث خطأ في حجز التواريخ" : "Failed to reserve dates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle instant booking
  const handleInstantBooking = async () => {
    if (!user || !profile || !selectedDates?.from || !selectedDates?.to || !availabilityCheck) {
      if (!user) {
        navigate('/auth');
        return;
      }
      return;
    }

    setLoading(true);

    try {
      const checkIn = selectedDates.from.toISOString().split('T')[0];
      const checkOut = selectedDates.to.toISOString().split('T')[0];
      const nights = calculateTotalNights();
      const totalAmount = calculateTotalPrice();

      // Create booking record
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          guest_id: profile.id,
          listing_id: listing.id,
          check_in_date: checkIn,
          check_out_date: checkOut,
          total_nights: nights,
          total_amount_usd: totalAmount,
          payment_method: paymentMethod === 'card' ? 'stripe' : 'cash',
          special_requests: specialRequests || null,
          status: paymentMethod === 'cash' ? 'confirmed' : 'pending' // Cash bookings confirmed immediately
        })
        .select('id')
        .single();

      if (bookingError) throw bookingError;

      // Confirm the booking (convert reservation to booked)
      const confirmSuccess = await confirmBooking(bookingData.id, checkIn, checkOut);
      
      if (!confirmSuccess) {
        throw new Error('Failed to confirm booking');
      }

      // Send booking confirmation email
      try {
        await supabase.functions.invoke('send-booking-confirmation', {
          body: {
            guestEmail: profile.email,
            guestName: profile.full_name || profile.email,
            listingName: listing.name,
            listingLocation: listing.location,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            totalNights: nights,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod,
            bookingId: bookingData.id
          }
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the booking if email fails
      }

      // Clear reservation timer
      setReservationTimer(0);
      setIsReserved(false);

      // Show success message
      toast({
        title: language === 'ar' ? "تم تأكيد الحجز!" : "Booking Confirmed!",
        description: paymentMethod === 'cash' 
          ? (language === 'ar' ? "تم تأكيد حجزك. سيتم الدفع عند الوصول." : "Your booking is confirmed. Payment due upon arrival.")
          : (language === 'ar' ? "تم تأكيد حجزك. تم الدفع بنجاح." : "Your booking is confirmed. Payment processed successfully."),
      });

      // Call success callback or navigate
      if (onBookingSuccess) {
        onBookingSuccess(bookingData.id);
      } else {
        navigate(`/payment-success?booking_id=${bookingData.id}`);
      }

    } catch (error: any) {
      console.error('Booking failed:', error);
      
      // Release reservation if booking failed
      if (selectedDates?.from && selectedDates?.to && user) {
        const checkIn = selectedDates.from.toISOString().split('T')[0];
        const checkOut = selectedDates.to.toISOString().split('T')[0];
        await releaseReservation(checkIn, checkOut, user.id);
      }
      
      setReservationTimer(0);
      setIsReserved(false);
      
      toast({
        title: language === 'ar' ? "فشل الحجز" : "Booking Failed",
        description: error.message || (language === 'ar' ? "حدث خطأ في إتمام الحجز" : "An error occurred while processing your booking"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Release current reservation
  const handleReleaseReservation = async () => {
    if (!user || !selectedDates?.from || !selectedDates?.to) return;
    
    const checkIn = selectedDates.from.toISOString().split('T')[0];
    const checkOut = selectedDates.to.toISOString().split('T')[0];
    
    await releaseReservation(checkIn, checkOut, user.id);
    setIsReserved(false);
    setReservationTimer(0);
    
    toast({
      title: language === 'ar' ? "تم إلغاء الحجز المؤقت" : "Reservation Released",
      description: language === 'ar' ? "يمكنك الآن اختيار تواريخ جديدة" : "You can now select new dates",
    });
  };

  const canProceedToBook = selectedDates?.from && selectedDates?.to && availabilityCheck?.is_available && !loading;
  const showReservationStep = canProceedToBook && !isReserved;
  const showBookingStep = canProceedToBook && isReserved;

  return (
    <div className={cn("space-y-6", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Calendar */}
      <AvailabilityCalendar
        listingId={listing.id}
        onDateSelect={setSelectedDates}
        selectedDates={selectedDates}
        mode="guest"
        showPricing={true}
      />

      {/* Guest Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            {language === 'ar' ? 'عدد الضيوف' : 'Guests'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GuestSelector
            value={guests}
            onChange={setGuests}
            maxGuests={listing.max_guests}
          />
        </CardContent>
      </Card>

      {/* Availability Check Results */}
      {availabilityCheck && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Availability Status */}
              <div className="flex items-center gap-3">
                {availabilityCheck.is_available ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700">
                      {language === 'ar' ? 'متاح للحجز' : 'Available for booking'}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-700">
                      {language === 'ar' ? 'غير متاح' : 'Not available'}
                    </span>
                  </>
                )}
              </div>

              {/* Simple Price Breakdown */}
              {availabilityCheck.is_available && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'السعر الأساسي:' : 'Base price:'}</span>
                    <span>${availabilityCheck.base_price} / {language === 'ar' ? 'ليلة' : 'night'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'عدد الليالي:' : 'Nights:'}</span>
                    <span>{availabilityCheck.total_nights}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{language === 'ar' ? 'المجموع:' : 'Total:'}</span>
                    <span>${availabilityCheck.total_price.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Blocked Dates Warning */}
              {availabilityCheck.blocked_dates.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="text-sm text-red-700">
                      <p className="font-medium mb-1">
                        {language === 'ar' ? 'تواريخ غير متاحة:' : 'Unavailable dates:'}
                      </p>
                      <p>
                        {availabilityCheck.blocked_dates.map(date => format(new Date(date), 'MMM d')).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reservation Timer */}
      {isReserved && reservationTimer > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium text-orange-800">
                  {language === 'ar' ? 'الحجز مؤكد مؤقتاً' : 'Dates temporarily reserved'}
                </p>
                <p className="text-sm text-orange-700">
                  {language === 'ar' ? 'الوقت المتبقي:' : 'Time remaining:'} {formatTimer(reservationTimer)}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReleaseReservation}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                {language === 'ar' ? 'إلغاء' : 'Release'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method Selection */}
      {showBookingStep && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <button
                onClick={() => setPaymentMethod('card')}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
                  paymentMethod === 'card'
                    ? 'border-nawartu-green bg-nawartu-green/10'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">
                      {language === 'ar' ? 'بطاقة ائتمان' : 'Credit Card'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {language === 'ar' ? 'دفع آمن فوري' : 'Secure instant payment'}
                    </div>
                  </div>
                </div>
                {paymentMethod === 'card' && (
                  <CheckCircle className="h-5 w-5 text-nawartu-green" />
                )}
              </button>

              <button
                onClick={() => setPaymentMethod('cash')}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
                  paymentMethod === 'cash'
                    ? 'border-nawartu-green bg-nawartu-green/10'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <Banknote className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">
                      {language === 'ar' ? 'دفع نقدي' : 'Cash Payment'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {language === 'ar' ? 'الدفع عند الوصول' : 'Pay upon arrival'}
                    </div>
                  </div>
                </div>
                {paymentMethod === 'cash' && (
                  <CheckCircle className="h-5 w-5 text-nawartu-green" />
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Special Requests */}
      {showBookingStep && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'ar' ? 'طلبات خاصة (اختياري)' : 'Special Requests (Optional)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="special-requests">
                {language === 'ar' ? 'أضف أي طلبات خاصة للمضيف' : 'Add any special requests for your host'}
              </Label>
              <Textarea
                id="special-requests"
                placeholder={language === 'ar' ? 'مثل: الوصول المبكر، ترتيبات خاصة، إلخ...' : 'e.g., early check-in, special arrangements, etc...'}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {showReservationStep && (
          <Button
            onClick={handleReserveDates}
            disabled={loading}
            className="w-full bg-nawartu-green hover:bg-nawartu-green/90 text-white font-semibold py-3 text-lg"
          >
            {loading ? (
              language === 'ar' ? 'جاري الحجز...' : 'Reserving...'
            ) : (
              language === 'ar' ? 'احجز التواريخ مؤقتاً' : 'Reserve Dates'
            )}
          </Button>
        )}

        {showBookingStep && (
          <Button
            onClick={handleInstantBooking}
            disabled={loading || reservationTimer <= 0}
            className="w-full bg-gradient-to-r from-nawartu-green to-nawartu-green/90 hover:from-nawartu-green/90 hover:to-nawartu-green/80 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? (
              language === 'ar' ? 'جاري التأكيد...' : 'Confirming...'
            ) : paymentMethod === 'card' ? (
              language === 'ar' ? 'ادفع واحجز فوراً' : 'Pay & Book Instantly'
            ) : (
              language === 'ar' ? 'أكد الحجز' : 'Confirm Booking'
            )}
          </Button>
        )}

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span>{language === 'ar' ? 'دفع آمن' : 'Secure payment'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>{language === 'ar' ? 'تأكيد فوري' : 'Instant confirmation'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
