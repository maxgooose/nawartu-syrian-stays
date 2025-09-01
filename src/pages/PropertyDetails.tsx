import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GuestSelector } from "@/components/GuestSelector";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReviewsList } from "@/components/ReviewsList";
import { StarRating } from "@/components/StarRating";
import GoogleMap from "@/components/GoogleMap";
import { PropertyImageGallery } from "@/components/PropertyImageGallery";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AirbnbCalendar } from "@/components/AirbnbCalendar";
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
  ArrowLeft,
  Star,
  Heart,
  Share,
  Award,
  Key,
  CheckCircle,
  Grid3X3,
  X,
  ChefHat,
  Utensils,
  Refrigerator,
  Microwave,
  Waves,
  Dumbbell,
  GamepadIcon,
  Baby,
  Cigarette as Smoking,
  PawPrint,
  Volume2,
  Shirt,
  Snowflake,
  Zap as Heater,
  Monitor,
  Laptop,
  Battery as ChargingStation,
  Zap,
  Bath as Bathtub,
  Bath as Shower,
  Shirt as ShirtIcon,
  Crown,
  MapIcon,
  TreePine,
  Camera,
  Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { getPublicImageUrl } from "@/lib/utils";
import CardDetailsModern from "@/components/CardDetailsModern";

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
  host?: {
    full_name: string;
    avatar_url?: string;
  } | null;
}

interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  cleanliness: number;
  accuracy: number;
  checkin: number;
  communication: number;
  location: number;
  value: number;
}

// Comprehensive amenity icons and categories
const amenityIcons: Record<string, any> = {
  // Kitchen & Dining
  kitchen: ChefHat,
  refrigerator: Refrigerator,
  microwave: Microwave,
  dishwasher: Utensils,
  coffee_maker: Coffee,
  dining_table: Utensils,
  
  // Bathroom
  bathtub: Bathtub,
  shower: Shower,
  hair_dryer: Wind,
  shampoo: Shield,
  
  // Bedroom & Laundry
  washer: Shirt,
  dryer: Wind,
  hangers: Shirt,
  iron: Shirt,
  
  // Entertainment
  tv: Tv,
  wifi: Wifi,
  sound_system: Volume2,
  games: GamepadIcon,
  books: Monitor,
  
  // Heating & Cooling
  air_conditioning: Snowflake,
  heating: Heater,
  fireplace: Heater,
  
  // Outdoor
  balcony: TreePine,
  garden: TreePine,
  pool: Waves,
  
  // Safety & Accessibility
  security: Shield,
  smoke_detector: Shield,
  first_aid_kit: Shield,
  
  // Parking & Transportation
  parking: Car,
  garage: Building,
  
  // Work & Technology
  workspace: Laptop,
  monitor: Monitor,
  charging_station: ChargingStation,
  
  // Family
  baby_safety_gates: Baby,
  high_chair: Baby,
  
  // Policies
  smoking_allowed: Smoking,
  pets_allowed: PawPrint,
  
  // Premium Features
  gym: Dumbbell,
  hot_tub: Waves,
  
  // Default fallback
  default: Shield
};

const amenityCategories = {
  kitchen: {
    title: { ar: 'المطبخ وتناول الطعام', en: 'Kitchen & dining' },
    amenities: ['kitchen', 'refrigerator', 'microwave', 'dishwasher', 'coffee_maker', 'dining_table']
  },
  bathroom: {
    title: { ar: 'الحمام', en: 'Bathroom' },
    amenities: ['bathtub', 'shower', 'hair_dryer', 'shampoo']
  },
  bedroom: {
    title: { ar: 'غرفة النوم والغسيل', en: 'Bedroom & laundry' },
    amenities: ['washer', 'dryer', 'hangers', 'iron']
  },
  entertainment: {
    title: { ar: 'الترفيه', en: 'Entertainment' },
    amenities: ['tv', 'wifi', 'sound_system', 'games', 'books']
  },
  climate: {
    title: { ar: 'التدفئة والتبريد', en: 'Heating & cooling' },
    amenities: ['air_conditioning', 'heating', 'fireplace']
  },
  outdoor: {
    title: { ar: 'المساحات الخارجية', en: 'Outdoor' },
    amenities: ['balcony', 'garden', 'pool']
  },
  safety: {
    title: { ar: 'الأمان وسهولة الوصول', en: 'Safety & accessibility' },
    amenities: ['security', 'smoke_detector', 'first_aid_kit']
  },
  parking: {
    title: { ar: 'وقوف السيارات والمواصلات', en: 'Parking & transportation' },
    amenities: ['parking', 'garage']
  },
  work: {
    title: { ar: 'العمل', en: 'Work' },
    amenities: ['workspace', 'monitor', 'charging_station']
  },
  family: {
    title: { ar: 'مناسب للعائلات', en: 'Family' },
    amenities: ['baby_safety_gates', 'high_chair']
  },
  policies: {
    title: { ar: 'السياسات', en: 'Policies' },
    amenities: ['smoking_allowed', 'pets_allowed']
  },
  premium: {
    title: { ar: 'مرافق مميزة', en: 'Premium features' },
    amenities: ['gym', 'hot_tub']
  }
};

