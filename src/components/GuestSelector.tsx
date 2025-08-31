import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Users, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface GuestSelectorProps {
  value: {
    adults: number;
    children: number;
    infants: number;
  };
  onChange: (value: { adults: number; children: number; infants: number }) => void;
  maxGuests?: number;
  className?: string;
  variant?: 'default' | 'dropdown';
  placeholder?: string;
}

export const GuestSelector: React.FC<GuestSelectorProps> = ({
  value,
  onChange,
  maxGuests = 16,
  className = '',
  variant = 'default',
  placeholder
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const isWhiteTheme = className.includes('text-white');

  const handleIncrement = (type: 'adults' | 'children' | 'infants') => {
    const newValue = { ...value };
    newValue[type] += 1;
    
    // Check if total guests (only adults count) exceeds maxGuests
    if (type === 'adults' && newValue.adults > maxGuests) {
      return;
    }
    
    // Limit children and infants to reasonable numbers
    if (type === 'children' && newValue.children > 8) {
      return;
    }
    if (type === 'infants' && newValue.infants > 4) {
      return;
    }
    
    onChange(newValue);
  };

  const handleDecrement = (type: 'adults' | 'children' | 'infants') => {
    const newValue = { ...value };
    if (newValue[type] > 0) {
      newValue[type] -= 1;
      onChange(newValue);
    }
  };

  const getTotalGuests = () => {
    // Only adults count toward total guests
    return value.adults;
  };

  const getDisplayText = () => {
    const total = getTotalGuests();
    if (total === 0) {
      return placeholder || (language === 'ar' ? 'اختر عدد الضيوف' : 'Select guests');
    }
    
    let text = `${total} ${total === 1 ? (language === 'ar' ? 'ضيف' : 'guest') : (language === 'ar' ? 'ضيوف' : 'guests')}`;
    
    if (value.children > 0) {
      text += `, ${value.children} ${language === 'ar' ? 'أطفال' : 'children'}`;
    }
    
    if (value.infants > 0) {
      text += `, ${value.infants} ${language === 'ar' ? 'رضع' : 'infants'}`;
    }
    
    return text;
  };

  // Dropdown variant for search boxes and compact areas
  if (variant === 'dropdown') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full h-11 justify-between ${isWhiteTheme ? 'border-white/20 bg-white/10 text-white hover:bg-white/20' : ''} ${className}`}
          >
            <div className="flex items-center gap-2">
              <Users className={`h-4 w-4 ${isWhiteTheme ? 'text-white/70' : 'text-muted-foreground'}`} />
              <span className={isWhiteTheme ? 'text-white' : ''}>
                {getDisplayText()}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 ${isWhiteTheme ? 'text-white/70' : 'text-muted-foreground'}`} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              {language === 'ar' ? 'الضيوف' : 'Guests'}
            </Label>
            
            {/* Adults */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {language === 'ar' ? 'البالغون' : 'Adults'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {language === 'ar' ? '13 سنة وما فوق' : '13 years and older'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDecrement('adults')}
                  disabled={value.adults <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{value.adults}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleIncrement('adults')}
                  disabled={value.adults >= maxGuests}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {language === 'ar' ? 'الأطفال' : 'Children'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {language === 'ar' ? '2-12 سنة' : '2-12 years'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDecrement('children')}
                  disabled={value.children <= 0}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{value.children}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleIncrement('children')}
                  disabled={value.children >= 8}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Infants */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {language === 'ar' ? 'الرضع' : 'Infants'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'أقل من سنتين' : 'Under 2 years'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDecrement('infants')}
                  disabled={value.infants <= 0}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{value.infants}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleIncrement('infants')}
                  disabled={value.infants >= 4}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="text-sm text-muted-foreground pt-2 border-t">
              {language === 'ar' 
                ? `إجمالي الضيوف المحتسبين: ${getTotalGuests()} (البالغون فقط)`
                : `Total counted guests: ${getTotalGuests()} (adults only)`
              }
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Default variant (existing implementation)
  return (
    <div className={`space-y-3 ${className}`}>
      <Label className={`text-sm font-medium ${isWhiteTheme ? 'text-white/90' : ''}`}>
        {language === 'ar' ? 'الضيوف' : 'Guests'}
      </Label>
      
      <div className={`border rounded-lg p-4 space-y-4 ${isWhiteTheme ? 'border-white/20 bg-white/10' : 'border-border'}`}>
        {/* Adults */}
        <div className="flex items-center justify-between">
          <div>
            <div className={`font-medium ${isWhiteTheme ? 'text-white' : ''}`}>
              {language === 'ar' ? 'البالغون' : 'Adults'}
            </div>
            <div className={`text-sm ${isWhiteTheme ? 'text-white/70' : 'text-muted-foreground'}`}>
              {language === 'ar' ? '13 سنة وما فوق' : '13 years and older'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDecrement('adults')}
              disabled={value.adults <= 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{value.adults}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleIncrement('adults')}
              disabled={value.adults >= maxGuests}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Children */}
        <div className="flex items-center justify-between">
          <div>
            <div className={`font-medium ${isWhiteTheme ? 'text-white' : ''}`}>
              {language === 'ar' ? 'الأطفال' : 'Children'}
            </div>
            <div className={`text-sm ${isWhiteTheme ? 'text-white/70' : 'text-muted-foreground'}`}>
              {language === 'ar' ? '2-12 سنة' : '2-12 years'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDecrement('children')}
              disabled={value.children <= 0}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{value.children}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleIncrement('children')}
              disabled={value.children >= 8}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Infants */}
        <div className="flex items-center justify-between">
          <div>
            <div className={`font-medium ${isWhiteTheme ? 'text-white' : ''}`}>
              {language === 'ar' ? 'الرضع' : 'Infants'}
            </div>
            <div className={`text-sm ${isWhiteTheme ? 'text-white/70' : 'text-muted-foreground'}`}>
              {language === 'ar' ? 'أقل من سنتين' : 'Under 2 years'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDecrement('infants')}
              disabled={value.infants <= 0}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{value.infants}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleIncrement('infants')}
              disabled={value.infants >= 4}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className={`text-sm ${isWhiteTheme ? 'text-white/70' : 'text-muted-foreground'}`}>
        {language === 'ar' 
          ? `إجمالي الضيوف المحتسبين: ${getTotalGuests()} (البالغون فقط)`
          : `Total counted guests: ${getTotalGuests()} (adults only)`
        }
      </div>
    </div>
  );
};
