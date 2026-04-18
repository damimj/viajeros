import { getTrips } from "@/lib/models/trips";
import { createRoute } from "@/lib/models/routes";
import { RouteForm } from "@/components/admin/route-form";
import type { TransportType } from "@/types/domain";
import type { Json } from "@/types/database";

export const metadata = { title: "New Route" };

export default async function NewRoutePage({
  searchParams,
}: {
  searchParams: Promise<{ trip_id?: string }>;
}) {
  const { trip_id } = await searchParams;
  const trips = await getTrips();

  async function handleCreate(data: {
    trip_id: string;
    transport_type: TransportType;
    geojson_data: Json;
    is_round_trip: boolean;
    distance_meters: number;
    color: string;
    name: string;
    description: string;
    start_datetime: string;
    end_datetime: string;
  }) {
    "use server";
    await createRoute({
      ...data,
      name: data.name || null,
      description: data.description || null,
      start_datetime: data.start_datetime || null,
      end_datetime: data.end_datetime || null,
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Route</h1>
      <RouteForm trips={trips} defaultTripId={trip_id} onSubmit={handleCreate} />
    </div>
  );
}
