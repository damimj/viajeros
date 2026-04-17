import type { SupabaseClient } from "@supabase/supabase-js";
import type { TransportType } from "@/types/domain";

// --- Queries ---

export async function getRoutesByTrip(supabase: SupabaseClient, tripId: string) {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("trip_id", tripId)
    .order("start_datetime", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getRouteById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("routes")
    .select("*, links(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// --- Mutations ---

export interface CreateRouteInput {
  trip_id: string;
  transport_type: TransportType;
  geojson_data: object;
  is_round_trip?: boolean;
  distance_meters?: number;
  color?: string;
  name?: string;
  description?: string;
  image_path?: string;
  start_datetime?: string;
  end_datetime?: string;
}

export async function createRoute(supabase: SupabaseClient, input: CreateRouteInput) {
  const { data, error } = await supabase
    .from("routes")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export interface UpdateRouteInput {
  transport_type?: TransportType;
  geojson_data?: object;
  is_round_trip?: boolean;
  distance_meters?: number;
  color?: string;
  name?: string;
  description?: string;
  image_path?: string;
  start_datetime?: string | null;
  end_datetime?: string | null;
}

export async function updateRoute(
  supabase: SupabaseClient,
  id: string,
  input: UpdateRouteInput,
) {
  const { data, error } = await supabase
    .from("routes")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRoute(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("routes").delete().eq("id", id);
  if (error) throw error;
}
