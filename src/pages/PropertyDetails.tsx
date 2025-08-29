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
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { ReviewsList } from "@/components/ReviewsList";
import { StarRating } from "@/components/StarRating";
import GoogleMap from "@/components/GoogleMap";
import { 
  ArrowRight, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Star, 
  Heart,
  Calendar as CalendarIcon,
  CreditCard,
  Banknote,
  Wifi,
  Car,
  AirVent,
  Coffee,
  Shield,
  Zap,
  Share2,
  Check,
  X,
  Clock,
  Home,
  Building,
  TreePine,
  Utensils,
  Tv,
  Wind,
  Snowflake,
  Waves,
  ParkingCircle,
  DogIcon,
  Cigarette,
  Music,
  ChevronLeft,
  ChevronRight,
  MapPinIcon,
  InfoIcon,
  AlertTriangle,
  ExternalLink,
  Navigation
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, addDays } from "date-fns";
import { ar } from "date-fns/locale";
import { getPublicImageUrl, openInGoogleMaps } from "@/lib/utils";

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

// Enhanced amenity icons with comprehensive mapping
const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: ParkingCircle,
  air_conditioning: Wind,
  kitchen: Utensils,
  elevator: Zap,
  tv: Tv,
  heating: Snowflake,
  pool: Waves,
  pets_allowed: DogIcon,
  balcony: TreePine,
  garden: TreePine,
  terrace: Home,
  dishwasher: Coffee,
  washing_machine: Coffee,
  refrigerator: Coffee,
  microwave: Coffee,
  coffee_maker: Coffee,
  gym: Building,
  spa: Waves,
  restaurant: Utensils,
  room_service: Utensils,
  concierge: Shield,
  valet_parking: Car,
  business_center: Building,
  conference_rooms: Building,
  free_breakfast: Coffee,
  airport_shuttle: Car,
  car_rental: Car,
  tour_desk: MapPinIcon,
  laundry_service: Coffee,
  dry_cleaning: Coffee,
  currency_exchange: Building,
  atm: Building,
  safe_deposit_box: Shield,
  luggage_storage: Shield,
  twenty_four_hour_reception: Clock,
  multilingual_staff: InfoIcon,
  non_smoking_rooms: X,
  family_rooms: Users,
  accessible_rooms: InfoIcon,
  soundproof_rooms: Music,
  air_purifier: Wind,
  first_aid_kit: Shield,
  fire_extinguisher: Shield,
  smoke_detector: Shield,
  carbon_monoxide_detector: Shield,
  electric_fans: Wind,
  electric_generators: Zap,
  electric_batteries: Zap
};

import { amenityLabels } from "@/lib/amenities";

