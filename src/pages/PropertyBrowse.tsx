import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyCard } from "@/components/PropertyCard";
import { GuestSelector } from "@/components/GuestSelector";
import { Search, Filter, MapPin, Calendar, Users, Grid, Map, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
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
  latitude?: number | null;
  longitude?: number | null;
  host: {
    full_name: string;
  };
}

const PropertyBrowse = () => {
  const { language } = useLanguage();
  const [favorites, setFavorites] = useState<string[]>([]);

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
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('location') || '');
  const [priceRange, setPriceRange] = useState('all');
  const [guestCount, setGuestCount] = useState(searchParams.get('guests') || 'all');
  const [guestDetails, setGuestDetails] = useState({
    adults: parseInt(searchParams.get('guests') || '2') || 2,
    children: 0,
    infants: 0
  });
  const [sortBy, setSortBy] = useState('price-low');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();
  const { toast } = useToast();

  const isRTL = language === 'ar';

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterAndSortListings();
    setCurrentPage(1); // Reset to first page when filters change
  }, [listings, searchQuery, priceRange, guestCount, guestDetails, sortBy]);

  const fetchListings = async () => {
    try {
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select(`
          *,
          host:profiles!listings_host_id_fkey(full_name)
        `)
        .eq('status', 'approved');

      if (listingsError) throw listingsError;
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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pattern-subtle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        {/* Clean Header */}
        <div className="mb-8">
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

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {language === 'ar' ? 'تصفح العقارات' : 'Browse Properties'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ar' 
                  ? `${filteredListings.length} عقار متاح للحجز`
                  : `${filteredListings.length} properties available for booking`
                }
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters - Streamlined */}
        <div className="bg-background border border-border rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Search */}
            <div className="relative">
              <Search className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={language === 'ar' ? "ابحث عن عقار أو موقع..." : "Search listing or location..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRTL ? 'pr-10 text-right' : 'pl-10'} h-11`}
              />
            </div>

            {/* Price Range */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className={`h-11 ${isRTL ? 'text-right' : ''}`}>
                <SelectValue placeholder={language === 'ar' ? "نطاق السعر" : "Price Range"} />
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
              <SelectTrigger className={`h-11 ${isRTL ? 'text-right' : ''}`}>
                <SelectValue placeholder={language === 'ar' ? "ترتيب حسب" : "Sort By"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">
                  {language === 'ar' ? 'السعر: منخفض إلى مرتفع' : 'Price: Low to High'}
                </SelectItem>
                <SelectItem value="price-high">
                  {language === 'ar' ? 'السعر: مرتفع إلى منخفض' : 'Price: High to Low'}
                </SelectItem>
                <SelectItem value="guests">
                  {language === 'ar' ? 'عدد الضيوف' : 'Guest Capacity'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Properties Grid */}
        {viewMode === 'grid' && (
          <>
            {filteredListings.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {language === 'ar' ? 'لم يتم العثور على عقارات' : 'No Properties Found'}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {language === 'ar' 
                      ? 'لم نتمكن من العثور على عقارات تطابق معايير البحث الخاصة بك. جرب تعديل الفلاتر أو البحث عن موقع آخر.'
                      : 'We couldn\'t find any properties matching your search criteria. Try adjusting your filters or searching for a different location.'
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery('');
                        setPriceRange('all');
                        setGuestCount('all');
                        setGuestDetails({ adults: 2, children: 0, infants: 0 });
                        setSortBy('price-low');
                      }}
                    >
                      {language === 'ar' ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
                    </Button>
                    <Button onClick={() => navigate('/')}>
                      {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Use same grid layout and PropertyCard component as homepage */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-12">
                  {filteredListings
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((listing, index) => (
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

                {/* Pagination */}
                {Math.ceil(filteredListings.length / itemsPerPage) > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12" dir={isRTL ? 'rtl' : 'ltr'}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {language === 'ar' ? 'السابق' : 'Previous'}
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(filteredListings.length / itemsPerPage) }, (_, i) => (
                        <Button
                          key={i + 1}
                          variant={currentPage === i + 1 ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(i + 1)}
                          className="w-10 h-10"
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredListings.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(filteredListings.length / itemsPerPage)}
                      className="flex items-center gap-2"
                    >
                      {language === 'ar' ? 'التالي' : 'Next'}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Map View Placeholder */}
        {viewMode === 'map' && (
          <div className="h-96 border border-border rounded-lg flex items-center justify-center bg-muted/30">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Map className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {language === 'ar' ? 'عرض الخريطة' : 'Map View'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ar' ? 'عرض الخريطة قريباً' : 'Map view coming soon'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyBrowse;