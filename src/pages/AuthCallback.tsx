import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback...');
        
        // First, try to exchange the code for a session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback session error:', error);
          toast({
            variant: 'destructive',
            title: language === 'ar' ? 'خطأ في المصادقة' : 'Authentication Error',
            description: language === 'ar' 
              ? 'فشل في إكمال المصادقة. يرجى المحاولة مرة أخرى.'
              : 'Failed to complete authentication. Please try signing in again.',
          });
          navigate('/auth');
          return;
        }

        if (data?.session) {
          console.log('Session established successfully:', data.session.user.email);
          
          // Give some time for the profile creation trigger to complete
          setTimeout(() => {
            toast({
              title: language === 'ar' ? 'مرحباً بك في نوارتو!' : 'Welcome to Nawartu!',
              description: language === 'ar' 
                ? 'تم تأكيد حسابك بنجاح.'
                : 'Your account has been confirmed successfully.',
            });
            navigate('/');
          }, 1000);
        } else {
          console.log('No session found, redirecting to auth');
          toast({
            variant: 'destructive',
            title: language === 'ar' ? 'مشكلة في المصادقة' : 'Authentication Issue',
            description: language === 'ar' 
              ? 'لا يمكن إنشاء الجلسة. يرجى المحاولة مرة أخرى.'
              : 'Could not establish session. Please try signing in again.',
          });
          navigate('/auth');
        }
      } catch (error) {
        console.error('Unexpected auth callback error:', error);
        toast({
          variant: 'destructive',
          title: language === 'ar' ? 'خطأ غير متوقع' : 'Unexpected Error',
          description: language === 'ar' 
            ? 'حدث خطأ أثناء المصادقة.'
            : 'Something went wrong during authentication.',
        });
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, toast, language]);

  return (
    <div className="min-h-screen flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'جاري المصادقة...' : 'Authenticating...'}
        </p>
      </div>
    </div>
  );
};