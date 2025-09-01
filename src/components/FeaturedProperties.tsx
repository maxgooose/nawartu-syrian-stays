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
          .limit(16);

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
    type: language === 'ar' ? 'عقار' : 'Listing',
    features: listing.amenities?.slice(0, 3) || []
  });

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`mb-12 ${isRTL ? 'text-arabic text-right' : 'text-latin text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="h-12 bg-gray-200 rounded w-1/2 mb-6 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-6 sm:gap-y-10">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mt-2"></div>
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Airbnb-style Section Header */}
        <div className={`mb-12 ${isRTL ? 'text-arabic text-right' : 'text-latin text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 mb-6 leading-tight">
            {language === 'ar' ? 'استكشف الإقامات القريبة' : 'Explore nearby stays'}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl font-light leading-relaxed">
            {language === 'ar' 
              ? 'اكتشف أماكن إقامة فريدة ومميزة في أجمل المناطق السورية'
              : 'Discover unique accommodations in Syria\'s most beautiful destinations'
            }
          </p>
        </div>

        {/* Airbnb-style Property Grid - 2 cols on mobile like Airbnb */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-6 sm:gap-y-10">
          {listings.map((listing) => (
            <PropertyCard 
              key={listing.id}
              property={formatListingForPropertyCard(listing)}
              language={language}
            />
          ))}
        </div>

        {/* Clean CTA Button */}
        <div className={`mt-16 ${isRTL ? 'text-right' : 'text-left'}`}>
          <button 
            onClick={() => window.location.href = '/browse'}
            className="inline-flex items-center gap-2 text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors group"
          >
            {language === 'ar' ? 'عرض جميع العقارات' : 'Show all stays'}
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

        {/* Removed secondary promo section to prioritize more listings */}
      </div>
    </section>
  );
};