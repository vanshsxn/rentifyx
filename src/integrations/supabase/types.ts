export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          area: string
          bathrooms: number | null
          bedrooms: number | null
          contact_email: string | null
          created_at: string
          distance: string | null
          features: string[] | null
          has_vr: boolean | null
          id: string
          image_url: string | null
          images: string[] | null // ADDED FOR MULTI-IMAGE SUPPORT
          is_featured: boolean | null
          landlord_id: string
          phone: string | null
          rating: number | null
          rent: number
          sqft: number | null
          title: string
          updated_at: string
          video_url: string | null
          vr_url: string | null
        }
        Insert: {
          address: string
          area: string
          bathrooms?: number | null
          bedrooms?: number | null
          contact_email?: string | null
          created_at?: string
          distance?: string | null
          features?: string[] | null
          has_vr?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null // ADDED FOR MULTI-IMAGE SUPPORT
          is_featured?: boolean | null
          landlord_id: string
          phone?: string | null
          rating?: number | null
          rent: number
          sqft?: number | null
          title: string
          updated_at?: string
          video_url?: string | null
          vr_url?: string | null
        }
        Update: {
          address?: string
          area?: string
          bathrooms?: number | null
          bedrooms?: number | null
          contact_email?: string | null
          created_at?: string
          distance?: string | null
          features?: string[] | null
          has_vr?: boolean | null
          id?: string
          image_url?: string | null
          images?: string[] | null // ADDED FOR MULTI-IMAGE SUPPORT
          is_featured?: boolean | null
          landlord_id?: string
          phone?: string | null
          rating?: number | null
          rent?: number
          sqft?: number | null
          title?: string
          updated_at?: string
          video_url?: string | null
          vr_url?: string | null
        }
        Relationships: []
      }
      property_ratings: {
        Row: {
          id: string
          property_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_ratings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      tenant_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          property_id: string
          status: string | null
          tenant_id: string
          urgent: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          property_id: string
          status?: string | null
          tenant_id: string
          urgent?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          property_id?: string
          status?: string | null
          tenant_id?: string
          urgent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "landlord" | "tenant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never

export type Enums<
  T extends keyof DefaultSchema["Enums"]
> = DefaultSchema["Enums"][T]

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "landlord", "tenant"],
    },
  },
} as const