// Property type icons
const propertyTypeIcons: Record<string, any> = {
  apartment: Building,
  villa: Home,
  guesthouse: TreePine,
  hotel: Building,
  hostel: Users,
  studio: Home,
  loft: Building,
  townhouse: Home,
  cottage: TreePine
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);

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

    // Check if user already has an active booking
    try {
      const { data: existingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('guest_id', profile.id)
        .in('status', ['pending', 'confirmed']);

      if (checkError) throw checkError;

      if (existingBookings && existingBookings.length > 0) {
        toast({
          title: "خطأ",
          description: "لديك حجز نشط بالفعل. لا يمكن إجراء حجز جديد.",
          variant: "destructive",
        });
        return;
      }
    } catch (error: any) {
      console.error('Error checking existing bookings:', error);
    }

    // Check cash booking constraints
    if (paymentMethod === 'cash') {
      const daysDiff = differenceInDays(checkInDate, new Date());
      if (daysDiff < 2) {
        toast({
          title: "خطأ",
          description: "الحجوزات النقدية يجب أن تكون قبل 48 ساعة على الأقل",
          variant: "destructive",
        });
        return;
      }

      if (nights > 2) {
        toast({
          title: "خطأ",
          description: "الحجوزات النقدية محدودة بليلتين كحد أقصى",
          variant: "destructive",
        });
        return;
      }
    }

    // Check availability for the requested dates
    try {
      const { data: conflictingBookings, error: availabilityError } = await supabase
        .from('bookings')
        .select('id, check_in_date, check_out_date, payment_method')
        .eq('listing_id', listing.id)
        .in('status', ['pending', 'confirmed'])
        .or(`check_in_date.lte.${format(checkOutDate, 'yyyy-MM-dd')},check_out_date.gte.${format(checkInDate, 'yyyy-MM-dd')}`);

      if (availabilityError) throw availabilityError;

      if (conflictingBookings && conflictingBookings.length > 0) {
        // For cash bookings, only check first 3 days
        if (paymentMethod === 'cash') {
          const cashCheckEndDate = addDays(checkInDate, 3);
          const hasConflict = conflictingBookings.some(booking => {
            const bookingStart = new Date(booking.check_in_date);
            const bookingEnd = new Date(booking.check_out_date);
            return (
              (bookingStart < cashCheckEndDate && bookingEnd > checkInDate) ||
              (booking.payment_method === 'cash' && bookingStart < checkOutDate && bookingEnd > checkInDate)
            );
          });

          if (hasConflict) {
            toast({
              title: "خطأ",
              description: "التواريخ المختارة غير متاحة",
              variant: "destructive",
            });
            return;
          }
        } else {
          toast({
            title: "خطأ",
            description: "التواريخ المختارة غير متاحة",
            variant: "destructive",
          });
          return;
        }
      }
    } catch (error: any) {
      console.error('Error checking availability:', error);
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

      // Send confirmation email
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
        // Create Stripe checkout session
        try {
          const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-stripe-checkout', {
            body: {
              bookingId: bookingData.id,
              totalAmount: calculateTotalAmount(),
              listingName: listing.name,
              nights: nights
            }
          });

          if (checkoutError) throw checkoutError;

          // Redirect to Stripe checkout
          window.open(checkoutData.url, '_blank');
          
          toast({
            title: "تم إنشاء الحجز",
            description: "تم فتح صفحة الدفع في نافذة جديدة. أكمل عملية الدفع لتأكيد حجزك.",
          });
        } catch (stripeError) {
          console.error('Stripe checkout error:', stripeError);
          toast({
            title: "خطأ في الدفع",
            description: "حدث خطأ في إنشاء جلسة الدفع. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "تم بنجاح",
          description: "تم إرسال طلب الحجز. سيتم التواصل معك قريباً لتأكيد الحجز. تم حجز الأيام الثلاثة الأولى.",
        });
      }

      // Reset form
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
      <div className="min-h-screen flex items-center justify-center pattern-subtle">
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
    <div className="min-h-screen bg-background pattern-geometric-stars">
      <div className="container-custom py-6">
        {/* Back Button */}
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
            {/* Enhanced Photo Gallery with Carousel */}
            <Card className="overflow-hidden pattern-subtle border border-primary/10 shadow-card">
              <div className="relative">
                {listing.images && listing.images.length > 0 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {listing.images.map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="aspect-[16/10] relative group">
                            <img 
                              src={getPublicImageUrl(image) || '/placeholder.svg'} 
                              alt={`${listing.name} - صورة ${index + 1}`}
                              className="w-full h-full object-cover hover-lift cursor-pointer transition-transform duration-300"
                              onClick={() => setCurrentImageIndex(index)}
                            />
                            {/* Image overlay on hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Badge variant="secondary" className="bg-background/90 text-foreground">
                                  {index + 1} من {listing.images.length}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4" />
                    <CarouselNext className="right-4" />
                  </Carousel>
                ) : (
                  <div className="aspect-[16/10] bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">لا توجد صور متاحة</p>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-background/80 hover:bg-background text-foreground rounded-full p-2 backdrop-blur-sm"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-background/80 hover:bg-background text-foreground rounded-full p-2 backdrop-blur-sm"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Property Info */}
            <Card className="pattern-subtle border border-primary/10">
              <CardContent className="p-6" dir="rtl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2 text-arabic">
                      {listing.name}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="h-5 w-5" />
                      <span>{listing.location}</span>
                    </div>
                    
                    {/* View on Map Button */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mb-4 bg-[#4285f4] hover:bg-[#3367d6] text-white border-[#4285f4] hover:border-[#3367d6]"
                      onClick={() => openInGoogleMaps({
                        latitude: listing.latitude,
                        longitude: listing.longitude,
                        address: listing.location,
                        propertyName: listing.name
                      })}
                    >
                      <Navigation className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {language === 'ar' ? 'عرض في خرائط جوجل' : 'View on Google Maps'}
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">4.8</span>
                    <span className="text-muted-foreground">(127 تقييم)</span>
                  </div>
                </div>

                 {/* Property Type & Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                    <Building className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">نوع العقار</p>
                      <p className="font-medium text-sm">شقة</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">الضيوف</p>
                      <p className="font-medium text-sm">{listing.max_guests} ضيوف</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                    <Bed className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">غرف النوم</p>
                      <p className="font-medium text-sm">{listing.bedrooms} غرف</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                    <Bath className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">الحمامات</p>
                      <p className="font-medium text-sm">{listing.bathrooms} حمام</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">وصف العقار</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {listing.description}
                  </p>
                </div>

                {/* Enhanced Amenities */}
                {listing.amenities && listing.amenities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      المرافق والخدمات
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {listing.amenities.map((amenity) => {
                        const IconComponent = amenityIcons[amenity] || Zap;
                        const amenityLabel = amenityLabels[amenity];
                        const displayText = amenityLabel ? (language === 'ar' ? amenityLabel.ar : amenityLabel.en) : amenity;
                        return (
                          <div key={amenity} className="flex items-center gap-3 p-3 rounded-lg border border-primary/10 bg-background/50 hover:bg-muted/30 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <IconComponent className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium">{displayText}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Show all amenities link */}
                    {listing.amenities.length > 6 && (
                      <Button variant="ghost" className="mt-3 text-primary">
                        عرض جميع المرافق ({listing.amenities.length})
                      </Button>
                    )}
                  </div>
                )}

                {/* Host Info */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3">المضيف</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {listing.host.avatar_url ? (
                        <img 
                          src={listing.host.avatar_url} 
                          alt={listing.host.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary font-semibold">
                          {listing.host.full_name?.charAt(0) || 'M'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{listing.host.full_name}</p>
                      <p className="text-sm text-muted-foreground">مضيف منذ 2023</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Section */}
            <Card className="pattern-subtle border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" dir="rtl">
                  <MapPinIcon className="h-5 w-5 text-primary" />
                  الموقع والمنطقة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4" dir="rtl">
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.location}</span>
                </div>
                
                {/* Google Map */}
                <div className="aspect-video bg-muted rounded-lg relative overflow-hidden">
                  <GoogleMap
                    lat={listing.latitude || 33.5138}
                    lng={listing.longitude || 36.2765}
                    zoom={15}
                    height="100%"
                    markers={[{
                      lat: listing.latitude || 33.5138,
                      lng: listing.longitude || 36.2765,
                      title: listing.name
                    }]}
                  />
                  {/* Map Overlay Buttons */}
                  <div className="absolute bottom-4 right-4 flex gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setShowFullMap(true)}
                    >
                      {language === 'ar' ? 'عرض الخريطة الكاملة' : 'View Full Map'}
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-[#4285f4] hover:bg-[#3367d6] text-white shadow-lg"
                      onClick={() => openInGoogleMaps({
                        latitude: listing.latitude,
                        longitude: listing.longitude,
                        address: listing.location,
                        propertyName: listing.name
                      })}
                    >
                      <Navigation className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {language === 'ar' ? 'عرض في خرائط جوجل' : 'View on Google Maps'}
                    </Button>
                  </div>
                </div>

                {/* Nearby Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="font-medium mb-2">معالم قريبة</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Building className="h-3 w-3" />
                        <span>مركز تسوق - 5 دقائق مشياً</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="h-3 w-3" />
                        <span>محطة باص - 3 دقائق مشياً</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Utensils className="h-3 w-3" />
                        <span>مطاعم - 2 دقيقة مشياً</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">وصف المنطقة</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      منطقة هادئة وآمنة في قلب المدينة، قريبة من جميع الخدمات والمرافق الأساسية. 
                      تتميز بسهولة الوصول إلى وسائل النقل العام والأماكن السياحية.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card className="pattern-subtle border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" dir="rtl">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  التقييمات والمراجعات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewsList listingId={listing.id} />
              </CardContent>
            </Card>

            {/* Rules & Policies Section */}
            <Card className="pattern-subtle border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" dir="rtl">
                  <Shield className="h-5 w-5 text-primary" />
                  القوانين والسياسات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6" dir="rtl">
                {/* House Rules */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Home className="h-4 w-4 text-primary" />
                    قوانين المنزل
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">مسموح بالأطفال</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <X className="h-4 w-4 text-red-500" />
                        <span className="text-sm">غير مسموح بالتدخين</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <X className="h-4 w-4 text-red-500" />
                        <span className="text-sm">غير مسموح بالحفلات</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">مسموح بالحيوانات الأليفة</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">هدوء بعد الساعة 10 مساءً</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">حد أقصى {listing.max_guests} ضيوف</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Check-in/Check-out */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    أوقات الوصول والمغادرة
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="h-4 w-4 text-green-500" />
                        <span className="font-medium">الوصول</span>
                      </div>
                      <p className="text-sm text-muted-foreground">من 3:00 مساءً إلى 10:00 مساءً</p>
                      <p className="text-xs text-muted-foreground">تسجيل وصول ذاتي بصندوق الأمان</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="h-4 w-4 text-red-500" />
                        <span className="font-medium">المغادرة</span>
                      </div>
                      <p className="text-sm text-muted-foreground">حتى 11:00 صباحاً</p>
                      <p className="text-xs text-muted-foreground">مغادرة ذاتية</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Cancellation Policy */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    سياسة الإلغاء
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">إلغاء مجاني</h5>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        يمكن الإلغاء مجاناً حتى 24 ساعة قبل الوصول للحصول على استرداد كامل.
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">استرداد جزئي</h5>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">
                        إلغاء خلال 24 ساعة من الوصول: استرداد 50% من المبلغ.
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">لا استرداد</h5>
                      <p className="text-sm text-red-600 dark:text-red-300">
                        لا يوجد استرداد في حالة عدم الحضور أو الإلغاء في نفس يوم الوصول.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Safety & Security */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    الأمان والسلامة
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs">كاشف دخان</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs">طفاية حريق</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs">حقيبة إسعافات أولية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs">كاميرات أمنية خارجية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs">إضاءة خارجية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-xs">خزنة آمنة</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 pattern-subtle border border-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-center" dir="rtl">
                  <div className="text-2xl font-bold text-primary mb-2">
                    ${listing.price_per_night_usd}
                    <span className="text-base font-normal text-muted-foreground"> / ليلة</span>
                  </div>
                  {listing.price_per_night_syp && (
                    <div className="text-sm text-muted-foreground">
                      أو {listing.price_per_night_syp.toLocaleString()} ل.س / ليلة
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4" dir="rtl">
                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>تاريخ الوصول</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-right">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkInDate ? format(checkInDate, 'dd/MM/yyyy', { locale: ar }) : 'اختر التاريخ'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkInDate}
                          onSelect={setCheckInDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label>تاريخ المغادرة</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-right">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOutDate ? format(checkOutDate, 'dd/MM/yyyy', { locale: ar }) : 'اختر التاريخ'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={checkOutDate}
                          onSelect={setCheckOutDate}
                          disabled={(date) => date < addDays(checkInDate || new Date(), 1)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Guest Count */}
                <div>
                  <Label>عدد الضيوف</Label>
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="text-right">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: listing.max_guests }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1} {i === 0 ? 'ضيف' : 'ضيوف'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method */}
                <div>
                  <Label>طريقة الدفع</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('stripe')}
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      بطاقة
                    </Button>
                    <Button
                      variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('cash')}
                      className="flex items-center gap-2"
                    >
                      <Banknote className="h-4 w-4" />
                      نقداً
                    </Button>
                  </div>
                  {paymentMethod === 'cash' && (
                    <p className="text-xs text-muted-foreground mt-2">
                      * الدفع النقدي: حد أقصى ليلتان، قبل 48 ساعة
                    </p>
                  )}
                </div>

                {/* Special Requests */}
                <div>
                  <Label>طلبات خاصة (اختياري)</Label>
                  <Textarea
                    placeholder="أي طلبات أو ملاحظات خاصة..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="text-right"
                    rows={3}
                  />
                </div>

                {/* Booking Summary */}
                {checkInDate && checkOutDate && calculateTotalNights() > 0 && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>{calculateTotalNights()} ليالي × ${listing.price_per_night_usd}</span>
                      <span>${calculateTotalAmount()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>المجموع</span>
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

                <p className="text-xs text-muted-foreground text-center">
                  لن يتم خصم أي مبلغ حتى تأكيد الحجز
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;