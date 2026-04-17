import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { getTrips } from "@/lib/models/trips";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Route } from "@/types/domain";

export const metadata = { title: "Routes" };

export default async function RoutesPage() {
  const [trips, routesData] = await Promise.all([
    getTrips(),
    createAdminClient()
      .from("routes")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const routes = (routesData.data as Route[]) ?? [];
  const tripsById = Object.fromEntries(trips.map((t) => [t.id, t]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Routes</h1>
        <Link
          href="/admin/routes/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Route
        </Link>
      </div>

      {routes.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed p-12 text-center">
          <p className="text-muted-foreground">No routes yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {routes.map((route) => (
            <div
              key={route.id}
              className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 flex-shrink-0 rounded"
                  style={{ background: route.color }}
                />
                <div>
                  <p className="font-medium">{route.name ?? route.transport_type}</p>
                  <p className="text-xs text-muted-foreground">
                    {tripsById[route.trip_id]?.title ?? "—"} · {route.transport_type}
                    {route.distance_meters > 0
                      ? ` · ${Math.round(route.distance_meters / 1000)} km`
                      : ""}
                  </p>
                </div>
              </div>
              <Link
                href={`/admin/routes/${route.id}`}
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
