import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { GuestSelector } from "@/components/GuestSelector";
import { ReviewsList } from "@/components/ReviewsList";
import { PropertyImageGallery } from "@/components/PropertyImageGallery";
import { ArrowLeft, MapPin, Users, Bed, Bath, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { getPublicImageUrl } from "@/lib/utils";
import CardDetails from "@/components/CardDetails";
import { getTranslatedContent } from "@/lib/translation";

interface Listing {
  id: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  location: string;
  location_ar?: string;
  location_en?: string;
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

const PropertyDetailsSimple = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>();
  const [guests, setGuests] = useState({
    adults: 2,
    children: 0,
    infants: 0
  });
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string>('');

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
        description: language === 'ar' ? "لم يتم العثور على العقار" : "Listing not found",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalNights = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return differenceInDays(dateRange.to, dateRange.from);
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

    if (!dateRange?.from || !dateRange?.to) {
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
          check_in_date: format(dateRange.from, 'yyyy-MM-dd'),
          check_out_date: format(dateRange.to, 'yyyy-MM-dd'),
          total_nights: nights,
          total_amount_usd: calculateTotalAmount(),
          payment_method: 'stripe',
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) throw error;

      setCurrentBookingId(bookingData.id);
      setShowCardDetails(true);
      setBookingLoading(false);

    } catch (error: any) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message || (language === 'ar' ? "حدث خطأ في إرسال طلب الحجز" : "Error sending booking request"),
        variant: "destructive",
      });
      setBookingLoading(false);
    }
  };

  const handleCardPaymentSuccess = () => {
    setDateRange(undefined);
    setGuests({ adults: 2, children: 0, infants: 0 });
    setShowCardDetails(false);
    setCurrentBookingId('');
    navigate(`/payment-success?booking_id=${currentBookingId}`);
  };

  const handleCardPaymentClose = () => {
    setShowCardDetails(false);
    setCurrentBookingId('');
    setBookingLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <p>{language === 'ar' ? 'لم يتم العثور على العقار' : 'Listing not found'}</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'ar' ? 'العودة' : 'Back'}
          </Button>
        </div>

        {/* Property Title */}
        <div className="mb-6">
          {(() => {
            const translatedContent = getTranslatedContent(listing, language);
            return (
              <>
                <h1 className="text-2xl font-semibold mb-2">
                  {translatedContent.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{translatedContent.location}</span>
                </div>
              </>
            );
          })()}
        </div>

        {/* Photo Gallery */}
        <div className="mb-8">
          <PropertyImageGallery 
            images={listing.images || []}
            propertyName={listing.name}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Info */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{listing.max_guests} guests</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    <span>{listing.bedrooms} bedrooms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span>{listing.bathrooms} bathrooms</span>
                  </div>
                </div>
                <p className="text-gray-700">
                  {(() => {
                    const translatedContent = getTranslatedContent(listing, language);
                    return translatedContent.description;
                  })()}
                </p>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {(() => {
                      const translatedContent = getTranslatedContent(listing, language);
                      return translatedContent.location;
                    })()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <ReviewsList listingId={listing.id} />
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>${listing.price_per_night_usd}</span>
                  <span className="text-sm font-normal">/ night</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Selection */}
                <div>
                  <DateRangePicker
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    language={language}
                  />
                </div>

                {/* Guest Selection */}
                <div>
                  <GuestSelector
                    value={guests}
                    onChange={setGuests}
                    maxGuests={listing.max_guests}
                  />
                </div>

                {/* Total */}
                {dateRange?.from && dateRange?.to && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total ({calculateTotalNights()} nights)</span>
                      <span>${calculateTotalAmount()}</span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <Button 
                  onClick={handleBooking} 
                  disabled={bookingLoading || !dateRange?.from || !dateRange?.to}
                  className="w-full"
                  size="lg"
                >
                  {bookingLoading ? "Booking..." : "Book Now"}
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

export default PropertyDetailsSimple;
