export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          rating: number;
          total_trips: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          rating?: number;
          total_trips?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          rating?: number;
          total_trips?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      drivers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          rating: number;
          vehicle_type: string;
          license_plate: string;
          status: string;
          documents_verified: boolean;
          current_location: { latitude: number; longitude: number } | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          rating?: number;
          vehicle_type?: string;
          license_plate?: string;
          status?: string;
          documents_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          rating?: number;
          vehicle_type?: string;
          license_plate?: string;
          status?: string;
          documents_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      rides: {
        Row: {
          id: string;
          passenger_id: string;
          driver_id: string | null;
          pickup_location: string;
          dropoff_location: string;
          status: 'active' | 'completed' | 'cancelled';
          fare: number;
          distance: number;
          duration: number;
          eta: string;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          passenger_id: string;
          driver_id?: string | null;
          pickup_location: string;
          dropoff_location: string;
          status?: 'active' | 'completed' | 'cancelled';
          fare?: number;
          distance?: number;
          duration?: number;
          eta?: string;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          passenger_id?: string;
          driver_id?: string | null;
          pickup_location?: string;
          dropoff_location?: string;
          status?: 'active' | 'completed' | 'cancelled';
          fare?: number;
          distance?: number;
          duration?: number;
          eta?: string;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      passengers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          status?: string;
          created_at?: string;
        };
      };
      app_settings: {
        Row: {
          id: string;
          base_fare: number;
          per_km_rate: number;
          per_minute_rate: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          base_fare?: number;
          per_km_rate?: number;
          per_minute_rate?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          base_fare?: number;
          per_km_rate?: number;
          per_minute_rate?: number;
          created_at?: string;
        };
      };
      ride_ratings: {
        Row: {
          id: string;
          ride_id: string;
          user_id: string;
          driver_id: string;
          user_rating: number | null;
          driver_rating: number | null;
          user_comment: string | null;
          driver_comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ride_id: string;
          user_id: string;
          driver_id: string;
          user_rating?: number | null;
          driver_rating?: number | null;
          user_comment?: string | null;
          driver_comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ride_id?: string;
          user_id?: string;
          driver_id?: string;
          user_rating?: number | null;
          driver_rating?: number | null;
          user_comment?: string | null;
          driver_comment?: string | null;
          created_at?: string;
        };
      };
      saved_addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          address: string;
          latitude: number;
          longitude: number;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          address: string;
          latitude: number;
          longitude: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
          card_last_four: string | null;
          card_brand: string | null;
          is_default: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
          card_last_four?: string | null;
          card_brand?: string | null;
          is_default?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
          card_last_four?: string | null;
          card_brand?: string | null;
          is_default?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_driver_stats: {
        Args: {
          driver_id: string;
          earnings: number;
        };
        Returns: void;
      };
      increment_passenger_stats: {
        Args: {
          passenger_id: string;
          amount: number;
        };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}