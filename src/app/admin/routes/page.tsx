import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { EntityActions } from "@/components/admin/entity-actions";

export default async function AdminRoutesPage() {
  const t = await getTranslations("routes");
  const tc = await getTranslations("common");
  const supabase = await createClient();

  const { data: routes } = await supabase
    .from("routes")
    .select("*, trips(title)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Link
          href="/admin/routes/new"
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("newRoute")}
        </Link>
      </div>

      {!routes || routes.length === 0 ? (
        <p className="text-muted-foreground">{tc("noResults")}</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">{t("trip")}</th>
                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">{t("transport")}</th>
                <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">{t("distance")}</th>
                <th className="px-4 py-3 text-right font-medium">{tc("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: route.color }}
                      />
                      <Link href={`/admin/routes/${route.id}`} className="font-medium hover:underline">
                        {route.name || `Route #${route.id.substring(0, 8)}`}
                      </Link>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {(route.trips as { title: string } | null)?.title ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {route.transport_type}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                    {route.distance_meters
                      ? `${(route.distance_meters / 1000).toFixed(1)} km`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <EntityActions
                      entityId={route.id}
                      entityTable="routes"
                      editHref={`/admin/routes/${route.id}`}
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
