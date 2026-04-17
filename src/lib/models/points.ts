import { createAdminClient } from "@/lib/supabase/admin";
import type { PointOfInterest, PoiType } from "@/types/domain";

export async function getPointsByTrip(tripId: string): Promise<PointOfInterest[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("points_of_interest")
    .select("*")
    .eq("trip_id", tripId)
    .order("visit_date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data as PointOfInterest[]) ?? [];
}

export async function getPointById(id: string): Promise<PointOfInterest | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("points_of_interest")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as PointOfInterest;
}

export async function createPoint(input: {
  trip_id: string;
  title: string;
  description?: string | null;
  type: PoiType;
  latitude: number;
  longitude: number;
  visit_date?: string | null;
  image_path?: string | null;
}): Promise<PointOfInterest> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("points_of_interest")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as PointOfInterest;
}

export async function updatePoint(
  id: string,
  input: Partial<{
    trip_id: string;
    title: string;
    description: string | null;
    type: PoiType;
    latitude: number;
    longitude: number;
    visit_date: string | null;
    image_path: string | null;
  }>,
): Promise<PointOfInterest> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("points_of_interest")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as PointOfInterest;
}

export async function deletePoint(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("points_of_interest").delete().eq("id", id);
  if (error) throw error;
}
