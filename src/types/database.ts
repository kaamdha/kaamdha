export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone: string;
          name: string | null;
          avatar_url: string | null;
          location: unknown;
          locality: string | null;
          city: string | null;
          free_leads_remaining: number;
          wallet_balance: number;
          last_active_mode: "find_help" | "find_jobs" | null;
          search_status: "actively_looking" | "not_looking";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone: string;
          name?: string | null;
          avatar_url?: string | null;
          location?: unknown;
          locality?: string | null;
          city?: string | null;
          free_leads_remaining?: number;
          wallet_balance?: number;
          last_active_mode?: "find_help" | "find_jobs" | null;
          search_status?: "actively_looking" | "not_looking";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          name?: string | null;
          avatar_url?: string | null;
          location?: unknown;
          locality?: string | null;
          city?: string | null;
          free_leads_remaining?: number;
          wallet_balance?: number;
          last_active_mode?: "find_help" | "find_jobs" | null;
          search_status?: "actively_looking" | "not_looking";
          updated_at?: string;
        };
      };
      worker_profiles: {
        Row: {
          id: string;
          custom_id: string;
          user_id: string;
          categories: string[];
          bio: string | null;
          experience_years: number;
          salary_min: number | null;
          salary_max: number | null;
          available_days: string[];
          available_timings: string[];
          languages: string[];
          gender: "male" | "female" | "other" | null;
          originally_from: string | null;
          location: unknown;
          locality: string | null;
          city: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          custom_id: string;
          user_id: string;
          categories?: string[];
          bio?: string | null;
          experience_years?: number;
          salary_min?: number | null;
          salary_max?: number | null;
          available_days?: string[];
          available_timings?: string[];
          languages?: string[];
          gender?: "male" | "female" | "other" | null;
          originally_from?: string | null;
          location?: unknown;
          locality?: string | null;
          city?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          custom_id?: string;
          user_id?: string;
          categories?: string[];
          bio?: string | null;
          experience_years?: number;
          salary_min?: number | null;
          salary_max?: number | null;
          available_days?: string[];
          available_timings?: string[];
          languages?: string[];
          gender?: "male" | "female" | "other" | null;
          originally_from?: string | null;
          location?: unknown;
          locality?: string | null;
          city?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      employer_profiles: {
        Row: {
          id: string;
          custom_id: string;
          user_id: string;
          categories_needed: string[];
          description: string | null;
          household_type:
            | "apartment"
            | "independent_house"
            | "villa"
            | "other"
            | null;
          salary_min: number | null;
          salary_max: number | null;
          available_days: string[];
          available_timings: string[];
          location: unknown;
          locality: string | null;
          city: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          custom_id: string;
          user_id: string;
          categories_needed?: string[];
          description?: string | null;
          household_type?:
            | "apartment"
            | "independent_house"
            | "villa"
            | "other"
            | null;
          salary_min?: number | null;
          salary_max?: number | null;
          available_days?: string[];
          available_timings?: string[];
          location?: unknown;
          locality?: string | null;
          city?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          custom_id?: string;
          user_id?: string;
          categories_needed?: string[];
          description?: string | null;
          household_type?:
            | "apartment"
            | "independent_house"
            | "villa"
            | "other"
            | null;
          salary_min?: number | null;
          salary_max?: number | null;
          available_days?: string[];
          available_timings?: string[];
          location?: unknown;
          locality?: string | null;
          city?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          label_en: string;
          label_hi: string;
          icon: string | null;
          is_active: boolean;
          sort_order: number;
        };
        Insert: {
          id: string;
          slug: string;
          label_en: string;
          label_hi: string;
          icon?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          slug?: string;
          label_en?: string;
          label_hi?: string;
          icon?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
      };
      cities: {
        Row: {
          id: string;
          name_en: string;
          name_hi: string;
          is_active: boolean;
          center_lat: number | null;
          center_lng: number | null;
        };
        Insert: {
          id: string;
          name_en: string;
          name_hi: string;
          is_active?: boolean;
          center_lat?: number | null;
          center_lng?: number | null;
        };
        Update: {
          name_en?: string;
          name_hi?: string;
          is_active?: boolean;
          center_lat?: number | null;
          center_lng?: number | null;
        };
      };
      lead_reveals: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          reveal_type: "employer_to_worker" | "worker_to_employer";
          worker_profile_id: string | null;
          employer_profile_id: string | null;
          amount_paid: number;
          was_free_lead: boolean;
          whatsapp_sent: boolean;
          whatsapp_message_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          to_user_id: string;
          reveal_type: "employer_to_worker" | "worker_to_employer";
          worker_profile_id?: string | null;
          employer_profile_id?: string | null;
          amount_paid?: number;
          was_free_lead?: boolean;
          whatsapp_sent?: boolean;
          whatsapp_message_id?: string | null;
          created_at?: string;
        };
        Update: {
          from_user_id?: string;
          to_user_id?: string;
          reveal_type?: "employer_to_worker" | "worker_to_employer";
          worker_profile_id?: string | null;
          employer_profile_id?: string | null;
          amount_paid?: number;
          was_free_lead?: boolean;
          whatsapp_sent?: boolean;
          whatsapp_message_id?: string | null;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          target_type: "worker_profile" | "employer_profile";
          worker_profile_id: string | null;
          employer_profile_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_type: "worker_profile" | "employer_profile";
          worker_profile_id?: string | null;
          employer_profile_id?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          target_type?: "worker_profile" | "employer_profile";
          worker_profile_id?: string | null;
          employer_profile_id?: string | null;
        };
      };
      recently_viewed: {
        Row: {
          id: string;
          user_id: string;
          target_type: "worker_profile" | "employer_profile";
          worker_profile_id: string | null;
          employer_profile_id: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_type: "worker_profile" | "employer_profile";
          worker_profile_id?: string | null;
          employer_profile_id?: string | null;
          viewed_at?: string;
        };
        Update: {
          user_id?: string;
          target_type?: "worker_profile" | "employer_profile";
          worker_profile_id?: string | null;
          employer_profile_id?: string | null;
          viewed_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      next_custom_id: {
        Args: { p_type: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
};

// Convenience type aliases
export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type WorkerProfile =
  Database["public"]["Tables"]["worker_profiles"]["Row"];
export type WorkerProfileInsert =
  Database["public"]["Tables"]["worker_profiles"]["Insert"];
export type WorkerProfileUpdate =
  Database["public"]["Tables"]["worker_profiles"]["Update"];

export type EmployerProfile =
  Database["public"]["Tables"]["employer_profiles"]["Row"];
export type EmployerProfileInsert =
  Database["public"]["Tables"]["employer_profiles"]["Insert"];
export type EmployerProfileUpdate =
  Database["public"]["Tables"]["employer_profiles"]["Update"];

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type City = Database["public"]["Tables"]["cities"]["Row"];

export type LeadReveal = Database["public"]["Tables"]["lead_reveals"]["Row"];
export type LeadRevealInsert =
  Database["public"]["Tables"]["lead_reveals"]["Insert"];

export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];
export type RecentlyViewed =
  Database["public"]["Tables"]["recently_viewed"]["Row"];
