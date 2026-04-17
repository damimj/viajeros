import { getTranslations } from "next-intl/server";
import { PointForm } from "@/components/admin/point-form";

export default async function NewPointPage() {
  const t = await getTranslations("points");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("newPoint")}</h1>
      <PointForm />
    </div>
  );
}
