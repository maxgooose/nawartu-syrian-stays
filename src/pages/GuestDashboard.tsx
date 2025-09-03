import { useState, useEffect, useCallback } from "react";
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
import { GuestSelector } from "@/components/GuestSelector";
import { Search, Filter, MapPin, Calendar, Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getPublicImageUrl, toggleFavorite, getFavorites } from "@/lib/utils";
import { getTranslatedContent } from "@/lib/translation";

interface Listing {
  id: string;
  name: string;
  name_en?: string;
  name_ar?: string;
  location: string;
  location_en?: string;
  location_ar?: string;
  price_per_night_usd: number;
  price_per_night_syp: number | null;
  status: 'pending' | 'approved' | 'rejected';
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  amenities: string[];
  description: string;
  description_en?: string;
  description_ar?: string;
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
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);

  const isRTL = language === 'ar';

  // Initialize favorites
  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleFavoriteToggle = (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking heart
    toggleFavorite(propertyId);
    setFavorites(getFavorites()); // Update local state
  };

  // Transform listing data to PropertyCard format with proper language handling
  const formatListingForPropertyCard = (listing: Listing) => {
    // Get translated content based on current language
    const translatedContent = getTranslatedContent(listing, language);
    
    return {
      id: listing.id,
      title: translatedContent.name,
      location: translatedContent.location,
      price: listing.price_per_night_usd,
      currency: 'USD' as const,
      rating: 4.8, // Default rating until we implement reviews
      reviews: 0, // Default reviews count
      image: getPublicImageUrl(listing.images?.[0]) || '/placeholder.svg',
      type: language === 'ar' ? 'عقار' : 'Listing',
      features: listing.amenities?.slice(0, 3) || []
    };
  };
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [guestCount, setGuestCount] = useState('all');
  const [guestDetails, setGuestDetails] = useState({
    adults: 2,
    children: 0,
    infants: 0
  });
  const [sortBy, setSortBy] = useState('price-low');

  const fetchData = useCallback(async () => {
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
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "حدث خطأ في تحميل البيانات" : "Error loading data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [profile, toast, language]);

  const filterAndSortListings = useCallback(() => {
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
    
    // Guest details filter (only adults count toward max_guests)
    if (guestDetails.adults > 0) {
      filtered = filtered.filter(listing =>
        listing.max_guests >= guestDetails.adults
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
  }, [listings, searchQuery, priceRange, guestCount, guestDetails, sortBy]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user, navigate, fetchData]);

  useEffect(() => {
    filterAndSortListings();
  }, [filterAndSortListings]);

  const getStatusBadge = (status: string) => {
    const labels = {
      pending: language === 'ar' ? 'قيد المراجعة' : 'Pending',
      confirmed: language === 'ar' ? 'مؤكد' : 'Confirmed',
      cancelled: language === 'ar' ? 'ملغى' : 'Cancelled',
      completed: language === 'ar' ? 'مكتمل' : 'Completed'
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
      <div className="min-h-screen flex items-center justify-center pattern-subtle" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
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
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {language === 'ar' ? 'مرحباً بك في نورتوا' : 'Welcome to Nawartu'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'ar' ? 'اكتشف أجمل العقارات في سوريا' : 'Discover the most beautiful properties in Syria'}
            </p>
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
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              {language === 'ar' ? 'تصفح العقارات' : 'Browse Properties'} ({filteredListings.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {language === 'ar' ? 'المفضلة' : 'Favorites'} ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {language === 'ar' ? 'حجوزاتي' : 'My Bookings'} ({bookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card className="pattern-subtle border border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  {language === 'ar' ? 'البحث والتصفية' : 'Search & Filters'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                    <Input
                      placeholder={language === 'ar' ? 'ابحث عن عقار أو موقع...' : 'Search for listing or location...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={isRTL ? 'pr-10 text-right' : 'pl-10 text-left'}
                    />
                  </div>

                  {/* Price Range */}
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                      <SelectValue placeholder={language === 'ar' ? 'نطاق السعر' : 'Price Range'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === 'ar' ? 'جميع الأسعار' : 'All Prices'}</SelectItem>
                      <SelectItem value="0-50">$0 - $50</SelectItem>
                      <SelectItem value="50-100">$50 - $100</SelectItem>
                      <SelectItem value="100-200">$100 - $200</SelectItem>
                      <SelectItem value="200-99999">$200+</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Guest Details */}
                  <div className="col-span-2">
                    <GuestSelector
                      value={guestDetails}
                      onChange={setGuestDetails}
                      maxGuests={16}
                      variant="dropdown"
                      placeholder={language === 'ar' ? 'اختر عدد الضيوف' : 'Select guests'}
                    />
                  </div>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                      <SelectValue placeholder={language === 'ar' ? 'ترتيب حسب' : 'Sort by'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-low">
                        {language === 'ar' ? 'السعر: منخفض إلى مرتفع' : 'Price: Low to High'}
                      </SelectItem>
                      <SelectItem value="price-high">
                        {language === 'ar' ? 'السعر: مرتفع إلى منخفض' : 'Price: High to Low'}
                      </SelectItem>
                      <SelectItem value="guests">
                        {language === 'ar' ? 'عدد الضيوف' : 'Guest Count'}
                      </SelectItem>
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
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'ar' ? 'لم يتم العثور على عقارات' : 'No properties found'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'جرب تعديل معايير البحث' : 'Try adjusting your search criteria'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-12">
                {filteredListings.map((listing, index) => (
                  <div 
                    key={listing.id}
                    className="group cursor-pointer"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <PropertyCard 
                      property={formatListingForPropertyCard(listing)}
                      language={language}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            {favorites.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'ar' ? 'لا توجد عقارات مفضلة بعد' : 'No favorite properties yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {language === 'ar' ? 'ابدأ بإضافة عقارات إلى المفضلة!' : 'Start adding properties to your favorites!'}
                  </p>
                  <Button onClick={() => navigate('/browse')}>
                    {language === 'ar' ? 'تصفح العقارات' : 'Browse Properties'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-12">
                {listings.filter(listing => favorites.includes(listing.id)).map((listing, index) => (
                  <div 
                    key={listing.id}
                    className="group cursor-pointer"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <PropertyCard 
                      property={formatListingForPropertyCard(listing)}
                      language={language}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            {bookings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'ar' ? 'لا توجد حجوزات بعد' : 'No bookings yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {language === 'ar' ? 'ابدأ بحجز عقارك الأول!' : 'Start by booking your first listing!'}
                  </p>
                  <Button onClick={() => navigate('/browse')}>
                    {language === 'ar' ? 'تصفح العقارات' : 'Browse Properties'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="pattern-subtle border border-primary/5">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          {booking.listing.images?.[0] && (
                            <img 
                              src={getPublicImageUrl(booking.listing.images[0]) || '/placeholder.svg'} 
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
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block">
                            {language === 'ar' ? 'تاريخ الوصول' : 'Check-in Date'}
                          </span>
                          <span className="font-medium">
                            {new Date(booking.check_in_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </span>
                    </div>
                        <div>
                          <span className="text-muted-foreground block">
                            {language === 'ar' ? 'تاريخ المغادرة' : 'Check-out Date'}
                          </span>
                          <span className="font-medium">
                            {new Date(booking.check_out_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </span>
                    </div>
                        <div>
                          <span className="text-muted-foreground block">
                            {language === 'ar' ? 'عدد الليالي' : 'Number of Nights'}
                          </span>
                          <span className="font-medium">{booking.total_nights}</span>
                    </div>
                        <div>
                          <span className="text-muted-foreground block">
                            {language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}
                          </span>
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