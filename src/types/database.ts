export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone: string;
          name: string | null;
          avatar_url: string | null;
          active_role: "worker" | "employer" | null;
          has_worker_profile: boolean;
          has_employer_profile: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone: string;
          name?: string | null;
          avatar_url?: string | null;
          active_role?: "worker" | "employer" | null;
          has_worker_profile?: boolean;
          has_employer_profile?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          name?: string | null;
          avatar_url?: string | null;
          active_role?: "worker" | "employer" | null;
          has_worker_profile?: boolean;
          has_employer_profile?: boolean;
          updated_at?: string;
        };
      };
      worker_profiles: {
        Row: {
          id: string;
          user_id: string;
          job_types: string[];
          bio: string | null;
          experience_years: number;
          salary_min: number | null;
          salary_max: number | null;
          availability: "full_time" | "part_time" | "flexible" | null;
          available_days: string[];
          languages: string[];
          location: unknown;
          locality: string | null;
          city: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_types?: string[];
          bio?: string | null;
          experience_years?: number;
          salary_min?: number | null;
          salary_max?: number | null;
          availability?: "full_time" | "part_time" | "flexible" | null;
          available_days?: string[];
          languages?: string[];
          location?: unknown;
          locality?: string | null;
          city?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          job_types?: string[];
          bio?: string | null;
          experience_years?: number;
          salary_min?: number | null;
          salary_max?: number | null;
          availability?: "full_time" | "part_time" | "flexible" | null;
          available_days?: string[];
          languages?: string[];
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
          user_id: string;
          household_type:
            | "apartment"
            | "independent_house"
            | "villa"
            | "other"
            | null;
          location: unknown;
          locality: string | null;
          city: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          household_type?:
            | "apartment"
            | "independent_house"
            | "villa"
            | "other"
            | null;
          location?: unknown;
          locality?: string | null;
          city?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          household_type?:
            | "apartment"
            | "independent_house"
            | "villa"
            | "other"
            | null;
          location?: unknown;
          locality?: string | null;
          city?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      job_posts: {
        Row: {
          id: string;
          employer_id: string;
          job_type: string;
          title: string | null;
          description: string | null;
          schedule: "full_time" | "part_time" | "flexible" | null;
          preferred_days: string[];
          preferred_timings: string | null;
          salary_min: number | null;
          salary_max: number | null;
          location: unknown;
          locality: string | null;
          city: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employer_id: string;
          job_type: string;
          title?: string | null;
          description?: string | null;
          schedule?: "full_time" | "part_time" | "flexible" | null;
          preferred_days?: string[];
          preferred_timings?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          location?: unknown;
          locality?: string | null;
          city?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          employer_id?: string;
          job_type?: string;
          title?: string | null;
          description?: string | null;
          schedule?: "full_time" | "part_time" | "flexible" | null;
          preferred_days?: string[];
          preferred_timings?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          location?: unknown;
          locality?: string | null;
          city?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      job_types: {
        Row: {
          id: string;
          label_en: string;
          label_hi: string;
          icon: string | null;
          is_active: boolean;
          sort_order: number;
        };
        Insert: {
          id: string;
          label_en: string;
          label_hi: string;
          icon?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
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
      interest_requests: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          type: "worker_to_job" | "employer_to_worker";
          job_post_id: string | null;
          worker_profile_id: string | null;
          status: "sent" | "viewed" | "connected";
          notification_sent: boolean;
          phone_revealed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          to_user_id: string;
          type: "worker_to_job" | "employer_to_worker";
          job_post_id?: string | null;
          worker_profile_id?: string | null;
          status?: "sent" | "viewed" | "connected";
          notification_sent?: boolean;
          phone_revealed?: boolean;
          created_at?: string;
        };
        Update: {
          from_user_id?: string;
          to_user_id?: string;
          type?: "worker_to_job" | "employer_to_worker";
          job_post_id?: string | null;
          worker_profile_id?: string | null;
          status?: "sent" | "viewed" | "connected";
          notification_sent?: boolean;
          phone_revealed?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
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

export type JobPost = Database["public"]["Tables"]["job_posts"]["Row"];
export type JobPostInsert = Database["public"]["Tables"]["job_posts"]["Insert"];
export type JobPostUpdate = Database["public"]["Tables"]["job_posts"]["Update"];

export type JobType = Database["public"]["Tables"]["job_types"]["Row"];
export type City = Database["public"]["Tables"]["cities"]["Row"];

export type InterestRequest =
  Database["public"]["Tables"]["interest_requests"]["Row"];
export type InterestRequestInsert =
  Database["public"]["Tables"]["interest_requests"]["Insert"];
export type InterestRequestUpdate =
  Database["public"]["Tables"]["interest_requests"]["Update"];
