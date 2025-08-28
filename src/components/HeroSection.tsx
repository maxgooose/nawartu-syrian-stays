import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import heroImage from "@/assets/airbnb-style-hero.jpg";
interface HeroSectionProps {
  language: 'ar' | 'en';
}
export const HeroSection = ({
  language
}: HeroSectionProps) => {
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: ''
  });
  const isRTL = language === 'ar';
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchData.location) params.set('location', searchData.location);
    if (searchData.guests) params.set('guests', searchData.guests);
    if (searchData.checkIn) params.set('checkin', searchData.checkIn);
    if (searchData.checkOut) params.set('checkout', searchData.checkOut);
    window.location.href = `/browse?${params.toString()}`;
  };
  return <section className="relative min-h-screen flex items-center overflow-hidden bg-cover bg-center bg-no-repeat" style={{
    backgroundImage: `url(${heroImage})`
  }}>
      {/* Light overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto animate-slide-up">
          {/* Hero Text */}
          <div className={`mb-8 sm:mb-12 ${isRTL ? 'text-arabic' : 'text-latin'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 sm:mb-6">
              {language === 'ar' ? <>
                  <span className="block">الضيافة السورية</span>
                  <span className="block text-primary">عأصولها</span>
                </> : <>
                  <span className="block">Syrian Hospitality</span>
                  <span className="block text-primary">Done Right</span>
                </>}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              {language === 'ar' ? 'استأجر أجمل العقارات التراثية والحديثة في سوريا. تجربة إقامة أصيلة وفريدة.' : 'Rent the most beautiful heritage and modern properties in Syria. An authentic and unique stay experience.'}
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-3 sm:p-6 md:p-8 shadow-lg max-w-4xl sm:max-w-5xl mx-auto border border-border relative animate-fade-in-up mx-2 sm:mx-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-6 relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
              {/* Location */}
              <div className="relative">
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
                  {language === 'ar' ? 'الموقع' : 'Location'}
                </label>
                <div className="relative">
                  <MapPin className={`absolute top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground ${isRTL ? 'right-2.5 sm:right-3' : 'left-2.5 sm:left-3'}`} />
                  <Input placeholder={language === 'ar' ? 'دمشق، حلب، حمص...' : 'Damascus, Aleppo, Homs...'} value={searchData.location} onChange={e => setSearchData({
                  ...searchData,
                  location: e.target.value
                })} className={`${isRTL ? 'pr-7 sm:pr-10 text-right' : 'pl-7 sm:pl-10'} h-9 sm:h-12 text-xs sm:text-base`} />
                </div>
              </div>

              {/* Check In */}
              <div className="relative">
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
                  {language === 'ar' ? 'تاريخ الوصول' : 'Check In'}
                </label>
                <div className="relative">
                  <Calendar className={`absolute top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground ${isRTL ? 'right-2.5 sm:right-3' : 'left-2.5 sm:left-3'}`} />
                  <Input 
                    type="date" 
                    value={searchData.checkIn} 
                    onChange={e => setSearchData({
                      ...searchData,
                      checkIn: e.target.value
                    })} 
                    className={`${isRTL ? 'pr-7 sm:pr-10 text-right' : 'pl-7 sm:pl-10'} h-9 sm:h-12 text-xs sm:text-base`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {!searchData.checkIn && (
                    <div className={`absolute top-2.5 sm:top-3 ${isRTL ? 'right-7 sm:right-10 text-right' : 'left-7 sm:left-10'} text-muted-foreground/70 pointer-events-none text-xs sm:text-base z-10`}>
                      {language === 'ar' ? 'اختر التاريخ' : 'Select date'}
                    </div>
                  )}
                </div>
              </div>

              {/* Check Out */}
              <div className="relative">
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
                  {language === 'ar' ? 'تاريخ المغادرة' : 'Check Out'}
                </label>
                <div className="relative">
                  <Calendar className={`absolute top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground ${isRTL ? 'right-2.5 sm:right-3' : 'left-2.5 sm:left-3'}`} />
                  <Input 
                    type="date" 
                    value={searchData.checkOut} 
                    onChange={e => setSearchData({
                      ...searchData,
                      checkOut: e.target.value
                    })} 
                    className={`${isRTL ? 'pr-7 sm:pr-10 text-right' : 'pl-8 sm:pl-10'} h-9 sm:h-12 text-xs sm:text-base`}
                    min={searchData.checkIn || new Date().toISOString().split('T')[0]}
                  />
                  {!searchData.checkOut && (
                    <div className={`absolute top-2.5 sm:top-3 ${isRTL ? 'right-7 sm:right-10 text-right' : 'left-7 sm:left-10'} text-muted-foreground/70 pointer-events-none text-xs sm:text-base z-10`}>
                      {language === 'ar' ? 'اختر التاريخ' : 'Select date'}
                    </div>
                  )}
                </div>
              </div>

              {/* Guests */}
              <div className="relative">
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2">
                  {language === 'ar' ? 'الضيوف' : 'Guests'}
                </label>
                <div className="relative">
                  <Users className={`absolute top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground ${isRTL ? 'right-2.5 sm:right-3' : 'left-2.5 sm:left-3'}`} />
                  <Input type="number" placeholder={language === 'ar' ? 'عدد الضيوف' : 'Number of guests'} value={searchData.guests} onChange={e => setSearchData({
                  ...searchData,
                  guests: e.target.value
                })} className={`${isRTL ? 'pr-7 sm:pr-10 text-right' : 'pl-7 sm:pl-10'} h-9 sm:h-12 text-xs sm:text-base`} />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <Button onClick={handleSearch} size="lg" className="w-full sm:w-auto px-4 sm:px-12 h-9 sm:h-12 text-sm sm:text-lg font-semibold hover-lift relative z-10">
              <Search className={`h-4 w-4 sm:h-5 sm:w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {language === 'ar' ? 'البحث عن عقار' : 'Search Properties'}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center animate-fade-in-up" style={{
            animationDelay: '0.2s'
          }}>
              
              
            </div>
            <div className="text-center animate-fade-in-up" style={{
            animationDelay: '0.4s'
          }}>
              
              
            </div>
            <div className="text-center animate-fade-in-up" style={{
            animationDelay: '0.6s'
          }}>
              
              
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
        
      </div>
    </section>;
};