// @ts-nocheck
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Users, X } from "lucide-react";
import { GuestSelector } from "@/components/GuestSelector";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import heroImage from "@/assets/airbnb-style-hero.jpg";
import SyrianGovernorateDropdown from "@/components/SyrianGovernorateDropdown";
import { SyrianGovernorate, SYRIAN_GOVERNORATES } from "@/lib/syrianGovernorates";

interface HeroSectionProps {
  language: 'ar' | 'en';
}

export const HeroSection = ({
  language
}: HeroSectionProps) => {
  const [searchData, setSearchData] = useState({
    location: '',
    governorate: null as SyrianGovernorate | null,
    dateRange: undefined,
    guests: {
      adults: 2,
      children: 0,
      infants: 0
    }
  });

  const [activeSection, setActiveSection] = useState<'where' | 'when' | 'who' | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const isRTL = language === 'ar';
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setActiveSection(null);
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    // Validate required fields
    if (!searchData.governorate && !searchData.location) {
      alert(language === 'ar' ? 'يرجى اختيار موقع' : 'Please select a location');
      return;
    }
    
    if (!searchData.dateRange?.from || !searchData.dateRange?.to) {
      alert(language === 'ar' ? 'يرجى اختيار تواريخ الإقامة' : 'Please select stay dates');
      return;
    }

    const params = new URLSearchParams();
    if (searchData.governorate) {
      params.set('governorate', searchData.governorate.id);
      params.set('location', searchData.governorate.nameAr);
    } else if (searchData.location) {
      params.set('location', searchData.location);
    }
    
    if (searchData.dateRange?.from) {
      params.set('checkin', searchData.dateRange.from.toISOString().split('T')[0]);
    }
    if (searchData.dateRange?.to) {
      params.set('checkout', searchData.dateRange.to.toISOString().split('T')[0]);
    }
    
    if (searchData.guests.adults > 0) {
      params.set('guests', searchData.guests.adults.toString());
    }
    if (searchData.guests.children > 0) {
      params.set('children', searchData.guests.children.toString());
    }
    if (searchData.guests.infants > 0) {
      params.set('infants', searchData.guests.infants.toString());
    }
    
    window.location.href = `/browse?${params.toString()}`;
  };

  const getGuestText = () => {
    const total = searchData.guests.adults + searchData.guests.children + searchData.guests.infants;
    if (total === 1) return language === 'ar' ? '1 ضيف' : '1 guest';
    if (total === 2) return language === 'ar' ? '2 ضيف' : '2 guests';
    return language === 'ar' ? `${total} ضيوف` : `${total} guests`;
  };

  const getDateText = () => {
    if (!searchData.dateRange?.from) {
      return language === 'ar' ? 'أضف تاريخ' : 'Add dates';
    }
    if (!searchData.dateRange?.to) {
      return language === 'ar' ? 'اختر تاريخ المغادرة' : 'Select check-out';
    }
    return `${searchData.dateRange.from.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')} - ${searchData.dateRange.to.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}`;
  };

  const getLocationText = () => {
    if (searchData.governorate) {
      return searchData.governorate.nameAr;
    }
    if (searchData.location) {
      return searchData.location;
    }
    return language === 'ar' ? 'أين تريد الذهاب؟' : 'Where to?';
  };

  const handleGovernorateSelect = (governorate: SyrianGovernorate) => {
    setSearchData(prev => ({
      ...prev,
      governorate: governorate,
      location: governorate.nameAr
    }));
    setActiveSection(null);
  };

  const handleDateRangeChange = (range: any) => {
    setSearchData(prev => ({ ...prev, dateRange: range }));
    if (range?.from && range?.to) {
      setActiveSection(null);
    }
  };

  const handleGuestChange = (guests: any) => {
    setSearchData(prev => ({ ...prev, guests }));
    setActiveSection(null);
  };

  const handleSectionClick = (section: 'where' | 'when' | 'who') => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url(${heroImage})`
    }}>
      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20"></div>

      {/* Airbnb-style Search Bar */}
      <div className="absolute top-6 left-4 right-4 z-50" ref={searchRef}>
        <div className="bg-white rounded-full shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center">
            {/* Where Section */}
            <div 
              className={`flex-1 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                activeSection === 'where' ? 'bg-gray-50' : ''
              }`}
              onClick={() => handleSectionClick('where')}
            >
              <div className="text-xs font-semibold text-gray-800 mb-1">
                {language === 'ar' ? 'أين' : 'Where'}
              </div>
              <div className="text-sm text-gray-600 truncate">
                {getLocationText()}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-12 bg-gray-300"></div>

            {/* When Section */}
            <div 
              className={`flex-1 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                activeSection === 'when' ? 'bg-gray-50' : ''
              }`}
              onClick={() => handleSectionClick('when')}
            >
              <div className="text-xs font-semibold text-gray-800 mb-1">
                {language === 'ar' ? 'متى' : 'When'}
              </div>
              <div className="text-sm text-gray-600 truncate">
                {getDateText()}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-12 bg-gray-300"></div>

            {/* Who Section */}
            <div 
              className={`flex-1 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                activeSection === 'who' ? 'bg-gray-50' : ''
              }`}
              onClick={() => handleSectionClick('who')}
            >
              <div className="text-xs font-semibold text-gray-800 mb-1">
                {language === 'ar' ? 'من' : 'Who'}
              </div>
              <div className="text-sm text-gray-600 truncate">
                {getGuestText()}
              </div>
            </div>

            {/* Search Button */}
            <div className="px-2 py-2">
              <Button 
                onClick={handleSearch}
                size="sm" 
                className="h-10 w-10 p-0 rounded-full bg-primary hover:bg-primary/90"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dropdown Panels - Properly positioned */}
        {activeSection && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Where Panel */}
            {activeSection === 'where' && (
              <div className="p-6">
                <div className="text-lg font-semibold text-gray-800 mb-4">
                  {language === 'ar' ? 'أين تريد الذهاب؟' : 'Where to?'}
                </div>
                
                {/* Search Input */}
                <div className="mb-4">
                  <SyrianGovernorateDropdown
                    onGovernorateSelect={handleGovernorateSelect}
                    selectedGovernorate={searchData.governorate}
                    placeholder={language === 'ar' ? 'اختر المحافظة...' : 'Select governorate...'}
                    showSearch={true}
                    className="h-12"
                  />
                </div>

                {/* Popular Locations */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    {language === 'ar' ? 'المواقع الشائعة' : 'Popular locations'}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'damascus', nameAr: 'دمشق', nameEn: 'Damascus', icon: '🏛️' },
                      { id: 'aleppo', nameAr: 'حلب', nameEn: 'Aleppo', icon: '🏰' },
                      { id: 'latakia', nameAr: 'اللاذقية', nameEn: 'Latakia', icon: '🌊' },
                      { id: 'homs', nameAr: 'حمص', nameEn: 'Homs', icon: '🏺' }
                    ].map((location) => (
                      <button
                        key={location.id}
                        onClick={() => {
                          const governorate = SYRIAN_GOVERNORATES.find(g => 
                            g.nameEn.toLowerCase().includes(location.nameEn.toLowerCase()) ||
                            g.nameAr.includes(location.nameAr)
                          );
                          if (governorate) {
                            handleGovernorateSelect(governorate);
                          }
                        }}
                        className="flex items-center gap-2 p-3 text-left rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                      >
                        <span className="text-lg">{location.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800 group-hover:text-primary">
                            {language === 'ar' ? location.nameAr : location.nameEn}
                          </div>
                          <div className="text-xs text-gray-500">
                            {language === 'ar' ? location.nameEn : location.nameAr}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const { latitude, longitude } = position.coords;
                              const nearest = SYRIAN_GOVERNORATES.reduce((nearest, current) => {
                                const nearestDist = Math.sqrt(
                                  Math.pow(latitude - nearest.latitude, 2) + 
                                  Math.pow(longitude - nearest.longitude, 2)
                                );
                                const currentDist = Math.sqrt(
                                  Math.pow(latitude - current.latitude, 2) + 
                                  Math.pow(longitude - current.longitude, 2)
                                );
                                return currentDist < nearestDist ? current : nearest;
                              });
                              handleGovernorateSelect(nearest);
                            },
                            () => {
                              alert(language === 'ar' ? 'لا يمكن تحديد موقعك' : 'Cannot determine your location');
                            }
                          );
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors duration-200"
                    >
                      <MapPin className="h-4 w-4" />
                      {language === 'ar' ? 'موقعي الحالي' : 'My location'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* When Panel - Calendar */}
            {activeSection === 'when' && (
              <div className="p-6">
                <div className="text-lg font-semibold text-gray-800 mb-4">
                  {language === 'ar' ? 'متى تريد الإقامة؟' : 'When do you want to stay?'}
                </div>
                <DateRangePicker
                  dateRange={searchData.dateRange}
                  onDateRangeChange={handleDateRangeChange}
                  language={language}
                  placeholder={language === 'ar' ? 'اختر التواريخ' : 'Select dates'}
                  variant="default"
                />
                {searchData.dateRange?.from && searchData.dateRange?.to && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm text-green-800">
                      {language === 'ar' ? 'تم اختيار التواريخ بنجاح!' : 'Dates selected successfully!'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Who Panel */}
            {activeSection === 'who' && (
              <div className="p-6">
                <div className="text-lg font-semibold text-gray-800 mb-4">
                  {language === 'ar' ? 'من سيحجز؟' : 'Who\'s coming?'}
                </div>
                <GuestSelector
                  value={searchData.guests}
                  onChange={handleGuestChange}
                  className="text-gray-800"
                  variant="dropdown"
                  placeholder={language === 'ar' ? 'اختر عدد الضيوف' : 'Select guests'}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-20 sm:pt-24 md:pt-28 lg:pt-32">
        <div className="max-w-4xl mx-auto animate-slide-up">
          {/* Hero Text */}
          <div className={`${isRTL ? 'text-arabic' : 'text-latin'} ${language === 'ar' ? 'mb-8' : 'mb-16'}`} dir={isRTL ? 'rtl' : 'ltr'}>
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
        </div>
      </div>
    </section>
  );
};