import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, addDays } from "date-fns";
import { ar } from "date-fns/locale";

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
  host: {
    full_name: string;
    avatar_url?: string;
  };
}

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  air_conditioning: AirVent,
  kitchen: Coffee,
  security: Shield,
  elevator: Zap,
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

  // Mock language - in real app this would come from context
  const language: 'ar' | 'en' = 'ar';
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

    setBookingLoading(true);

    try {
      const { error } = await supabase
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
        });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: paymentMethod === 'cash' 
          ? "تم إرسال طلب الحجز. سيتم التواصل معك قريباً لتأكيد الحجز."
          : "تم إرسال طلب الحجز. ستتم إعادة توجيهك للدفع.",
      });

      if (paymentMethod === 'stripe') {
        // TODO: Redirect to Stripe payment
        navigate('/guest-dashboard');
      } else {
        navigate('/guest-dashboard');
      }
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
            {/* Image Gallery */}
            <Card className="overflow-hidden pattern-subtle border border-primary/10">
              <div className="relative aspect-[16/10]">
                {listing.images?.[currentImageIndex] ? (
                  <img 
                    src={listing.images[currentImageIndex]} 
                    alt={listing.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Image Navigation */}
                {listing.images && listing.images.length > 1 && (
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {listing.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentImageIndex 
                            ? 'bg-white' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Favorite Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 bg-background/80 hover:bg-background text-foreground rounded-full p-2"
                >
                  <Heart className="h-5 w-5" />
                </Button>
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
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">4.8</span>
                    <span className="text-muted-foreground">(127 تقييم)</span>
                  </div>
                </div>

                {/* Property Stats */}
                <div className="flex gap-6 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.max_guests} ضيوف</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.bedrooms} غرف نوم</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.bathrooms} حمام</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">وصف العقار</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {listing.description}
                  </p>
                </div>

                {/* Amenities */}
                {listing.amenities && listing.amenities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">المرافق والخدمات</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {listing.amenities.map((amenity) => {
                        const IconComponent = amenityIcons[amenity] || Zap;
                        return (
                          <div key={amenity} className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-primary" />
                            <span className="text-sm">{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
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