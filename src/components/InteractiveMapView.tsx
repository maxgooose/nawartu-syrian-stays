import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import GoogleMap from './GoogleMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GuestSelector } from '@/components/GuestSelector';
import { MapPin, Filter, Search, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedContent } from '@/lib/translation';
import { getTranslatedContentWithAuto } from '@/lib/autoTranslation';

interface Listing {
  id: string;
  name: string;
  name_en?: string;
  name_ar?: string;
  description: string;
  description_en?: string;
  description_ar?: string;
  location: string;
  location_en?: string;
  location_ar?: string;
  price_per_night_usd: number;
  latitude: number | null;
  longitude: number | null;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  amenities: string[];
  host: {
    full_name: string;
  } | null;
}

interface MapFilters {
  priceRange: [number, number];
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  amenities: string[];
}

const InteractiveMapView: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [translatedListings, setTranslatedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 33.5138, lng: 36.2765 });
  const [zoom, setZoom] = useState(10);
  const [filters, setFilters] = useState<MapFilters>({
    priceRange: [0, 1000],
    guests: {
      adults: 1,
      children: 0,
      infants: 0
    },
    amenities: []
  });

  const fetchListings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          host:profiles!listings_host_id_fkey(full_name)
        `)
        .eq('status', 'approved')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;
      setListings(data || []);
      setFilteredListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    const filtered = listings.filter(listing => {
      // Price filter
      const priceMatches = listing.price_per_night_usd >= filters.priceRange[0] && 
                           listing.price_per_night_usd <= filters.priceRange[1];
      
      // Guests filter (only adults count toward max_guests)
      const guestsMatch = listing.max_guests >= filters.guests.adults;
      
      // Amenities filter
      const amenitiesMatch = filters.amenities.length === 0 || 
                            filters.amenities.every(amenity => listing.amenities.includes(amenity));

      return priceMatches && guestsMatch && amenitiesMatch;
    });

    setFilteredListings(filtered);
  }, [listings, filters]);

  const createMapMarkers = useCallback(() => {
    return filteredListings
      .filter(listing => listing.latitude && listing.longitude)
      .map(listing => ({
        lat: listing.latitude!,
        lng: listing.longitude!,
        title: language === 'ar' 
          ? (listing.name_ar || listing.name || listing.name_en)
          : (listing.name_en || listing.name || listing.name_ar),
        icon: selectedListing?.id === listing.id 
          ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
          : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        info: `
          <div style="max-width: 300px;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px;">${listing.name}</h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${listing.location}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;">$${listing.price_per_night_usd} / ليلة</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;">${listing.max_guests} ضيوف • ${listing.bedrooms} غرف نوم</p>
            ${listing.images[0] ? `<img src="${listing.images[0]}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-top: 8px;" />` : ''}
          </div>
        `,
        onClick: () => {
          setSelectedListing(listing);
          setMapCenter({ lat: listing.latitude!, lng: listing.longitude! });
          setZoom(15);
        }
      }));
  }, [filteredListings, selectedListing]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Handle translation when filtered listings or language changes
  useEffect(() => {
    const translateListings = async () => {
      if (filteredListings.length === 0) {
        setTranslatedListings([]);
        return;
      }

      // Show basic translation immediately
      const basicTranslations = filteredListings.map((listing) => {
        const basicContent = getTranslatedContent(listing, language);
        return {
          listing,
          translatedContent: basicContent
        };
      });
      setTranslatedListings(basicTranslations);

      // Then enhance with auto-translation in the background
      const enhancedTranslations = await Promise.all(
        filteredListings.map(async (listing) => {
          const translatedContent = await getTranslatedContentWithAuto(listing, language, true);
          return {
            listing,
            translatedContent
          };
        })
      );
      setTranslatedListings(enhancedTranslations);
    };

    translateListings();
  }, [filteredListings, language]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري تحميل الخريطة التفاعلية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">خريطة العقارات التفاعلية</h1>
          <p className="text-muted-foreground">اكتشف العقارات المتاحة على الخريطة</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  فلترة النتائج
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price Range Filter */}
                <div>
                  <Label className="text-sm font-medium">نطاق السعر (USD)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      type="number"
                      placeholder="من"
                      value={filters.priceRange[0]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]]
                      }))}
                    />
                    <Input
                      type="number"
                      placeholder="إلى"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], parseInt(e.target.value) || 1000]
                      }))}
                    />
                  </div>
                </div>

                {/* Guests Filter */}
                <div>
                  <GuestSelector
                    value={filters.guests}
                    onChange={(guests) => setFilters(prev => ({ ...prev, guests }))}
                    maxGuests={16}
                    variant="dropdown"
                    placeholder={language === 'ar' ? 'اختر عدد الضيوف' : 'Select guests'}
                  />
                </div>

                {/* Common Amenities Filter */}
                <div>
                  <Label className="text-sm font-medium">المرافق</Label>
                  <div className="mt-2 space-y-2">
                    {['wifi', 'parking', 'kitchen', 'air_conditioning', 'pool'].map(amenity => (
                      <label key={amenity} className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, amenities: [...prev.amenities, amenity] }));
                            } else {
                              setFilters(prev => ({ 
                                ...prev, 
                                amenities: prev.amenities.filter(a => a !== amenity) 
                              }));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{amenity.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => setFilters({ 
                    priceRange: [0, 1000], 
                    guests: { adults: 1, children: 0, infants: 0 }, 
                    amenities: [] 
                  })}
                  variant="outline" 
                  className="w-full"
                >
                  إعادة تعيين الفلاتر
                </Button>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {filteredListings.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    عقار متاح
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map and Selected Listing */}
          <div className="lg:col-span-3 space-y-4">
            {/* Map */}
            <Card>
              <CardContent className="p-0">
                <GoogleMap
                  lat={mapCenter.lat}
                  lng={mapCenter.lng}
                  zoom={zoom}
                  height="500px"
                  markers={createMapMarkers()}
                  showNearbyPlaces={true}
                  showDistanceToMajorCities={selectedListing ? true : false}
                  enableGeocoding={true}
                />
              </CardContent>
            </Card>

            {/* Selected Listing Details */}
            {selectedListing && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedListing.name}</span>
                    <Button 
                      onClick={() => navigate(`/property/${selectedListing.id}`)}
                      size="sm"
                    >
                      عرض التفاصيل
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {(() => {
                            const translatedContent = getTranslatedContent(selectedListing, language);
                            return translatedContent.location;
                          })()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {(() => {
                          const translatedContent = getTranslatedContent(selectedListing, language);
                          return translatedContent.description?.slice(0, 150) + '...';
                        })()}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          ${selectedListing.price_per_night_usd} / ليلة
                        </Badge>
                        <Badge variant="outline">
                          {selectedListing.max_guests} ضيوف
                        </Badge>
                        <Badge variant="outline">
                          {selectedListing.bedrooms} غرف نوم
                        </Badge>
                        <Badge variant="outline">
                          {selectedListing.bathrooms} حمامات
                        </Badge>
                      </div>
                    </div>
                    {selectedListing.images[0] && (
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <img 
                          src={selectedListing.images[0]} 
                          alt={language === 'ar' 
                            ? (selectedListing.name_ar || selectedListing.name || selectedListing.name_en)
                            : (selectedListing.name_en || selectedListing.name || selectedListing.name_ar)
                          }
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMapView;