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
        
        // Handle the auth callback with hash fragments
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
          
          toast({
            title: language === 'ar' ? 'مرحباً بك في نورتوا!' : 'Welcome to Nawartu!',
            description: language === 'ar' 
              ? 'تم تأكيد حسابك بنجاح.'
              : 'Your account has been confirmed successfully.',
          });
          
          // Redirect to home page
          navigate('/', { replace: true });
        } else {
          // Try to handle auth state change event
          const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state change:', event, session?.user?.email);
            
            if (event === 'SIGNED_IN' && session) {
              toast({
                title: language === 'ar' ? 'مرحباً بك في نورتوا!' : 'Welcome to Nawartu!',
                description: language === 'ar' 
                  ? 'تم تأكيد حسابك بنجاح.'
                  : 'Your account has been confirmed successfully.',
              });
              navigate('/', { replace: true });
              authListener.subscription.unsubscribe();
            } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
              // Do nothing for these events in callback
            }
          });

          // If no session after 3 seconds, redirect to auth
          setTimeout(() => {
            supabase.auth.getSession().then(({ data }) => {
              if (!data.session) {
                console.log('No session found after timeout, redirecting to auth');
                toast({
                  variant: 'destructive',
                  title: language === 'ar' ? 'مشكلة في المصادقة' : 'Authentication Issue',
                  description: language === 'ar' 
                    ? 'لا يمكن إنشاء الجلسة. يرجى المحاولة مرة أخرى.'
                    : 'Could not establish session. Please try signing in again.',
                });
                navigate('/auth');
              }
              authListener.subscription.unsubscribe();
            });
          }, 3000);
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