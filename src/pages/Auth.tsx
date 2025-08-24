import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, Globe } from 'lucide-react';

export const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
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

  const handleEmailAuth = async (mode: 'signin' | 'signup') => {
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        console.log('Starting signup process...', { email, fullName, language });
        
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
              preferred_language: language,
            }
          }
        });

        console.log('Signup response:', { data, error });

        if (error) {
          console.error('Signup error:', error);
          throw error;
        }

        // Check if user needs email confirmation
        if (data?.user && !data.session) {
          toast({
            title: language === 'ar' ? 'تم إنشاء الحساب' : 'Account created',
            description: language === 'ar' ? 
              'تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى فحص بريدك وإنجاز التأكيد.' : 
              'Confirmation link sent to your email. Please check your email and confirm your account.',
          });
        } else if (data?.session) {
          // User was created and logged in immediately
          toast({
            title: language === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully',
            description: language === 'ar' ? 'مرحباً بك في نوارتو' : 'Welcome to Nawartu',
          });
          navigate('/');
        }
      } else {
        console.log('Starting signin process...', { email });
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        console.log('Signin response:', { data, error });

        if (error) {
          console.error('Signin error:', error);
          throw error;
        }

        if (data?.session) {
          toast({
            title: language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Successfully signed in',
            description: language === 'ar' ? 'مرحباً بك في نوارتو' : 'Welcome to Nawartu',
          });
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Auth error details:', error);
      let errorMessage = error.message;
      
      // Handle common auth errors with friendly messages
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = language === 'ar' ? 
          'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 
          'Invalid email or password';
      } else if (error.message.includes('User already registered')) {
        errorMessage = language === 'ar' ? 
          'هذا البريد الإلكتروني مسجل مسبقاً' : 
          'This email is already registered';
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = language === 'ar' ? 
          'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 
          'Password should be at least 6 characters';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = language === 'ar' ? 
          'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول' : 
          'Please confirm your email before signing in';
      } else if (error.message.includes('Signup disabled')) {
        errorMessage = language === 'ar' ? 
          'التسجيل معطل حالياً' : 
          'Signup is currently disabled';
      }

      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-md bg-background/95 backdrop-blur-sm shadow-elegant">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <img src="/nawartu-logo.png" alt="Nawartu" className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl font-arabic">
            {language === 'ar' ? 'مرحباً بك في نوارتو' : 'Welcome to Nawartu'}
          </CardTitle>
          <CardDescription>
            {language === 'ar' ? 'منصة الإقامة السورية' : 'Syrian Hospitality Platform'}
          </CardDescription>
          
          <div className="flex justify-center mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              {language === 'ar' ? 'English' : 'العربية'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">
                {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </TabsTrigger>
              <TabsTrigger value="signup">
                {language === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                className="w-full"
                onClick={() => handleEmailAuth('signin')}
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (language === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...') : 
                            (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone">
                  {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                </Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder={language === 'ar' ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                className="w-full"
                onClick={() => handleEmailAuth('signup')}
                disabled={isLoading || !email || !password || !fullName}
              >
                {isLoading ? (language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...') : 
                            (language === 'ar' ? 'إنشاء حساب' : 'Sign Up')}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Separator />
            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full"
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
                {language === 'ar' ? 'المتابعة مع جوجل' : 'Continue with Google'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};