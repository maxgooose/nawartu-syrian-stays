import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Users, X } from "lucide-react";
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
  
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const isRTL = language === 'ar';
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchData.location) params.set('location', searchData.location);
    if (searchData.guests) params.set('guests', searchData.guests);
    if (searchData.checkIn) params.set('checkin', searchData.checkIn);
    if (searchData.checkOut) params.set('checkout', searchData.checkOut);
    window.location.href = `/browse?${params.toString()}`;
  };
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url(${heroImage})`
    }}>
      {/* Subtle overlay for better text readability - reduced opacity to show more of the hero image */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20"></div>

      {/* Floating Search Bar - Minimalist Apple-style */}
      <div className="absolute top-6 left-4 right-4 z-50">
        {!isSearchExpanded ? (
          // Collapsed floating search bar
          <div 
            onClick={() => setIsSearchExpanded(true)}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 cursor-pointer transition-all duration-300 hover:bg-white/15 hover:scale-105 shadow-lg"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-white/90" />
                <span className="text-white/90 font-medium">
                  {language === 'ar' ? 'البحث عن عقار...' : 'Search properties...'}
                </span>
              </div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            </div>
          </div>
        ) : (
          // Expanded search form with glass morphism
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl transition-all duration-500 animate-slide-down">
            {/* Close button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsSearchExpanded(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <X className="h-5 w-5 text-white/90" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
              {/* Location */}
              <div className="relative">
                <label className="block text-sm font-medium text-white/90 mb-2">
                  {language === 'ar' ? 'الموقع' : 'Location'}
                </label>
                <div className="relative">
                  <MapPin className={`absolute top-3 h-5 w-5 text-white/70 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input 
                    placeholder={language === 'ar' ? 'دمشق، حلب، حمص...' : 'Damascus, Aleppo, Homs...'} 
                    value={searchData.location} 
                    onChange={e => setSearchData({...searchData, location: e.target.value})} 
                    className={`${isRTL ? 'pr-10 text-right' : 'pl-10'} h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/15 focus:border-white/30`} 
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="relative">
                <label className="block text-sm font-medium text-white/90 mb-2">
                  {language === 'ar' ? 'الضيوف' : 'Guests'}
                </label>
                <div className="relative">
                  <Users className={`absolute top-3 h-5 w-5 text-white/70 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input 
                    type="number" 
                    placeholder={language === 'ar' ? 'عدد الضيوف' : 'Number of guests'} 
                    value={searchData.guests} 
                    onChange={e => setSearchData({...searchData, guests: e.target.value})} 
                    className={`${isRTL ? 'pr-10 text-right' : 'pl-10'} h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/15 focus:border-white/30`} 
                  />
                </div>
              </div>

              {/* Check In */}
              <div className="relative">
                <label className="block text-sm font-medium text-white/90 mb-2">
                  {language === 'ar' ? 'تاريخ الوصول' : 'Check In'}
                </label>
                <div className="relative">
                  <Calendar className={`absolute top-3 h-5 w-5 text-white/70 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input 
                    type="date" 
                    value={searchData.checkIn} 
                    onChange={e => setSearchData({...searchData, checkIn: e.target.value})} 
                    className={`${isRTL ? 'pr-10 text-right' : 'pl-10'} h-12 bg-white/10 border-white/20 text-white focus:bg-white/15 focus:border-white/30`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Check Out */}
              <div className="relative">
                <label className="block text-sm font-medium text-white/90 mb-2">
                  {language === 'ar' ? 'تاريخ المغادرة' : 'Check Out'}
                </label>
                <div className="relative">
                  <Calendar className={`absolute top-3 h-5 w-5 text-white/70 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input 
                    type="date" 
                    value={searchData.checkOut} 
                    onChange={e => setSearchData({...searchData, checkOut: e.target.value})} 
                    className={`${isRTL ? 'pr-10 text-right' : 'pl-10'} h-12 bg-white/10 border-white/20 text-white focus:bg-white/15 focus:border-white/30`}
                    min={searchData.checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <Button 
              onClick={() => {
                handleSearch();
                setIsSearchExpanded(false);
              }} 
              size="lg" 
              className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Search className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {language === 'ar' ? 'البحث عن عقار' : 'Search Properties'}
            </Button>
          </div>
        )}
      </div>

      {/* Hero Content - Repositioned to be more visible */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-32">
        <div className="max-w-4xl mx-auto animate-slide-up">
          {/* Hero Text */}
          <div className={`mb-16 ${isRTL ? 'text-arabic' : 'text-latin'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              {language === 'ar' ? <>
                  <span className="block">الضيافة السورية</span>
                  <span className="block text-primary drop-shadow-xl">عأصولها</span>
                </> : <>
                  <span className="block">Syrian Hospitality</span>
                  <span className="block text-primary drop-shadow-xl">Done Right</span>
                </>}
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-white/90 max-w-3xl mx-auto leading-relaxed px-4 drop-shadow-md">
              {language === 'ar' ? 'استأجر أجمل العقارات التراثية والحديثة في سوريا. تجربة إقامة أصيلة وفريدة.' : 'Rent the most beautiful heritage and modern properties in Syria. An authentic and unique stay experience.'}
            </p>
          </div>

          {/* Stats - Made more subtle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center animate-fade-in-up opacity-80" style={{ animationDelay: '0.2s' }}>
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-white/70">{language === 'ar' ? 'عقار' : 'Properties'}</div>
            </div>
            <div className="text-center animate-fade-in-up opacity-80" style={{ animationDelay: '0.4s' }}>
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-white/70">{language === 'ar' ? 'مدينة' : 'Cities'}</div>
            </div>
            <div className="text-center animate-fade-in-up opacity-80" style={{ animationDelay: '0.6s' }}>
              <div className="text-2xl font-bold text-white">10k+</div>
              <div className="text-white/70">{language === 'ar' ? 'ضيف سعيد' : 'Happy Guests'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};