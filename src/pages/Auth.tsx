import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PhoneInputComponent } from '@/components/PhoneInput';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const { language, handleLanguageChange } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  // Phone is optional at sign-in; we no longer force the phone dialog here
  useEffect(() => {
    if (user && profile && (!profile.phone || profile.phone.trim() === '')) {
      setShowPhoneDialog(true);
      setFullName(profile.full_name || '');
    }
  }, [user, profile]);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      console.log('Starting Google OAuth...');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }
      
      // Don't set loading to false here since we're redirecting
    } catch (error: any) {
      console.error('Google auth error details:', error);
      let errorMessage = error.message;
      
      if (error.message.includes('To signup, please visit')) {
        errorMessage = language === 'ar' ? 
          'يرجى استخدام الرابط المرسل إلى بريدك الإلكتروني لإكمال التسجيل' : 
          'Please check your email and click the confirmation link to complete signup';
      }

      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phone.trim()) {
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required',
      });
      return;
    }

    if (!fullName.trim()) {
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'الاسم الكامل مطلوب' : 'Full name is required',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          phone: phone.trim(),
          full_name: fullName.trim()
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: language === 'ar' ? 'تم التحديث بنجاح' : 'Successfully updated',
        description: language === 'ar' ? 'تم حفظ معلوماتك بنجاح' : 'Your information has been saved successfully',
      });

      setShowPhoneDialog(false);
      navigate('/');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Card className="w-full max-w-md bg-background/95 backdrop-blur-sm shadow-elegant">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-light mb-2">
              {language === 'ar' ? 'مرحباً بك في نورتوا' : 'Welcome to Nawartu'}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {language === 'ar' ? 'منصة الإقامة السورية' : 'Syrian Hospitality Platform'}
            </CardDescription>
            
            <div className="flex justify-center mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLanguageChange(language === 'ar' ? 'en' : 'ar')}
                className="gap-2 text-sm hover:bg-gray-100 transition-colors"
                title={language === 'ar' ? 'تغيير إلى الإنجليزية' : 'Switch to Arabic'}
              >
                <Languages className="h-4 w-4" />
                {language === 'ar' ? 'EN' : 'AR'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                  {language === 'ar' ? 'سجل الدخول أو أنشئ حساب' : 'Sign In or Create Account'}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {language === 'ar' ? 'استخدم حساب Google للمتابعة' : 'Use your Google account to continue'}
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isLoading ? 
                  (language === 'ar' ? 'جاري التحميل...' : 'Loading...') :
                  (language === 'ar' ? 'المتابعة مع Google' : 'Continue with Google')
                }
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                {language === 'ar' ? 
                  'بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية' :
                  'By continuing, you agree to our Terms of Service and Privacy Policy'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phone Number Required Dialog */}
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'أكمل ملفك الشخصي' : 'Complete Your Profile'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' ? 
                'يرجى إضافة رقم هاتفك لإكمال التسجيل. رقم الهاتف مطلوب للتواصل معك.' :
                'Please add your phone number to complete registration. Phone number is required for communication.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="full-name" className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              </Label>
              <Input
                id="full-name"
                type="text"
                placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone-number" className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
              </Label>
              <div className="[&_.react-tel-input]:h-12 [&_.react-tel-input]:rounded-xl [&_.react-tel-input]:border-gray-200 [&_.react-tel-input]:focus-within:border-blue-400 [&_.react-tel-input]:focus-within:ring-2 [&_.react-tel-input]:focus-within:ring-blue-100 [&_.react-tel-input]:transition-all [&_.react-tel-input]:duration-200">
                <PhoneInputComponent
                  value={phone}
                  onChange={(value) => setPhone(value || '')}
                  placeholder={language === 'ar' ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                  disabled={isLoading}
                  defaultCountry="SY"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handlePhoneSubmit}
              disabled={isLoading || !phone.trim() || !fullName.trim()}
              className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 hover:shadow-lg"
            >
              {isLoading ? 
                (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') :
                (language === 'ar' ? 'حفظ والمتابعة' : 'Save & Continue')
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Auth;