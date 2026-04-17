import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { EntityActions } from "@/components/admin/entity-actions";

export default async function AdminPointsPage() {
  const t = await getTranslations("points");
  const tc = await getTranslations("common");
  const supabase = await createClient();

  const { data: points } = await supabase
    .from("points_of_interest")
    .select("*, trips(title)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Link
          href="/admin/points/new"
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("newPoint")}
        </Link>
      </div>

      {!points || points.length === 0 ? (
        <p className="text-muted-foreground">{tc("noResults")}</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t("pointTitle")}</th>
                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">{t("trip")}</th>
                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">{t("kind")}</th>
                <th className="px-4 py-3 text-right font-medium">{tc("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {points.map((poi) => (
                <tr key={poi.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/points/${poi.id}`} className="font-medium hover:underline">
                      {poi.title}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {(poi.trips as { title: string } | null)?.title ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {poi.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <EntityActions
                      entityId={poi.id}
                      entityTable="points_of_interest"
                      editHref={`/admin/points/${poi.id}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
