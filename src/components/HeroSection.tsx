import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import heroProperty from "@/assets/hero-property.jpg";

interface HeroSectionProps {
  language: 'ar' | 'en';
}

export const HeroSection = ({ language }: HeroSectionProps) => {
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: ''
  });

  const isRTL = language === 'ar';

  const handleSearch = () => {
    console.log('Search data:', searchData);
    // TODO: Implement search functionality
  };

  return (
    <section className="relative min-h-screen flex items-center pattern-islamic">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroProperty})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom text-center">
        <div className="max-w-4xl mx-auto animate-slide-up">
          {/* Hero Text */}
          <div className={`mb-12 ${isRTL ? 'text-arabic' : 'text-latin'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 text-shadow">
              {language === 'ar' ? (
                <>
                  <span className="block">اكتشف جمال</span>
                  <span className="block text-secondary">سوريا التراثية</span>
                </>
              ) : (
                <>
                  <span className="block">Discover the Beauty</span>
                  <span className="block text-secondary">of Historic Syria</span>
                </>
              )}
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
              {language === 'ar' 
                ? 'استأجر أجمل العقارات التراثية والحديثة في سوريا. تجربة إقامة أصيلة وفريدة.'
                : 'Rent the most beautiful heritage and modern properties in Syria. An authentic and unique stay experience.'
              }
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-floating max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
              {/* Location */}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {language === 'ar' ? 'الموقع' : 'Location'}
                </label>
                <div className="relative">
                  <MapPin className={`absolute top-3 h-5 w-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    placeholder={language === 'ar' ? 'دمشق، حلب، حمص...' : 'Damascus, Aleppo, Homs...'}
                    value={searchData.location}
                    onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                    className={`${isRTL ? 'pr-10 text-right' : 'pl-10'} h-12`}
                  />
                </div>
              </div>

              {/* Check In */}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {language === 'ar' ? 'تاريخ الوصول' : 'Check In'}
                </label>
                <div className="relative">
                  <Calendar className={`absolute top-3 h-5 w-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    type="date"
                    value={searchData.checkIn}
                    onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                    className={`${isRTL ? 'pr-10 text-right' : 'pl-10'} h-12`}
                  />
                </div>
              </div>

              {/* Check Out */}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {language === 'ar' ? 'تاريخ المغادرة' : 'Check Out'}
                </label>
                <div className="relative">
                  <Calendar className={`absolute top-3 h-5 w-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    type="date"
                    value={searchData.checkOut}
                    onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                    className={`${isRTL ? 'pr-10 text-right' : 'pl-10'} h-12`}
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {language === 'ar' ? 'الضيوف' : 'Guests'}
                </label>
                <div className="relative">
                  <Users className={`absolute top-3 h-5 w-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    type="number"
                    placeholder={language === 'ar' ? 'عدد الضيوف' : 'Number of guests'}
                    value={searchData.guests}
                    onChange={(e) => setSearchData({...searchData, guests: e.target.value})}
                    className={`${isRTL ? 'pr-10 text-right' : 'pl-10'} h-12`}
                  />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              size="lg"
              className="w-full md:w-auto px-12 h-12 text-lg font-semibold hover-lift"
            >
              <Search className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {language === 'ar' ? 'البحث عن عقار' : 'Search Properties'}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">500+</div>
              <div className="text-primary-foreground/80">
                {language === 'ar' ? 'عقار مميز' : 'Premium Properties'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">15</div>
              <div className="text-primary-foreground/80">
                {language === 'ar' ? 'مدينة سورية' : 'Syrian Cities'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">50K+</div>
              <div className="text-primary-foreground/80">
                {language === 'ar' ? 'مسافر راضي' : 'Happy Travelers'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary-foreground/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};