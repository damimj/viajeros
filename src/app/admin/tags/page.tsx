"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { TripTag, Trip } from "@/types/domain";

export default function TagsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tags, setTags] = useState<TripTag[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("trips").select("id, title, status").order("title"),
      supabase.from("trip_tags").select("*").order("tag_name"),
    ]).then(([tripsRes, tagsRes]) => {
      const tripsData = (tripsRes.data as Trip[]) ?? [];
      setTrips(tripsData);
      setTags((tagsRes.data as TripTag[]) ?? []);
      if (tripsData[0]) setSelectedTripId(tripsData[0].id);
      setLoading(false);
    });
  }, []);

  const filteredTags = selectedTripId ? tags.filter((t) => t.trip_id === selectedTripId) : tags;

  async function addTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newTag.trim() || !selectedTripId) return;
    setAdding(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("trip_tags")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert({ trip_id: selectedTripId, tag_name: newTag.trim().toLowerCase() } as any)
      .select()
      .single();
    if (data) {
      setTags((prev) => [...prev, data as TripTag]);
      setNewTag("");
    }
    setAdding(false);
  }

  async function removeTag(id: string) {
    const supabase = createClient();
    await supabase.from("trip_tags").delete().eq("id", id);
    setTags((prev) => prev.filter((t) => t.id !== id));
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tags</h1>

      <div className="max-w-lg space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Trip</label>
          <select
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          >
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.title}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={addTag} className="flex gap-2">
          <input
            type="text"
            placeholder="New tag…"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1 rounded-md border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={adding || !newTag.trim()}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {filteredTags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags for this trip yet.</p>
          ) : (
            filteredTags.map((tag) => (
              <span
                key={tag.id}
                className="flex items-center gap-1.5 rounded-full border bg-slate-50 px-3 py-1 text-sm"
              >
                {tag.tag_name}
                <button
                  type="button"
                  onClick={() => removeTag(tag.id)}
                  className="rounded-full p-0.5 hover:bg-slate-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
