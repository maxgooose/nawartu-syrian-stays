import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: error.message,
          });
          navigate('/auth');
          return;
        }

        if (data?.session) {
          toast({
            title: 'Welcome to Nawartu!',
            description: 'You have been successfully authenticated.',
          });
          navigate('/');
        } else {
          navigate('/auth');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    </div>
  );
};