// Placeholder — regenerate with:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];


export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          auth_user_id: string;
          username: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          username: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          username?: string;
          created_at?: string;
        };
      };
      trips: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          color_hex: string;
          status: string;
          show_routes_in_timeline: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          color_hex?: string;
          status?: string;
          show_routes_in_timeline?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          color_hex?: string;
          status?: string;
          show_routes_in_timeline?: boolean | null;
          updated_at?: string;
        };
      };
      routes: {
        Row: {
          id: string;
          trip_id: string;
          transport_type: string;
          geojson_data: Json;
          is_round_trip: boolean;
          distance_meters: number;
          color: string;
          name: string | null;
          description: string | null;
          image_path: string | null;
          start_datetime: string | null;
          end_datetime: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          transport_type: string;
          geojson_data: Json;
          is_round_trip?: boolean;
          distance_meters?: number;
          color?: string;
          name?: string | null;
          description?: string | null;
          image_path?: string | null;
          start_datetime?: string | null;
          end_datetime?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          trip_id?: string;
          transport_type?: string;
          geojson_data?: Json;
          is_round_trip?: boolean;
          distance_meters?: number;
          color?: string;
          name?: string | null;
          description?: string | null;
          image_path?: string | null;
          start_datetime?: string | null;
          end_datetime?: string | null;
          updated_at?: string;
        };
      };
      points_of_interest: {
        Row: {
          id: string;
          trip_id: string;
          title: string;
          description: string | null;
          type: string;
          icon: string;
          image_path: string | null;
          latitude: number;
          longitude: number;
          visit_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          title: string;
          description?: string | null;
          type: string;
          icon?: string;
          image_path?: string | null;
          latitude: number;
          longitude: number;
          visit_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          trip_id?: string;
          title?: string;
          description?: string | null;
          type?: string;
          icon?: string;
          image_path?: string | null;
          latitude?: number;
          longitude?: number;
          visit_date?: string | null;
          updated_at?: string;
        };
      };
      trip_tags: {
        Row: {
          id: string;
          trip_id: string;
          tag_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          tag_name: string;
          created_at?: string;
        };
        Update: {
          tag_name?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          setting_key: string;
          setting_value: string | null;
          setting_type: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          setting_key: string;
          setting_value?: string | null;
          setting_type?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          setting_value?: string | null;
          setting_type?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
      links: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          link_type: string;
          url: string;
          label: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          entity_type: string;
          entity_id: string;
          link_type?: string;
          url: string;
          label?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          link_type?: string;
          url?: string;
          label?: string | null;
          sort_order?: number;
        };
      };
      geocode_cache: {
        Row: {
          id: string;
          latitude: number;
          longitude: number;
          city: string;
          display_name: string | null;
          country: string | null;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          latitude: number;
          longitude: number;
          city: string;
          display_name?: string | null;
          country?: string | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          city?: string;
          display_name?: string | null;
          country?: string | null;
          expires_at?: string | null;
        };
      };
    };
  };
}
