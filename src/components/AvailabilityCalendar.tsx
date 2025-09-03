import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAvailability, AvailabilityData } from "@/hooks/useAvailability";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wrench
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isBefore } from "date-fns";
import { ar } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface AvailabilityCalendarProps {
  listingId: string;
  onDateSelect?: (dateRange: DateRange | undefined) => void;
  selectedDates?: DateRange | undefined;
  mode?: 'guest' | 'host';
  showPricing?: boolean;
  className?: string;
}

const statusConfig = {
  available: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    label: { ar: 'متاح', en: 'Available' }
  },
  booked: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    label: { ar: 'محجوز', en: 'Booked' }
  },
  blocked: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: XCircle,
    label: { ar: 'مغلق', en: 'Blocked' }
  },
  maintenance: {
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Wrench,
    label: { ar: 'صيانة', en: 'Maintenance' }
  },
  reserved: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    label: { ar: 'محجوز مؤقتاً', en: 'Reserved' }
  }
};

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  listingId,
  onDateSelect,
  selectedDates,
  mode = 'guest',
  showPricing = true,
  className
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);

  // Get availability data for the current month and next month
  const startDate = startOfMonth(currentMonth).toISOString().split('T')[0];
  const endDate = endOfMonth(addMonths(currentMonth, 1)).toISOString().split('T')[0];
  
  const { availability, loading, error } = useAvailability(listingId, startDate, endDate);

  // Create a map for quick availability lookup
  const availabilityMap = useMemo(() => {
    const map = new Map<string, AvailabilityData>();
    availability.forEach(item => {
      map.set(item.date, item);
    });
    return map;
  }, [availability]);

  // Generate calendar days for current month
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Generate days for previous month (for calendar padding)
  const prevMonthDays = useMemo(() => {
    const firstDayOfMonth = startOfMonth(currentMonth);
    const startDay = firstDayOfMonth.getDay();
    const daysToShow = startDay === 0 ? 6 : startDay - 1; // Show previous month days to fill the week
    
    if (daysToShow === 0) return [];
    
    const prevMonth = subMonths(currentMonth, 1);
    const endOfPrevMonth = endOfMonth(prevMonth);
    const days = [];
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(endOfPrevMonth);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    
    return days;
  }, [currentMonth]);

  // Generate days for next month (for calendar padding)
  const nextMonthDays = useMemo(() => {
    const lastDayOfMonth = endOfMonth(currentMonth);
    const endDay = lastDayOfMonth.getDay();
    const daysToShow = endDay === 0 ? 0 : 7 - endDay;
    
    if (daysToShow === 0) return [];
    
    const nextMonth = addMonths(currentMonth, 1);
    const startOfNextMonth = startOfMonth(nextMonth);
    const days = [];
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startOfNextMonth);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    
    return days;
  }, [currentMonth]);

  const allDays = [...prevMonthDays, ...monthDays, ...nextMonthDays];

  const handleDateClick = (date: Date) => {
    if (mode === 'host') return; // Host mode doesn't allow date selection for booking
    
    const dateStr = date.toISOString().split('T')[0];
    const dayAvailability = availabilityMap.get(dateStr);
    
    // Don't allow selection of unavailable dates or past dates
    if (!dayAvailability?.is_available || isBefore(date, new Date())) {
      return;
    }

    if (!onDateSelect) return;

    if (!selectedDates?.from || (selectedDates.from && selectedDates.to) || selectingCheckOut) {
      // Start new selection or select check-in
      onDateSelect({ from: date, to: undefined });
      setSelectingCheckOut(true);
    } else if (selectedDates.from && !selectedDates.to) {
      // Select check-out date
      if (isBefore(date, selectedDates.from)) {
        // If selected date is before check-in, make it the new check-in
        onDateSelect({ from: date, to: undefined });
      } else {
        // Set as check-out date
        onDateSelect({ from: selectedDates.from, to: date });
        setSelectingCheckOut(false);
      }
    }
  };

  const handleMouseEnter = (date: Date) => {
    if (mode === 'guest' && selectedDates?.from && !selectedDates.to) {
      setHoverDate(date);
    }
  };

  const handleMouseLeave = () => {
    setHoverDate(null);
  };

  const getDayStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayAvailability = availabilityMap.get(dateStr);
    return dayAvailability?.status || 'available';
  };

  const getDayPrice = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayAvailability = availabilityMap.get(dateStr);
    return dayAvailability?.price_modifier || 1.0;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDates) return false;
    
    if (selectedDates.from && isSameDay(date, selectedDates.from)) return true;
    if (selectedDates.to && isSameDay(date, selectedDates.to)) return true;
    
    // Check if date is in range
    if (selectedDates.from && selectedDates.to) {
      return date >= selectedDates.from && date <= selectedDates.to;
    }
    
    // Check hover range
    if (selectedDates.from && hoverDate && !selectedDates.to) {
      const start = selectedDates.from;
      const end = hoverDate;
      if (start <= end) {
        return date >= start && date <= end;
      }
    }
    
    return false;
  };

  const isDateRangeStart = (date: Date) => {
    return selectedDates?.from && isSameDay(date, selectedDates.from);
  };

  const isDateRangeEnd = (date: Date) => {
    if (selectedDates?.to && isSameDay(date, selectedDates.to)) return true;
    if (selectedDates?.from && hoverDate && !selectedDates.to && isSameDay(date, hoverDate)) return true;
    return false;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nawartu-green"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{language === 'ar' ? 'حدث خطأ في تحميل التوفر' : 'Error loading availability'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {language === 'ar' ? 'التوفر والحجز' : 'Availability & Booking'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: isRTL ? ar : undefined })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6 text-xs">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon;
            return (
              <div key={status} className="flex items-center gap-1">
                <Icon className="h-3 w-3 text-gray-600" />
                <span>{config.label[language]}</span>
              </div>
            );
          })}
        </div>

        {/* Calendar Grid */}
        <div className="space-y-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-600">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="py-2">
                {language === 'ar' ? 
                  ['اث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح'][['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(day)] : 
                  day
                }
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {allDays.map((date, index) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const dayStatus = getDayStatus(date);
              const priceModifier = getDayPrice(date);
              const statusInfo = statusConfig[dayStatus as keyof typeof statusConfig];
              const isSelected = isDateSelected(date);
              const isRangeStart = isDateRangeStart(date);
              const isRangeEnd = isDateRangeEnd(date);
              const isPast = isBefore(date, new Date());
              const isClickable = mode === 'guest' && dayStatus === 'available' && !isPast;

              return (
                <div
                  key={index}
                  className={cn(
                    "relative p-2 min-h-[60px] border border-gray-100 transition-all duration-200",
                    isCurrentMonth ? "bg-white" : "bg-gray-50",
                    isClickable && "cursor-pointer hover:bg-gray-50",
                    isPast && "opacity-50",
                    isSelected && "bg-nawartu-green/10 border-nawartu-green/30",
                    isRangeStart && "bg-nawartu-green text-white",
                    isRangeEnd && "bg-nawartu-green text-white",
                    !isCurrentMonth && "text-gray-400"
                  )}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => handleMouseEnter(date)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Date Number */}
                  <div className={cn(
                    "text-sm font-medium",
                    isToday(date) && "text-nawartu-green font-bold",
                    (isRangeStart || isRangeEnd) && "text-white"
                  )}>
                    {format(date, 'd')}
                  </div>

                  {/* Status Indicator */}
                  {isCurrentMonth && dayStatus !== 'available' && (
                    <div className={cn(
                      "absolute top-1 right-1 w-2 h-2 rounded-full",
                      statusInfo.color.split(' ')[0]
                    )} />
                  )}

                  {/* Price Modifier */}
                  {isCurrentMonth && showPricing && priceModifier !== 1.0 && dayStatus === 'available' && (
                    <div className="absolute bottom-1 left-1 text-xs bg-nawartu-green text-white px-1 rounded">
                      {priceModifier > 1 ? `+${Math.round((priceModifier - 1) * 100)}%` : 
                       priceModifier < 1 ? `-${Math.round((1 - priceModifier) * 100)}%` : ''}
                    </div>
                  )}

                  {/* Selection Indicators */}
                  {isRangeStart && (
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-nawartu-green rounded-full border-2 border-white" />
                  )}
                  {isRangeEnd && selectedDates?.to && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-nawartu-green rounded-full border-2 border-white" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selection Summary */}
        {selectedDates?.from && (
          <div className="mt-6 p-4 bg-nawartu-beige/20 rounded-lg">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="font-medium">{language === 'ar' ? 'تسجيل الدخول:' : 'Check-in:'}</span>
                <span>{format(selectedDates.from, 'MMM d, yyyy')}</span>
              </div>
              {selectedDates.to && (
                <div className="flex justify-between">
                  <span className="font-medium">{language === 'ar' ? 'تسجيل الخروج:' : 'Check-out:'}</span>
                  <span>{format(selectedDates.to, 'MMM d, yyyy')}</span>
                </div>
              )}
              {selectedDates.from && selectedDates.to && (
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="font-medium">{language === 'ar' ? 'عدد الليالي:' : 'Nights:'}</span>
                  <span>{Math.ceil((selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24))}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
