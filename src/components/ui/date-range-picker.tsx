import * as React from "react";
import { format, isBefore, isAfter, addDays, startOfDay, isSameDay, addMonths } from "date-fns";
import { Calendar as CalendarIcon, X, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { DateRange } from "react-day-picker";
import { ar, enUS } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  language: 'ar' | 'en';
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  variant?: 'default' | 'hero';
  autoOpen?: boolean;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  language,
  disabled = false,
  className,
  placeholder,
  variant = 'default',
  autoOpen = false
}: DateRangePickerProps) {
  const isRTL = language === 'ar';
  const locale = language === 'ar' ? ar : enUS;
  const [isOpen, setIsOpen] = React.useState(autoOpen);
  const [currentMonth, setCurrentMonth] = React.useState(new Date(2025, 7, 1)); // August 2025
  const [flexibility, setFlexibility] = React.useState('exact');
  
  // Auto-open effect
  React.useEffect(() => {
    if (autoOpen) {
      setIsOpen(true);
    }
  }, [autoOpen]);
  
  // Set default dates (Sep 1 - Sep 18, 2025)
  React.useEffect(() => {
    if (!dateRange && autoOpen) {
      onDateRangeChange({
        from: new Date(2025, 8, 1), // Sep 1, 2025
        to: new Date(2025, 8, 18)   // Sep 18, 2025
      });
    }
  }, [autoOpen, dateRange, onDateRangeChange]);
  
  // Calculate nights between dates
  const nights = dateRange?.from && dateRange?.to 
    ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (!dateRange?.from || (dateRange?.from && dateRange?.to)) {
      // Start new selection
      onDateRangeChange({ from: date, to: undefined });
    } else if (dateRange.from && !dateRange.to) {
      // Complete selection
      if (date >= dateRange.from) {
        onDateRangeChange({ from: dateRange.from, to: date });
      } else {
        onDateRangeChange({ from: date, to: undefined });
      }
    }
  };

  // Clear date range
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateRangeChange(undefined);
  };

  // Generate calendar days for a month
  const generateCalendarDays = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Check if date is in range
  const isInRange = (date: Date) => {
    if (!dateRange?.from || !dateRange?.to) return false;
    return date >= dateRange.from && date <= dateRange.to;
  };

  // Check if date is start or end
  const isStartDate = (date: Date) => {
    return dateRange?.from && isSameDay(date, dateRange.from);
  };

  const isEndDate = (date: Date) => {
    return dateRange?.to && isSameDay(date, dateRange.to);
  };

  // Get day class names
  const getDayClassName = (date: Date, isCurrentMonth: boolean) => {
    const isToday = isSameDay(date, new Date());
    const isStart = isStartDate(date);
    const isEnd = isEndDate(date);
    const inRange = isInRange(date);
    const isPast = isBefore(date, startOfDay(new Date()));
    
    return cn(
      "w-10 h-10 flex items-center justify-center text-sm rounded-full transition-all duration-200 cursor-pointer",
      !isCurrentMonth && "text-gray-300",
      isCurrentMonth && !isPast && "hover:bg-gray-100",
      isPast && "text-gray-300 cursor-not-allowed",
      isToday && !isStart && !isEnd && "border-2 border-gray-900",
      inRange && !isStart && !isEnd && "bg-gray-100",
      (isStart || isEnd) && "bg-gray-900 text-white hover:bg-gray-800",
      isStart && isEnd && "rounded-full",
      isStart && !isEnd && "rounded-l-full rounded-r-none bg-gray-900",
      isEnd && !isStart && "rounded-r-full rounded-l-none bg-gray-900"
    );
  };

  const flexibilityOptions = [
    { value: 'exact', label: language === 'ar' ? 'تواريخ محددة' : 'Exact dates' },
    { value: '1', label: '±1 day' },
    { value: '2', label: '±2 days' },
    { value: '3', label: '±3 days' },
    { value: '7', label: '±7 days' },
    { value: '14', label: '±14 days' }
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal px-4",
              variant === 'hero' ? "h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/15 focus:border-white/30" : "h-16 border-2 border-border hover:border-primary/50",
              !dateRange && (variant === 'hero' ? "text-white/60" : "text-muted-foreground"),
              variant === 'hero' ? "hover:bg-white/15" : "hover:bg-accent hover:text-accent-foreground",
              variant === 'hero' ? "rounded-lg" : "rounded-xl shadow-sm",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <CalendarIcon className={cn(
                  "h-5 w-5",
                  variant === 'hero' ? "text-white/70" : "text-muted-foreground"
                )} />
                <div className="text-left">
                  {dateRange?.from ? (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {format(dateRange.from, "MMM dd", { locale })}
                      </div>
                      <div className={cn(
                        "text-xs",
                        variant === 'hero' ? "text-white/70" : "text-muted-foreground"
                      )}>
                        {language === 'ar' ? 'تاريخ الوصول' : 'Check-in'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm">
                      {placeholder || (language === 'ar' ? 'اختر تاريخ الوصول' : 'Select check-in date')}
                    </div>
                  )}
                </div>
              </div>
              
              {dateRange?.to && (
                <div className="flex items-center gap-3">
                  <div className="w-px h-8 bg-border" />
                  <div className="text-left">
                    <div className="text-sm font-medium">
                      {format(dateRange.to, "MMM dd", { locale })}
                    </div>
                    <div className={cn(
                      "text-xs",
                      variant === 'hero' ? "text-white/70" : "text-muted-foreground"
                    )}>
                      {language === 'ar' ? 'تاريخ المغادرة' : 'Check-out'}
                    </div>
                  </div>
                </div>
              )}
              
              {dateRange?.from && dateRange?.to && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-6 w-6 p-0 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 bg-white border border-gray-200 shadow-xl z-50 rounded-3xl" 
          align="center"
          side="bottom"
          sideOffset={4}
        >
          <div className="p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-8">
                <h3 className="text-lg font-semibold">
                  {format(currentMonth, 'MMMM yyyy', { locale })}
                </h3>
                <h3 className="text-lg font-semibold">
                  {format(addMonths(currentMonth, 1), 'MMMM yyyy', { locale })}
                </h3>
              </div>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Two Month Calendar */}
            <div className="flex gap-8">
              {/* First Month */}
              <div className="flex-1">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                    <div key={day} className="w-10 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays(currentMonth).map((date, index) => {
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    return (
                      <button
                        key={index}
                        onClick={() => !isBefore(date, startOfDay(new Date())) && handleDateSelect(date)}
                        className={getDayClassName(date, isCurrentMonth)}
                        disabled={isBefore(date, startOfDay(new Date()))}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Second Month */}
              <div className="flex-1">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                    <div key={day} className="w-10 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays(addMonths(currentMonth, 1)).map((date, index) => {
                    const isCurrentMonth = date.getMonth() === addMonths(currentMonth, 1).getMonth();
                    return (
                      <button
                        key={index}
                        onClick={() => !isBefore(date, startOfDay(new Date())) && handleDateSelect(date)}
                        className={getDayClassName(date, isCurrentMonth)}
                        disabled={isBefore(date, startOfDay(new Date()))}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Date Flexibility Options */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  {language === 'ar' ? 'مرونة التواريخ' : 'Date flexibility'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {flexibilityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFlexibility(option.value)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                        flexibility === option.value
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Nights Counter */}
            {dateRange?.from && dateRange?.to && (
              <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {language === 'ar' ? 'عدد الليالي' : 'Total nights'}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {nights} {language === 'ar' ? 'ليلة' : nights === 1 ? 'night' : 'nights'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}