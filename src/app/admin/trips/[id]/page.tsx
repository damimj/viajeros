import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { TripForm } from "@/components/admin/trip-form";

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("trips");
  const supabase = await createClient();

  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !trip) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("editTrip")}</h1>
      <TripForm trip={trip} />
    </div>
  );
}
