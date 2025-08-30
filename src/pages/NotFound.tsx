import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">
          {language === 'ar' ? 'عذراً! الصفحة غير موجودة' : 'Oops! Page not found'}
        </p>
        <div className="space-y-4">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className={isRTL ? 'ml-4' : 'mr-4'}
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
            {language === 'ar' ? 'العودة' : 'Go Back'}
          </Button>
          <Button 
            onClick={() => window.location.href = '/'}
            variant="default"
          >
            {language === 'ar' ? 'العودة للرئيسية' : 'Return to Home'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
