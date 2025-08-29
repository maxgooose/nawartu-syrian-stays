import { useEffect, useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { getPublicImageUrl } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface FeaturedPropertiesProps {
  language: 'ar' | 'en';
}

interface Listing {
  id: string;
  name: string;
  location: string;
  price_per_night_usd: number;
  price_per_night_syp?: number;
  images: string[];
  amenities: string[];
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
}

export const FeaturedProperties = ({ language }: FeaturedPropertiesProps) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const isRTL = language === 'ar';

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'approved')
          .limit(8);

        if (error) {
          console.error('Error fetching listings:', error);
          return;
        }

        setListings(data || []);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedListings();
  }, []);

  const formatListingForPropertyCard = (listing: Listing) => ({
    id: listing.id,
    title: listing.name,
    location: listing.location,
    price: listing.price_per_night_usd,
    currency: 'USD' as const,
    rating: 4.5, // Default rating until we implement reviews
    reviews: 0, // Default reviews count
    image: getPublicImageUrl(listing.images?.[0]) || '/placeholder.svg',
    type: language === 'ar' ? 'عقار' : 'Property',
    features: listing.amenities?.slice(0, 3) || []
  });

  if (loading) {
    return (
      <section className="py-16 bg-background pattern-classic-elegant relative">
        <div className="container-custom relative z-10">
          <div className={`text-center mb-12 ${isRTL ? 'text-arabic' : 'text-latin'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {language === 'ar' ? 'عقارات مميزة' : 'Featured Properties'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'اكتشف أجمل العقارات المختارة بعناية في أفضل المواقع السورية'
                : 'Discover the most beautiful carefully selected properties in the best Syrian locations'
              }
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return null; // Don't show the section if no listings
  }

  return (
    <section className="py-16 bg-background pattern-classic-elegant relative">
      <div className="container-custom relative z-10">
        <div className={`text-center mb-12 ${isRTL ? 'text-arabic' : 'text-latin'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === 'ar' ? 'عقارات مميزة' : 'Featured Properties'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'ar' 
              ? 'اكتشف أجمل العقارات المختارة بعناية في أفضل المواقع السورية'
              : 'Discover the most beautiful carefully selected properties in the best Syrian locations'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <PropertyCard 
              key={listing.id}
              property={formatListingForPropertyCard(listing)}
              language={language}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <button 
            onClick={() => window.location.href = '/browse'}
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            {language === 'ar' ? 'عرض جميع العقارات ←' : 'View All Properties →'}
          </button>
        </div>
      </div>
    </section>
  );
};