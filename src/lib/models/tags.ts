import { createAdminClient } from "@/lib/supabase/admin";
import type { TripTag } from "@/types/domain";

export async function getTagsByTrip(tripId: string): Promise<TripTag[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("trip_tags")
    .select("*")
    .eq("trip_id", tripId)
    .order("tag_name");
  if (error) throw error;
  return (data as TripTag[]) ?? [];
}

export async function addTag(tripId: string, tagName: string): Promise<TripTag> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("trip_tags")
    .insert({ trip_id: tripId, tag_name: tagName.trim().toLowerCase() })
    .select()
    .single();
  if (error) throw error;
  return data as TripTag;
}

export async function deleteTag(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("trip_tags").delete().eq("id", id);
  if (error) throw error;
}

export async function getAllTags(): Promise<TripTag[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("trip_tags")
    .select("*")
    .order("tag_name");
  if (error) throw error;
  return (data as TripTag[]) ?? [];
}
