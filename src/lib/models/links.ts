import type { SupabaseClient } from "@supabase/supabase-js";
import type { LinkEntityType, LinkType } from "@/types/domain";

// --- Queries ---

export async function getLinksByEntity(
  supabase: SupabaseClient,
  entityType: LinkEntityType,
  entityId: string,
) {
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("sort_order");

  if (error) throw error;
  return data;
}

// --- Mutations ---

export interface CreateLinkInput {
  entity_type: LinkEntityType;
  entity_id: string;
  link_type: LinkType;
  url: string;
  label?: string;
  sort_order?: number;
}

export async function createLink(supabase: SupabaseClient, input: CreateLinkInput) {
  const { data, error } = await supabase
    .from("links")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLink(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("links").delete().eq("id", id);
  if (error) throw error;
}
