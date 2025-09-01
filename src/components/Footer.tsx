import { Link } from "react-router-dom";
import { Instagram, MessageCircle, Languages } from "lucide-react";
import { TikTokIcon } from "@/components/ui/icons";

interface FooterProps {
  language: 'ar' | 'en';
  onLanguageChange: (lang: 'ar' | 'en') => void;
}

export const Footer = ({ language, onLanguageChange }: FooterProps) => {
  const isRTL = language === 'ar';

  const quickLinks = [
    { 
      label: language === 'ar' ? 'الرئيسية' : 'Home', 
      href: '/' 
    },
    { 
      label: language === 'ar' ? 'تصفح العقارات' : 'Browse Properties', 
      href: '/browse' 
    },
    { 
      label: language === 'ar' ? 'كن مضيفاً' : 'Become a Host', 
      href: '/host-dashboard' 
    },
    { 
      label: language === 'ar' ? 'تواصل معنا' : 'Contact Us', 
      href: '/contact' 
    }
  ];

  const legalLinks = [
    { 
      label: language === 'ar' ? 'شروط الخدمة' : 'Terms of Service', 
      href: '/terms' 
    },
    { 
      label: language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy', 
      href: '/privacy' 
    },
    { 
      label: language === 'ar' ? 'إرشادات العقارات' : 'Listing Guidelines', 
      href: '/guidelines' 
    }
  ];

  return (
    <footer className={`bg-gray-50 border-t border-gray-200 ${isRTL ? 'footer-arabic-responsive' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 ${isRTL ? 'rtl' : 'ltr'}`}>
          {/* Support */}
          <div className={`${isRTL ? 'text-arabic' : 'text-latin'} ${isRTL ? 'text-right' : 'text-left'}`}>
            <h4 className="font-semibold text-gray-900 mb-4">
              {language === 'ar' ? 'الدعم' : 'Support'}
            </h4>
            <ul className="space-y-3">
              {[
                { label: language === 'ar' ? 'تواصل معنا' : 'Contact Us', href: '/contact' },
                { label: language === 'ar' ? 'شروط الخدمة' : 'Terms of Service', href: '/terms' },
                { label: language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy', href: '/privacy' },
                { label: language === 'ar' ? 'إرشادات العقارات' : 'Listing Guidelines', href: '/guidelines' }
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm block font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div className={`${isRTL ? 'text-arabic' : 'text-latin'} ${isRTL ? 'text-right' : 'text-left'}`}>
            <h4 className="font-semibold text-gray-900 mb-4">
              {language === 'ar' ? 'المجتمع' : 'Community'}
            </h4>
            <ul className="space-y-3">
              {[
                { label: language === 'ar' ? 'كن مضيفاً' : 'Become a Host', href: '/become-host' },
                { label: language === 'ar' ? 'تصفح العقارات' : 'Browse Properties', href: '/browse' },
                { label: language === 'ar' ? 'الخريطة التفاعلية' : 'Interactive Map', href: '/map' }
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm block font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hosting */}
          <div className={`${isRTL ? 'text-arabic' : 'text-latin'} ${isRTL ? 'text-right' : 'text-left'}`}>
            <h4 className="font-semibold text-gray-900 mb-4">
              {language === 'ar' ? 'الاستضافة' : 'Hosting'}
            </h4>
            <ul className="space-y-3">
              {[
                { label: language === 'ar' ? 'ابدأ بالاستضافة' : 'Start hosting', href: '/become-host' },
                { label: language === 'ar' ? 'لوحة المضيف' : 'Host Dashboard', href: '/host-dashboard' }
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-gray-600 hover:text-gray-900 transition-colors text-sm block font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div className={`${isRTL ? 'text-arabic' : 'text-latin'} ${isRTL ? 'text-right' : 'text-left'}`}>
            <h4 className="font-semibold text-gray-900 mb-4">
              {language === 'ar' ? 'نورتوا' : 'Nawartu'}
            </h4>
            <div className="text-sm text-gray-600 leading-relaxed">
              {language === 'ar' 
                ? 'الضيافة السورية عأصولها - منصة للحجوزات الأصيلة في سوريا.' 
                : "Syrian hospitality done right – authentic stays across Syria."}
            </div>
            
            {/* Social Links */}
            <div className="mt-6">
              <div className={`flex gap-4 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                <a 
                  href="https://instagram.com/nawartuofficial" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://tiktok.com/@nawartu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://wa.me/963969864741"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Airbnb Style */}
        <div className="border-t border-gray-200 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Left side - Links */}
            <div className="flex flex-wrap gap-4 text-sm">
              {[
                { label: language === 'ar' ? 'سياسة الخصوصية' : 'Privacy', href: '/privacy' },
                { label: language === 'ar' ? 'الشروط' : 'Terms', href: '/terms' },
                { label: language === 'ar' ? 'خريطة الموقع' : 'Sitemap', href: '/sitemap.xml' },
              ].map((link, index) => (
                <span key={index}>
                  <Link 
                    to={link.href} 
                    className="text-gray-600 hover:text-gray-900 transition-colors underline"
                  >
                    {link.label}
                  </Link>
                  {index < 2 && <span className="text-gray-400 ml-4">·</span>}
                </span>
              ))}
            </div>
            
            {/* Right side - Copyright & Language */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`flex items-center gap-2 hover:text-gray-900 transition-colors ${
                    language === 'en' ? 'text-gray-900 font-medium' : 'text-gray-600'
                  }`}
                >
                  <Languages className="h-4 w-4" />
                  English (US)
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={() => onLanguageChange('ar')}
                  className={`hover:text-gray-900 transition-colors ${
                    language === 'ar' ? 'text-gray-900 font-medium' : 'text-gray-600'
                  }`}
                >
                  العربية
                </button>
              </div>
              
              <p className="text-gray-600">
                © {new Date().getFullYear()} Nawartu, Inc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};