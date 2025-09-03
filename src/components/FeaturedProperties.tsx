import { useEffect, useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { getPublicImageUrl } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { getTranslatedContent } from "@/lib/translation";
import { getTranslatedContentWithAuto } from "@/lib/autoTranslation";

interface FeaturedPropertiesProps {
  language: 'ar' | 'en';
}

interface Listing {
  id: string;
  name: string;
  name_en?: string;
  name_ar?: string;
  description?: string;
  description_en?: string;
  description_ar?: string;
  location: string;
  location_en?: string;
  location_ar?: string;
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
  const [translatedListings, setTranslatedListings] = useState<any[]>([]);
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

  // Translate listings when language or listings change
  useEffect(() => {
    const translateListings = async () => {
      if (listings.length === 0) {
        setTranslatedListings([]);
        return;
      }

      const translations = await Promise.all(
        listings.map(async (listing) => {
          const translatedContent = await getTranslatedContentWithAuto(listing, language, true);
          return {
            listing,
            translatedContent,
            formattedCard: formatListingForPropertyCard(listing, translatedContent)
          };
        })
      );
      setTranslatedListings(translations);
    };

    translateListings();
  }, [listings, language]);

  const formatListingForPropertyCard = (listing: Listing, translatedContent?: any) => {
    // Use provided translated content or fall back to basic translation
    const content = translatedContent || getTranslatedContent(listing, language);
    
    return {
      id: listing.id,
      title: content.name,
      location: content.location,
      price: listing.price_per_night_usd,
      currency: 'USD' as const,
      rating: 4.5, // Default rating until we implement reviews
      reviews: 0, // Default reviews count
      image: getPublicImageUrl(listing.images?.[0]) || '/placeholder.svg',
      type: language === 'ar' ? 'عقار' : 'Listing',
      features: listing.amenities?.slice(0, 3) || []
    };
  };

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
    <section className="py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Modern Section Header */}
        <div className={`mb-20 text-center ${isRTL ? 'text-arabic' : 'text-latin'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 mb-8 leading-tight">
            {language === 'ar' ? 'استكشف الإقامات الاستثنائية' : 'Exceptional Stays'}
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
            {language === 'ar' 
              ? 'مجموعة مختارة من أفضل أماكن الإقامة التي تجمع بين الأصالة والحداثة'
              : 'A curated collection of extraordinary accommodations blending authenticity with modern luxury'
            }
          </p>
          
          {/* Decorative line */}
          <div className="mt-12 flex justify-center">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
          </div>
        </div>

        {/* Modern Property Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-12">
          {translatedListings.map((item, index) => (
            <div 
              key={item.listing.id}
              className="group cursor-pointer"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <PropertyCard 
                property={item.formattedCard}
                language={language}
              />
            </div>
          ))}
        </div>

        {/* Elegant CTA Section */}
        <div className="mt-24 text-center">
          <div className="inline-flex flex-col items-center">
            <button 
              onClick={() => window.location.href = '/browse'}
              className="group relative inline-flex items-center gap-3 px-12 py-4 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {language === 'ar' ? 'استكشف جميع العقارات' : 'Discover All Properties'}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <p className="mt-4 text-gray-500 text-sm font-light">
              {language === 'ar' ? 'اكتشف ما يناسبك' : 'Discover what\'s yours'}
            </p>
          </div>
        </div>

        {/* Removed secondary promo section to prioritize more listings */}
      </div>
    </section>
  );
};