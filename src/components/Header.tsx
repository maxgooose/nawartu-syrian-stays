import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Menu, X } from "lucide-react";
import nawartuLogo from "@/assets/nawartu-logo.png";

interface HeaderProps {
  language: 'ar' | 'en';
  onLanguageChange: (lang: 'ar' | 'en') => void;
}

export const Header = ({ language, onLanguageChange }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    onLanguageChange(language === 'ar' ? 'en' : 'ar');
  };

  const isRTL = language === 'ar';

  return (
    <header className="fixed top-0 w-full z-50 glass-effect border-b border-border/20">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Logo */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src={nawartuLogo} alt="Nawartu" className="h-10 w-10" />
            <span className="text-2xl font-bold text-primary tracking-wide">
              نوارتو
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              {language === 'ar' ? 'البحث' : 'Search'}
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              {language === 'ar' ? 'استضافة' : 'Host'}
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors">
              {language === 'ar' ? 'حول' : 'About'}
            </a>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">
                {language === 'ar' ? 'English' : 'العربية'}
              </span>
            </Button>

            {/* Auth Buttons */}
            <Button variant="ghost" size="sm">
              {language === 'ar' ? 'تسجيل دخول' : 'Login'}
            </Button>
            <Button variant="default" size="sm">
              {language === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/20 animate-slide-up">
            <nav className="flex flex-col space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                {language === 'ar' ? 'الرئيسية' : 'Home'}
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                {language === 'ar' ? 'البحث' : 'Search'}
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                {language === 'ar' ? 'استضافة' : 'Host'}
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                {language === 'ar' ? 'حول' : 'About'}
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};