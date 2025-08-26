import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyCard } from "@/components/PropertyCard";
import { HostRegistrationButton } from "@/components/HostRegistrationButton";
import { Search, Filter, MapPin, Calendar, Users, Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Listing {
  id: string;
  name: string;
  location: string;
  price_per_night_usd: number;
  price_per_night_syp: number | null;
  status: 'pending' | 'approved' | 'rejected';
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  amenities: string[];
  description: string;
  host: {
    full_name: string;
  };
}

interface Booking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  total_nights: number;
  total_amount_usd: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_method: 'stripe' | 'cash';
  listing: {
    name: string;
    images: string[];
    location: string;
  };
}

const GuestDashboard = () => {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [guestCount, setGuestCount] = useState('all');
  const [sortBy, setSortBy] = useState('price-low');
  const navigate = useNavigate();
  const { toast } = useToast();

  const { language } = useLanguage();
  const isRTL = language === 'ar';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user]);

  useEffect(() => {
    filterAndSortListings();
  }, [listings, searchQuery, priceRange, guestCount, sortBy]);

  const fetchData = async () => {
    try {
      // Fetch approved listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select(`
          *,
          host:profiles!listings_host_id_fkey(full_name)
        `)
        .eq('status', 'approved');

      if (listingsError) throw listingsError;

      // Fetch user's bookings if authenticated
      if (profile) {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            listing:listings!bookings_listing_id_fkey(name, images, location)
          `)
          .eq('guest_id', profile.id);

        if (bookingsError) throw bookingsError;
        setBookings(bookingsData || []);
      }

      setListings(listingsData || []);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortListings = () => {
    let filtered = [...listings];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(listing =>
        listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(listing =>
        listing.price_per_night_usd >= min && 
        (max ? listing.price_per_night_usd <= max : true)
      );
    }

    // Guest count filter
    if (guestCount !== 'all') {
      filtered = filtered.filter(listing =>
        listing.max_guests >= parseInt(guestCount)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price_per_night_usd - b.price_per_night_usd;
        case 'price-high':
          return b.price_per_night_usd - a.price_per_night_usd;
        case 'guests':
          return b.max_guests - a.max_guests;
        default:
          return 0;
      }
    });

    setFilteredListings(filtered);
  };

  const getStatusBadge = (status: string) => {
    const labels = {
      pending: 'قيد المراجعة',
      confirmed: 'مؤكد',
      cancelled: 'ملغى',
      completed: 'مكتمل'
    };

    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
      completed: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
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

  return (
    <div className="min-h-screen bg-background pattern-geometric-stars">
      <div className="container-custom py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">مرحباً بك في نورتوا</h1>
            <p className="text-muted-foreground mt-2">اكتشف أجمل العقارات في سوريا</p>
          </div>
          {profile?.role === 'guest' && (
            <HostRegistrationButton 
              variant="outline" 
              size="sm"
              onSuccess={() => navigate('/host-dashboard')}
            />
          )}
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              تصفح العقارات ({filteredListings.length})
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              حجوزاتي ({bookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card className="pattern-subtle border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  البحث والتصفية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4" dir="rtl">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث عن عقار أو موقع..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10 text-right"
                    />
                  </div>

                  {/* Price Range */}
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="نطاق السعر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأسعار</SelectItem>
                      <SelectItem value="0-50">$0 - $50</SelectItem>
                      <SelectItem value="50-100">$50 - $100</SelectItem>
                      <SelectItem value="100-200">$100 - $200</SelectItem>
                      <SelectItem value="200-99999">$200+</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Guest Count */}
                  <Select value={guestCount} onValueChange={setGuestCount}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="عدد الضيوف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">أي عدد</SelectItem>
                      <SelectItem value="1">ضيف واحد</SelectItem>
                      <SelectItem value="2">ضيفان</SelectItem>
                      <SelectItem value="4">4 ضيوف</SelectItem>
                      <SelectItem value="6">6+ ضيوف</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="ترتيب حسب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-low">السعر: منخفض إلى مرتفع</SelectItem>
                      <SelectItem value="price-high">السعر: مرتفع إلى منخفض</SelectItem>
                      <SelectItem value="guests">عدد الضيوف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Properties Grid */}
            {filteredListings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لم يتم العثور على عقارات</h3>
                  <p className="text-muted-foreground">جرب تعديل معايير البحث</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredListings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover-lift cursor-pointer group pattern-subtle border border-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {listing.images?.[0] ? (
                        <img 
                          src={listing.images[0]} 
                          alt={listing.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <MapPin className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-3 right-3 bg-background/80 hover:bg-background text-foreground rounded-full p-2"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardContent className="p-4" dir="rtl">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-foreground line-clamp-1 text-arabic">
                          {listing.name}
                        </h3>
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">4.8</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 rtl:space-x-reverse text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{listing.location}</span>
                      </div>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                          {listing.max_guests} ضيوف
                        </span>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                          {listing.bedrooms} غرف
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-arabic">
                          <span className="text-lg font-bold text-foreground">
                            ${listing.price_per_night_usd}
                          </span>
                          <span className="text-sm text-muted-foreground"> / ليلة</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/property/${listing.id}`)}
                        >
                          عرض التفاصيل
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            {bookings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد حجوزات بعد</h3>
                  <p className="text-muted-foreground mb-4">ابدأ بحجز عقارك الأول!</p>
                  <Button onClick={() => navigate('/browse')}>
                    تصفح العقارات
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="pattern-subtle border border-primary/5">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4" dir="rtl">
                        <div className="flex gap-4">
                          {booking.listing.images?.[0] && (
                            <img 
                              src={booking.listing.images[0]} 
                              alt={booking.listing.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-lg">{booking.listing.name}</h3>
                            <p className="text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {booking.listing.location}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" dir="rtl">
                        <div>
                          <span className="text-muted-foreground block">تاريخ الوصول</span>
                          <span className="font-medium">{new Date(booking.check_in_date).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">تاريخ المغادرة</span>
                          <span className="font-medium">{new Date(booking.check_out_date).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">عدد الليالي</span>
                          <span className="font-medium">{booking.total_nights}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">المبلغ الإجمالي</span>
                          <span className="font-medium">${booking.total_amount_usd}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GuestDashboard;