import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReviewsList } from "@/components/ReviewsList";
import { StarRating } from "@/components/StarRating";
import GoogleMap from "@/components/GoogleMap";
import { PropertyImageGallery } from "@/components/PropertyImageGallery";
import { 
  ArrowRight, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Calendar as CalendarIcon,
  CreditCard,
  Banknote,
  Wifi,
  Car,
  Coffee,
  Shield,
  Tv,
  Wind,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, addDays } from "date-fns";
import { getPublicImageUrl } from "@/lib/utils";
import CardDetails from "@/components/CardDetails";

interface Listing {
  id: string;
  name: string;
  description: string;
  location: string;
  price_per_night_usd: number;
  price_per_night_syp: number | null;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  amenities: string[];
  latitude?: number;
  longitude?: number;
  host: {
    full_name: string;
    avatar_url?: string;
  };
}

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  air_conditioning: Wind,
  kitchen: Coffee,
  tv: Tv,
  security: Shield
};

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [guests, setGuests] = useState('2');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe');
  const [specialRequests, setSpecialRequests] = useState('');
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string>('');

  const { language } = useLanguage();
  const isRTL = language === 'ar';

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          host:profiles!listings_host_id_fkey(full_name, avatar_url)
        `)
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error: any) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "لم يتم العثور على العقار" : "Property not found",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    return differenceInDays(checkOutDate, checkInDate);
  };

  const calculateTotalAmount = () => {
    const nights = calculateTotalNights();
    if (!listing || nights <= 0) return 0;
    return nights * listing.price_per_night_usd;
  };

  const handleBooking = async () => {
    if (!user || !profile || !listing) {
      navigate('/auth');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "يرجى اختيار تواريخ الإقامة" : "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }

    const nights = calculateTotalNights();
    if (nights <= 0) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول" : "Check-out date must be after check-in date",
        variant: "destructive",
      });
      return;
    }

    setBookingLoading(true);

    try {
      const { data: bookingData, error } = await supabase
        .from('bookings')
        .insert({
          guest_id: profile.id,
          listing_id: listing.id,
          check_in_date: format(checkInDate, 'yyyy-MM-dd'),
          check_out_date: format(checkOutDate, 'yyyy-MM-dd'),
          total_nights: nights,
          total_amount_usd: calculateTotalAmount(),
          payment_method: paymentMethod,
          special_requests: specialRequests || null,
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) throw error;

      // Send booking confirmation email immediately
      try {
        await supabase.functions.invoke('send-booking-confirmation', {
          body: {
            guestEmail: profile.email,
            guestName: profile.full_name || profile.email,
            listingName: listing.name,
            listingLocation: listing.location,
            checkInDate: format(checkInDate, 'yyyy-MM-dd'),
            checkOutDate: format(checkOutDate, 'yyyy-MM-dd'),
            totalNights: nights,
            totalAmount: calculateTotalAmount(),
            paymentMethod: paymentMethod,
            bookingId: bookingData.id
          }
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the booking if email fails
      }

      if (paymentMethod === 'stripe') {
        // Show card details form instead of redirecting to Stripe
        setCurrentBookingId(bookingData.id);
        setShowCardDetails(true);
        setBookingLoading(false);
      } else {
        toast({
          title: language === 'ar' ? "تم بنجاح" : "Success",
          description: language === 'ar' ? "تم إرسال طلب الحجز. سيتم التواصل معك قريباً." : "Booking request sent. We'll contact you soon.",
        });

        setCheckInDate(undefined);
        setCheckOutDate(undefined);
        setGuests('2');
        setSpecialRequests('');
        setBookingLoading(false);
      }

    } catch (error: any) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message || (language === 'ar' ? "حدث خطأ في إرسال طلب الحجز" : "Error sending booking request"),
        variant: "destructive",
      });
      setBookingLoading(false);
    }
  };

  const handleCardPaymentSuccess = (paymentIntentId: string) => {
    // Reset form
    setCheckInDate(undefined);
    setCheckOutDate(undefined);
    setGuests('2');
    setSpecialRequests('');
    setShowCardDetails(false);
    setCurrentBookingId('');
    
    // Navigate to success page or show success message
    navigate(`/payment-success?booking_id=${currentBookingId}`);
  };

  const handleCardPaymentClose = () => {
    setShowCardDetails(false);
    setCurrentBookingId('');
    setBookingLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="text-center p-8">
          <p>{language === 'ar' ? 'لم يتم العثور على العقار' : 'Property not found'}</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pattern-geometric-stars" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container-custom py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => {
              // Try to go back in history, fallback to homepage
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'ar' ? 'العودة' : 'Go Back'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <PropertyImageGallery 
              images={listing.images || []}
              propertyName={listing.name}
            />

            {/* Property Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{listing.name}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.location}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{listing.max_guests} {language === 'ar' ? 'ضيوف' : 'guests'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    <span>{listing.bedrooms} {language === 'ar' ? 'غرف نوم' : 'bedrooms'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span>{listing.bathrooms} {language === 'ar' ? 'حمامات' : 'bathrooms'}</span>
                  </div>
                </div>

                <p className="text-muted-foreground">{listing.description}</p>

                {/* Amenities */}
                {listing.amenities && listing.amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">
                      {language === 'ar' ? 'المرافق' : 'Amenities'}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {listing.amenities.map((amenity, index) => {
                        const IconComponent = amenityIcons[amenity] || Shield;
                        const amenityLabels: Record<string, { ar: string; en: string }> = {
                          wifi: { ar: 'واي فاي', en: 'WiFi' },
                          parking: { ar: 'موقف سيارات', en: 'Parking' },
                          air_conditioning: { ar: 'مكيف هواء', en: 'Air Conditioning' },
                          kitchen: { ar: 'مطبخ', en: 'Kitchen' },
                          tv: { ar: 'تلفاز', en: 'TV' },
                          security: { ar: 'أمان', en: 'Security' }
                        };
                        const label = amenityLabels[amenity] || { ar: amenity.replace(/_/g, ' '), en: amenity.replace(/_/g, ' ') };
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <span className="text-sm">{language === 'ar' ? label.ar : label.en}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Map */}
                {listing.latitude && listing.longitude && (
                  <div>
                    <h3 className="font-semibold mb-2">
                      {language === 'ar' ? 'الموقع' : 'Location'}
                    </h3>
                    <div className="h-64 rounded-lg overflow-hidden">
                      <GoogleMap
                        lat={listing.latitude}
                        lng={listing.longitude}
                        zoom={15}
                        markers={[{
                          lat: listing.latitude,
                          lng: listing.longitude,
                          title: listing.name,
                          info: listing.description
                        }]}
                        showNearbyPlaces={true}
                        showDistanceToMajorCities={true}
                        enableGeocoding={true}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <ReviewsList listingId={listing.id} />
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>${listing.price_per_night_usd}</span>
                  <span className="text-sm font-normal">
                    / {language === 'ar' ? 'ليلة' : 'night'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Check-in Date */}
                <div>
                  <Label>{language === 'ar' ? 'تاريخ الوصول' : 'Check-in Date'}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkInDate ? format(checkInDate, 'PPP') : (language === 'ar' ? "اختر التاريخ" : "Select Date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={checkInDate}
                        onSelect={setCheckInDate}
                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Check-out Date */}
                <div>
                  <Label>{language === 'ar' ? 'تاريخ المغادرة' : 'Check-out Date'}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOutDate ? format(checkOutDate, 'PPP') : (language === 'ar' ? "اختر التاريخ" : "Select Date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={checkOutDate}
                        onSelect={setCheckOutDate}
                        disabled={(date) => date <= (checkInDate || new Date()) || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Guests */}
                <div>
                  <Label>{language === 'ar' ? 'عدد الضيوف' : 'Number of Guests'}</Label>
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: listing.max_guests }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1} {i + 1 === 1 ? (language === 'ar' ? 'ضيف' : 'guest') : (language === 'ar' ? 'ضيوف' : 'guests')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method */}
                <div>
                  <Label>{language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</Label>
                  <Select value={paymentMethod} onValueChange={(value: 'stripe' | 'cash') => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>{language === 'ar' ? 'كرت ائتماني' : 'Credit Card'}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          <span>{language === 'ar' ? 'نقداً' : 'Cash'}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Payment method info */}
                  {paymentMethod === 'stripe' && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CreditCard className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">{language === 'ar' ? 'الدفع الفوري' : 'Instant Payment'}</p>
                          <p className="text-xs">{language === 'ar' ? 'سيتم خصم المبلغ فوراً من بطاقتك' : 'Amount will be charged immediately from your card'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {paymentMethod === 'cash' && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Banknote className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium">{language === 'ar' ? 'الدفع عند الوصول' : 'Pay on Arrival'}</p>
                          <p className="text-xs">{language === 'ar' ? 'سيتم التواصل معك لتأكيد الحجز' : 'We will contact you to confirm the booking'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Special Requests */}
                <div>
                  <Label>{language === 'ar' ? 'طلبات خاصة (اختياري)' : 'Special Requests (Optional)'}</Label>
                  <Textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder={language === 'ar' ? "أدخل أي طلبات خاصة..." : "Enter any special requests..."}
                    rows={3}
                  />
                </div>

                {/* Total */}
                {checkInDate && checkOutDate && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>
                        {language === 'ar' ? 'المجموع' : 'Total'} ({calculateTotalNights()} {language === 'ar' ? 'ليالي' : 'nights'})
                      </span>
                      <span>${calculateTotalAmount()}</span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <Button 
                  onClick={handleBooking} 
                  disabled={bookingLoading || !checkInDate || !checkOutDate}
                  className="w-full"
                  size="lg"
                >
                  {bookingLoading ? (language === 'ar' ? "جاري الحجز..." : "Booking...") : (language === 'ar' ? "احجز الآن" : "Book Now")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Card Details Modal */}
        <CardDetails
          isOpen={showCardDetails}
          onClose={handleCardPaymentClose}
          onSuccess={handleCardPaymentSuccess}
          amount={calculateTotalAmount()}
          bookingId={currentBookingId}
          listingName={listing?.name || ''}
          nights={calculateTotalNights()}
        />
      </div>
    </div>
  );
};

export default PropertyDetails;