import Link from "next/link";
import { Plus, Edit, Globe, EyeOff } from "lucide-react";
import { getTrips } from "@/lib/models/trips";
import { TripActions } from "@/components/admin/trip-actions";

export const metadata = { title: "Trips" };

export default async function AdminDashboard() {
  const trips = await getTrips();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trips</h1>
        <Link
          href="/admin/trips/new"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed p-12 text-center">
          <p className="text-muted-foreground">No trips yet. Create your first trip!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 flex-shrink-0 rounded-full"
                  style={{ background: trip.color_hex }}
                />
                <div>
                  <p className="font-medium">{trip.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {trip.start_date && (
                      <span>{new Date(trip.start_date).toLocaleDateString()}</span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        trip.status === "published"
                          ? "bg-green-100 text-green-700"
                          : trip.status === "planned"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TripActions tripId={trip.id} currentStatus={trip.status} />
                <Link
                  href={`/admin/trips/${trip.id}`}
                  className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
