import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import SyrianGovernorateDropdown from '@/components/SyrianGovernorateDropdown';
import { SyrianGovernorate } from '@/lib/syrianGovernorates';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TestSyrianGovernorateDropdown = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [selectedGovernorate, setSelectedGovernorate] = useState<SyrianGovernorate | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const isRTL = language === 'ar';

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testBasicFunctionality = () => {
    addTestResult('Testing basic dropdown functionality');
    setSelectedGovernorate(null);
  };

  const testSearchFunctionality = () => {
    addTestResult('Testing search functionality - try typing "دمشق" or "Damascus"');
  };

  const testHostLocationAdaptation = () => {
    addTestResult('Testing host location adaptation - nearest governorate should appear first');
  };

  const testClearSelection = () => {
    addTestResult('Testing clear selection functionality');
    setSelectedGovernorate(null);
  };

  const handleGovernorateSelect = (governorate: SyrianGovernorate) => {
    setSelectedGovernorate(governorate);
    addTestResult(`Selected: ${governorate.nameAr} (${governorate.nameEn})`);
  };

  return (
    <div className="min-h-screen bg-background pattern-geometric-stars" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container-custom py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('العودة للرئيسية', 'Back to Home')}
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('اختبار قائمة المحافظات السورية', 'Test Syrian Governorate Dropdown')}
          </h1>
          <p className="text-muted-foreground">
            {t('صفحة اختبار لمكون قائمة المحافظات السورية الجديد', 'Test page for the new Syrian Governorate Dropdown component')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('أدوات الاختبار', 'Test Controls')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={testBasicFunctionality} variant="outline" size="sm">
                    {t('اختبار أساسي', 'Basic Test')}
                  </Button>
                  <Button onClick={testSearchFunctionality} variant="outline" size="sm">
                    {t('اختبار البحث', 'Search Test')}
                  </Button>
                  <Button onClick={testHostLocationAdaptation} variant="outline" size="sm">
                    {t('اختبار التكيف', 'Adaptation Test')}
                  </Button>
                  <Button onClick={testClearSelection} variant="outline" size="sm">
                    {t('مسح الاختيار', 'Clear Selection')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card>
              <CardHeader>
                <CardTitle>{t('نتائج الاختبار', 'Test Results')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {testResults.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      {t('لا توجد نتائج اختبار بعد', 'No test results yet')}
                    </p>
                  ) : (
                    testResults.map((result, index) => (
                      <div key={index} className="text-sm p-2 bg-muted rounded">
                        {result}
                      </div>
                    ))
                  )}
                </div>
                {testResults.length > 0 && (
                  <Button 
                    onClick={() => setTestResults([])} 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                  >
                    {t('مسح النتائج', 'Clear Results')}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Component Tests */}
          <div className="space-y-6">
            {/* Basic Dropdown Test */}
            <Card>
              <CardHeader>
                <CardTitle>{t('القائمة الأساسية', 'Basic Dropdown')}</CardTitle>
              </CardHeader>
              <CardContent>
                <SyrianGovernorateDropdown
                  onGovernorateSelect={handleGovernorateSelect}
                  selectedGovernorate={selectedGovernorate}
                  label={t('اختر المحافظة', 'Select Governorate')}
                  placeholder={t('اختر محافظة...', 'Select governorate...')}
                  required={true}
                />
              </CardContent>
            </Card>

            {/* Dropdown with Search Disabled */}
            <Card>
              <CardHeader>
                <CardTitle>{t('قائمة بدون بحث', 'Dropdown without Search')}</CardTitle>
              </CardHeader>
              <CardContent>
                <SyrianGovernorateDropdown
                  onGovernorateSelect={handleGovernorateSelect}
                  selectedGovernorate={selectedGovernorate}
                  label={t('اختر المحافظة', 'Select Governorate')}
                  placeholder={t('اختر محافظة...', 'Select governorate...')}
                  showSearch={false}
                />
              </CardContent>
            </Card>

            {/* Host Location Adaptation Test */}
            <Card>
              <CardHeader>
                <CardTitle>{t('تكيف مع موقع المضيف', 'Host Location Adaptation')}</CardTitle>
              </CardHeader>
              <CardContent>
                <SyrianGovernorateDropdown
                  onGovernorateSelect={handleGovernorateSelect}
                  selectedGovernorate={selectedGovernorate}
                  label={t('اختر المحافظة', 'Select Governorate')}
                  placeholder={t('اختر محافظة...', 'Select governorate...')}
                  adaptToHostLocation={true}
                  hostLatitude={33.5138} // Damascus coordinates
                  hostLongitude={36.2765}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {t('المحافظة الأقرب لدمشق ستظهر أولاً', 'Governorate nearest to Damascus will appear first')}
                </p>
              </CardContent>
            </Card>

            {/* Disabled Dropdown */}
            <Card>
              <CardHeader>
                <CardTitle>{t('قائمة معطلة', 'Disabled Dropdown')}</CardTitle>
              </CardHeader>
              <CardContent>
                <SyrianGovernorateDropdown
                  onGovernorateSelect={handleGovernorateSelect}
                  selectedGovernorate={selectedGovernorate}
                  label={t('اختر المحافظة', 'Select Governorate')}
                  placeholder={t('اختر محافظة...', 'Select governorate...')}
                  disabled={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Selected Governorate Display */}
        {selectedGovernorate && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{t('المحافظة المختارة', 'Selected Governorate')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('الاسم العربي', 'Arabic Name')}
                  </span>
                  <p className="text-lg font-semibold">{selectedGovernorate.nameAr}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('الاسم الإنجليزي', 'English Name')}
                  </span>
                  <p className="text-lg font-semibold">{selectedGovernorate.nameEn}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('المنطقة', 'Region')}
                  </span>
                  <Badge variant="secondary">{selectedGovernorate.region}</Badge>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('المدن الرئيسية', 'Major Cities')}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedGovernorate.majorCities.slice(0, 3).map((city, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {city}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestSyrianGovernorateDropdown;
