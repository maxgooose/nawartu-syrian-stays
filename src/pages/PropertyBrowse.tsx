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
import { Search, Filter, MapPin, Calendar, Users, Heart, Star, Grid, Map, ArrowLeft } from "lucide-react";
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

const PropertyBrowse = () => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('location') || '');
  const [priceRange, setPriceRange] = useState('all');
  const [guestCount, setGuestCount] = useState(searchParams.get('guests') || 'all');
  const [sortBy, setSortBy] = useState('price-low');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const navigate = useNavigate();
  const { toast } = useToast();

  const isRTL = language === 'ar';

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterAndSortListings();
  }, [listings, searchQuery, priceRange, guestCount, sortBy]);

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
      {/* Hero Section with Islamic Pattern */}
      <section className="relative h-64 pattern-islamic-hero overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60"></div>
        <div className="relative z-10 container-custom h-full flex items-center justify-center">
          <div className={`text-center text-white ${isRTL ? 'text-arabic' : 'text-latin'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'ar' ? 'تصفح العقارات' : 'Browse Properties'}
            </h1>
            <p className="text-xl opacity-90">
              {language === 'ar' 
                ? 'اكتشف أجمل العقارات في سوريا'
                : 'Discover the most beautiful properties in Syria'
              }
            </p>
          </div>
        </div>
      </section>

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

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {language === 'ar' ? 'العقارات المتاحة' : 'Available Properties'}
            </h2>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' 
                ? `${filteredListings.length} عقار متاح`
                : `${filteredListings.length} properties available`
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

        {/* Search and Filters */}
        <Card className="pattern-subtle border border-primary/10 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {language === 'ar' ? 'البحث والتصفية' : 'Search & Filter'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
              {/* Search */}
              <div className="relative">
                <Search className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder={language === 'ar' ? "ابحث عن عقار أو موقع..." : "Search property or location..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
                />
              </div>

              {/* Price Range */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className={isRTL ? 'text-right' : ''}>
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

              {/* Guest Count */}
              <Select value={guestCount} onValueChange={setGuestCount}>
                <SelectTrigger className={isRTL ? 'text-right' : ''}>
                  <SelectValue placeholder={language === 'ar' ? "عدد الضيوف" : "Guest Count"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'أي عدد' : 'Any Number'}</SelectItem>
                  <SelectItem value="1">{language === 'ar' ? 'ضيف واحد' : '1 Guest'}</SelectItem>
                  <SelectItem value="2">{language === 'ar' ? 'ضيفان' : '2 Guests'}</SelectItem>
                  <SelectItem value="4">{language === 'ar' ? '4 ضيوف' : '4 Guests'}</SelectItem>
                  <SelectItem value="6">{language === 'ar' ? '6+ ضيوف' : '6+ Guests'}</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className={isRTL ? 'text-right' : ''}>
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
          </CardContent>
        </Card>

        {/* Properties Grid */}
        {viewMode === 'grid' && (
          <>
            {filteredListings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'ar' ? 'لم يتم العثور على عقارات' : 'No Properties Found'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'جرب تعديل معايير البحث' : 'Try adjusting your search criteria'}
                  </p>
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

                    <CardContent className="p-4" dir={isRTL ? 'rtl' : 'ltr'}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-semibold text-lg text-foreground line-clamp-1 ${isRTL ? 'text-arabic' : 'text-latin'}`}>
                          {listing.name}
                        </h3>
                        <div className={`flex items-center space-x-1 ${isRTL ? 'rtl:space-x-reverse' : ''}`}>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">4.8</span>
                        </div>
                      </div>

                      <div className={`flex items-center space-x-1 ${isRTL ? 'rtl:space-x-reverse' : ''} text-muted-foreground mb-3`}>
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{listing.location}</span>
                      </div>

                      <div className={`flex items-center space-x-2 ${isRTL ? 'rtl:space-x-reverse' : ''} mb-3`}>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                          {listing.max_guests} {language === 'ar' ? 'ضيوف' : 'guests'}
                        </span>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                          {listing.bedrooms} {language === 'ar' ? 'غرف' : 'bedrooms'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className={isRTL ? 'text-arabic' : 'text-latin'}>
                          <span className="text-lg font-bold text-foreground">
                            ${listing.price_per_night_usd}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {language === 'ar' ? ' / ليلة' : ' / night'}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/property/${listing.id}`)}
                        >
                          {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Map View Placeholder */}
        {viewMode === 'map' && (
          <Card className="h-96 flex items-center justify-center">
            <CardContent className="text-center">
              <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'ar' ? 'عرض الخريطة' : 'Map View'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ar' ? 'عرض الخريطة قريباً' : 'Map view coming soon'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PropertyBrowse;