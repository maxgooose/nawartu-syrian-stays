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
      title: language === 'ar' ? 'بيت باب توما التراثي - قلب دمشق القديمة' : 'Bab Touma Heritage House - Heart of Old Damascus',
      location: language === 'ar' ? 'دمشق، باب توما، البلدة القديمة' : 'Damascus, Bab Touma, Old City',
      price: 120,
      currency: 'USD' as const,
      rating: 4.9,
      reviews: 187,
      image: damascusHouse1,
      type: language === 'ar' ? 'بيت دمشقي تراثي' : 'Traditional Damascene House',
      features: language === 'ar' ? 
        ['حوش داخلي مع نافورة', 'ليوان تراثي', 'واي فاي مجاني', 'مطبخ مجهز بالكامل', 'تكييف', 'حديقة خاصة', 'موقف سيارة'] : 
        ['Internal Courtyard with Fountain', 'Traditional Liwan', 'Free WiFi', 'Fully Equipped Kitchen', 'Air Conditioning', 'Private Garden', 'Parking'],
      bedrooms: 3,
      bathrooms: 2,
      guests: 6,
      description: language === 'ar' ? 
        'بيت دمشقي أصيل يعود للقرن الثامن عشر في حي باب توما التاريخي. يتميز بالحوش الداخلي المرصوف بالحجر الأبيض ونافورة وسطية، ليوان تراثي مطل على الحديقة، وغرف واسعة بأسقف خشبية مزينة. الموقع مثالي للوصول إلى الأماكن التاريخية والمقاهي الشعبية.' :
        'Authentic 18th century Damascene house in the historic Bab Touma quarter. Features a white stone courtyard with central fountain, traditional liwan overlooking the garden, and spacious rooms with decorated wooden ceilings. Perfect location for accessing historical sites and traditional cafes.'
    },
    {
      id: '2',
      title: language === 'ar' ? 'دار الياسمين - قصر عثماني مرمم' : 'Dar Al Yasmin - Restored Ottoman Palace',
      location: language === 'ar' ? 'دمشق، الجورة، المدينة القديمة' : 'Damascus, Al Joura, Old City',
      price: 180,
      currency: 'USD' as const,
      rating: 4.8,
      reviews: 156,
      image: damascusHouse2,
      type: language === 'ar' ? 'قصر عثماني' : 'Ottoman Palace',
      features: language === 'ar' ? 
        ['مشربية خشبية أصلية', 'قاعة استقبال فخمة', 'حمام تركي تراثي', 'مكتبة', 'تراس علوي', 'خدمة الإفطار', 'جولة مرشد محلي'] : 
        ['Original Wooden Mashrabiya', 'Grand Reception Hall', 'Traditional Turkish Bath', 'Library', 'Rooftop Terrace', 'Breakfast Service', 'Local Guide Tour'],
      bedrooms: 5,
      bathrooms: 3,
      guests: 10,
      description: language === 'ar' ? 
        'قصر عثماني فخم مرمم بعناية فائقة، يحتفظ بكامل عناصره التراثية الأصلية. يضم قاعات استقبال واسعة بأقواس حجرية، مشربيات خشبية منحوتة يدوياً، وحمام تركي تقليدي. التراس العلوي يوفر إطلالة ساحرة على قباب المدينة القديمة.' :
        'Magnificent Ottoman palace meticulously restored while preserving all original heritage elements. Features grand reception halls with stone arches, hand-carved wooden mashrabiya, and traditional Turkish bath. The rooftop terrace offers enchanting views of the old city domes.'
    },
    {
      id: '3',
      title: language === 'ar' ? 'بيت الورد - واحة هادئة في قلب دمشق' : 'Bait Al Ward - Peaceful Oasis in Damascus Heart',
      location: language === 'ar' ? 'دمشق، القيمرية، البلدة القديمة' : 'Damascus, Al Qaymariyya, Old City',
      price: 95,
      currency: 'USD' as const,
      rating: 4.7,
      reviews: 203,
      image: damascusHouse3,
      type: language === 'ar' ? 'بيت حديقة تراثي' : 'Heritage Garden House',
      features: language === 'ar' ? 
        ['حديقة ياسمين وورد', 'جلسة عربية تقليدية', 'مطبخ دمشقي أصيل', 'مكتبة صغيرة', 'واي فاي عالي السرعة', 'خدمة شاي ترحيبية', 'إفطار دمشقي'] : 
        ['Jasmine & Rose Garden', 'Traditional Arabic Seating', 'Authentic Damascene Kitchen', 'Small Library', 'High-Speed WiFi', 'Welcome Tea Service', 'Damascene Breakfast'],
      bedrooms: 2,
      bathrooms: 2,
      guests: 4,
      description: language === 'ar' ? 
        'بيت دمشقي ساحر يتميز بحديقة غناء مليئة بالياسمين والورد الدمشقي. البيت مرمم بحرفية عالية مع الحفاظ على الطابع التراثي الأصيل. يوفر أجواء هادئة ومريحة مع جلسات عربية تقليدية وإفطار دمشقي شهي يقدم في الحديقة.' :
        'Charming Damascene house featuring a lush garden filled with jasmine and Damascus roses. Expertly restored while maintaining authentic heritage character. Offers peaceful and comfortable atmosphere with traditional Arabic seating and delicious Damascene breakfast served in the garden.'
    },
    {
      id: '4',
      title: language === 'ar' ? 'قصر الشام - تحفة معمارية إسلامية' : 'Qasr Al Sham - Islamic Architectural Masterpiece',
      location: language === 'ar' ? 'دمشق، المدرسة العادلية، البلدة القديمة' : 'Damascus, Al Madrasa Al Adiliyya, Old City',
      price: 250,
      currency: 'USD' as const,
      rating: 4.9,
      reviews: 134,
      image: damascusHouse4,
      type: language === 'ar' ? 'قصر إسلامي' : 'Islamic Palace',
      features: language === 'ar' ? 
        ['قاعة مقرنصات أثرية', 'فسيفساء دمشقية', 'مكتبة تراثية كبيرة', 'صالون موسيقى', 'حمام رخامي فاخر', 'خدمة كونسيرج', 'جولات ثقافية مخصصة'] : 
        ['Historic Muqarnas Hall', 'Damascene Mosaic', 'Large Heritage Library', 'Music Salon', 'Luxury Marble Bath', 'Concierge Service', 'Private Cultural Tours'],
      bedrooms: 4,
      bathrooms: 4,
      guests: 8,
      description: language === 'ar' ? 
        'قصر إسلامي نادر يعود للعصر الأيوبي، يعتبر تحفة معمارية حقيقية. يضم قاعة مقرنصات أثرية فريدة، فسيفساء دمشقية نادرة، ومكتبة تراثية ضخمة. كل غرفة تحكي قصة تاريخية مع وسائل راحة عصرية متطورة.' :
        'Rare Islamic palace from the Ayyubid era, a true architectural masterpiece. Features unique historic muqarnas hall, rare Damascene mosaics, and vast heritage library. Each room tells a historical story while offering sophisticated modern amenities.'
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