const amenityLabels: Record<string, { ar: string; en: string; description?: { ar: string; en: string } }> = {
  // Kitchen
  kitchen: { 
    ar: 'مطبخ مُجهز', 
    en: 'Kitchen', 
    description: { ar: 'مطبخ كامل مع الأساسيات', en: 'Full kitchen with basics' }
  },
  refrigerator: { 
    ar: 'ثلاجة', 
    en: 'Refrigerator',
    description: { ar: 'ثلاجة بحجم كامل', en: 'Full-size refrigerator' }
  },
  microwave: { 
    ar: 'مايكروويف', 
    en: 'Microwave',
    description: { ar: 'فرن مايكروويف', en: 'Microwave oven' }
  },
  dishwasher: { 
    ar: 'غسالة أطباق', 
    en: 'Dishwasher',
    description: { ar: 'غسالة أطباق تلقائية', en: 'Automatic dishwasher' }
  },
  coffee_maker: { 
    ar: 'صانعة قهوة', 
    en: 'Coffee maker',
    description: { ar: 'آلة صنع القهوة', en: 'Coffee making machine' }
  },
  
  // Bathroom
  bathtub: { 
    ar: 'حوض استحمام', 
    en: 'Bathtub',
    description: { ar: 'حوض استحمام للاسترخاء', en: 'Relaxing bathtub' }
  },
  shower: { 
    ar: 'دش', 
    en: 'Shower',
    description: { ar: 'دش منعش', en: 'Refreshing shower' }
  },
  hair_dryer: { 
    ar: 'مجفف شعر', 
    en: 'Hair dryer',
    description: { ar: 'مجفف شعر عالي الجودة', en: 'High-quality hair dryer' }
  },
  
  // Technology
  wifi: { 
    ar: 'واي فاي مجاني', 
    en: 'Free WiFi',
    description: { ar: 'إنترنت لاسلكي عالي السرعة', en: 'High-speed wireless internet' }
  },
  tv: { 
    ar: 'تلفزيون', 
    en: 'TV',
    description: { ar: 'تلفزيون ذكي مع قنوات', en: 'Smart TV with channels' }
  },
  
  // Climate
  air_conditioning: { 
    ar: 'مكيف هواء', 
    en: 'Air conditioning',
    description: { ar: 'تكييف مركزي أو وحدة', en: 'Central or unit AC' }
  },
  heating: { 
    ar: 'تدفئة', 
    en: 'Heating',
    description: { ar: 'نظام تدفئة فعال', en: 'Efficient heating system' }
  },
  
  // Parking
  parking: { 
    ar: 'موقف مجاني', 
    en: 'Free parking',
    description: { ar: 'موقف سيارات مجاني في المبنى', en: 'Free parking on premises' }
  },
  
  // Safety
  security: { 
    ar: 'أمان وحراسة', 
    en: 'Security system',
    description: { ar: 'نظام أمان ومراقبة', en: 'Security and monitoring system' }
  },
  
  // Work
  workspace: { 
    ar: 'مساحة عمل', 
    en: 'Dedicated workspace',
    description: { ar: 'مكتب مناسب للعمل', en: 'Suitable for working' }
  },
  
  // Premium
  pool: { 
    ar: 'مسبح', 
    en: 'Pool',
    description: { ar: 'مسبح للسباحة والاستجمام', en: 'Swimming pool for relaxation' }
  },
  hot_tub: { 
    ar: 'جاكوزي', 
    en: 'Hot tub',
    description: { ar: 'جاكوزي للاسترخاء', en: 'Relaxing hot tub' }
  },
  
  // Family
  baby_safety_gates: { 
    ar: 'حواجز أمان للأطفال', 
    en: 'Baby safety gates',
    description: { ar: 'حواجز أمان للأطفال الصغار', en: 'Safety gates for young children' }
  },
  
  // Policies
  pets_allowed: { 
    ar: 'يُسمح بالحيوانات الأليفة', 
    en: 'Pets allowed',
    description: { ar: 'مرحب بالحيوانات الأليفة', en: 'Pet-friendly accommodation' }
  },
  smoking_allowed: { 
    ar: 'يُسمح بالتدخين', 
    en: 'Smoking allowed',
    description: { ar: 'مسموح التدخين في المنطقة المخصصة', en: 'Smoking permitted in designated area' }
  }
};

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();


  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>();
  const [guests, setGuests] = useState({
    adults: 2,
    children: 0,
    infants: 0
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [specialRequests, setSpecialRequests] = useState('');
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string>('');
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);

  const { language } = useLanguage();
  const isRTL = language === 'ar';

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);



  // Reset check-out date when check-in date changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to && dateRange.to <= dateRange.from) {
      setDateRange(prev => prev ? { ...prev, to: undefined } : prev);
    }
  }, [dateRange]);

  const fetchListing = async () => {
    try {
      // First, get the listing data
      const { data: rawData, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (listingError) throw listingError;

      // Try to get host data separately (optional)
      let hostData = null;
      if (rawData?.host_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', rawData.host_id)
          .single();
        
        hostData = profileData;
      }

      // Combine the data
      const data = {
        ...rawData,
        host: hostData
      };

      setListing(data);
      
      // Fetch review summary
      await fetchReviewSummary();
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

  const fetchReviewSummary = async () => {
    try {
      // Just fetch the basic rating column to avoid database schema issues
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('listing_id', id);

      if (error) throw error;

      if (data && data.length > 0) {
        const totalReviews = data.length;
        const averageRating = data.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews;
        
        // Use the average rating for all categories since detailed ratings may not be available
        const defaultRating = Math.round(averageRating * 10) / 10;

        setReviewSummary({
          totalReviews,
          averageRating: defaultRating,
          cleanliness: defaultRating,
          accuracy: defaultRating,
          checkin: defaultRating,
          communication: defaultRating,
          location: defaultRating,
          value: defaultRating,
        });
      }
    } catch (error) {
      console.error('Error fetching review summary:', error);
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
          payment_method: paymentMethod === 'card' ? 'stripe' : 'cash',
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
            checkInDate: format(dateRange.from!, 'yyyy-MM-dd'),
            checkOutDate: format(dateRange.to!, 'yyyy-MM-dd'),
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

      if (paymentMethod === 'card') {
        // Show card details form for secure payment
        setCurrentBookingId(bookingData.id);
        setShowCardDetails(true);
        setBookingLoading(false);
      } else if (paymentMethod === 'cash') {
        // Cash payment - booking confirmed, payment on arrival
        toast({
          title: language === 'ar' ? "تم تأكيد الحجز!" : "Booking Confirmed!",
          description: language === 'ar' ? "تم تأكيد حجزك بنجاح. سيتم دفع المبلغ عند الوصول." : "Your booking is confirmed! Payment will be collected upon arrival.",
        });

        setDateRange(undefined);
        setGuests({ adults: 2, children: 0, infants: 0 });
        setSpecialRequests('');
        setPaymentMethod('card');
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
    setDateRange(undefined);
    setGuests({ adults: 2, children: 0, infants: 0 });
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
      {/* Header with Navigation */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === 'ar' ? 'العودة' : 'Back'}
            </Button>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Share className="h-4 w-4" />
                {language === 'ar' ? 'مشاركة' : 'Share'}
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                {language === 'ar' ? 'حفظ' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Property Title and Rating */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4 leading-tight">{listing.name}</h1>
          
          {/* Badges Section */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {reviewSummary && reviewSummary.averageRating >= 4.8 && (
              <div className="flex items-center gap-1.5 bg-nawartu-green/10 border border-nawartu-green/20 px-3 py-1.5 rounded-lg">
                <Award className="h-4 w-4 text-nawartu-green" />
                <span className="text-sm font-medium text-nawartu-green">
                  {language === 'ar' ? 'مفضل الضيوف' : 'Guest favorite'}
                </span>
              </div>
            )}
            
            {listing.amenities?.includes('wifi') && (
              <div className="flex items-center gap-1.5 bg-nawartu-beige border border-nawartu-gray/20 px-3 py-1.5 rounded-lg">
                <Wifi className="h-4 w-4 text-nawartu-gray" />
                <span className="text-sm font-medium text-nawartu-gray">
                  {language === 'ar' ? 'واي فاي مجاني' : 'Free WiFi'}
                </span>
              </div>
            )}
            
            {listing.amenities?.includes('parking') && (
              <div className="flex items-center gap-1.5 bg-nawartu-beige border border-nawartu-gray/20 px-3 py-1.5 rounded-lg">
                <Car className="h-4 w-4 text-nawartu-gray" />
                <span className="text-sm font-medium text-nawartu-gray">
                  {language === 'ar' ? 'موقف مجاني' : 'Free parking'}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 bg-nawartu-green/10 border border-nawartu-green/20 px-3 py-1.5 rounded-lg">
              <CheckCircle className="h-4 w-4 text-nawartu-green" />
              <span className="text-sm font-medium text-nawartu-green">
                {language === 'ar' ? 'مضيف مميز' : 'Superhost'}
              </span>
            </div>

            {/* Additional trust badges based on property features */}
            {listing.amenities?.includes('security') && (
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  {language === 'ar' ? 'آمن ومحمي' : 'Safe & Secure'}
                </span>
              </div>
            )}

            {listing.amenities?.includes('workspace') && (
              <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg">
                <Laptop className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">
                  {language === 'ar' ? 'مناسب للعمل عن بُعد' : 'Remote work friendly'}
                </span>
              </div>
            )}

            {listing.amenities?.includes('pets_allowed') && (
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg">
                <PawPrint className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">
                  {language === 'ar' ? 'مرحب بالحيوانات الأليفة' : 'Pet friendly'}
                </span>
              </div>
            )}

            {(listing.amenities?.includes('baby_safety_gates') || listing.amenities?.includes('high_chair')) && (
              <div className="flex items-center gap-1.5 bg-pink-50 border border-pink-200 px-3 py-1.5 rounded-lg">
                <Baby className="h-4 w-4 text-pink-600" />
                <span className="text-sm font-medium text-pink-600">
                  {language === 'ar' ? 'مناسب للعائلات' : 'Family friendly'}
                </span>
              </div>
            )}
          </div>
          
          {/* Rating and Location */}
          <div className="flex items-center gap-1 text-sm mb-2">
            {reviewSummary && (
              <>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current text-black" />
                  <span className="font-semibold">{reviewSummary.averageRating}</span>
                </div>
                <span className="text-gray-600 mx-1">·</span>
                <button className="text-gray-900 font-medium underline decoration-1 underline-offset-2 hover:text-gray-700 transition-colors">
                  {reviewSummary.totalReviews} {language === 'ar' ? 'تقييم' : 'reviews'}
                </button>
                <span className="text-gray-600 mx-1">·</span>
              </>
            )}
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <button className="underline decoration-1 underline-offset-2 hover:text-gray-900 transition-colors font-medium">
                {listing.location}
              </button>
            </div>
          </div>
        </div>

        {/* Airbnb-Style Photo Gallery */}
        <div className="mb-8 relative">
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[480px] rounded-xl overflow-hidden">
            {listing.images && listing.images.length > 0 ? (
              <>
                {/* Main large image */}
                <div className="col-span-2 row-span-2 relative group">
                  <img 
                    src={getPublicImageUrl(listing.images[0])} 
                    alt={listing.name}
                    className="w-full h-full object-cover cursor-pointer transition-all duration-300 group-hover:brightness-90"
                    onClick={() => setShowAllPhotos(true)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300"></div>
                </div>
                
                {/* Four smaller images */}
                {listing.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={getPublicImageUrl(image)} 
                      alt={`${listing.name} ${index + 2}`}
                      className="w-full h-full object-cover cursor-pointer transition-all duration-300 group-hover:brightness-90"
                      onClick={() => setShowAllPhotos(true)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300"></div>
                    
                    {/* Show all photos overlay on the last image */}
                    {index === 3 && listing.images.length > 5 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button 
                          className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
                          onClick={() => setShowAllPhotos(true)}
                        >
                          <Grid3X3 className="h-4 w-4" />
                          {language === 'ar' ? `عرض كل ${listing.images.length}` : `Show all ${listing.images.length}`}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Fill remaining slots with placeholder if not enough images */}
                {listing.images.length < 5 && Array.from({ length: 5 - listing.images.length }).map((_, index) => (
                  <div key={`placeholder-${index}`} className="bg-gray-100 flex items-center justify-center">
                    <div className="text-gray-400 text-sm">{language === 'ar' ? 'لا توجد صورة' : 'No image'}</div>
                  </div>
                ))}
              </>
            ) : (
              <div className="col-span-4 row-span-2 bg-gray-100 flex items-center justify-center rounded-xl">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📷</div>
                  <span>{language === 'ar' ? 'لا توجد صور متاحة' : 'No images available'}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Show all photos button - positioned over the gallery */}
          <Button 
            variant="outline"
            onClick={() => setShowAllPhotos(true)}
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white backdrop-blur-sm border border-gray-300 shadow-md text-gray-900 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            {language === 'ar' ? 'عرض جميع الصور' : 'Show all photos'}
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Overview */}
            <div className="border-b border-gray-100 pb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                    {language === 'ar' ? 'بيت كامل في' : 'Entire home in'} {listing.location}
                  </h2>
                  
                  {/* High-level property info with enhanced styling */}
                  <div className="flex flex-wrap items-center gap-4 text-gray-700 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-nawartu-green" />
                      <span className="font-medium">{listing.max_guests}</span>
                      <span>{language === 'ar' ? 'ضيوف' : 'guests'}</span>
                  </div>
                    
                    <span className="text-gray-300">·</span>
                    
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-nawartu-green" />
                      <span className="font-medium">{listing.bedrooms}</span>
                      <span>{listing.bedrooms === 1 ? (language === 'ar' ? 'غرفة نوم' : 'bedroom') : (language === 'ar' ? 'غرف نوم' : 'bedrooms')}</span>
                </div>
                    
                    <span className="text-gray-300">·</span>
                    
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-nawartu-green" />
                      <span className="font-medium">{listing.bathrooms}</span>
                      <span>{listing.bathrooms === 1 ? (language === 'ar' ? 'حمام' : 'bath') : (language === 'ar' ? 'حمامات' : 'baths')}</span>
                    </div>
                    
                    <span className="text-gray-300">·</span>
                    
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-nawartu-green" />
                      <span>{language === 'ar' ? 'دخول ذاتي' : 'Self check-in'}</span>
                    </div>
                  </div>
                </div>
                
                {listing.host && (
                  <div className="flex-shrink-0">
                    <Avatar className="h-16 w-16 border-2 border-nawartu-beige shadow-sm">
                      <AvatarImage src={listing.host.avatar_url || ''} />
                      <AvatarFallback className="text-lg font-medium bg-nawartu-beige text-nawartu-green">
                        {listing.host.full_name?.charAt(0) || 'H'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>

              {/* Property Highlights - Airbnb Style */}
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-nawartu-beige/30 hover:bg-nawartu-beige/50 transition-colors">
                  <div className="p-2 rounded-lg bg-nawartu-green/10">
                    <Award className="h-6 w-6 text-nawartu-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {language === 'ar' ? 'أفضل 10% من المنازل' : 'Top 10% of homes'}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {language === 'ar' ? 'هذا المنزل مصنف بدرجة عالية بناءً على التقييمات والمراجعات والموثوقية.' : 'This home is highly ranked based on ratings, reviews, and reliability.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-nawartu-beige/30 hover:bg-nawartu-beige/50 transition-colors">
                  <div className="p-2 rounded-lg bg-nawartu-green/10">
                    <Key className="h-6 w-6 text-nawartu-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {language === 'ar' ? 'تسجيل دخول ذاتي' : 'Self check-in'}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {language === 'ar' ? 'تحقق بنفسك من خلال صندوق الأقفال.' : 'Check yourself in with the lockbox.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-nawartu-beige/30 hover:bg-nawartu-beige/50 transition-colors">
                  <div className="p-2 rounded-lg bg-nawartu-green/10">
                    <MapPin className="h-6 w-6 text-nawartu-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {language === 'ar' ? 'حي نابض بالحياة' : 'Great location'}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {language === 'ar' ? 'يقول الضيوف أن هذه المنطقة قابلة للمشي مع الكثير للاستكشاف، خاصة لتناول الطعام.' : 'Guests say this area is walkable with lots to explore, especially for dining out.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* About this space */}
            <div className="border-b border-gray-100 pb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {language === 'ar' ? 'حول هذا المكان' : 'About this space'}
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">{listing.description}</p>
              </div>
            </div>

            {/* What this place offers - Enhanced Airbnb Style */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                  {language === 'ar' ? 'ما يقدمه هذا المكان' : 'What this place offers'}
                </h2>
                
                {/* Categorized Amenities */}
                <div className="space-y-8">
                  {Object.entries(amenityCategories).map(([categoryKey, category]) => {
                    const categoryAmenities = listing.amenities.filter(amenity => 
                      category.amenities.includes(amenity)
                    );
                    
                    if (categoryAmenities.length === 0) return null;
                    
                    return (
                      <div key={categoryKey} className="bg-nawartu-beige/20 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-nawartu-green rounded-full"></div>
                          {language === 'ar' ? category.title.ar : category.title.en}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categoryAmenities.map((amenity, index) => {
                            const IconComponent = amenityIcons[amenity] || amenityIcons.default;
                            const label = amenityLabels[amenity] || { 
                              ar: amenity.replace(/_/g, ' '), 
                              en: amenity.replace(/_/g, ' ') 
                            };
                            
                    return (
                              <div key={index} className="flex items-start gap-4 p-4 bg-white/60 rounded-lg hover:bg-white/80 transition-colors">
                                <div className="flex-shrink-0 p-2 bg-nawartu-green/10 rounded-lg">
                                  <IconComponent className="h-5 w-5 text-nawartu-green" />
                                </div>
                                <div className="flex-grow">
                                  <div className="font-medium text-gray-900 mb-1">
                                    {language === 'ar' ? label.ar : label.en}
                                  </div>
                                  {label.description && (
                                    <div className="text-sm text-gray-600">
                                      {language === 'ar' ? label.description.ar : label.description.en}
                                    </div>
                                  )}
                                </div>
                      </div>
                    );
                  })}
                </div>
                      </div>
                    );
                  })}
                  
                  {/* Uncategorized amenities */}
                  {(() => {
                    const categorizedAmenityIds = Object.values(amenityCategories)
                      .flatMap(category => category.amenities);
                    const uncategorizedAmenities = listing.amenities.filter(amenity => 
                      !categorizedAmenityIds.includes(amenity)
                    );
                    
                    if (uncategorizedAmenities.length === 0) return null;
                    
                    return (
                      <div className="bg-nawartu-beige/20 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-nawartu-green rounded-full"></div>
                          {language === 'ar' ? 'مرافق أخرى' : 'Other amenities'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {uncategorizedAmenities.map((amenity, index) => {
                            const IconComponent = amenityIcons[amenity] || amenityIcons.default;
                            const label = amenityLabels[amenity] || { 
                              ar: amenity.replace(/_/g, ' '), 
                              en: amenity.replace(/_/g, ' ') 
                            };
                            
                            return (
                              <div key={index} className="flex items-start gap-4 p-4 bg-white/60 rounded-lg hover:bg-white/80 transition-colors">
                                <div className="flex-shrink-0 p-2 bg-nawartu-green/10 rounded-lg">
                                  <IconComponent className="h-5 w-5 text-nawartu-green" />
                                </div>
                                <div className="flex-grow">
                                  <div className="font-medium text-gray-900 mb-1">
                                    {language === 'ar' ? label.ar : label.en}
                                  </div>
                                  {label.description && (
                                    <div className="text-sm text-gray-600">
                                      {language === 'ar' ? label.description.ar : label.description.en}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                {/* Show all amenities button */}
                <Button 
                  variant="outline" 
                  className="mt-8 px-8 py-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-50 font-semibold rounded-xl transition-all hover:shadow-md"
                >
                  {language === 'ar' ? `عرض جميع المرافق (${listing.amenities.length})` : `Show all ${listing.amenities.length} amenities`}
                </Button>
              </div>
            )}

            {/* Reviews - Enhanced Airbnb Style */}
            {reviewSummary && (
              <div className="border-b border-gray-100 pb-8">
                <div className="flex items-center gap-3 mb-8">
                  <Star className="h-6 w-6 fill-current text-black" />
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {reviewSummary.averageRating} · {reviewSummary.totalReviews} {language === 'ar' ? 'تقييم' : 'reviews'}
                  </h2>
                </div>

                {/* Enhanced Review Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  {[
                    { key: 'cleanliness', labelAr: 'النظافة', labelEn: 'Cleanliness', value: reviewSummary.cleanliness },
                    { key: 'accuracy', labelAr: 'الدقة', labelEn: 'Accuracy', value: reviewSummary.accuracy },
                    { key: 'checkin', labelAr: 'تسجيل الدخول', labelEn: 'Check-in', value: reviewSummary.checkin },
                    { key: 'communication', labelAr: 'التواصل', labelEn: 'Communication', value: reviewSummary.communication },
                    { key: 'location', labelAr: 'الموقع', labelEn: 'Location', value: reviewSummary.location },
                    { key: 'value', labelAr: 'القيمة مقابل المال', labelEn: 'Value', value: reviewSummary.value }
                  ].map((category) => (
                    <div key={category.key} className="flex items-center justify-between py-3">
                      <span className="text-gray-900 font-medium">
                        {language === 'ar' ? category.labelAr : category.labelEn}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gray-900 rounded-full transition-all duration-500" 
                            style={{ width: `${(category.value / 5) * 100}%` }}
                        />
                      </div>
                        <span className="text-sm font-semibold w-8 text-right">{category.value}</span>
                    </div>
                    </div>
                  ))}
                  </div>
                  
                {/* Sample Reviews Section - Enhanced */}
                <div className="space-y-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'ar' ? 'آراء الضيوف' : 'Recent reviews'}
                  </h3>
                  
                  {/* Sample Review Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sample Review 1 */}
                    <div className="bg-nawartu-beige/20 rounded-xl p-6 hover:bg-nawartu-beige/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-nawartu-green rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">M</span>
                      </div>
                          <div>
                            <div className="font-semibold text-gray-900">Mohammed</div>
                            <div className="text-sm text-gray-600">
                              {language === 'ar' ? 'أكتوبر 2024' : 'October 2024'}
                    </div>
                  </div>
                      </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current text-black" />
                          ))}
                    </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {language === 'ar' 
                          ? 'مكان رائع ونظيف جداً. المضيف كان متعاوناً والموقع ممتاز. أنصح بشدة!'
                          : 'Amazing place and very clean. The host was helpful and the location is excellent. Highly recommend!'
                        }
                      </p>
                  </div>

                    {/* Sample Review 2 */}
                    <div className="bg-nawartu-beige/20 rounded-xl p-6 hover:bg-nawartu-beige/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-nawartu-green rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">S</span>
                      </div>
                          <div>
                            <div className="font-semibold text-gray-900">Sarah</div>
                            <div className="text-sm text-gray-600">
                              {language === 'ar' ? 'سبتمبر 2024' : 'September 2024'}
                    </div>
                  </div>
                      </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current text-black" />
                          ))}
                    </div>
                  </div>
                      <p className="text-gray-700 leading-relaxed">
                        {language === 'ar'
                          ? 'تجربة مذهلة! البيت كما هو موضح في الصور تماماً. المرافق ممتازة والحي هادئ.'
                          : 'Wonderful experience! The house is exactly as shown in photos. Great amenities and quiet neighborhood.'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reviews component */}
                <ReviewsList listingId={listing.id} />
                
                {/* Show all reviews button */}
                <div className="mt-8">
                  <Button 
                    variant="outline"
                    className="px-8 py-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-50 font-semibold rounded-xl transition-all hover:shadow-md"
                  >
                    {language === 'ar' ? `عرض جميع التقييمات (${reviewSummary.totalReviews})` : `Show all ${reviewSummary.totalReviews} reviews`}
                  </Button>
                </div>
              </div>
            )}

            {/* Location - Enhanced Airbnb Style */}
            {listing.latitude && listing.longitude && (
              <div className="border-b border-gray-100 pb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                  {language === 'ar' ? 'الموقع والمنطقة المحيطة' : 'Where you\'ll be'}
                </h2>
                
                {/* Map with enhanced styling */}
                <div className="bg-nawartu-beige/20 rounded-2xl p-6 mb-8">
                  <div className="h-96 rounded-xl overflow-hidden shadow-md mb-6">
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
                  
                  {/* Location Description */}
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">{listing.location}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {language === 'ar'
                        ? 'موقع مثالي يوفر سهولة الوصول إلى المعالم المهمة والمرافق الأساسية'
                        : 'Perfect location with easy access to major attractions and essential amenities'
                      }
                    </p>
                  </div>
                </div>

                {/* Neighborhood Highlights */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {language === 'ar' ? 'مميزات المنطقة' : 'Neighborhood highlights'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Transportation */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 bg-nawartu-green/10 rounded-lg">
                        <Car className="h-6 w-6 text-nawartu-green" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {language === 'ar' ? 'المواصلات' : 'Transportation'}
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {language === 'ar'
                            ? 'الوصول سهل بالسيارة مع توفر مواقف قريبة. محطة باصات على بعد 5 دقائق مشياً'
                            : 'Easy access by car with nearby parking. Bus station 5 minutes walk away'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Dining */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 bg-nawartu-green/10 rounded-lg">
                        <Utensils className="h-6 w-6 text-nawartu-green" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {language === 'ar' ? 'المطاعم والمقاهي' : 'Dining & Cafes'}
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {language === 'ar'
                            ? 'مطاعم شعبية ومقاهي تقليدية على بعد دقائق من المكان'
                            : 'Popular restaurants and traditional cafes within minutes'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Shopping */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 bg-nawartu-green/10 rounded-lg">
                        <Building className="h-6 w-6 text-nawartu-green" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {language === 'ar' ? 'التسوق' : 'Shopping'}
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {language === 'ar'
                            ? 'أسواق محلية ومحلات تجارية لتوفير جميع احتياجاتك'
                            : 'Local markets and shops for all your daily needs'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Attractions */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 bg-nawartu-green/10 rounded-lg">
                        <Camera className="h-6 w-6 text-nawartu-green" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {language === 'ar' ? 'المعالم السياحية' : 'Attractions'}
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {language === 'ar'
                            ? 'معالم تاريخية وثقافية مهمة في محيط المنطقة'
                            : 'Important historical and cultural landmarks nearby'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Distance to Major Places */}
                  <div className="bg-white rounded-xl p-6 border border-nawartu-beige">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      {language === 'ar' ? 'المسافات إلى الأماكن المهمة' : 'Distance to key places'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-nawartu-green">5 min</div>
                        <div className="text-sm text-gray-600">
                          {language === 'ar' ? 'المركز التجاري' : 'Shopping Center'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-nawartu-green">10 min</div>
                        <div className="text-sm text-gray-600">
                          {language === 'ar' ? 'المدينة القديمة' : 'Old City'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-nawartu-green">15 min</div>
                        <div className="text-sm text-gray-600">
                          {language === 'ar' ? 'المطار' : 'Airport'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Host */}
            {listing.host && (
              <div className="border-b border-gray-200 pb-8">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={listing.host.avatar_url || ''} />
                    <AvatarFallback className="text-lg">{listing.host.full_name?.charAt(0) || 'H'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-medium text-gray-900">
                      {language === 'ar' ? `استضافة من ${listing.host.full_name}` : `Hosted by ${listing.host.full_name}`}
                    </h2>
                    <p className="text-gray-600">
                      {language === 'ar' ? 'مضيف منذ عام 2024' : 'Host since 2024'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="border border-gray-300 shadow-xl rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-6">
                  {/* Price and Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-semibold">${listing.price_per_night_usd}</span>
                      <span className="text-gray-600"> {language === 'ar' ? 'ليلة' : 'night'}</span>
                    </div>
                    {reviewSummary && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-current text-black" />
                        <span className="font-medium">{reviewSummary.averageRating}</span>
                        <span className="text-gray-600">({reviewSummary.totalReviews})</span>
                      </div>
                    )}
                  </div>

                  {/* Date and Guest Selection - Enhanced Airbnb Style */}
                  <div className="border border-gray-300 rounded-xl mb-4 overflow-hidden">
                    <div className="grid grid-cols-2 border-b border-gray-300">
                      <button 
                        className="p-4 border-r border-gray-300 text-left hover:bg-gray-50 transition-colors group"
                        onClick={() => setShowDatePicker(true)}
                      >
                        <div className="text-xs font-semibold text-gray-900 mb-1 tracking-wide">
                          {language === 'ar' ? 'تسجيل الدخول' : 'CHECK-IN'}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          {dateRange?.from ? format(dateRange.from, 'MMM d, yyyy') : (language === 'ar' ? 'إضافة تاريخ' : 'Add date')}
                        </div>
                      </button>
                      <button 
                        className="p-4 text-left hover:bg-gray-50 transition-colors group"
                        onClick={() => setShowDatePicker(true)}
                      >
                        <div className="text-xs font-semibold text-gray-900 mb-1 tracking-wide">
                          {language === 'ar' ? 'تسجيل الخروج' : 'CHECKOUT'}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          {dateRange?.to ? format(dateRange.to, 'MMM d, yyyy') : (language === 'ar' ? 'إضافة تاريخ' : 'Add date')}
                        </div>
                      </button>
                    </div>
                    <button 
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors group"
                      onClick={() => setShowGuestSelector(true)}
                    >
                      <div className="text-xs font-semibold text-gray-900 mb-1 tracking-wide">
                        {language === 'ar' ? 'الضيوف' : 'GUESTS'}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {guests.adults + guests.children} {language === 'ar' ? 'ضيف' : 'guest'}
                        {guests.adults + guests.children !== 1 && !isRTL && 's'}
                      </div>
                    </button>
                  </div>

                  {/* Hidden date picker and guest selector */}
                  <div className="hidden">
                    <DateRangePicker
                      dateRange={dateRange}
                      onDateRangeChange={setDateRange}
                      language={language}
                    />
                    <GuestSelector
                      value={guests}
                      onChange={setGuests}
                      maxGuests={listing.max_guests}
                    />
                  </div>

                  {/* Payment Method Selection */}
                  {dateRange?.from && dateRange?.to && (
                    <div className="mb-6 bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        {language === 'ar' ? 'طريقة الدفع' : 'Payment method'}
                      </h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => setPaymentMethod('card')}
                          className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                            paymentMethod === 'card'
                              ? 'border-nawartu-green bg-nawartu-green/10 text-nawartu-green'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-medium">
                                {language === 'ar' ? 'بطاقة ائتمان' : 'Credit Card'}
                              </div>
                              <div className="text-xs opacity-75">
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
                          className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                            paymentMethod === 'cash'
                              ? 'border-nawartu-green bg-nawartu-green/10 text-nawartu-green'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Banknote className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-medium">
                                {language === 'ar' ? 'دفع نقدي' : 'Cash Payment'}
                              </div>
                              <div className="text-xs opacity-75">
                                {language === 'ar' ? 'الدفع عند الوصول' : 'Pay upon arrival'}
                              </div>
                            </div>
                          </div>
                          {paymentMethod === 'cash' && (
                            <CheckCircle className="h-5 w-5 text-nawartu-green" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reserve Button - Airbnb Style */}
                  <Button 
                    onClick={handleBooking} 
                    disabled={bookingLoading || !dateRange?.from || !dateRange?.to}
                    className="w-full bg-gradient-to-r from-nawartu-green to-nawartu-green/90 hover:from-nawartu-green/90 hover:to-nawartu-green/80 text-white font-semibold py-4 rounded-xl mb-4 text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    {bookingLoading 
                      ? (language === 'ar' ? "جاري الحجز..." : "Booking...") 
                      : paymentMethod === 'card' 
                        ? (language === 'ar' ? "ادفع واحجز" : "Pay & Reserve")
                        : (language === 'ar' ? "أكد الحجز" : "Confirm Booking")
                    }
                  </Button>

                  <p className="text-center text-gray-600 text-sm mb-4">
                    {paymentMethod === 'card' 
                      ? (language === 'ar' ? 'دفع آمن بالبطاقة الائتمانية' : 'Secure credit card payment')
                      : (language === 'ar' ? 'ستدفع نقداً عند الوصول' : 'You\'ll pay cash upon arrival')
                    }
                  </p>

                  {/* Enhanced Price Breakdown */}
                  {dateRange?.from && dateRange?.to && (
                    <div className="space-y-4 border-t border-gray-200 pt-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900">
                          ${listing.price_per_night_usd} x {calculateTotalNights()} {language === 'ar' ? 'ليالي' : 'nights'}
                        </span>
                        <span className="font-medium">${calculateTotalAmount()}</span>
                      </div>
                      
                      {/* Payment method indicator */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                          {paymentMethod === 'card' ? (
                            <>
                              <CreditCard className="h-4 w-4" />
                              {language === 'ar' ? 'الدفع بالبطاقة' : 'Card payment'}
                            </>
                          ) : (
                            <>
                              <Banknote className="h-4 w-4" />
                              {language === 'ar' ? 'الدفع نقداً' : 'Cash payment'}
                            </>
                          )}
                        </span>
                        <span className="text-nawartu-green font-medium">
                          {paymentMethod === 'cash' 
                            ? (language === 'ar' ? 'عند الوصول' : 'At arrival')
                            : (language === 'ar' ? 'فوري' : 'Now')
                          }
                        </span>
                      </div>
                      
                      <div className="flex justify-between font-semibold text-xl border-t border-gray-200 pt-4">
                        <span>{language === 'ar' ? 'المجموع' : 'Total'}</span>
                        <span>${calculateTotalAmount()}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Photo Gallery Modal */}
        {showAllPhotos && (
          <PropertyImageGallery 
            images={listing.images || []}
            propertyName={listing.name}
          />
        )}

        {/* Date Picker Modal */}
        {showDatePicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-6"></div> {/* Spacer for centering */}
                  <div></div> {/* Title is handled in AirbnbCalendar */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowDatePicker(false)}
                    className="w-6 h-6 p-0 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <AirbnbCalendar
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  language={language}
                />

                <div className="flex justify-end gap-3 mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setDateRange(undefined);
                    }}
                    className="px-6"
                  >
                    {language === 'ar' ? 'مسح التواريخ' : 'Clear dates'}
                  </Button>
                  <Button 
                    onClick={() => setShowDatePicker(false)}
                    disabled={!dateRange?.from || !dateRange?.to}
                    className="px-6 bg-gray-900 hover:bg-gray-800"
                  >
                    {language === 'ar' ? 'إغلاق' : 'Close'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guest Selector Modal */}
        {showGuestSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {language === 'ar' ? 'الضيوف' : 'Guests'}
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowGuestSelector(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mb-6">
                  <GuestSelector
                    value={guests}
                    onChange={setGuests}
                    maxGuests={listing.max_guests}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setShowGuestSelector(false)}>
                    {language === 'ar' ? 'إغلاق' : 'Close'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card Details Modal */}
        <CardDetailsModern
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