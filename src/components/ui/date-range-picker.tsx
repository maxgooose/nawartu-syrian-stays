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
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [flexibility, setFlexibility] = React.useState('exact');
  const [hoveredDate, setHoveredDate] = React.useState<Date | undefined>(undefined);
  
  // Auto-open effect
  React.useEffect(() => {
    if (autoOpen) {
      setIsOpen(true);
    }
  }, [autoOpen]);
  
  // No default date selection - let users choose their own dates
  
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

  // Generate month cells (exact month only, no overflow days)
  const generateMonthCells = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingEmpty = firstDay.getDay(); // 0..6 (Sun..Sat)

    const cells: Array<Date | null> = [];
    // Leading blanks to align week start
    for (let i = 0; i < leadingEmpty; i++) cells.push(null);
    // Month days
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
    // Trailing blanks to complete 6x7 grid (42 cells)
    while (cells.length < 42) cells.push(null);
    return cells;
  };

  // Check if date is in range
  const isInRange = (date: Date) => {
    if (!dateRange?.from || !dateRange?.to) return false;
    return date >= dateRange.from && date <= dateRange.to;
  };

  // Hover preview range when only start date is selected (desktop UX)
  const isInPreviewRange = (date: Date) => {
    if (!dateRange?.from || dateRange?.to || !hoveredDate) return false;
    const start = dateRange.from < hoveredDate ? dateRange.from : hoveredDate;
    const end = dateRange.from < hoveredDate ? hoveredDate : dateRange.from;
    return date >= start && date <= end;
  };

  // Check if date is start or end
  const isStartDate = (date: Date) => {
    return dateRange?.from && isSameDay(date, dateRange.from);
  };

  const isEndDate = (date: Date) => {
    return dateRange?.to && isSameDay(date, dateRange.to);
  };

  // Base day class names (structural)
  const getDayClassName = (date: Date, isCurrentMonth: boolean) => {
    const isPast = isBefore(date, startOfDay(new Date()));
    return cn(
      "relative w-10 h-10 flex items-center justify-center text-sm transition-all duration-200 cursor-pointer",
      !isCurrentMonth && "text-gray-300",
      isCurrentMonth && !isPast && "hover:bg-gray-100",
      isPast && "text-gray-300 cursor-not-allowed"
    );
  };

  const flexibilityOptions = [
    { value: 'exact', label: language === 'ar' ? 'تواريخ محددة' : 'Exact dates' },
    { value: '1', label: '+1 day' },
    { value: '2', label: '+2 days' },
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
          className="w-full max-w-sm md:max-w-none p-0 bg-white border border-gray-200 shadow-xl z-50 rounded-3xl mx-4 sm:mx-0" 
          align="center"
          side="bottom"
          sideOffset={4}
        >
          <div className="p-4 sm:p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
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
                className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Responsive Calendar: single month on small screens */}
            <div className="flex gap-8 md:flex-row flex-col">
              {/* First Month */}
              <div className="flex-1">
                <div className="grid grid-cols-7 gap-0 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                    <div key={day} className="w-10 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0" onMouseLeave={() => setHoveredDate(undefined)}>
                  {generateMonthCells(currentMonth).map((cell, index) => {
                    if (!cell) {
                      return <div key={index} className="w-10 h-10" />;
                    }
                    const date = cell;
                    const isCurrentMonth = true;
                    const isStart = isStartDate(date);
                    const isEnd = isEndDate(date);
                    const inRange = isInRange(date);
                    const inPreview = isInPreviewRange(date);
                    const hasCompleteRange = Boolean(dateRange?.from && dateRange?.to);
                    const isPast = isBefore(date, startOfDay(new Date()));
                    return (
                      <button
                        key={index}
                        onClick={() => !isPast && handleDateSelect(date)}
                        onMouseEnter={() => !isPast && setHoveredDate(date)}
                        className={getDayClassName(date, isCurrentMonth)}
                        disabled={isPast}
                      >
                        {(inRange || inPreview) && !isStart && !isEnd && (
                          <span className="absolute inset-0 bg-gray-100" />
                        )}
                        <span className={cn(
                          "relative z-10 w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center rounded-full min-w-[44px] min-h-[44px]",
                          (isStart || isEnd) ? "bg-emerald-600 text-white" : "",
                        )}>
                          {date.getDate()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Second Month (hidden on small screens) */}
              <div className="flex-1 hidden md:block">
                <div className="grid grid-cols-7 gap-0 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                    <div key={day} className="w-10 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0" onMouseLeave={() => setHoveredDate(undefined)}>
                  {generateMonthCells(addMonths(currentMonth, 1)).map((cell, index) => {
                    if (!cell) {
                      return <div key={index} className="w-10 h-10" />;
                    }
                    const date = cell;
                    const isCurrentMonth = true;
                    const isStart = isStartDate(date);
                    const isEnd = isEndDate(date);
                    const inRange = isInRange(date);
                    const inPreview = isInPreviewRange(date);
                    const hasCompleteRange = Boolean(dateRange?.from && dateRange?.to);
                    const isPast = isBefore(date, startOfDay(new Date()));
                    return (
                      <button
                        key={index}
                        onClick={() => !isPast && handleDateSelect(date)}
                        onMouseEnter={() => !isPast && setHoveredDate(date)}
                        className={getDayClassName(date, isCurrentMonth)}
                        disabled={isPast}
                      >
                        {(inRange || inPreview) && !isStart && !isEnd && (
                          <span className="absolute inset-0 bg-gray-100" />
                        )}
                        <span className={cn(
                          "relative z-10 w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center rounded-full min-w-[44px] min-h-[44px]",
                          (isStart || isEnd) ? "bg-emerald-600 text-white" : "",
                        )}>
                          {date.getDate()}
                        </span>
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
                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[44px] flex items-center justify-center",
                        flexibility === option.value
                          ? "bg-emerald-600 text-white"
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