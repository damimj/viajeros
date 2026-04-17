import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Admin Supabase client with the service_role key.
 *
 * ⚠️ SERVER-SIDE ONLY — never import this in client components.
 * This client bypasses RLS policies.
 *
 * Use only for:
 * - Admin operations behind authenticated API routes
 * - CSV importers (FlightRadar, Airbnb)
 * - Seed scripts
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
