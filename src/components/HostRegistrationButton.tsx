import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useHostUpgrade } from '@/hooks/useHostUpgrade';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface HostRegistrationButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  onSuccess?: () => void;
}

/**
 * Example component demonstrating how to use the useHostUpgrade hook
 * This can be used anywhere in the application where you need host upgrade functionality
 */
export function HostRegistrationButton({ 
  variant = 'default', 
  size = 'default', 
  className = '',
  onSuccess 
}: HostRegistrationButtonProps) {
  const [message, setMessage] = useState('');
  const { isLoading, upgradeToHost } = useHostUpgrade();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleHostUpgrade = async () => {
    setMessage('');

    const result = await upgradeToHost();

    if (result.success) {
      setMessage(result.message);
      
      // Refresh user session to get updated role
      await refreshProfile();
      
      // Call success callback if provided; otherwise navigate to host dashboard
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/host-dashboard');
      }
      
      toast({
        title: "Success!",
        description: "You are now a host. Welcome to our hosting community!",
      });
    } else {
      setMessage(result.message);
      
      toast({
        title: "Upgrade Failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  // Don't show button if user is already a host or admin
  if (profile?.role === 'host' || profile?.role === 'admin') {
    return null;
  }

  return (
    <div className={className}>
      <Button 
        onClick={handleHostUpgrade} 
        disabled={isLoading}
        variant={variant}
        size={size}
      >
        {isLoading ? 'Processing...' : 'Become a Host'}
      </Button>
      {message && (
        <p className={`mt-2 text-sm ${message.includes('Successfully') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
