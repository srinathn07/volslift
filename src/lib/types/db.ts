// ─────────────────────────────────────────────────────────────────────────────
// Generated-style database types for VolsLift.
//
// These were hand-authored to match the migration exactly and serve as the
// source of truth until `supabase gen types typescript` can be run against a
// live project. When you do regenerate, replace this file entirely and
// re-run `npm run gate` to catch any drift.
//
// Command to regenerate:
//   npx supabase gen types typescript --project-id <ref> > src/lib/types/db.ts
// ─────────────────────────────────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id:              string;
          email:           string;
          display_name:    string | null;
          unit_preference: 'lb' | 'kg';
          no_axial_load:   boolean;
          created_at:      string;
        };
        Insert: {
          id:              string;
          email:           string;
          display_name?:   string | null;
          unit_preference?:'lb' | 'kg';
          no_axial_load?:  boolean;
          created_at?:     string;
        };
        Update: {
          id?:             string;
          email?:          string;
          display_name?:   string | null;
          unit_preference?:'lb' | 'kg';
          no_axial_load?:  boolean;
          created_at?:     string;
        };
        Relationships: [];
      };

      exercises: {
        Row: {
          id:                  string;
          name:                string;
          pattern:             'horiz_push' | 'vert_push' | 'horiz_pull' | 'vert_pull' | 'squat' | 'hinge' | 'lunge' | 'carry' | 'isolation';
          primary_mover:       string;
          synergists:          string[];
          equipment_class:     'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight';
          stability_demand:    number;
          unilateral:          boolean;
          axial_load:          boolean;
          rom_profile:         'short' | 'mid' | 'long';
          skill_floor:         number;
          default_rest_seconds:number;
          is_unit_bound:       boolean;
        };
        Insert: {
          id:                  string;
          name:                string;
          pattern:             'horiz_push' | 'vert_push' | 'horiz_pull' | 'vert_pull' | 'squat' | 'hinge' | 'lunge' | 'carry' | 'isolation';
          primary_mover:       string;
          synergists?:         string[];
          equipment_class:     'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight';
          stability_demand:    number;
          unilateral?:         boolean;
          axial_load?:         boolean;
          rom_profile:         'short' | 'mid' | 'long';
          skill_floor:         number;
          default_rest_seconds?:number;
          is_unit_bound?:      boolean;
        };
        Update: Partial<Database['public']['Tables']['exercises']['Insert']>;
        Relationships: [];
      };

      equipment_units: {
        Row: {
          id:                         string;
          name:                       string;
          zone:                       string;
          kind:                       'rack' | 'bench' | 'machine' | 'cable' | 'platform' | 'dumbbell_area';
          walk_seconds_from_entrance: number;
        };
        Insert: {
          id:                         string;
          name:                       string;
          zone:                       string;
          kind:                       'rack' | 'bench' | 'machine' | 'cable' | 'platform' | 'dumbbell_area';
          walk_seconds_from_entrance?:number;
        };
        Update: Partial<Database['public']['Tables']['equipment_units']['Insert']>;
        Relationships: [];
      };

      exercise_equipment: {
        Row: {
          exercise_id:       string;
          equipment_unit_id: string;
        };
        Insert: {
          exercise_id:       string;
          equipment_unit_id: string;
        };
        Update: {
          exercise_id?:      string;
          equipment_unit_id?:string;
        };
        Relationships: [
          { foreignKeyName: 'exercise_equipment_exercise_id_fkey';  columns: ['exercise_id'];       referencedRelation: 'exercises';       referencedColumns: ['id'] },
          { foreignKeyName: 'exercise_equipment_equipment_unit_id_fkey'; columns: ['equipment_unit_id']; referencedRelation: 'equipment_units'; referencedColumns: ['id'] },
        ];
      };

      equipment_events: {
        Row: {
          id:                string;
          equipment_unit_id: string;
          occupied_until:    string;
          source:            'set_log' | 'manual';
          reporter_id:       string | null;
          client_uuid:       string;
          created_at:        string;
        };
        Insert: {
          id?:               string;
          equipment_unit_id: string;
          occupied_until:    string;
          source:            'set_log' | 'manual';
          reporter_id?:      string | null;
          client_uuid:       string;
          created_at?:       string;
        };
        Update: Partial<Database['public']['Tables']['equipment_events']['Insert']>;
        Relationships: [
          { foreignKeyName: 'equipment_events_equipment_unit_id_fkey'; columns: ['equipment_unit_id']; referencedRelation: 'equipment_units'; referencedColumns: ['id'] },
        ];
      };

      sessions: {
        Row: {
          id:          string;
          user_id:     string;
          name:        string;
          started_at:  string;
          ended_at:    string | null;
          client_uuid: string;
        };
        Insert: {
          id?:         string;
          user_id:     string;
          name?:       string;
          started_at?: string;
          ended_at?:   string | null;
          client_uuid: string;
        };
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>;
        Relationships: [
          { foreignKeyName: 'sessions_user_id_fkey'; columns: ['user_id']; referencedRelation: 'users'; referencedColumns: ['id'] },
        ];
      };

      session_plan_items: {
        Row: {
          id:                       string;
          session_id:               string;
          exercise_id:              string;
          position:                 number;
          target_sets:              number;
          target_reps_low:          number;
          target_reps_high:         number;
          status:                   'planned' | 'done' | 'swapped' | 'skipped';
          swapped_from_exercise_id: string | null;
          swap_reason:              string | null;
        };
        Insert: {
          id?:                       string;
          session_id:                string;
          exercise_id:               string;
          position:                  number;
          target_sets?:              number;
          target_reps_low?:          number;
          target_reps_high?:         number;
          status?:                   'planned' | 'done' | 'swapped' | 'skipped';
          swapped_from_exercise_id?: string | null;
          swap_reason?:              string | null;
        };
        Update: Partial<Database['public']['Tables']['session_plan_items']['Insert']>;
        Relationships: [
          { foreignKeyName: 'session_plan_items_session_id_fkey';  columns: ['session_id'];  referencedRelation: 'sessions';  referencedColumns: ['id'] },
          { foreignKeyName: 'session_plan_items_exercise_id_fkey'; columns: ['exercise_id']; referencedRelation: 'exercises'; referencedColumns: ['id'] },
        ];
      };

      sets: {
        Row: {
          id:                string;
          session_id:        string;
          exercise_id:       string;
          equipment_unit_id: string | null;
          set_index:         number;
          weight:            number;
          reps:              number;
          rpe:               number | null;
          is_warmup:         boolean;
          rest_seconds:      number | null;
          logged_at:         string;
          client_uuid:       string;
        };
        Insert: {
          id?:               string;
          session_id:        string;
          exercise_id:       string;
          equipment_unit_id?:string | null;
          set_index:         number;
          weight?:           number;
          reps?:             number;
          rpe?:              number | null;
          is_warmup?:        boolean;
          rest_seconds?:     number | null;
          logged_at?:        string;
          client_uuid:       string;
        };
        Update: Partial<Database['public']['Tables']['sets']['Insert']>;
        Relationships: [
          { foreignKeyName: 'sets_session_id_fkey';        columns: ['session_id'];        referencedRelation: 'sessions';        referencedColumns: ['id'] },
          { foreignKeyName: 'sets_exercise_id_fkey';       columns: ['exercise_id'];       referencedRelation: 'exercises';       referencedColumns: ['id'] },
          { foreignKeyName: 'sets_equipment_unit_id_fkey'; columns: ['equipment_unit_id']; referencedRelation: 'equipment_units'; referencedColumns: ['id'] },
        ];
      };

      substitution_cache: {
        Row: {
          exercise_id:           string;
          candidate_exercise_id: string;
          intent_band:           'strength' | 'hypertrophy' | 'accessory';
          similarity:            number;
          reason_codes:          string[];
        };
        Insert: {
          exercise_id:           string;
          candidate_exercise_id: string;
          intent_band:           'strength' | 'hypertrophy' | 'accessory';
          similarity:            number;
          reason_codes?:         string[];
        };
        Update: Partial<Database['public']['Tables']['substitution_cache']['Insert']>;
        Relationships: [
          { foreignKeyName: 'substitution_cache_exercise_id_fkey';           columns: ['exercise_id'];           referencedRelation: 'exercises'; referencedColumns: ['id'] },
          { foreignKeyName: 'substitution_cache_candidate_exercise_id_fkey'; columns: ['candidate_exercise_id']; referencedRelation: 'exercises'; referencedColumns: ['id'] },
        ];
      };

      equipment_reports: {
        Row: {
          id:                string;
          equipment_unit_id: string;
          reporter_id:       string;
          category:          string;
          note:              string | null;
          status:            'open' | 'resolved';
          client_uuid:       string;
          created_at:        string;
        };
        Insert: {
          id?:               string;
          equipment_unit_id: string;
          reporter_id:       string;
          category:          string;
          note?:             string | null;
          status?:           'open' | 'resolved';
          client_uuid:       string;
          created_at?:       string;
        };
        Update: Partial<Database['public']['Tables']['equipment_reports']['Insert']>;
        Relationships: [
          { foreignKeyName: 'equipment_reports_equipment_unit_id_fkey'; columns: ['equipment_unit_id']; referencedRelation: 'equipment_units'; referencedColumns: ['id'] },
          { foreignKeyName: 'equipment_reports_reporter_id_fkey';       columns: ['reporter_id'];       referencedRelation: 'users';           referencedColumns: ['id'] },
        ];
      };

      occupancy_history: {
        Row: {
          equipment_unit_id: string;
          weekday:           number;
          hour_of_day:       number;
          occupied_fraction: number;
          sample_count:      number;
        };
        Insert: {
          equipment_unit_id: string;
          weekday:           number;
          hour_of_day:       number;
          occupied_fraction?:number;
          sample_count?:     number;
        };
        Update: Partial<Database['public']['Tables']['occupancy_history']['Insert']>;
        Relationships: [
          { foreignKeyName: 'occupancy_history_equipment_unit_id_fkey'; columns: ['equipment_unit_id']; referencedRelation: 'equipment_units'; referencedColumns: ['id'] },
        ];
      };
    };

    Views: {
      equipment_status: {
        Row: {
          id:                string;
          equipment_unit_id: string;
          occupied_until:    string;
          source:            'set_log' | 'manual';
          client_uuid:       string;
          created_at:        string;
        };
        Relationships: [
          { foreignKeyName: 'equipment_events_equipment_unit_id_fkey'; columns: ['equipment_unit_id']; referencedRelation: 'equipment_units'; referencedColumns: ['id'] },
        ];
      };
    };

    Functions: Record<string, never>;
    Enums:     Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// ─── Convenience helpers (matches Supabase generated output) ─────────────────

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Row'];

export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update'];

export type Views<T extends keyof PublicSchema['Views']> =
  PublicSchema['Views'][T]['Row'];
