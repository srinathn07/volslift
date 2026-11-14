// Local (component-level) types for C2.
// DB row types come from src/lib/types/db.ts via the Tables<> helper.

export interface LocalSet {
  /** Matches the DB id once synced; temp client value before. */
  id:           string;
  client_uuid:  string;
  exercise_id:  string;
  set_index:    number;
  weight:       number;
  reps:         number;
  logged_at:    string;
  /** Offline flag — not persisted to DB. */
  synced:       boolean;
}

export interface PrevSet {
  set_index: number;
  weight:    number;
  reps:      number;
}

export interface ExerciseRow {
  id:                   string;
  name:                 string;
  equipment_class:      string;
  is_unit_bound:        boolean;
  default_rest_seconds: number;
  axial_load:           boolean;
}

export interface UnitRow {
  id:   string;
  name: string;
  zone: string;
  kind: string;
}
