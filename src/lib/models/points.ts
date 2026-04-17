import type { SupabaseClient } from "@supabase/supabase-js";
import type { PointType } from "@/types/domain";

// --- Queries ---

export async function getPointsByTrip(supabase: SupabaseClient, tripId: string) {
  const { data, error } = await supabase
    .from("points_of_interest")
    .select("*")
    .eq("trip_id", tripId)
    .order("visit_date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getPointById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("points_of_interest")
    .select("*, links(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// --- Mutations ---

export interface CreatePointInput {
  trip_id: string;
  title: string;
  description?: string;
  type: PointType;
  icon?: string;
  image_path?: string;
  latitude: number;
  longitude: number;
  visit_date?: string;
}

export async function createPoint(supabase: SupabaseClient, input: CreatePointInput) {
  const { data, error } = await supabase
    .from("points_of_interest")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export interface UpdatePointInput {
  title?: string;
  description?: string;
  type?: PointType;
  icon?: string;
  image_path?: string;
  latitude?: number;
  longitude?: number;
  visit_date?: string | null;
}

export async function updatePoint(
  supabase: SupabaseClient,
  id: string,
  input: UpdatePointInput,
) {
  const { data, error } = await supabase
    .from("points_of_interest")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePoint(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("points_of_interest").delete().eq("id", id);
  if (error) throw error;
}
