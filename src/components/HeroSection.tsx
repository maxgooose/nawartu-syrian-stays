import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Users, X, Minus, Plus } from "lucide-react";
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
  const navigate = useNavigate();
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
      // Allow clicks inside Radix Popover portals (calendar) without closing
      const targetNode = event.target as Node;
      const popoverWrappers = Array.from(document.querySelectorAll('[data-radix-popper-content-wrapper]')) as HTMLElement[];
      const clickedInsidePopover = popoverWrappers.some((el) => el.contains(targetNode));

      if (clickedInsidePopover) {
        return;
      }

      if (searchRef.current && !searchRef.current.contains(targetNode)) {
        setActiveSection(null);
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll on mobile when a panel is open
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (activeSection && isMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [activeSection]);

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
    const total = searchData.guests.adults + searchData.guests.children; // Exclude infants from count
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
      return language === 'ar' ? searchData.governorate.nameAr : searchData.governorate.nameEn;
    }
    if (searchData.location) {
      return searchData.location;
    }
    return language === 'ar' ? 'البحث عن وجهات' : 'Search destinations';
  };

  const handleGovernorateSelect = (governorate: SyrianGovernorate) => {
    setSearchData(prev => ({
      ...prev,
      governorate: governorate,
      location: governorate.nameAr
    }));
    setActiveSection(null);
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    setSearchData(prev => ({ ...prev, dateRange: range }));
    // Keep calendar open - don't auto-close when both dates are selected
  };

  const handleGuestChange = (guests: { adults: number; children: number; infants: number }) => {
    setSearchData(prev => ({ ...prev, guests }));
    setActiveSection(null);
  };

  const handleSectionClick = (section: 'where' | 'when' | 'who') => {
    console.log('Section clicked:', section, 'Current active:', activeSection);
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
      <div className="absolute top-4 sm:top-6 left-2 right-2 sm:left-4 sm:right-4 z-30" ref={searchRef}>
        <div className="bg-white rounded-full shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center divide-x divide-gray-300">
            {/* Where Section */}
            <div 
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 rounded-l-full ${
                activeSection === 'where' ? 'bg-gray-50 shadow-sm' : ''
              }`}
              onClick={() => handleSectionClick('where')}
            >
              <div className="text-xs font-semibold text-gray-900 mb-1">
                {language === 'ar' ? 'أين' : 'Where'}
              </div>
              <div className="text-sm text-gray-500 truncate font-normal">
                {getLocationText()}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-12 bg-gray-300"></div>

            {/* When Section */}
            <div 
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
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
            <div className="hidden sm:block w-px h-12 bg-gray-300"></div>

            {/* Who Section */}
            <div 
              className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
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
            <div className="px-1 sm:px-2 py-2">
              <Button 
                onClick={handleSearch}
                size="sm" 
                className="h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full bg-primary hover:bg-primary/90"
              >
                <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Backdrop on mobile when any panel is open */}
        {activeSection && (
          <div className="fixed inset-0 bg-black/40 z-50 md:hidden" onClick={() => setActiveSection(null)} />
        )}

                 {/* Where Panel - fixed background */}
        {activeSection === 'where' && (
          <div className="fixed inset-0 z-[60] bg-white md:inset-auto md:absolute md:top-full md:left-0 md:right-0 md:mt-3 md:bg-white md:rounded-3xl md:shadow-2xl md:border md:border-gray-100 overflow-auto max-w-full md:max-w-2xl md:mx-auto">
            <div className="p-0">
              {/* Mobile close */}
              <div className="md:hidden flex justify-end p-4">
                <button onClick={() => setActiveSection(null)} className="p-2 rounded-full border text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Search Input - Integrated at top */}
              <div className="p-6 pb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchData.location}
                    onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder={language === 'ar' ? 'ابحث عن وجهات...' : 'Search destinations'}
                    className="w-full h-14 pl-12 pr-4 border-0 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-300 outline-none transition-all duration-200 text-base font-medium placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Suggested Destinations Header */}
              <div className="px-6 pb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  {language === 'ar' ? 'الوجهات المقترحة' : 'Suggested destinations'}
                </h3>
              </div>

              {/* Nearby Option */}
              <div className="px-6 pb-2">
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
                  className="w-full flex items-center gap-4 p-4 text-left rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-medium text-gray-900 group-hover:text-gray-700">
                      {language === 'ar' ? 'قريب مني' : 'Nearby'}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {language === 'ar' ? 'اكتشف ما حولك' : 'Find what\'s around you'}
                    </div>
                  </div>
                </button>
              </div>

              {/* Popular Syrian Destinations */}
              <div className="space-y-1">
                {[
                  { 
                    id: 'damascus', 
                    nameAr: 'دمشق، سوريا', 
                    nameEn: 'Damascus, Syria', 
                    icon: '🏛️',
                    descAr: 'العاصمة التاريخية',
                    descEn: 'Historic capital city'
                  },
                  { 
                    id: 'aleppo', 
                    nameAr: 'حلب، سوريا', 
                    nameEn: 'Aleppo, Syria', 
                    icon: '🏰',
                    descAr: 'مدينة التراث العالمي',
                    descEn: 'UNESCO World Heritage site'
                  },
                  { 
                    id: 'latakia', 
                    nameAr: 'اللاذقية، سوريا', 
                    nameEn: 'Latakia, Syria', 
                    icon: '🌊',
                    descAr: 'ساحل البحر الأبيض المتوسط',
                    descEn: 'Mediterranean coastal city'
                  },
                  { 
                    id: 'homs', 
                    nameAr: 'حمص، سوريا', 
                    nameEn: 'Homs, Syria', 
                    icon: '🏺',
                    descAr: 'مدينة الحضارات القديمة',
                    descEn: 'Ancient civilizations hub'
                  },
                  { 
                    id: 'tartus', 
                    nameAr: 'طرطوس، سوريا', 
                    nameEn: 'Tartus, Syria', 
                    icon: '⛵',
                    descAr: 'المدينة الساحلية الجميلة',
                    descEn: 'Beautiful coastal destination'
                  },
                  { 
                    id: 'palmyra', 
                    nameAr: 'تدمر، سوريا', 
                    nameEn: 'Palmyra, Syria', 
                    icon: '🏜️',
                    descAr: 'أطلال تدمر الأثرية',
                    descEn: 'Ancient archaeological site'
                  }
                ].map((location) => (
                  <div key={location.id} className="px-6">
                    <button
                      onClick={() => {
                        const governorate = SYRIAN_GOVERNORATES.find(g => 
                          g.nameEn.toLowerCase().includes(location.nameEn.split(',')[0].toLowerCase()) ||
                          g.nameAr.includes(location.nameAr.split('،')[0])
                        );
                        if (governorate) {
                          handleGovernorateSelect(governorate);
                        }
                      }}
                      className="w-full flex items-center gap-4 p-4 text-left rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                        {location.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-medium text-gray-900 group-hover:text-gray-700">
                          {language === 'ar' ? location.nameAr : location.nameEn}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {language === 'ar' ? location.descAr : location.descEn}
                        </div>
                      </div>
                  </button>
                </div>
                ))}
              </div>

              {/* Governorate Dropdown - Hidden but available */}
              <div className="hidden">
                <SyrianGovernorateDropdown
                  onGovernorateSelect={handleGovernorateSelect}
                  selectedGovernorate={searchData.governorate}
                  placeholder={language === 'ar' ? 'أو اختر من المحافظات...' : 'Or select from governorates...'}
                  showSearch={true}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        )}

        {/* When - fullscreen on mobile */}
        {activeSection === 'when' && (
          <div className="fixed inset-0 z-[60] bg-white p-4 md:p-0 md:absolute md:top-full md:left-1/2 md:transform md:-translate-x-1/2 md:mt-2">
            <div className="md:hidden flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-700">{language === 'ar' ? 'التواريخ' : 'Dates'}</div>
              <button onClick={() => setActiveSection(null)} className="p-2 rounded-full border text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <DateRangePicker
              dateRange={searchData.dateRange}
              onDateRangeChange={handleDateRangeChange}
              language={language}
              placeholder={language === 'ar' ? 'اختر التواريخ' : 'Select dates'}
              variant="default"
              autoOpen={true}
            />
          </div>
        )}

        {/* Who - responsive panel */}
        {activeSection === 'who' && (
          <div className="fixed inset-0 z-[60] bg-white p-4 md:absolute md:inset-auto md:top-full md:right-4 md:mt-2 md:bg-white md:rounded-lg md:shadow-lg md:border md:w-80 md:p-4 overflow-auto">
            {/* Mobile header */}
            <div className="md:hidden flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-700">{language === 'ar' ? 'الضيوف' : 'Guests'}</div>
              <button onClick={() => setActiveSection(null)} className="p-2 rounded-full border text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-6">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">
                    {language === 'ar' ? 'البالغون' : 'Adults'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === 'ar' ? '13 سنة وما فوق' : '13 years and older'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (searchData.guests.adults > 1) {
                        setSearchData(prev => ({ 
                          ...prev, 
                          guests: { ...prev.guests, adults: prev.guests.adults - 1 }
                        }));
                      }
                    }}
                    disabled={searchData.guests.adults <= 1}
                    className="h-8 w-8 p-0 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{searchData.guests.adults}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (searchData.guests.adults < 16) {
                        setSearchData(prev => ({ 
                          ...prev, 
                          guests: { ...prev.guests, adults: prev.guests.adults + 1 }
                        }));
                      }
                    }}
                    disabled={searchData.guests.adults >= 16}
                    className="h-8 w-8 p-0 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">
                    {language === 'ar' ? 'الأطفال' : 'Children'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === 'ar' ? '2-12 سنة' : '2-12 years'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (searchData.guests.children > 0) {
                        const newGuests = { ...searchData.guests, children: searchData.guests.children - 1 };
                        setSearchData(prev => ({ ...prev, guests: newGuests }));
                      }
                    }}
                    disabled={searchData.guests.children <= 0}
                    className="h-8 w-8 p-0 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{searchData.guests.children}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (searchData.guests.children < 8) {
                        const newGuests = { ...searchData.guests, children: searchData.guests.children + 1 };
                        setSearchData(prev => ({ ...prev, guests: newGuests }));
                      }
                    }}
                    disabled={searchData.guests.children >= 8}
                    className="h-8 w-8 p-0 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800">
                    {language === 'ar' ? 'الرضع' : 'Infants'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === 'ar' ? 'أقل من سنتين' : 'Under 2 years'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (searchData.guests.infants > 0) {
                        const newGuests = { ...searchData.guests, infants: searchData.guests.infants - 1 };
                        setSearchData(prev => ({ ...prev, guests: newGuests }));
                      }
                    }}
                    disabled={searchData.guests.infants <= 0}
                    className="h-8 w-8 p-0 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{searchData.guests.infants}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (searchData.guests.infants < 4) {
                        const newGuests = { ...searchData.guests, infants: searchData.guests.infants + 1 };
                        setSearchData(prev => ({ ...prev, guests: newGuests }));
                      }
                    }}
                    disabled={searchData.guests.infants >= 4}
                    className="h-8 w-8 p-0 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="text-sm text-gray-600 pt-2 border-t">
                {language === 'ar' 
                  ? `إجمالي الضيوف: ${searchData.guests.adults + searchData.guests.children}`
                  : `Total guests: ${searchData.guests.adults + searchData.guests.children}`
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hero Content - Airbnb Style */}
      <div className="relative z-10 container mx-auto px-4 pt-28 sm:pt-32 md:pt-40 lg:pt-48 xl:pt-56">
        <div className="max-w-2xl animate-slide-up mobile-optimized">
          {/* Main Headline - Clean Airbnb Style */}
          <div className={`${isRTL ? 'text-arabic text-right' : 'text-latin text-left'} mb-8`} dir={isRTL ? 'rtl' : 'ltr'}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold text-white mb-6 leading-tight tracking-tight mobile-text">
              {language === 'ar' ? (
                <>
                  <span className="block leading-none">نورتوا</span>
                  <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-white/90 mt-2 leading-tight">الضيافة السورية</span>
                </>
              ) : (
                <>
                  <span className="block leading-none">Not sure</span>
                  <span className="block leading-none">where to go?</span>
                  <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-white/90 mt-2 leading-tight">Perfect.</span>
                </>
              )}
            </h1>
          </div>
          
          {/* CTA Button - Airbnb Style */}
          <div className={`${isRTL ? 'text-right' : 'text-left'} mb-12`}>
            <button 
              onClick={() => navigate('/browse')}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-4 sm:px-8 sm:py-4 rounded-full font-medium text-base sm:text-lg hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 min-h-[44px] min-w-[44px]"
            >
              {language === 'ar' ? 'اكتشف سوريا' : 'Discover Syria'}
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};