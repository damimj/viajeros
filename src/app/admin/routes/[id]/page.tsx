import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { RouteForm } from "@/components/admin/route-form";

export default async function EditRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("routes");
  const supabase = await createClient();

  const { data: route, error } = await supabase
    .from("routes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !route) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("editRoute")}</h1>
      <RouteForm route={route} />
    </div>
  );
}
