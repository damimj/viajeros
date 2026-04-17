"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Plus } from "lucide-react";

interface TagWithTrip {
  id: string;
  tag_name: string;
  trip_id: string;
  trips: { title: string } | null;
}

export default function AdminTagsPage() {
  const t = useTranslations("tags");
  const tc = useTranslations("common");

  const [tags, setTags] = useState<TagWithTrip[]>([]);
  const [trips, setTrips] = useState<{ id: string; title: string }[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagTripId, setNewTagTripId] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const supabase = createClient();
    const [tagsRes, tripsRes] = await Promise.all([
      supabase
        .from("trip_tags")
        .select("*, trips(title)")
        .order("tag_name"),
      supabase
        .from("trips")
        .select("id, title")
        .order("title"),
    ]);

    setTags((tagsRes.data as TagWithTrip[]) ?? []);
    setTrips(tripsRes.data ?? []);
    if (!newTagTripId && tripsRes.data && tripsRes.data.length > 0) {
      setNewTagTripId(tripsRes.data[0].id);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTagName.trim() || !newTagTripId) return;

    const supabase = createClient();
    const { error } = await supabase.from("trip_tags").insert({
      trip_id: newTagTripId,
      tag_name: newTagName.trim().toLowerCase(),
    });

    if (error) {
      alert(tc("error"));
      return;
    }

    setNewTagName("");
    loadData();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("trip_tags").delete().eq("id", id);
    if (error) {
      alert(tc("error"));
      return;
    }
    loadData();
  }

  if (loading) {
    return <p className="text-muted-foreground">{tc("loading")}</p>;
  }

  // Group tags by name
  const grouped = tags.reduce<Record<string, TagWithTrip[]>>((acc, tag) => {
    if (!acc[tag.tag_name]) acc[tag.tag_name] = [];
    acc[tag.tag_name].push(tag);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      {/* Add tag form */}
      <form onSubmit={handleAdd} className="mb-6 flex items-end gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">{t("name")}</label>
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            required
            className="flex h-9 w-48 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="beach, culture..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">{t("assignToTrip")}</label>
          <select
            value={newTagTripId}
            onChange={(e) => setNewTagTripId(e.target.value)}
            className="flex h-9 w-56 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {trips.map((tr) => (
              <option key={tr.id} value={tr.id}>
                {tr.title}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {tc("create")}
        </button>
      </form>

      {/* Tags list */}
      {Object.keys(grouped).length === 0 ? (
        <p className="text-muted-foreground">{tc("noResults")}</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([tagName, entries]) => (
            <div key={tagName} className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">{tagName}</h3>
              <div className="space-y-1">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {entry.trips?.title ?? "Unknown trip"}
                    </span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
