import * as React from "react";
import { format, 
  isBefore, 
  isAfter, 
  addDays, 
  startOfDay, 
  isSameDay, 
  addMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  isToday
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DateRange } from "react-day-picker";
import { ar, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AirbnbCalendarProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  language: 'ar' | 'en';
}

export function AirbnbCalendar({
  dateRange,
  onDateRangeChange,
  language
}: AirbnbCalendarProps) {
  const locale = language === 'ar' ? ar : enUS;
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [hoveredDate, setHoveredDate] = React.useState<Date | undefined>(undefined);

  const dayLabels = language === 'ar' 
    ? ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Generate calendar days for a month
  const generateMonthDays = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDate = addDays(monthStart, -getDay(monthStart));
    const endDate = addDays(monthEnd, 6 - getDay(monthEnd));
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

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

  // Check if date is in range
  const isInRange = (date: Date) => {
    if (!dateRange?.from || !dateRange?.to) return false;
    return isAfter(date, dateRange.from) && isBefore(date, dateRange.to);
  };

  // Check if date is in preview range (when hovering)
  const isInPreviewRange = (date: Date) => {
    if (!dateRange?.from || dateRange?.to || !hoveredDate) return false;
    const start = dateRange.from;
    const end = hoveredDate;
    if (isBefore(end, start)) return false;
    return isAfter(date, start) && isBefore(date, end);
  };

  // Check if date is start or end
  const isStartDate = (date: Date) => dateRange?.from && isSameDay(date, dateRange.from);
  const isEndDate = (date: Date) => dateRange?.to && isSameDay(date, dateRange.to);

  // Get day button className
  const getDayClassName = (date: Date, isCurrentMonth: boolean) => {
    const isPast = isBefore(date, startOfDay(new Date()));
    const isStart = isStartDate(date);
    const isEnd = isEndDate(date);
    const inRange = isInRange(date) || isInPreviewRange(date);
    const isHovered = hoveredDate && isSameDay(date, hoveredDate);
    
    return cn(
      "relative w-10 h-10 text-sm font-medium rounded-full transition-all",
      "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900",
      isCurrentMonth ? "text-gray-900" : "text-gray-400",
      isPast && "text-gray-300 cursor-not-allowed hover:bg-transparent",
      (isStart || isEnd) && "bg-gray-900 text-white hover:bg-gray-800",
      inRange && !isStart && !isEnd && "bg-gray-100",
      isHovered && !isStart && !isEnd && !dateRange?.to && "bg-gray-200",
      isToday(date) && !isStart && !isEnd && "ring-1 ring-gray-900"
    );
  };

  const renderMonth = (month: Date) => {
    const days = generateMonthDays(month);
    const monthStart = startOfMonth(month);
    
    return (
      <div className="flex-1">
        {/* Month header */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(month, 'MMMM yyyy', { locale })}
          </h3>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayLabels.map((day) => (
            <div key={day} className="w-10 h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1" onMouseLeave={() => setHoveredDate(undefined)}>
          {days.map((date, index) => {
            const isCurrentMonth = date >= monthStart && date <= endOfMonth(month);
            const isPast = isBefore(date, startOfDay(new Date()));
            
            return (
              <button
                key={index}
                onClick={() => !isPast && handleDateSelect(date)}
                onMouseEnter={() => !isPast && setHoveredDate(date)}
                className={getDayClassName(date, isCurrentMonth)}
                disabled={isPast}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {language === 'ar' ? 'اختر التواريخ' : 'Select dates'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {language === 'ar' ? 'الحد الأدنى للإقامة: ليلتان' : 'Minimum stay: 2 nights'}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar months */}
      <div className="flex gap-16 justify-center">
        {renderMonth(currentMonth)}
        {renderMonth(addMonths(currentMonth, 1))}
      </div>

      {/* Selected dates display */}
      {(dateRange?.from || dateRange?.to) && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-medium text-gray-900">
                {language === 'ar' ? 'تسجيل الدخول:' : 'Check-in:'}
              </span>
              <span className="ml-2 text-gray-600">
                {dateRange?.from ? format(dateRange.from, 'MMM dd, yyyy', { locale }) : (language === 'ar' ? 'اختر تاريخ' : 'Add date')}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900">
                {language === 'ar' ? 'تسجيل الخروج:' : 'Check-out:'}
              </span>
              <span className="ml-2 text-gray-600">
                {dateRange?.to ? format(dateRange.to, 'MMM dd, yyyy', { locale }) : (language === 'ar' ? 'اختر تاريخ' : 'Add date')}
              </span>
            </div>
          </div>
          {dateRange?.from && dateRange?.to && (
            <div className="mt-2 text-center">
              <span className="text-sm text-gray-600">
                {Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} {language === 'ar' ? 'ليلة' : 'nights'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
