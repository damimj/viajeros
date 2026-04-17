import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getTrips } from "@/lib/models/trips";
import { TripActions } from "@/components/admin/trip-actions";

export default async function AdminTripsPage() {
  const t = await getTranslations("trips");
  const tc = await getTranslations("common");
  const supabase = await createClient();
  const trips = await getTrips(supabase);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Link
          href="/admin/trips/new"
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("newTrip")}
        </Link>
      </div>

      {trips.length === 0 ? (
        <p className="text-muted-foreground">{t("noTrips")}</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t("tripTitle")}</th>
                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                  {t("startDate")}
                </th>
                <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                  {t("endDate")}
                </th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">{tc("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: trip.color_hex }}
                      />
                      <Link
                        href={`/admin/trips/${trip.id}`}
                        className="font-medium hover:underline"
                      >
                        {trip.title}
                      </Link>
                      {trip.trip_tags && trip.trip_tags.length > 0 && (
                        <div className="flex gap-1">
                          {trip.trip_tags.map((tag: { id: string; tag_name: string }) => (
                            <span
                              key={tag.id}
                              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {tag.tag_name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {trip.start_date ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {trip.end_date ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        trip.status === "published"
                          ? "bg-green-100 text-green-700"
                          : trip.status === "planned"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <TripActions tripId={trip.id} tripTitle={trip.title} />
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
