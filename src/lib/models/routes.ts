import { createAdminClient } from "@/lib/supabase/admin";
import type { Route, TransportType } from "@/types/domain";
import type { Json } from "@/types/database";

export async function getRoutesByTrip(tripId: string): Promise<Route[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as Route[]) ?? [];
}

export async function getRouteById(id: string): Promise<Route | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("routes").select("*").eq("id", id).single();
  if (error) return null;
  return data as Route;
}

export async function createRoute(input: {
  trip_id: string;
  transport_type: TransportType;
  geojson_data: Json;
  is_round_trip?: boolean;
  distance_meters?: number;
  color?: string;
  name?: string | null;
  description?: string | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
}): Promise<Route> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("routes").insert(input).select().single();
  if (error) throw error;
  return data as Route;
}

export async function updateRoute(
  id: string,
  input: Partial<{
    trip_id: string;
    transport_type: TransportType;
    geojson_data: Json;
    is_round_trip: boolean;
    distance_meters: number;
    color: string;
    name: string | null;
    description: string | null;
    start_datetime: string | null;
    end_datetime: string | null;
  }>,
): Promise<Route> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("routes")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Route;
}

export async function deleteRoute(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("routes").delete().eq("id", id);
  if (error) throw error;
}
