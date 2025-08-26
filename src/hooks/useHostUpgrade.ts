import { useState } from 'react';
import { requestHostUpgrade, type HostUpgradeResult } from '@/lib/hostUpgrade';

export interface UseHostUpgradeReturn {
  isLoading: boolean;
  upgradeToHost: () => Promise<HostUpgradeResult>;
  reset: () => void;
}

/**
 * Custom hook for handling host upgrade functionality
 * Provides loading states and error handling for host upgrade requests
 */
export function useHostUpgrade(): UseHostUpgradeReturn {
  const [isLoading, setIsLoading] = useState(false);

  const upgradeToHost = async (): Promise<HostUpgradeResult> => {
    setIsLoading(true);
    
    try {
      const result = await requestHostUpgrade();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
  };

  return {
    isLoading,
    upgradeToHost,
    reset,
  };
}
