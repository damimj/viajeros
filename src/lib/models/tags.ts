import type { SupabaseClient } from "@supabase/supabase-js";

// --- Queries ---

/**
 * Get all unique tag names across all trips.
 */
export async function getAllTagNames(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase
    .from("trip_tags")
    .select("tag_name")
    .order("tag_name");

  if (error) throw error;

  const unique = [...new Set((data ?? []).map((r) => r.tag_name))];
  return unique;
}

/**
 * Get tags for a specific trip.
 */
export async function getTagsByTrip(supabase: SupabaseClient, tripId: string) {
  const { data, error } = await supabase
    .from("trip_tags")
    .select("*")
    .eq("trip_id", tripId)
    .order("tag_name");

  if (error) throw error;
  return data;
}

// --- Mutations ---

/**
 * Add a tag to a trip (idempotent — ignores duplicates).
 */
export async function addTagToTrip(
  supabase: SupabaseClient,
  tripId: string,
  tagName: string,
) {
  const { data, error } = await supabase
    .from("trip_tags")
    .upsert(
      { trip_id: tripId, tag_name: tagName.trim().toLowerCase() },
      { onConflict: "trip_id,tag_name" },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove a tag from a trip.
 */
export async function removeTagFromTrip(
  supabase: SupabaseClient,
  tripId: string,
  tagName: string,
) {
  const { error } = await supabase
    .from("trip_tags")
    .delete()
    .eq("trip_id", tripId)
    .eq("tag_name", tagName.trim().toLowerCase());

  if (error) throw error;
}

/**
 * Set all tags for a trip (replaces existing).
 */
export async function setTripTags(
  supabase: SupabaseClient,
  tripId: string,
  tagNames: string[],
) {
  // Delete existing tags
  const { error: delError } = await supabase
    .from("trip_tags")
    .delete()
    .eq("trip_id", tripId);

  if (delError) throw delError;

  if (tagNames.length === 0) return;

  // Insert new tags
  const rows = tagNames.map((name) => ({
    trip_id: tripId,
    tag_name: name.trim().toLowerCase(),
  }));

  const { error: insError } = await supabase.from("trip_tags").insert(rows);
  if (insError) throw insError;
}
