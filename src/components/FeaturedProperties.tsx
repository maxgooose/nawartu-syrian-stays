import { PropertyCard } from "./PropertyCard";
import damascusHouse1 from "@/assets/damascus-house-1.jpg";
import damascusHouse2 from "@/assets/damascus-house-2.jpg";
import damascusHouse3 from "@/assets/damascus-house-3.jpg";
import damascusHouse4 from "@/assets/damascus-house-4.jpg";

interface FeaturedPropertiesProps {
  language: 'ar' | 'en';
}

export const FeaturedProperties = ({ language }: FeaturedPropertiesProps) => {
  const isRTL = language === 'ar';

  // Mock data - this would come from your backend
  const featuredProperties = [
    {
      id: '1',
      title: language === 'ar' ? 'بيت دمشقي تراثي في البلدة القديمة' : 'Heritage Damascene House in Old City',
      location: language === 'ar' ? 'دمشق، البلدة القديمة' : 'Damascus, Old City',
      price: 85,
      currency: 'USD' as const,
      rating: 4.8,
      reviews: 127,
      image: damascusHouse1,
      type: language === 'ar' ? 'بيت تراثي' : 'Heritage House',
      features: language === 'ar' ? ['حديقة خاصة', 'واي فاي', 'مطبخ كامل'] : ['Private Garden', 'WiFi', 'Full Kitchen']
    },
    {
      id: '2',
      title: language === 'ar' ? 'شقة حديثة مع إطلالة على قلعة حلب' : 'Modern Apartment with Citadel View',
      location: language === 'ar' ? 'حلب، المدينة الجديدة' : 'Aleppo, New City',
      price: 320000,
      currency: 'SYP' as const,
      rating: 4.6,
      reviews: 89,
      image: damascusHouse2,
      type: language === 'ar' ? 'شقة' : 'Apartment',
      features: language === 'ar' ? ['إطلالة رائعة', 'مكيف', 'موقف سيارة'] : ['Great View', 'AC', 'Parking']
    },
    {
      id: '3',
      title: language === 'ar' ? 'فيلا فاخرة على ساحل طرطوس' : 'Luxury Villa on Tartus Coast',
      location: language === 'ar' ? 'طرطوس، الساحل' : 'Tartus, Coast',
      price: 150,
      currency: 'USD' as const,
      rating: 4.9,
      reviews: 203,
      image: damascusHouse3,
      type: language === 'ar' ? 'فيلا' : 'Villa',
      features: language === 'ar' ? ['أمام البحر', 'مسبح خاص', 'شرفة كبيرة'] : ['Beachfront', 'Private Pool', 'Large Terrace']
    },
    {
      id: '4',
      title: language === 'ar' ? 'استراحة جبلية في جبال اللاذقية' : 'Mountain Retreat in Latakia Mountains',
      location: language === 'ar' ? 'اللاذقية، الجبال' : 'Latakia, Mountains',
      price: 480000,
      currency: 'SYP' as const,
      rating: 4.7,
      reviews: 156,
      image: damascusHouse4,
      type: language === 'ar' ? 'كوخ' : 'Cabin',
      features: language === 'ar' ? ['إطلالة جبلية', 'هواء نقي', 'مدفأة'] : ['Mountain View', 'Fresh Air', 'Fireplace']
    }
  ];

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
          {featuredProperties.map((property) => (
            <PropertyCard 
              key={property.id}
              property={property}
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