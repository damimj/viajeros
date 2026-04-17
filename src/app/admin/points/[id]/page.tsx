import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PointForm } from "@/components/admin/point-form";

export default async function EditPointPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("points");
  const supabase = await createClient();

  const { data: point, error } = await supabase
    .from("points_of_interest")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !point) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("editPoint")}</h1>
      <PointForm point={point} />
    </div>
  );
}
