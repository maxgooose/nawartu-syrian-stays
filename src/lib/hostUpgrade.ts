import { supabase } from "@/integrations/supabase/client";

export interface HostUpgradeResult {
  success: boolean;
  message: string;
}

/**
 * Frontend method to request host upgrade using the RPC function
 * This provides a secure way to upgrade user roles through server-side validation
 */
export async function requestHostUpgrade(): Promise<HostUpgradeResult> {
  try {
    const { data, error } = await supabase
      .rpc('request_host_upgrade')
      .single();

    if (error) {
      console.error('Host Upgrade Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to register as host'
      };
    }

    if (data === true) {
      // Successful upgrade
      return {
        success: true,
        message: 'Successfully registered as a host!'
      };
    } else {
      // Upgrade failed
      return {
        success: false,
        message: 'Unable to complete host registration'
      };
    }
  } catch (catchError) {
    console.error('Unexpected error:', catchError);
    return {
      success: false,
      message: 'An unexpected error occurred'
    };
  }
}
