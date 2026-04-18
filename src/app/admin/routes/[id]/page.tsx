import { notFound } from "next/navigation";
import { getRouteById, updateRoute, deleteRoute } from "@/lib/models/routes";
import { getTrips } from "@/lib/models/trips";
import { RouteForm } from "@/components/admin/route-form";
import { EntityActions } from "@/components/admin/entity-actions";
import type { TransportType } from "@/types/domain";
import type { Json } from "@/types/database";

export const metadata = { title: "Edit Route" };

export default async function EditRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [route, trips] = await Promise.all([getRouteById(id), getTrips()]);
  if (!route) notFound();

  async function handleUpdate(data: {
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
    await updateRoute(id, {
      ...data,
      name: data.name || null,
      description: data.description || null,
      start_datetime: data.start_datetime || null,
      end_datetime: data.end_datetime || null,
    });
  }

  async function handleDelete() {
    "use server";
    await deleteRoute(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Route</h1>
        <EntityActions onDelete={handleDelete} redirectPath="/admin/routes" />
      </div>
      <RouteForm route={route} trips={trips} onSubmit={handleUpdate} />
    </div>
  );
}
