import { createAdminClient } from "@/lib/supabase/admin";
import type { Link, LinkType } from "@/types/domain";

export async function getLinksByEntity(
  entityType: "poi" | "route" | "trip",
  entityId: string,
): Promise<Link[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("sort_order");
  if (error) throw error;
  return (data as Link[]) ?? [];
}

export async function createLink(input: {
  entity_type: "poi" | "route" | "trip";
  entity_id: string;
  link_type?: LinkType;
  url: string;
  label?: string | null;
  sort_order?: number;
}): Promise<Link> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("links").insert(input).select().single();
  if (error) throw error;
  return data as Link;
}

export async function deleteLink(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("links").delete().eq("id", id);
  if (error) throw error;
}
