import { useState, useEffect } from "react";
import { Heart, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { getAmenityLabel } from "@/lib/amenities";
import { toggleFavorite, getFavorites } from "@/lib/utils";

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
    <Card className="overflow-hidden hover-lift cursor-pointer group pattern-subtle border border-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={property.image} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFavoriteToggle}
          className="absolute top-3 right-3 bg-background/80 hover:bg-background text-foreground rounded-full p-2"
        >
          <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
        <div className="absolute bottom-3 left-3 bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full text-sm font-medium border border-primary/20">
          {language === 'ar' ? property.type : property.type}
        </div>
      </div>

      <CardContent className="p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-semibold text-lg text-foreground line-clamp-1 ${isRTL ? 'text-arabic' : 'text-latin'}`}>
            {property.title}
          </h3>
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{property.rating}</span>
            <span className="text-sm text-muted-foreground">({property.reviews})</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 rtl:space-x-reverse text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
          {property.features.slice(0, 2).map((feature, index) => (
            <span 
              key={index}
              className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full"
            >
              {getAmenityLabel(feature, language)}
            </span>
          ))}
          {property.features.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{property.features.length - 2} {language === 'ar' ? 'المزيد' : 'more'}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className={`${isRTL ? 'text-arabic' : 'text-latin'}`}>
            <span className="text-sm font-medium text-gray-400">
              {formatPrice(property.price, property.currency)}
            </span>
            <span className="text-xs text-gray-400">
              {language === 'ar' ? ' / ليلة' : ' / night'}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/property/${property.id}`)}
            className="bg-primary text-primary-foreground border-primary hover:bg-primary/90 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            {language === 'ar' ? 'عرض' : 'View'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};