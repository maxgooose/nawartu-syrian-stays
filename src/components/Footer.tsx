import { Link } from "react-router-dom";

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
      href: '/properties' 
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
      label: language === 'ar' ? 'إرشادات العقارات' : 'Property Guidelines', 
      href: '/guidelines' 
    }
  ];

  return (
    <footer className="bg-muted/30 border-t" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className={`${isRTL ? 'text-arabic' : 'text-latin'}`}>
            <h3 className="font-bold text-lg mb-4 text-foreground">
              {language === 'ar' ? 'نوارتو' : 'Nawartu'}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {language === 'ar' 
                ? 'الضيافة السورية عأصولها - منصة تأجير العقارات الأولى في سوريا'
                : 'Syrian hospitality done right - Syria\'s premier property rental platform'
              }
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onLanguageChange('ar')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  language === 'ar' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  language === 'en' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className={`${isRTL ? 'text-arabic' : 'text-latin'}`}>
            <h4 className="font-semibold mb-4 text-foreground">
              {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className={`${isRTL ? 'text-arabic' : 'text-latin'}`}>
            <h4 className="font-semibold mb-4 text-foreground">
              {language === 'ar' ? 'قانوني' : 'Legal'}
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className={`${isRTL ? 'text-arabic' : 'text-latin'}`}>
            <h4 className="font-semibold mb-4 text-foreground">
              {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>info@nawartu.com</p>
              <p>
                {language === 'ar' ? 'هاتف: ' : 'Phone: '}
                +963 XXX XXX XXX
              </p>
              <p>
                {language === 'ar' ? 'العنوان: دمشق، سوريا' : 'Address: Damascus, Syria'}
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className={`border-t mt-8 pt-8 text-center ${isRTL ? 'text-arabic' : 'text-latin'}`}>
          <p className="text-muted-foreground text-sm">
            {language === 'ar' 
              ? `© ${new Date().getFullYear()} نوارتو. جميع الحقوق محفوظة.`
              : `© ${new Date().getFullYear()} Nawartu. All rights reserved.`
            }
          </p>
        </div>
      </div>
    </footer>
  );
};