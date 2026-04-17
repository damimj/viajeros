import { getTranslations } from "next-intl/server";
import { TripForm } from "@/components/admin/trip-form";

export default async function NewTripPage() {
  const t = await getTranslations("trips");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("newTrip")}</h1>
      <TripForm />
    </div>
  );
}
