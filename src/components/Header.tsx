import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Globe, Menu, X, User, LogOut, Shield } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import nawartuLogo from "@/assets/nawartu-logo.png";

interface HeaderProps {
  language: 'ar' | 'en';
  onLanguageChange: (lang: 'ar' | 'en') => void;
}

export const Header = ({ language, onLanguageChange }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    onLanguageChange(language === 'ar' ? 'en' : 'ar');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
              {language === 'ar' ? 'نورتوا' : 'Nawartu'}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <Link to="/guest-dashboard" className="text-foreground hover:text-primary transition-colors">
              {language === 'ar' ? 'تصفح العقارات' : 'Browse Properties'}
            </Link>
            {profile?.role === 'host' && (
              <Link to="/host-dashboard" className="text-foreground hover:text-primary transition-colors">
                {language === 'ar' ? 'لوحة المضيف' : 'Host Dashboard'}
              </Link>
            )}
            {profile?.role === 'admin' && (
              <Link to="/admin-dashboard" className="text-foreground hover:text-primary transition-colors">
                {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
              </Link>
            )}
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

            {/* Auth Section */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline max-w-20 truncate">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin-dashboard')}>
                      <Shield className="mr-2 h-4 w-4" />
                      {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
                    </DropdownMenuItem>
                  )}
                  {profile?.role === 'host' && (
                    <DropdownMenuItem onClick={() => navigate('/host-dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      {language === 'ar' ? 'لوحة المضيف' : 'Host Dashboard'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/guest-dashboard')}>
                    <User className="mr-2 h-4 w-4" />
                    {language === 'ar' ? 'تصفح العقارات' : 'Browse Properties'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {language === 'ar' ? 'تسجيل خروج' : 'Sign Out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">
                    {language === 'ar' ? 'تسجيل دخول' : 'Login'}
                  </Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link to="/auth">
                    {language === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
                  </Link>
                </Button>
              </>
            )}

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
              <Link to="/" className="text-foreground hover:text-primary transition-colors">
                {language === 'ar' ? 'الرئيسية' : 'Home'}
              </Link>
              <Link to="/guest-dashboard" className="text-foreground hover:text-primary transition-colors">
                {language === 'ar' ? 'تصفح العقارات' : 'Browse Properties'}
              </Link>
              {profile?.role === 'host' && (
                <Link to="/host-dashboard" className="text-foreground hover:text-primary transition-colors">
                  {language === 'ar' ? 'لوحة المضيف' : 'Host Dashboard'}
                </Link>
              )}
              {profile?.role === 'admin' && (
                <Link to="/admin-dashboard" className="text-foreground hover:text-primary transition-colors">
                  {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
                </Link>
              )}
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