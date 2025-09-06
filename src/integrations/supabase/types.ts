export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_approvals: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          notes: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          notes?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_approvals_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_constraints: {
        Row: {
          constraint_type: Database["public"]["Enums"]["constraint_type"]
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          listing_id: string
          start_date: string | null
          updated_at: string | null
          value: Json
        }
        Insert: {
          constraint_type: Database["public"]["Enums"]["constraint_type"]
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          listing_id: string
          start_date?: string | null
          updated_at?: string | null
          value: Json
        }
        Update: {
          constraint_type?: Database["public"]["Enums"]["constraint_type"]
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          listing_id?: string
          start_date?: string | null
          updated_at?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "booking_constraints_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          admin_notes: string | null
          check_in_date: string
          check_out_date: string
          created_at: string
          guest_id: string
          id: string
          listing_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"]
          stripe_payment_intent_id: string | null
          total_amount_syp: number | null
          total_amount_usd: number
          total_nights: number
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          check_in_date: string
          check_out_date: string
          created_at?: string
          guest_id: string
          id?: string
          listing_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_payment_intent_id?: string | null
          total_amount_syp?: number | null
          total_amount_usd: number
          total_nights: number
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          check_in_date?: string
          check_out_date?: string
          created_at?: string
          guest_id?: string
          id?: string
          listing_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_payment_intent_id?: string | null
          total_amount_syp?: number | null
          total_amount_usd?: number
          total_nights?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          admin_notes: string | null
          amenities: string[] | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          description: string
          description_ar: string | null
          description_ar_auto_translated: boolean | null
          description_en: string | null
          description_en_auto_translated: boolean | null
          host_id: string
          id: string
          images: string[] | null
          last_translation_update: string | null
          latitude: number | null
          location: string
          location_ar: string | null
          location_ar_auto_translated: boolean | null
          location_en: string | null
          location_en_auto_translated: boolean | null
          longitude: number | null
          max_guests: number
          name: string
          name_ar: string | null
          name_ar_auto_translated: boolean | null
          name_en: string | null
          name_en_auto_translated: boolean | null
          price_per_night_syp: number | null
          price_per_night_usd: number
          status: Database["public"]["Enums"]["listing_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          description: string
          description_ar?: string | null
          description_ar_auto_translated?: boolean | null
          description_en?: string | null
          description_en_auto_translated?: boolean | null
          host_id: string
          id?: string
          images?: string[] | null
          last_translation_update?: string | null
          latitude?: number | null
          location: string
          location_ar?: string | null
          location_ar_auto_translated?: boolean | null
          location_en?: string | null
          location_en_auto_translated?: boolean | null
          longitude?: number | null
          max_guests?: number
          name: string
          name_ar?: string | null
          name_ar_auto_translated?: boolean | null
          name_en?: string | null
          name_en_auto_translated?: boolean | null
          price_per_night_syp?: number | null
          price_per_night_usd: number
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          description?: string
          description_ar?: string | null
          description_ar_auto_translated?: boolean | null
          description_en?: string | null
          description_en_auto_translated?: boolean | null
          host_id?: string
          id?: string
          images?: string[] | null
          last_translation_update?: string | null
          latitude?: number | null
          location?: string
          location_ar?: string | null
          location_ar_auto_translated?: boolean | null
          location_en?: string | null
          location_en_auto_translated?: boolean | null
          longitude?: number | null
          max_guests?: number
          name?: string
          name_ar?: string | null
          name_ar_auto_translated?: boolean | null
          name_en?: string | null
          name_en_auto_translated?: boolean | null
          price_per_night_syp?: number | null
          price_per_night_usd?: number
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      property_availability: {
        Row: {
          created_at: string | null
          date: string
          id: string
          listing_id: string
          max_stay_nights: number | null
          min_stay_nights: number | null
          notes: string | null
          price_modifier: number | null
          reserved_by: string | null
          reserved_until: string | null
          status: Database["public"]["Enums"]["availability_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          listing_id: string
          max_stay_nights?: number | null
          min_stay_nights?: number | null
          notes?: string | null
          price_modifier?: number | null
          reserved_by?: string | null
          reserved_until?: string | null
          status?: Database["public"]["Enums"]["availability_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          listing_id?: string
          max_stay_nights?: number | null
          min_stay_nights?: number | null
          notes?: string | null
          price_modifier?: number | null
          reserved_by?: string | null
          reserved_until?: string | null
          status?: Database["public"]["Enums"]["availability_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_availability_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string
          created_at: string
          guest_id: string
          host_response: string | null
          id: string
          listing_id: string
          rating: number
          title: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          comment: string
          created_at?: string
          guest_id: string
          host_response?: string | null
          id?: string
          listing_id: string
          rating: number
          title: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          comment?: string
          created_at?: string
          guest_id?: string
          host_response?: string | null
          id?: string
          listing_id?: string
          rating?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      terms_acceptance: {
        Row: {
          accepted_at: string
          booking_id: string | null
          id: string
          terms_version: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          booking_id?: string | null
          id?: string
          terms_version?: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          booking_id?: string | null
          id?: string
          terms_version?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "terms_acceptance_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terms_acceptance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_review_booking: {
        Args: { booking_uuid: string }
        Returns: boolean
      }
      check_availability: {
        Args: {
          p_check_in: string
          p_check_out: string
          p_guests?: number
          p_listing_id: string
        }
        Returns: {
          available_nights: number
          base_price: number
          blocked_dates: string[]
          constraints: Json
          is_available: boolean
          total_nights: number
          total_price: number
        }[]
      }
      cleanup_expired_reservations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      confirm_booking: {
        Args: {
          p_booking_id: string
          p_check_in: string
          p_check_out: string
          p_listing_id: string
        }
        Returns: boolean
      }
      get_listing_availability: {
        Args: { p_end_date: string; p_listing_id: string; p_start_date: string }
        Returns: {
          date: string
          is_available: boolean
          min_stay_nights: number
          price_modifier: number
          status: Database["public"]["Enums"]["availability_status"]
        }[]
      }
      get_listing_average_rating: {
        Args: { listing_uuid: string }
        Returns: {
          average_rating: number
          review_count: number
        }[]
      }
      initialize_listing_availability: {
        Args: { p_days_ahead?: number; p_listing_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      release_reservation: {
        Args: {
          p_check_in: string
          p_check_out: string
          p_listing_id: string
          p_user_id?: string
        }
        Returns: undefined
      }
      request_host_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      reserve_dates: {
        Args: {
          p_check_in: string
          p_check_out: string
          p_hold_duration_minutes?: number
          p_listing_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      translate_existing_listings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      upgrade_to_host: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      validate_user_input: {
        Args: { input_text: string }
        Returns: boolean
      }
    }
    Enums: {
      availability_status:
        | "available"
        | "booked"
        | "blocked"
        | "maintenance"
        | "reserved"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      constraint_type:
        | "min_stay"
        | "max_stay"
        | "advance_booking"
        | "same_day_booking"
        | "weekend_only"
        | "seasonal_pricing"
        | "weekend_pricing"
        | "holiday_pricing"
      listing_status: "pending" | "approved" | "rejected"
      payment_method: "cash" | "stripe"
      user_role: "guest" | "host" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      availability_status: [
        "available",
        "booked",
        "blocked",
        "maintenance",
        "reserved",
      ],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      constraint_type: [
        "min_stay",
        "max_stay",
        "advance_booking",
        "same_day_booking",
        "weekend_only",
        "seasonal_pricing",
        "weekend_pricing",
        "holiday_pricing",
      ],
      listing_status: ["pending", "approved", "rejected"],
      payment_method: ["cash", "stripe"],
      user_role: ["guest", "host", "admin"],
    },
  },
} as const
