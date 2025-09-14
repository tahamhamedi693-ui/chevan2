// Supabase Database Types Override
// This file provides type definitions for Supabase database operations
// until proper type generation is set up

import { UserType } from '@/types/database';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          user_type: UserType
          rating: number
          total_trips: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          user_type?: UserType
          rating?: number
          total_trips?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          user_type?: UserType
          rating?: number
          total_trips?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
