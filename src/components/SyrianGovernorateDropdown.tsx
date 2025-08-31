import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, ChevronDown, Search, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  SyrianGovernorate, 
  SYRIAN_GOVERNORATES, 
  getGovernorateSuggestions,
  getNearestGovernorate,
  getGovernorateDisplayName
} from '@/lib/syrianGovernorates';
import { cn } from '@/lib/utils';

interface SyrianGovernorateDropdownProps {
  onGovernorateSelect: (governorate: SyrianGovernorate) => void;
  selectedGovernorate?: SyrianGovernorate | null;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  showSearch?: boolean;
  adaptToHostLocation?: boolean;
  hostLatitude?: number | null;
  hostLongitude?: number | null;
  required?: boolean;
}

const SyrianGovernorateDropdown: React.FC<SyrianGovernorateDropdownProps> = ({
  onGovernorateSelect,
  selectedGovernorate,
  placeholder,
  label,
  className,
  disabled = false,
  showSearch = true,
  adaptToHostLocation = false,
  hostLatitude,
  hostLongitude,
  required = false
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGovernorates, setFilteredGovernorates] = useState<SyrianGovernorate[]>(SYRIAN_GOVERNORATES);
  const [hostAdaptedGovernorates, setHostAdaptedGovernorates] = useState<SyrianGovernorate[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isRTL = language === 'ar';

  // Default placeholder text
  const defaultPlaceholder = language === 'ar' ? 'اختر المحافظة...' : 'Select governorate...';
  const defaultLabel = language === 'ar' ? 'المحافظة' : 'Governorate';

  // Adapt governorates based on host location if enabled
  useEffect(() => {
    if (adaptToHostLocation && hostLatitude && hostLongitude) {
      const nearest = getNearestGovernorate(hostLatitude, hostLongitude);
      const sortedByDistance = [...SYRIAN_GOVERNORATES].sort((a, b) => {
        const distA = Math.sqrt(
          Math.pow(hostLatitude - a.latitude, 2) + Math.pow(hostLongitude - a.longitude, 2)
        );
        const distB = Math.sqrt(
          Math.pow(hostLatitude - b.latitude, 2) + Math.pow(hostLongitude - b.longitude, 2)
        );
        return distA - distB;
      });
      
      // Put nearest governorate first, then others by distance
      const reordered = [nearest, ...sortedByDistance.filter(g => g.id !== nearest.id)];
      setHostAdaptedGovernorates(reordered);
    } else {
      setHostAdaptedGovernorates(SYRIAN_GOVERNORATES);
    }
  }, [adaptToHostLocation, hostLatitude, hostLongitude]);

  // Filter governorates based on search query
  useEffect(() => {
    const baseList = adaptToHostLocation && hostAdaptedGovernorates.length > 0 
      ? hostAdaptedGovernorates 
      : SYRIAN_GOVERNORATES;
    
    if (searchQuery.trim()) {
      const filtered = getGovernorateSuggestions(searchQuery, language);
      setFilteredGovernorates(filtered);
    } else {
      setFilteredGovernorates(baseList);
    }
  }, [searchQuery, language, adaptToHostLocation, hostAdaptedGovernorates]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, showSearch]);

  const handleGovernorateSelect = (governorate: SyrianGovernorate) => {
    onGovernorateSelect(governorate);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchQuery('');
      }
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onGovernorateSelect({} as SyrianGovernorate);
    setSearchQuery('');
  };

  const getDisplayText = () => {
    if (selectedGovernorate) {
      return getGovernorateDisplayName(selectedGovernorate, language);
    }
    return placeholder || defaultPlaceholder;
  };

  const getGovernorateItem = (governorate: SyrianGovernorate, index: number) => {
    const isSelected = selectedGovernorate?.id === governorate.id;
    const isNearest = adaptToHostLocation && hostLatitude && hostLongitude && index === 0;
    
    return (
      <button
        key={governorate.id}
        type="button"
        className={cn(
          "w-full px-4 py-3 text-right hover:bg-muted focus:bg-muted focus:outline-none transition-colors",
          "border-b border-border last:border-b-0",
          isSelected && "bg-primary/10 text-primary font-medium",
          isNearest && "bg-blue-50 dark:bg-blue-950/20 border-r-2 border-r-blue-500"
        )}
        onClick={() => handleGovernorateSelect(governorate)}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className={cn(
              "h-4 w-4 flex-shrink-0",
              isSelected ? "text-primary" : "text-muted-foreground",
              isNearest ? "text-blue-500" : ""
            )} />
            <div className="flex-1 text-right">
              <div className={cn(
                "font-medium text-sm",
                isSelected && "text-primary",
                isNearest && "text-blue-700 dark:text-blue-300"
              )}>
                {getGovernorateDisplayName(governorate, language)}
              </div>
              <div className="text-xs text-muted-foreground">
                {language === 'ar' ? governorate.nameEn : governorate.nameAr}
              </div>
              {isNearest && (
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {language === 'ar' ? 'الأقرب لموقعك' : 'Nearest to you'}
                </div>
              )}
            </div>
          </div>
          {isSelected && (
            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
          )}
        </div>
      </button>
    );
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {label && (
        <Label className="text-sm font-medium mb-2 block">
          {label || defaultLabel}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-between h-11 px-3",
          !selectedGovernorate && "text-muted-foreground",
          isOpen && "ring-2 ring-ring ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={handleToggle}
        disabled={disabled}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center gap-2 flex-1 text-right">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{getDisplayText()}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {selectedGovernorate && (
            <button
              type="button"
              onClick={clearSelection}
              className="p-1 hover:bg-muted rounded-sm"
              title={language === 'ar' ? 'مسح الاختيار' : 'Clear selection'}
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </div>
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60">
          {showSearch && (
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder={language === 'ar' ? 'البحث في المحافظات...' : 'Search governorates...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "pl-10 pr-3 h-9",
                    isRTL ? "text-right" : "text-left"
                  )}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            </div>
          )}

          <ScrollArea className="max-h-48">
            {filteredGovernorates.length > 0 ? (
              filteredGovernorates.map((governorate, index) => 
                getGovernorateItem(governorate, index)
              )
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default SyrianGovernorateDropdown;
