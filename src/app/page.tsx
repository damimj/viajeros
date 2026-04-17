import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("map");

  return (
    <main className="relative h-screen w-screen">
      {/* Phase 3: MapLibre GL full-screen map + sidebar + clustering */}
      <div className="flex h-full items-center justify-center bg-slate-100 text-slate-500">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t("allTrips")}</h1>
          <p className="mt-2 text-sm">
            Map will be rendered here in Phase 3.
          </p>
        </div>
      </div>
    </main>
  );
}
