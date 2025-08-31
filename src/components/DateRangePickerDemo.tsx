import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, Home, Search } from 'lucide-react';

export const DateRangePickerDemo = () => {
  const { language } = useLanguage();
  const [dateRange, setDateRange] = useState<DateRange>();
  const [heroDateRange, setHeroDateRange] = useState<DateRange>();

  const isRTL = language === 'ar';

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  return (
    <div className="min-h-screen bg-background p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Calendar className="h-10 w-10 text-primary" />
            {t('عرض توضيحي لاختيار التواريخ', 'Date Range Picker Demo')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t(
              'مكون جديد لاختيار نطاق التواريخ بتصميم مشابه لـ Airbnb، مع دعم اللغة العربية والإنجليزية',
              'A new date range picker component with Airbnb-style design, supporting Arabic and English languages'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Default Variant */}
          <Card className="border-2 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                {t('المكون الافتراضي', 'Default Variant')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('مستخدم في صفحات تفاصيل العقار', 'Used in listing detail pages')}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('تواريخ الإقامة', 'Stay Dates')}
                </label>
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  language={language}
                  placeholder={t('اختر تاريخ الوصول والمغادرة', 'Select check-in and check-out dates')}
                />
              </div>

              {dateRange?.from && dateRange?.to && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {t('تاريخ الوصول', 'Check-in')}
                    </Badge>
                    <span className="font-medium">
                      {dateRange.from.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {t('تاريخ المغادرة', 'Check-out')}
                    </Badge>
                    <span className="font-medium">
                      {dateRange.to.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">
                      {t('عدد الليالي', 'Nights')}
                    </Badge>
                    <span className="font-medium">
                      {Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hero Variant */}
          <Card className="border-2 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                {t('مكون البطل', 'Hero Variant')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('مستخدم في قسم البحث الرئيسي', 'Used in the main search hero section')}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/90">
                  {t('تواريخ الإقامة', 'Stay Dates')}
                </label>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg">
                  <DateRangePicker
                    dateRange={heroDateRange}
                    onDateRangeChange={setHeroDateRange}
                    language={language}
                    placeholder={t('اختر التواريخ', 'Select dates')}
                    variant="hero"
                  />
                </div>
              </div>

              {heroDateRange?.from && heroDateRange?.to && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {t('تاريخ الوصول', 'Check-in')}
                    </Badge>
                    <span className="font-medium">
                      {heroDateRange.from.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {t('تاريخ المغادرة', 'Check-out')}
                    </Badge>
                    <span className="font-medium">
                      {heroDateRange.to.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">
                      {t('عدد الليالي', 'Nights')}
                    </Badge>
                    <span className="font-medium">
                      {Math.ceil((heroDateRange.to.getTime() - heroDateRange.from.getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="mt-8 border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="text-center">
              {t('المميزات الرئيسية', 'Key Features')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{t('تصميم Airbnb', 'Airbnb Design')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('تصميم جميل وعصري مشابه لـ Airbnb', 'Beautiful and modern design similar to Airbnb')}
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{t('متعدد الاستخدامات', 'Multi-purpose')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('متغيرات مختلفة للاستخدام في أماكن مختلفة', 'Different variants for use in different places')}
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{t('دعم متعدد اللغات', 'Multi-language')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('دعم كامل للعربية والإنجليزية مع RTL', 'Full support for Arabic and English with RTL')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Toggle */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => {
              // This would typically be handled by the language context
              console.log('Language toggle clicked');
            }}
            className="mx-auto"
          >
            {t('تغيير اللغة', 'Change Language')}
          </Button>
        </div>
      </div>
    </div>
  );
};
