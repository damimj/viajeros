import { notFound } from "next/navigation";
import { getPointById, updatePoint, deletePoint } from "@/lib/models/points";
import { getTrips } from "@/lib/models/trips";
import { PointForm } from "@/components/admin/point-form";
import { EntityActions } from "@/components/admin/entity-actions";
import type { PoiType } from "@/types/domain";

export const metadata = { title: "Edit Point" };

export default async function EditPointPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [point, trips] = await Promise.all([getPointById(id), getTrips()]);
  if (!point) notFound();

  async function handleUpdate(data: {
    trip_id: string;
    title: string;
    description: string;
    type: PoiType;
    latitude: number;
    longitude: number;
    visit_date: string;
  }) {
    "use server";
    await updatePoint(id, {
      ...data,
      description: data.description || null,
      visit_date: data.visit_date || null,
    });
  }

  async function handleDelete() {
    "use server";
    await deletePoint(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Point</h1>
        <EntityActions onDelete={handleDelete} redirectPath="/admin/points" />
      </div>
      <PointForm point={point} trips={trips} onSubmit={handleUpdate} />
    </div>
  );
}
