import * as React from "react";
import { format, isBefore, isAfter, addDays, startOfDay, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, X, ArrowRight } from "lucide-react";
import { DateRange } from "react-day-picker";
import { ar, enUS } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  language: 'ar' | 'en';
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  variant?: 'default' | 'hero';
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  language,
  disabled = false,
  className,
  placeholder,
  variant = 'default'
}: DateRangePickerProps) {
  const isRTL = language === 'ar';
  const locale = language === 'ar' ? ar : enUS;
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Calculate nights between dates
  const nights = dateRange?.from && dateRange?.to 
    ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Handle date selection with sequential guidance
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    if (!dateRange?.from) {
      // First date selected - set as check-in
      onDateRangeChange({ from: selectedDate, to: undefined });
      // Keep popover open to guide user to select check-out
    } else if (!dateRange?.to) {
      // Second date selected - validate and complete range
      if (selectedDate <= dateRange.from) {
        // Invalid selection - check-out must be after check-in
        return;
      }
      onDateRangeChange({ from: dateRange.from, to: selectedDate });
      // Close popover after successful selection
      setIsOpen(false);
    }
  };

  // Clear date range
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateRangeChange(undefined);
  };

  // Custom day renderer for better visual feedback
  const renderDay = (day: Date, modifiers: any) => {
    const isSelected = dateRange?.from && dateRange?.to && 
      (isAfter(day, startOfDay(dateRange.from)) || isSameDay(day, dateRange.from)) &&
      (isBefore(day, startOfDay(dateRange.to)) || isSameDay(day, dateRange.to));
    
    const isStart = dateRange?.from && isSameDay(day, dateRange.from);
    const isEnd = dateRange?.to && isSameDay(day, dateRange.to);
    const isAfterCheckIn = dateRange?.from && day > dateRange.from;
    
    return (
      <div
        className={cn(
          "relative w-full h-full flex items-center justify-center",
          isSelected && "bg-primary/10",
          isStart && "bg-primary text-primary-foreground rounded-l-md",
          isEnd && "bg-primary text-primary-foreground rounded-r-md",
          isStart && isEnd && "rounded-md",
          // Highlight dates after check-in to guide user
          dateRange?.from && !dateRange?.to && isAfterCheckIn && "bg-blue-50 hover:bg-blue-100 cursor-pointer"
        )}
      >
        {day.getDate()}
        {/* Visual indicator for next step */}
        {dateRange?.from && !dateRange?.to && isAfterCheckIn && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        )}
      </div>
    );
  };

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
              
              {/* Sequential selection guidance */}
              {dateRange?.from && !dateRange?.to && (
                <div className="flex items-center gap-2">
                  <ArrowRight className={cn(
                    "h-4 w-4",
                    variant === 'hero' ? "text-primary-200" : "text-primary"
                  )} />
                  <div className="text-left">
                    <div className="text-sm font-medium text-primary">
                      {language === 'ar' ? 'اختر تاريخ المغادرة' : 'Select check-out'}
                    </div>
                    <div className="text-xs text-primary/70">
                      {language === 'ar' ? 'الخطوة التالية' : 'Next step'}
                    </div>
                  </div>
                </div>
              )}
              
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
          className="w-auto p-0" 
          align="start"
          side={isRTL ? "left" : "right"}
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            locale={locale}
            disabled={(date) => date < startOfDay(new Date())}
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-accent rounded-md"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: cn(
                "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              ),
              day_range_end: "day-range-end",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
            components={{
              Day: ({ date, ...props }) => renderDay(date, props),
            }}
          />
          
          {/* Sequential selection guidance */}
          {dateRange?.from && !dateRange?.to && (
            <div className="p-4 border-t bg-blue-50/50">
              <div className="flex items-center gap-2 text-blue-700">
                <ArrowRight className="h-4 w-4" />
                <div className="text-sm">
                  <p className="font-medium">
                    {language === 'ar' ? 'الآن اختر تاريخ المغادرة' : 'Now select your check-out date'}
                  </p>
                  <p className="text-xs text-blue-600">
                    {language === 'ar' ? 'انقر على تاريخ بعد تاريخ الوصول' : 'Click on a date after your check-in'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Nights counter */}
          {dateRange?.from && dateRange?.to && (
            <div className="p-4 border-t bg-muted/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'عدد الليالي' : 'Nights'}
                </span>
                <span className="font-semibold text-primary">
                  {nights} {language === 'ar' ? 'ليلة' : nights === 1 ? 'night' : 'nights'}
                </span>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}


