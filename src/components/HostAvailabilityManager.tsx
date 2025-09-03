import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAvailability } from "@/hooks/useAvailability";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  Wrench,
  Save,
  RotateCcw,
  TrendingUp,
  Users,
  BarChart3
} from "lucide-react";
import { format, addDays, addMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface HostAvailabilityManagerProps {
  listingId: string;
  listing: {
    id: string;
    name: string;
    price_per_night_usd: number;
    max_guests: number;
  };
  className?: string;
}

interface BulkAction {
  type: 'block' | 'unblock' | 'price' | 'min_stay';
  status: 'available' | 'blocked' | 'maintenance';
  priceModifier?: number;
  minStayNights?: number;
  notes?: string;
}

interface AvailabilityStats {
  totalDays: number;
  availableDays: number;
  bookedDays: number;
  blockedDays: number;
  occupancyRate: number;
  averagePriceModifier: number;
}

export const HostAvailabilityManager: React.FC<HostAvailabilityManagerProps> = ({
  listingId,
  listing,
  className
}) => {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const { toast } = useToast();
  const isRTL = language === 'ar';

  // State management
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkAction>({
    type: 'block',
    status: 'blocked'
  });
  const [priceModifier, setPriceModifier] = useState<string>('1.0');
  const [minStayNights, setMinStayNights] = useState<string>('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AvailabilityStats | null>(null);

  // Availability hook
  const { availability, loading: availabilityLoading, refetch } = useAvailability(listingId);

  // Calculate stats when availability data changes
  useEffect(() => {
    if (availability.length > 0) {
      calculateStats();
    }
  }, [availability]);

  const calculateStats = () => {
    const totalDays = availability.length;
    const availableDays = availability.filter(day => day.status === 'available').length;
    const bookedDays = availability.filter(day => day.status === 'booked').length;
    const blockedDays = availability.filter(day => ['blocked', 'maintenance'].includes(day.status)).length;
    const occupancyRate = totalDays > 0 ? (bookedDays / totalDays) * 100 : 0;
    
    const priceModifiers = availability
      .filter(day => day.status === 'available')
      .map(day => day.price_modifier);
    const averagePriceModifier = priceModifiers.length > 0 
      ? priceModifiers.reduce((sum, mod) => sum + mod, 0) / priceModifiers.length 
      : 1.0;

    setStats({
      totalDays,
      availableDays,
      bookedDays,
      blockedDays,
      occupancyRate,
      averagePriceModifier
    });
  };

  const handleDateSelection = (dateRange: DateRange | undefined) => {
    if (!dateRange?.from) return;
    
    if (dateRange.to) {
      // Generate array of dates from range
      const dates: Date[] = [];
      let currentDate = new Date(dateRange.from);
      const endDate = new Date(dateRange.to);
      
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate = addDays(currentDate, 1);
      }
      
      setSelectedDates(dates);
    } else {
      setSelectedDates([dateRange.from]);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedDates.length === 0) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "يرجى اختيار تواريخ أولاً" : "Please select dates first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const updates = selectedDates.map(date => ({
        listing_id: listingId,
        date: format(date, 'yyyy-MM-dd'),
        status: bulkAction.status,
        price_modifier: bulkAction.type === 'price' ? parseFloat(priceModifier) : 1.0,
        min_stay_nights: bulkAction.type === 'min_stay' ? parseInt(minStayNights) : 1,
        notes: notes || null
      }));

      const { error } = await supabase
        .from('property_availability')
        .upsert(updates, { onConflict: 'listing_id,date' });

      if (error) throw error;

      toast({
        title: language === 'ar' ? "تم التحديث بنجاح" : "Updated Successfully",
        description: language === 'ar' 
          ? `تم تحديث ${selectedDates.length} يوم` 
          : `Updated ${selectedDates.length} day${selectedDates.length > 1 ? 's' : ''}`,
      });

      // Reset form
      setSelectedDates([]);
      setNotes('');
      setPriceModifier('1.0');
      setMinStayNights('1');
      
      // Refresh availability data
      refetch();
    } catch (error: any) {
      console.error('Error updating availability:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message || (language === 'ar' ? "حدث خطأ في التحديث" : "Failed to update availability"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: 'block_weekend' | 'unblock_all' | 'boost_pricing') => {
    setLoading(true);

    try {
      let updates: any[] = [];
      const startDate = new Date();
      const endDate = addMonths(startDate, 3); // Next 3 months

      switch (action) {
        case 'block_weekend':
          // Block all weekends for next 3 months
          const weekends: Date[] = [];
          let current = new Date(startDate);
          while (current <= endDate) {
            if (current.getDay() === 5 || current.getDay() === 6) { // Friday or Saturday
              weekends.push(new Date(current));
            }
            current = addDays(current, 1);
          }
          
          updates = weekends.map(date => ({
            listing_id: listingId,
            date: format(date, 'yyyy-MM-dd'),
            status: 'blocked',
            notes: 'Blocked weekends - bulk action'
          }));
          break;

        case 'unblock_all':
          // Unblock all currently blocked dates
          updates = availability
            .filter(day => day.status === 'blocked')
            .map(day => ({
              listing_id: listingId,
              date: day.date,
              status: 'available',
              notes: null
            }));
          break;

        case 'boost_pricing':
          // Increase pricing by 20% for all available dates
          updates = availability
            .filter(day => day.status === 'available')
            .map(day => ({
              listing_id: listingId,
              date: day.date,
              status: 'available',
              price_modifier: Math.min(day.price_modifier * 1.2, 2.0), // Cap at 2x
              notes: 'Price boosted - bulk action'
            }));
          break;
      }

      if (updates.length > 0) {
        const { error } = await supabase
          .from('property_availability')
          .upsert(updates, { onConflict: 'listing_id,date' });

        if (error) throw error;

        toast({
          title: language === 'ar' ? "تم التطبيق بنجاح" : "Applied Successfully",
          description: language === 'ar' 
            ? `تم تحديث ${updates.length} يوم` 
            : `Updated ${updates.length} day${updates.length > 1 ? 's' : ''}`,
        });

        refetch();
      }
    } catch (error: any) {
      console.error('Error applying quick action:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message || (language === 'ar' ? "حدث خطأ في التطبيق" : "Failed to apply action"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {language === 'ar' ? 'إدارة التوفر' : 'Availability Management'}
          </h2>
          <p className="text-gray-600">
            {language === 'ar' ? 'إدارة توفر وأسعار' : 'Manage availability and pricing for'} {listing.name}
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          {language === 'ar' ? 'مضيف' : 'Host Mode'}
        </Badge>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'ar' ? 'متاح' : 'Available'}
                  </p>
                  <p className="text-xl font-semibold">{stats.availableDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'ar' ? 'محجوز' : 'Booked'}
                  </p>
                  <p className="text-xl font-semibold">{stats.bookedDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'ar' ? 'معدل الإشغال' : 'Occupancy Rate'}
                  </p>
                  <p className="text-xl font-semibold">{stats.occupancyRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'ar' ? 'متوسط التعديل' : 'Avg. Price Modifier'}
                  </p>
                  <p className="text-xl font-semibold">{stats.averagePriceModifier.toFixed(2)}x</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <AvailabilityCalendar
            listingId={listingId}
            onDateSelect={handleDateSelection}
            mode="host"
            showPricing={true}
          />
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Bulk Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {language === 'ar' ? 'إجراءات مجمعة' : 'Bulk Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Action Type Selection */}
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'نوع الإجراء' : 'Action Type'}</Label>
                <Select
                  value={bulkAction.type}
                  onValueChange={(value: BulkAction['type']) => setBulkAction(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">
                      {language === 'ar' ? 'حجب التواريخ' : 'Block Dates'}
                    </SelectItem>
                    <SelectItem value="unblock">
                      {language === 'ar' ? 'إلغاء الحجب' : 'Unblock Dates'}
                    </SelectItem>
                    <SelectItem value="price">
                      {language === 'ar' ? 'تعديل السعر' : 'Adjust Pricing'}
                    </SelectItem>
                    <SelectItem value="min_stay">
                      {language === 'ar' ? 'تعديل الحد الأدنى للإقامة' : 'Set Minimum Stay'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Selection for Block/Unblock */}
              {(bulkAction.type === 'block' || bulkAction.type === 'unblock') && (
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الحالة' : 'Status'}</Label>
                  <Select
                    value={bulkAction.status}
                    onValueChange={(value: BulkAction['status']) => setBulkAction(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">
                        {language === 'ar' ? 'متاح' : 'Available'}
                      </SelectItem>
                      <SelectItem value="blocked">
                        {language === 'ar' ? 'محجوب' : 'Blocked'}
                      </SelectItem>
                      <SelectItem value="maintenance">
                        {language === 'ar' ? 'صيانة' : 'Maintenance'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Price Modifier Input */}
              {bulkAction.type === 'price' && (
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'معامل السعر' : 'Price Modifier'}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="5.0"
                    value={priceModifier}
                    onChange={(e) => setPriceModifier(e.target.value)}
                    placeholder={language === 'ar' ? '1.0 = سعر عادي، 1.5 = زيادة 50%' : '1.0 = normal, 1.5 = 50% increase'}
                  />
                  <p className="text-xs text-gray-600">
                    {language === 'ar' ? 'السعر الجديد:' : 'New price:'} ${(listing.price_per_night_usd * parseFloat(priceModifier || '1')).toFixed(2)}
                  </p>
                </div>
              )}

              {/* Minimum Stay Input */}
              {bulkAction.type === 'min_stay' && (
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الحد الأدنى للليالي' : 'Minimum Nights'}</Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={minStayNights}
                    onChange={(e) => setMinStayNights(e.target.value)}
                  />
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'ملاحظات (اختيارية)' : 'Notes (Optional)'}</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'ar' ? 'سبب التغيير...' : 'Reason for change...'}
                  rows={2}
                />
              </div>

              {/* Selected Dates Info */}
              {selectedDates.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {language === 'ar' ? 'تم اختيار' : 'Selected'}: {selectedDates.length} {language === 'ar' ? 'يوم' : 'day'}
                    {selectedDates.length > 1 && !isRTL && 's'}
                  </p>
                </div>
              )}

              {/* Apply Button */}
              <Button
                onClick={handleBulkUpdate}
                disabled={loading || selectedDates.length === 0}
                className="w-full"
              >
                {loading ? (
                  language === 'ar' ? 'جاري التطبيق...' : 'Applying...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'تطبيق التغييرات' : 'Apply Changes'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={() => handleQuickAction('block_weekend')}
                disabled={loading}
                className="w-full justify-start"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'حجب عطل الأسبوع' : 'Block Weekends'}
              </Button>

              <Button
                variant="outline"
                onClick={() => handleQuickAction('unblock_all')}
                disabled={loading}
                className="w-full justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'إلغاء جميع الحجوبات' : 'Unblock All'}
              </Button>

              <Button
                variant="outline"
                onClick={() => handleQuickAction('boost_pricing')}
                disabled={loading}
                className="w-full justify-start"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'رفع الأسعار 20%' : 'Boost Pricing 20%'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
