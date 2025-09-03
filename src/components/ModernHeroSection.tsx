import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Users, X, ArrowRight } from "lucide-react";
import { GuestSelector } from "@/components/GuestSelector";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import SyrianGovernorateDropdown from "@/components/SyrianGovernorateDropdown";
import { SyrianGovernorate } from "@/lib/syrianGovernorates";
import { motion } from "framer-motion";

interface ModernHeroSectionProps {
  language: 'ar' | 'en';
}

export const ModernHeroSection = ({ language }: ModernHeroSectionProps) => {
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
  const isRTL = language === 'ar';
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      const popoverWrappers = Array.from(document.querySelectorAll('[data-radix-popper-content-wrapper]')) as HTMLElement[];
      const clickedInsidePopover = popoverWrappers.some((el) => el.contains(targetNode));

      if (clickedInsidePopover) return;

      if (searchRef.current && !searchRef.current.contains(targetNode)) {
        setActiveSection(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (searchData.governorate) {
      searchParams.set('governorate', searchData.governorate.nameEn);
    }
    if (searchData.location) {
      searchParams.set('location', searchData.location);
    }
    navigate(`/browse?${searchParams.toString()}`);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with modern house aesthetic */}
      <div className="absolute inset-0">
        {/* Gradient background inspired by the twilight sky */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900"></div>
        
        {/* Overlay pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/20 blur-xl"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-orange-400/30 blur-lg"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-white/20 blur-md"></div>
        </div>
        
        {/* Geometric elements inspired by modern architecture */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div className="absolute top-1/4 right-0 w-1 h-64 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Hero text with modern typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <h1 className={`text-5xl md:text-7xl lg:text-8xl font-light text-white leading-tight mb-6 ${
            isRTL ? 'font-arabic' : 'font-light'
          }`} dir={isRTL ? 'rtl' : 'ltr'}>
            {language === 'ar' ? 
              <>نورتوا<br /><span className="text-3xl md:text-4xl lg:text-5xl opacity-80">سوريا الاستثنائية</span></> : 
              <>Nawartu<br /><span className="text-3xl md:text-4xl lg:text-5xl opacity-80">Exceptional Syria</span></>
            }
          </h1>
          <p className={`text-xl md:text-2xl text-white/90 font-light max-w-4xl mx-auto leading-relaxed ${
            isRTL ? 'font-arabic' : ''
          }`} dir={isRTL ? 'rtl' : 'ltr'}>
            {language === 'ar' ? 
              'اكتشف أماكن إقامة فريدة تجمع بين الراحة العصرية والأصالة السورية في أجمل الوجهات' : 
              'Discover unique stays that blend modern comfort with authentic Syrian heritage in breathtaking destinations'
            }
          </p>
        </motion.div>

        {/* Modern search interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
          ref={searchRef}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-2 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              
              {/* Location */}
              <div className="relative">
                <button
                  onClick={() => setActiveSection(activeSection === 'where' ? null : 'where')}
                  className={`w-full p-6 text-left rounded-2xl transition-all duration-200 ${
                    activeSection === 'where' 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'bg-transparent text-white hover:bg-white/20'
                  }`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm mb-1">
                        {language === 'ar' ? 'أين؟' : 'Where?'}
                      </p>
                      <p className="text-sm opacity-80 truncate">
                        {searchData.governorate 
                          ? (language === 'ar' ? searchData.governorate.nameAr : searchData.governorate.nameEn)
                          : (language === 'ar' ? 'اختر المحافظة' : 'Select governorate')
                        }
                      </p>
                    </div>
                  </div>
                </button>

                {/* Location dropdown */}
                {activeSection === 'where' && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50">
                    <SyrianGovernorateDropdown
                      selectedGovernorate={searchData.governorate}
                      onGovernorateSelect={(governorate) => {
                        setSearchData(prev => ({ ...prev, governorate }));
                        setActiveSection(null);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="relative">
                <button
                  onClick={() => setActiveSection(activeSection === 'when' ? null : 'when')}
                  className={`w-full p-6 text-left rounded-2xl transition-all duration-200 ${
                    activeSection === 'when' 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'bg-transparent text-white hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm mb-1">
                        {language === 'ar' ? 'متى؟' : 'When?'}
                      </p>
                      <p className="text-sm opacity-80 truncate">
                        {language === 'ar' ? 'اختر التواريخ' : 'Select dates'}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Date picker dropdown */}
                {activeSection === 'when' && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50">
                    <DateRangePicker
                      dateRange={searchData.dateRange}
                      onDateRangeChange={(dateRange) => {
                        setSearchData(prev => ({ ...prev, dateRange }));
                      }}
                      language={language}
                    />
                  </div>
                )}
              </div>

              {/* Guests */}
              <div className="relative">
                <button
                  onClick={() => setActiveSection(activeSection === 'who' ? null : 'who')}
                  className={`w-full p-6 text-left rounded-2xl transition-all duration-200 ${
                    activeSection === 'who' 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'bg-transparent text-white hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm mb-1">
                        {language === 'ar' ? 'من؟' : 'Who?'}
                      </p>
                      <p className="text-sm opacity-80 truncate">
                        {searchData.guests.adults + searchData.guests.children > 0
                          ? `${searchData.guests.adults + searchData.guests.children} ${language === 'ar' ? 'ضيف' : 'guests'}`
                          : (language === 'ar' ? 'أضف الضيوف' : 'Add guests')
                        }
                      </p>
                    </div>
                  </div>
                </button>

                {/* Guest selector dropdown */}
                {activeSection === 'who' && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50">
                    <GuestSelector
                      value={searchData.guests}
                      onChange={(guests) => setSearchData(prev => ({ ...prev, guests }))}
                    />
                  </div>
                )}
              </div>

              {/* Search button */}
              <div className="flex items-center">
                <Button
                  onClick={handleSearch}
                  className="w-full h-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 text-lg py-6"
                >
                  <Search className="h-5 w-5" />
                  <span className="hidden sm:inline">
                    {language === 'ar' ? 'بحث' : 'Search'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating call-to-action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="mt-16"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/browse')}
            className="text-white hover:bg-white/20 border border-white/30 rounded-full px-8 py-4 backdrop-blur-sm font-medium"
          >
            {language === 'ar' ? 'استكشف جميع العقارات' : 'Explore all properties'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {/* Backdrop when dropdown is open */}
      {activeSection && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden" 
          onClick={() => setActiveSection(null)} 
        />
      )}
    </div>
  );
};
