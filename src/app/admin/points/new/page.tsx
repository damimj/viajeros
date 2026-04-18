import { getTrips } from "@/lib/models/trips";
import { createPoint } from "@/lib/models/points";
import { PointForm } from "@/components/admin/point-form";
import type { PoiType } from "@/types/domain";

export const metadata = { title: "New Point" };

export default async function NewPointPage({
  searchParams,
}: {
  searchParams: Promise<{ trip_id?: string }>;
}) {
  const { trip_id } = await searchParams;
  const trips = await getTrips();

  async function handleCreate(data: {
    trip_id: string;
    title: string;
    description: string;
    type: PoiType;
    latitude: number;
    longitude: number;
    visit_date: string;
  }) {
    "use server";
    await createPoint({
      ...data,
      description: data.description || null,
      visit_date: data.visit_date || null,
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Point of Interest</h1>
      <PointForm trips={trips} defaultTripId={trip_id} onSubmit={handleCreate} />
    </div>
  );
}
