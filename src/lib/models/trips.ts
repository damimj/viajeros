import { createAdminClient } from "@/lib/supabase/admin";
import type { Trip, TripStatus } from "@/types/domain";

export async function getTrips(): Promise<Trip[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("trips")
    .select("*, tags:trip_tags(id, tag_name, trip_id, created_at)")
    .order("start_date", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data as Trip[]) ?? [];
}

export async function getPublishedTrips(): Promise<Trip[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("trips")
    .select(`
      *,
      points:points_of_interest(*),
      routes(*),
      tags:trip_tags(id, tag_name, trip_id, created_at)
    `)
    .eq("status", "published")
    .order("start_date", { ascending: false });
  if (error) throw error;
  return (data as Trip[]) ?? [];
}

export async function getTripById(id: string): Promise<Trip | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("trips")
    .select(`
      *,
      points:points_of_interest(*),
      routes(*),
      tags:trip_tags(id, tag_name, trip_id, created_at)
    `)
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Trip;
}

export async function createTrip(input: {
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  color_hex?: string;
  status?: TripStatus;
}): Promise<Trip> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("trips").insert(input).select().single();
  if (error) throw error;
  return data as Trip;
}

export async function updateTrip(
  id: string,
  input: Partial<{
    title: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    color_hex: string;
    status: TripStatus;
    show_routes_in_timeline: boolean | null;
  }>,
): Promise<Trip> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("trips")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Trip;
}

export async function deleteTrip(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("trips").delete().eq("id", id);
  if (error) throw error;
}
