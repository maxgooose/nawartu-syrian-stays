import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Shield, MapPin, Languages } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";


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
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Logo - Airbnb Style */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse flex-shrink-0">
            <img src="/nawartu-logo.png" alt="Nawartu Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold tracking-normal" style={{ color: '#0F5E2B' }}>
              {language === 'ar' ? 'نورتوا' : 'Nawartu'}
            </span>
          </div>

          {/* Center Navigation - Minimal Airbnb Style */}
          <nav className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse">
            <Link to="/" className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all duration-200 font-medium">
              {language === 'ar' ? 'الرئيسية' : 'Stays'}
            </Link>
            <Link to="/browse" className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all duration-200 font-medium">
              {language === 'ar' ? 'تصفح' : 'Experiences'}
            </Link>
            {profile?.role !== 'host' && (
              <Link to="/become-host" className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all duration-200 font-medium">
                {language === 'ar' ? 'كن مضيف' : 'Become a Host'}
              </Link>
            )}
          </nav>

          {/* Right Section - Airbnb Style */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse flex-shrink-0">
            {/* Language Toggle - Clear and understandable */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 text-sm font-medium"
              title={language === 'ar' ? 'تغيير إلى الإنجليزية' : 'Switch to Arabic'}
            >
              <Languages className="h-4 w-4" />
              <span>{language === 'ar' ? 'EN' : 'AR'}</span>
            </button>

            {/* User Menu - Airbnb Style */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 rtl:space-x-reverse p-2 border border-gray-300 rounded-full hover:shadow-md transition-all duration-200">
                    <Menu className="h-4 w-4 text-gray-600" />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="text-sm bg-gray-500 text-white">
                        {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="bg-white border border-gray-200 shadow-xl rounded-xl p-2 z-[70] min-w-[240px]">
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
                  <DropdownMenuItem onClick={() => navigate('/browse')}>
                    <User className="mr-2 h-4 w-4" />
                    {language === 'ar' ? 'تصفح العقارات' : 'Browse Properties'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/map')}>
                    <MapPin className="mr-2 h-4 w-4" />
                    {language === 'ar' ? 'الخريطة التفاعلية' : 'Interactive Map'}
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
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <button 
                  onClick={() => navigate('/auth')}
                  className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 border border-gray-300 rounded-full hover:shadow-md transition-all duration-200"
                  aria-label={language === 'ar' ? 'تسجيل الدخول أو إنشاء حساب' : 'Sign in or create account'}
                >
                  <Menu className="h-4 w-4 text-gray-600" />
                  <div className="h-8 w-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border bg-background/95 backdrop-blur-sm animate-slide-up z-[70]">
            <nav className="flex flex-col space-y-3 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
              <Link 
                to="/" 
                className="text-foreground hover:text-primary transition-colors py-2 border-b border-border/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {language === 'ar' ? 'الرئيسية' : 'Home'}
              </Link>
              <Link 
                to="/browse" 
                className="text-foreground hover:text-primary transition-colors py-2 border-b border-border/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {language === 'ar' ? 'تصفح العقارات' : 'Browse Properties'}
              </Link>
              <Link 
                to="/map" 
                className="text-foreground hover:text-primary transition-colors py-2 border-b border-border/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {language === 'ar' ? 'الخريطة التفاعلية' : 'Interactive Map'}
              </Link>
              {profile?.role === 'host' && (
                <Link 
                  to="/host-dashboard" 
                  className="text-foreground hover:text-primary transition-colors py-2 border-b border-border/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {language === 'ar' ? 'لوحة المضيف' : 'Host Dashboard'}
                </Link>
              )}
              {profile?.role === 'admin' && (
                <Link 
                  to="/admin-dashboard" 
                  className="text-foreground hover:text-primary transition-colors py-2 border-b border-border/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
                </Link>
              )}
              {profile?.role !== 'host' && (
                <Link 
                  to="/become-host" 
                  className="text-foreground hover:text-primary transition-colors py-2 border-b border-border/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {language === 'ar' ? 'كن مضيف' : 'Become a Host'}
                </Link>
              )}
              
              {/* Mobile Auth Buttons */}
              {!user && (
                <div className="flex flex-col space-y-2 pt-4">
                  <Button variant="ghost" size="sm" asChild className="justify-start">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      {language === 'ar' ? 'تسجيل دخول' : 'Login'}
                    </Link>
                  </Button>
                  <Button variant="default" size="sm" asChild className="justify-start">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      {language === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};