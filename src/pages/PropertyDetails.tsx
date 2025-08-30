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
  Wind
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, addDays } from "date-fns";
import { getPublicImageUrl } from "@/lib/utils";

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

  const { language } = useLanguage();

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
        title: "خطأ",
        description: "لم يتم العثور على العقار",
        variant: "destructive",
      });
      navigate('/guest-dashboard');
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
        title: "خطأ",
        description: "يرجى اختيار تواريخ الإقامة",
        variant: "destructive",
      });
      return;
    }

    const nights = calculateTotalNights();
    if (nights <= 0) {
      toast({
        title: "خطأ",
        description: "تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول",
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

      if (paymentMethod === 'stripe') {
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-stripe-checkout', {
          body: {
            bookingId: bookingData.id,
            totalAmount: calculateTotalAmount(),
            listingName: listing.name,
            nights: nights
          }
        });

        if (checkoutError) throw checkoutError;
        window.open(checkoutData.url, '_blank');
        
        toast({
          title: "تم إنشاء الحجز",
          description: "تم فتح صفحة الدفع في نافذة جديدة.",
        });
      } else {
        toast({
          title: "تم بنجاح",
          description: "تم إرسال طلب الحجز. سيتم التواصل معك قريباً.",
        });
      }

      setCheckInDate(undefined);
      setCheckOutDate(undefined);
      setGuests('2');
      setSpecialRequests('');

    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ في إرسال طلب الحجز",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <p>لم يتم العثور على العقار</p>
          <Button onClick={() => navigate('/guest-dashboard')} className="mt-4">
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/guest-dashboard')}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للتصفح
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <Card className="overflow-hidden">
              <div className="aspect-[16/10]">
                {listing.images && listing.images.length > 0 ? (
                  <img 
                    src={getPublicImageUrl(listing.images[0], 'property-images', { width: 800, quality: 80 }) || '/placeholder.svg'} 
                    alt={listing.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد صور</p>
                  </div>
                )}
              </div>
            </Card>

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
                    <span>{listing.max_guests} ضيوف</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    <span>{listing.bedrooms} غرف نوم</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span>{listing.bathrooms} حمامات</span>
                  </div>
                </div>

                <p className="text-muted-foreground">{listing.description}</p>

                {/* Amenities */}
                {listing.amenities && listing.amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">المرافق</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {listing.amenities.map((amenity, index) => {
                        const IconComponent = amenityIcons[amenity] || Shield;
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <span className="text-sm">{amenity.replace(/_/g, ' ')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Map */}
                {listing.latitude && listing.longitude && (
                  <div>
                    <h3 className="font-semibold mb-2">الموقع</h3>
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
                  <span className="text-sm font-normal">/ ليلة</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Check-in Date */}
                <div>
                  <Label>تاريخ الوصول</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkInDate ? format(checkInDate, 'PPP') : "اختر التاريخ"}
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
                  <Label>تاريخ المغادرة</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOutDate ? format(checkOutDate, 'PPP') : "اختر التاريخ"}
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
                  <Label>عدد الضيوف</Label>
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: listing.max_guests }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1} {i + 1 === 1 ? 'ضيف' : 'ضيوف'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method */}
                <div>
                  <Label>طريقة الدفع</Label>
                  <Select value={paymentMethod} onValueChange={(value: 'stripe' | 'cash') => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>كرت ائتماني</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          <span>نقداً</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Special Requests */}
                <div>
                  <Label>طلبات خاصة (اختياري)</Label>
                  <Textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="أدخل أي طلبات خاصة..."
                    rows={3}
                  />
                </div>

                {/* Total */}
                {checkInDate && checkOutDate && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>المجموع ({calculateTotalNights()} ليالي)</span>
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
                  {bookingLoading ? "جاري الحجز..." : "احجز الآن"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;