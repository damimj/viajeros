import Link from "next/link";
import { Plus, Edit, MapPin } from "lucide-react";
import { getTrips } from "@/lib/models/trips";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PointOfInterest } from "@/types/domain";

export const metadata = { title: "Points of Interest" };

export default async function PointsPage() {
  const [trips, pointsData] = await Promise.all([
    getTrips(),
    createAdminClient()
      .from("points_of_interest")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const points = (pointsData.data as PointOfInterest[]) ?? [];
  const tripsById = Object.fromEntries(trips.map((t) => [t.id, t]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Points of Interest</h1>
        <Link
          href="/admin/points/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Point
        </Link>
      </div>

      {points.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed p-12 text-center">
          <p className="text-muted-foreground">No points of interest yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {points.map((poi) => (
            <div
              key={poi.id}
              className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{poi.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {tripsById[poi.trip_id]?.title ?? "—"} · {poi.type}
                    {poi.visit_date
                      ? ` · ${new Date(poi.visit_date).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
              </div>
              <Link
                href={`/admin/points/${poi.id}`}
                className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
