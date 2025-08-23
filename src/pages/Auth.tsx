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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
              phone,
              preferred_language: language,
            }
          }
        });

        if (error) throw error;

        toast({
          title: language === 'ar' ? 'تم إنشاء الحساب' : 'Account created',
          description: language === 'ar' ? 
            'تم إرسال رابط التأكيد إلى بريدك الإلكتروني' : 
            'Confirmation link sent to your email',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Successfully signed in',
          description: language === 'ar' ? 'مرحباً بك في نوارتو' : 'Welcome to Nawartu',
        });

        navigate('/');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-md bg-background/95 backdrop-blur-sm shadow-elegant">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <img src="/src/assets/nawartu-logo.png" alt="Nawartu" className="w-10 h-10" />
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