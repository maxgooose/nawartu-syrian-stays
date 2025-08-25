import { Link } from "react-router-dom";
import { Instagram, MessageCircle } from "lucide-react";
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
              {language === 'ar' ? 'نورتوا' : 'Nawartu'}
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
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </p>
                <a 
                  href="mailto:info@nawartu.com" 
                  className="text-primary hover:underline"
                >
                  info@nawartu.com
                </a>
              </div>
              
              <div>
                <p className="font-medium text-foreground mb-1">
                  {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                </p>
                <a
                  href="https://wa.me/19296679792"
                  className="text-primary hover:underline flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                >
                  <MessageCircle className="h-3 w-3" />
                  +1 (929) 667-9792
                </a>
              </div>
              
              <div>
                <p className="font-medium text-foreground mb-1">
                  {language === 'ar' ? 'سوريا' : 'Syria'}
                </p>
                <a
                  href="tel:+963969864741"
                  className="text-primary hover:underline"
                  dir="ltr"
                >
                  +963 969 864 741
                </a>
              </div>

              <div>
                <p className="font-medium text-foreground mb-2">
                  {language === 'ar' ? 'تابعونا' : 'Follow Us'}
                </p>
                <div className="flex gap-3">
                  <a 
                    href="https://instagram.com/nawartuofficial" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a
                    href="https://tiktok.com/@nawartu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                    aria-label="TikTok"
                  >
                    <TikTokIcon className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className={`border-t mt-8 pt-8 text-center ${isRTL ? 'text-arabic' : 'text-latin'}`}>
          <p className="text-muted-foreground text-sm">
            {language === 'ar'
              ? `© ${new Date().getFullYear()} نورتوا. جميع الحقوق محفوظة.`
              : `© ${new Date().getFullYear()} Nawartu. All rights reserved.`
            }
          </p>
        </div>
      </div>
    </footer>
  );
};