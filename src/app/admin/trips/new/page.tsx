import { redirect } from "next/navigation";
import { TripForm } from "@/components/admin/trip-form";
import { createTrip } from "@/lib/models/trips";
import type { TripStatus } from "@/types/domain";

export const metadata = { title: "New Trip" };

export default function NewTripPage() {
  async function handleCreate(data: {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    color_hex: string;
    status: TripStatus;
  }) {
    "use server";
    const trip = await createTrip(data);
    redirect(`/admin/trips/${trip.id}`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Trip</h1>
      <TripForm onSubmit={handleCreate} />
    </div>
  );
}
