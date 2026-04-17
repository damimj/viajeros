import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, Route } from "lucide-react";
import { getTripById, updateTrip, deleteTrip } from "@/lib/models/trips";
import { TripForm } from "@/components/admin/trip-form";
import { EntityActions } from "@/components/admin/entity-actions";
import { TripActions } from "@/components/admin/trip-actions";
import type { TripStatus } from "@/types/domain";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getTripById(id);
  return { title: trip ? `Edit: ${trip.title}` : "Trip" };
}

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getTripById(id);
  if (!trip) notFound();

  async function handleUpdate(data: {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    color_hex: string;
    status: TripStatus;
  }) {
    "use server";
    await updateTrip(id, data);
    redirect("/admin");
  }

  async function handleDelete() {
    "use server";
    await deleteTrip(id);
    redirect("/admin");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Trip</h1>
        <div className="flex items-center gap-2">
          <TripActions tripId={trip.id} currentStatus={trip.status} />
          <EntityActions onDelete={handleDelete} />
        </div>
      </div>

      <TripForm trip={trip} onSubmit={handleUpdate} />

      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Points of Interest ({trip.points?.length ?? 0})</h2>
            <Link
              href={`/admin/points/new?trip_id=${trip.id}`}
              className="text-sm text-primary hover:underline"
            >
              + Add
            </Link>
          </div>
          {(trip.points ?? []).slice(0, 5).map((p) => (
            <Link
              key={p.id}
              href={`/admin/points/${p.id}`}
              className="flex items-center gap-2 py-1 text-sm hover:text-primary"
            >
              <MapPin className="h-3 w-3" />
              {p.title}
            </Link>
          ))}
          {(trip.points?.length ?? 0) > 5 && (
            <Link href="/admin/points" className="text-xs text-muted-foreground hover:underline">
              View all →
            </Link>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Routes ({trip.routes?.length ?? 0})</h2>
            <Link
              href={`/admin/routes/new?trip_id=${trip.id}`}
              className="text-sm text-primary hover:underline"
            >
              + Add
            </Link>
          </div>
          {(trip.routes ?? []).slice(0, 5).map((r) => (
            <Link
              key={r.id}
              href={`/admin/routes/${r.id}`}
              className="flex items-center gap-2 py-1 text-sm hover:text-primary"
            >
              <Route className="h-3 w-3" />
              {r.name ?? r.transport_type}
            </Link>
          ))}
          {(trip.routes?.length ?? 0) > 5 && (
            <Link href="/admin/routes" className="text-xs text-muted-foreground hover:underline">
              View all →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
