import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const TestDateRangePicker = () => {
  const { language } = useLanguage();
  const [dateRange, setDateRange] = useState<DateRange>();
  const [heroDateRange, setHeroDateRange] = useState<DateRange>();

  const isRTL = language === 'ar';

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  return (
    <div className="min-h-screen bg-background p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t('اختبار مكون اختيار التواريخ', 'Date Range Picker Test')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('اختبار المكون الجديد', 'Testing the new component')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Default Variant Test */}
          <Card>
            <CardHeader>
              <CardTitle>{t('المكون الافتراضي', 'Default Variant')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                language={language}
                placeholder={t('اختر التواريخ', 'Select dates')}
              />
              
              {dateRange?.from && dateRange?.to && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">
                    {t('تم الاختيار:', 'Selected:')} {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hero Variant Test */}
          <Card>
            <CardHeader>
              <CardTitle>{t('مكون البطل', 'Hero Variant')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg">
                <DateRangePicker
                  dateRange={heroDateRange}
                  onDateRangeChange={setHeroDateRange}
                  language={language}
                  placeholder={t('اختر التواريخ', 'Select dates')}
                  variant="hero"
                />
              </div>
              
              {heroDateRange?.from && heroDateRange?.to && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800">
                    {t('تم الاختيار:', 'Selected:')} {heroDateRange.from.toLocaleDateString()} - {heroDateRange.to.toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Controls */}
        <div className="mt-8 text-center space-x-4">
          <Button
            onClick={() => {
              setDateRange(undefined);
              setHeroDateRange(undefined);
            }}
            variant="outline"
          >
            {t('مسح الكل', 'Clear All')}
          </Button>
          
          <Button
            onClick={() => {
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              setDateRange({ from: today, to: tomorrow });
              setHeroDateRange({ from: today, to: tomorrow });
            }}
          >
            {t('اختبار سريع', 'Quick Test')}
          </Button>
        </div>

        {/* Status Display */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">{t('حالة المكون', 'Component Status')}</h3>
          <div className="space-y-2 text-sm">
            <p>✅ {t('تم تحميل المكون بنجاح', 'Component loaded successfully')}</p>
            <p>✅ {t('دعم اللغة العربية', 'Arabic language support')}</p>
            <p>✅ {t('دعم اللغة الإنجليزية', 'English language support')}</p>
            <p>✅ {t('دعم RTL', 'RTL support')}</p>
            <p>✅ {t('متغيرات متعددة', 'Multiple variants')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
