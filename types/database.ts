/**
 * Hand-authored placeholder matching `supabase/migrations/0001_init.sql`.
 *
 * This file MUST be regenerated once the Supabase project is linked:
 *   supabase gen types typescript --linked > types/database.ts
 *
 * Keep the shape in sync with the migration until then.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SowStatus = "active" | "sold" | "culled" | "dead";
export type FarrowingStatus = "lactating" | "weaned" | "closed";

export type Database = {
  public: {
    Tables: {
      sows: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          birth_date: string | null;
          status: SowStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          birth_date?: string | null;
          status?: SowStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          birth_date?: string | null;
          status?: SowStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      farrowings: {
        Row: {
          id: string;
          user_id: string;
          sow_id: string;
          farrowing_date: string;
          born_alive: number;
          current_piglets: number;
          status: FarrowingStatus;
          weaning_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          sow_id: string;
          farrowing_date: string;
          born_alive: number;
          current_piglets: number;
          status?: FarrowingStatus;
          weaning_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          sow_id?: string;
          farrowing_date?: string;
          born_alive?: number;
          current_piglets?: number;
          status?: FarrowingStatus;
          weaning_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "farrowings_sow_id_fkey";
            columns: ["sow_id"];
            isOneToOne: false;
            referencedRelation: "sows";
            referencedColumns: ["id"];
          },
        ];
      };
      feeding_config: {
        Row: {
          id: string;
          user_id: string;
          base_kg: number;
          kg_per_piglet: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          base_kg?: number;
          kg_per_piglet?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          base_kg?: number;
          kg_per_piglet?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
