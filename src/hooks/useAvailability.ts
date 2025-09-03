import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AvailabilityData {
  date: string;
  status: 'available' | 'booked' | 'blocked' | 'maintenance' | 'reserved';
  price_modifier: number;
  min_stay_nights: number;
  is_available: boolean;
}

export interface AvailabilityCheck {
  is_available: boolean;
  available_nights: number;
  total_nights: number;
  base_price: number;
  total_price: number;
  constraints: any[];
  blocked_dates: string[];
}

export const useAvailability = (listingId: string, startDate?: string, endDate?: string) => {
  const [availability, setAvailability] = useState<AvailabilityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Generate default date range (next 6 months)
  const getDefaultDateRange = useCallback(() => {
    const start = startDate || new Date().toISOString().split('T')[0];
    const end = endDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return { start, end };
  }, [startDate, endDate]);

  const fetchAvailability = useCallback(async () => {
    if (!listingId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { start, end } = getDefaultDateRange();
      
      const { data, error: rpcError } = await supabase
        .rpc('get_listing_availability', {
          p_listing_id: listingId,
          p_start_date: start,
          p_end_date: end
        });

      if (rpcError) throw rpcError;
      
      setAvailability(data || []);
    } catch (err: any) {
      console.error('Error fetching availability:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load availability data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [listingId, getDefaultDateRange, toast]);

  const checkAvailability = useCallback(async (
    checkIn: string,
    checkOut: string,
    guests: number = 1
  ): Promise<AvailabilityCheck | null> => {
    if (!listingId) return null;
    
    try {
      const { data, error } = await supabase
        .rpc('check_availability', {
          p_listing_id: listingId,
          p_check_in: checkIn,
          p_check_out: checkOut,
          p_guests: guests
        });

      if (error) throw error;
      
      return data?.[0] || null;
    } catch (err: any) {
      console.error('Error checking availability:', err);
      toast({
        title: "Error",
        description: "Failed to check availability",
        variant: "destructive",
      });
      return null;
    }
  }, [listingId, toast]);

  const reserveDates = useCallback(async (
    checkIn: string,
    checkOut: string,
    userId: string,
    holdDurationMinutes: number = 15
  ): Promise<boolean> => {
    if (!listingId) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('reserve_dates', {
          p_listing_id: listingId,
          p_check_in: checkIn,
          p_check_out: checkOut,
          p_user_id: userId,
          p_hold_duration_minutes: holdDurationMinutes
        });

      if (error) throw error;
      
      if (data) {
        // Refresh availability after successful reservation
        fetchAvailability();
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('Error reserving dates:', err);
      toast({
        title: "Error",
        description: "Failed to reserve dates",
        variant: "destructive",
      });
      return false;
    }
  }, [listingId, fetchAvailability, toast]);

  const releaseReservation = useCallback(async (
    checkIn: string,
    checkOut: string,
    userId?: string
  ): Promise<void> => {
    if (!listingId) return;
    
    try {
      const { error } = await supabase
        .rpc('release_reservation', {
          p_listing_id: listingId,
          p_check_in: checkIn,
          p_check_out: checkOut,
          p_user_id: userId || null
        });

      if (error) throw error;
      
      // Refresh availability after releasing reservation
      fetchAvailability();
    } catch (err: any) {
      console.error('Error releasing reservation:', err);
      toast({
        title: "Error",
        description: "Failed to release reservation",
        variant: "destructive",
      });
    }
  }, [listingId, fetchAvailability, toast]);

  const confirmBooking = useCallback(async (
    bookingId: string,
    checkIn: string,
    checkOut: string
  ): Promise<boolean> => {
    if (!listingId) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('confirm_booking', {
          p_booking_id: bookingId,
          p_listing_id: listingId,
          p_check_in: checkIn,
          p_check_out: checkOut
        });

      if (error) throw error;
      
      // Refresh availability after confirming booking
      fetchAvailability();
      return true;
    } catch (err: any) {
      console.error('Error confirming booking:', err);
      toast({
        title: "Error",
        description: "Failed to confirm booking",
        variant: "destructive",
      });
      return false;
    }
  }, [listingId, fetchAvailability, toast]);

  // Initial fetch
  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Set up real-time subscription
  useEffect(() => {
    if (!listingId) return;

    const subscription = supabase
      .channel(`availability:${listingId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'property_availability',
          filter: `listing_id=eq.${listingId}`
        }, 
        (payload) => {
          console.log('Availability changed:', payload);
          fetchAvailability(); // Refresh data on any change
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public', 
          table: 'bookings',
          filter: `listing_id=eq.${listingId}`
        },
        (payload) => {
          console.log('Booking changed:', payload);
          fetchAvailability(); // Refresh data when bookings change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [listingId, fetchAvailability]);

  return {
    availability,
    loading,
    error,
    refetch: fetchAvailability,
    checkAvailability,
    reserveDates,
    releaseReservation,
    confirmBooking
  };
};
