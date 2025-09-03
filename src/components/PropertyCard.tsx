import { useState, useEffect } from "react";
import { Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toggleFavorite, getFavorites, openInGoogleMaps } from "@/lib/utils";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    location: string;
    price: number;
    currency: 'USD' | 'SYP';
    rating: number;
    reviews: number;
    image: string;
    type: string;
    features: string[];
  };
  language: 'ar' | 'en';
}

export const PropertyCard = ({ property, language }: PropertyCardProps) => {
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const guestFavorite = property.rating >= 4.8;

  // Initialize favorite state
  useEffect(() => {
    const favorites = getFavorites();
    setIsFavorited(favorites.includes(property.id));
  }, [property.id]);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking heart
    toggleFavorite(property.id);
    setIsFavorited(!isFavorited);
  };

  const formatPrice = (price: number, currency: 'USD' | 'SYP') => {
    if (currency === 'USD') {
      return `$${price}`;
    } else {
      return `${price.toLocaleString()} ل.س`;
    }
  };

  return (
    <div 
      onClick={() => navigate(`/property/${property.id}`)}
      className="cursor-pointer group"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Image Container - Airbnb Style */}
      <div className="relative aspect-square mb-3 overflow-hidden rounded-xl">
        <img 
          src={property.image} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200 ease-out"
        />
        
        {/* Favorite Heart - Airbnb Style */}
        <button
          onClick={handleFavoriteToggle}
          className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform duration-200"
          aria-label={isFavorited ? (language === 'ar' ? 'إزالة من المفضلة' : 'Remove from favorites') : (language === 'ar' ? 'أضف إلى المفضلة' : 'Add to favorites')}
        >
          <Heart 
            className={`h-6 w-6 transition-colors duration-200 ${
              isFavorited 
                ? 'fill-red-500 stroke-red-500' 
                : 'fill-black/20 stroke-white hover:stroke-gray-300'
            }`}
            strokeWidth={1.5}
          />
        </button>

        {/* Guest Favorite Badge */}
        {guestFavorite && (
          <div className="absolute top-3 left-3 bg-white text-gray-900 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
            {language === 'ar' ? 'مفضل الضيوف' : 'Guest favorite'}
          </div>
        )}
      </div>

      {/* Content - Airbnb Style */}
      <div className="space-y-1.5">
        {/* Property Name and Rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className={`text-gray-900 font-medium text-sm sm:text-base line-clamp-2 sm:line-clamp-1 flex-1 ${isRTL ? 'text-arabic text-right' : 'text-latin text-left'}`}>
            {property.title}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="h-3 w-3 fill-black stroke-black" />
          </div>
        </div>

        {/* Property Location */}
        <button 
          onClick={() => openInGoogleMaps({
            name: property.title,
            location: property.location
          })}
          className={`text-gray-600 text-sm line-clamp-2 sm:line-clamp-1 underline decoration-1 underline-offset-2 hover:text-gray-900 transition-colors ${isRTL ? 'text-arabic text-right' : 'text-latin text-left'}`}
        >
          {property.location}
        </button>

        {/* Price */}
        <div className={`pt-1 ${isRTL ? 'text-arabic text-right' : 'text-latin text-left'}`}>
          <span className="text-gray-900 font-medium text-sm">
            {formatPrice(property.price, property.currency)}
          </span>
          <span className="text-gray-600 text-sm font-normal">
            {language === 'ar' ? ' ليلة' : ' night'}
          </span>
        </div>
      </div>
    </div>
  );
};