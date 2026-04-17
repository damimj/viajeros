import { getTranslations } from "next-intl/server";
import { RouteForm } from "@/components/admin/route-form";

export default async function NewRoutePage() {
  const t = await getTranslations("routes");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("newRoute")}</h1>
      <RouteForm />
    </div>
  );
}
