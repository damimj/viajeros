import { getTranslations } from "next-intl/server";

export default async function ImportAirbnbPage() {
  const t = await getTranslations("import.airbnb");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p>Airbnb CSV importer will be implemented in Phase 4.</p>
        <p className="mt-2 text-sm">Upload CSV → Geocode → Link to trips → Import</p>
      </div>
    </div>
  );
}
