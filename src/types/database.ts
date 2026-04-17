/**
 * Database type definitions.
 *
 * This file will be auto-generated in Phase 1 with:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT > src/types/database.ts
 *
 * For now it contains a placeholder so TypeScript compiles.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
