import type { SupabaseClient } from "@supabase/supabase-js";
import type { Trip, TripStatus, snakeToCamel } from "@/types/domain";

// --- Queries ---

/**
 * Fetch all trips (admin sees all, public sees published via RLS).
 */
export async function getTrips(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("trips")
    .select("*, trip_tags(id, tag_name)")
    .order("start_date", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch a single trip by ID with related data.
 */
export async function getTripById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("trips")
    .select(`
      *,
      trip_tags(id, tag_name),
      points_of_interest(id, title, type, latitude, longitude, image_path, visit_date),
      routes(id, transport_type, distance_meters, name, color)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch only published trips with all related data for the public map.
 */
export async function getPublishedTripsWithData(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("trips")
    .select(`
      *,
      trip_tags(id, tag_name),
      points_of_interest(*),
      routes(*)
    `)
    .eq("status", "published")
    .order("start_date", { ascending: false });

  if (error) throw error;
  return data;
}

// --- Mutations ---

export interface CreateTripInput {
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  color_hex?: string;
  status?: TripStatus;
}

export async function createTrip(supabase: SupabaseClient, input: CreateTripInput) {
  const { data, error } = await supabase
    .from("trips")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export interface UpdateTripInput {
  title?: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
  color_hex?: string;
  status?: TripStatus;
  show_routes_in_timeline?: boolean | null;
}

export async function updateTrip(
  supabase: SupabaseClient,
  id: string,
  input: UpdateTripInput,
) {
  const { data, error } = await supabase
    .from("trips")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTrip(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("trips").delete().eq("id", id);
  if (error) throw error;
}
