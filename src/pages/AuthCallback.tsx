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
        console.log('Processing auth callback...');
        
        // First, try to exchange the code for a session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback session error:', error);
          toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'Failed to complete authentication. Please try signing in again.',
          });
          navigate('/auth');
          return;
        }

        if (data?.session) {
          console.log('Session established successfully:', data.session.user.email);
          
          // Give some time for the profile creation trigger to complete
          setTimeout(() => {
            toast({
              title: 'Welcome to Nawartu!',
              description: 'Your account has been confirmed successfully.',
            });
            navigate('/');
          }, 1000);
        } else {
          console.log('No session found, redirecting to auth');
          toast({
            variant: 'destructive',
            title: 'Authentication Issue',
            description: 'Could not establish session. Please try signing in again.',
          });
          navigate('/auth');
        }
      } catch (error) {
        console.error('Unexpected auth callback error:', error);
        toast({
          variant: 'destructive',
          title: 'Unexpected Error',
          description: 'Something went wrong during authentication.',
        });
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