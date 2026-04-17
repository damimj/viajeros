"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Upload, Loader2, Check, MapPin } from "lucide-react";
import { parseAirbnbCSV, type AirbnbRow } from "@/lib/utils/csv-parsers";

type Step = "upload" | "geocoding" | "preview" | "importing" | "done";

interface GeocodedStay extends AirbnbRow {
  latitude?: number;
  longitude?: number;
  geocodeStatus: "pending" | "found" | "not_found";
}

export default function ImportAirbnbPage() {
  const t = useTranslations("import.airbnb");
  const tc = useTranslations("common");

  const [step, setStep] = useState<Step>("upload");
  const [stays, setStays] = useState<GeocodedStay[]>([]);
  const [geocodeProgress, setGeocodeProgress] = useState(0);
  const [result, setResult] = useState<{ imported: number; linked: number; newTrips: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = parseAirbnbCSV(text);

    if (parsed.length === 0) {
      setError("No valid stays found in CSV");
      return;
    }

    // Initialize geocoded stays
    const geocoded: GeocodedStay[] = parsed.map((row) => ({
      ...row,
      geocodeStatus: "pending",
    }));

    setStays(geocoded);
    setStep("geocoding");
    setError(null);

    // Geocode each address using Nominatim (with rate limiting)
    for (let i = 0; i < geocoded.length; i++) {
      const stay = geocoded[i];
      const query = stay.listingAddress || stay.listing;

      if (!query) {
        geocoded[i].geocodeStatus = "not_found";
        continue;
      }

      try {
        // Rate limit: 1 request per second (Nominatim policy)
        if (i > 0) await new Promise((r) => setTimeout(r, 1100));

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
          {
            headers: { "User-Agent": "Viajeros/1.0" },
          },
        );

        const data = await res.json();

        if (data.length > 0) {
          geocoded[i].latitude = parseFloat(data[0].lat);
          geocoded[i].longitude = parseFloat(data[0].lon);
          geocoded[i].geocodeStatus = "found";
        } else {
          geocoded[i].geocodeStatus = "not_found";
        }
      } catch {
        geocoded[i].geocodeStatus = "not_found";
      }

      setGeocodeProgress(i + 1);
      setStays([...geocoded]);
    }

    setStep("preview");
  }, []);

  function updateCoords(idx: number, lat: string, lon: string) {
    setStays((prev) => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        latitude: parseFloat(lat) || undefined,
        longitude: parseFloat(lon) || undefined,
        geocodeStatus: lat && lon ? "found" : "not_found",
      };
      return updated;
    });
  }

  async function handleImport() {
    setStep("importing");
    setError(null);

    const validStays = stays.filter(
      (s) => s.geocodeStatus === "found" && s.latitude && s.longitude,
    );

    try {
      const res = await fetch("/api/import/airbnb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stays: validStays }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setResult(data);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
      setStep("preview");
    }
  }

  const geocodedCount = stays.filter((s) => s.geocodeStatus === "found").length;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      {/* Upload */}
      {step === "upload" && (
        <div className="max-w-lg">
          <label className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 transition-colors hover:border-primary/50">
            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
            <span className="text-sm font-medium">{t("upload")}</span>
            <span className="mt-1 text-xs text-muted-foreground">
              CSV export from Airbnb reservations
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      )}

      {/* Geocoding progress */}
      {step === "geocoding" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>
              Geocoding addresses... {geocodeProgress}/{stays.length}
            </span>
          </div>
          <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(geocodeProgress / stays.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Preview */}
      {step === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {geocodedCount}/{stays.length} stays geocoded
            </p>
            <button
              onClick={handleImport}
              disabled={geocodedCount === 0}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {t("importButton")} ({geocodedCount})
            </button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Listing</th>
                  <th className="px-3 py-2 text-left font-medium">Dates</th>
                  <th className="px-3 py-2 text-left font-medium">Lat</th>
                  <th className="px-3 py-2 text-left font-medium">Lon</th>
                </tr>
              </thead>
              <tbody>
                {stays.map((stay, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      {stay.geocodeStatus === "found" ? (
                        <MapPin className="h-4 w-4 text-green-500" />
                      ) : stay.geocodeStatus === "not_found" ? (
                        <span className="text-xs text-destructive">✗</span>
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-2" title={stay.listing}>
                      {stay.listing}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {stay.startDate} → {stay.endDate}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="any"
                        value={stay.latitude ?? ""}
                        onChange={(e) =>
                          updateCoords(idx, e.target.value, String(stay.longitude ?? ""))
                        }
                        className="w-24 rounded border bg-background px-1 py-0.5 font-mono text-xs"
                        placeholder="lat"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="any"
                        value={stay.longitude ?? ""}
                        onChange={(e) =>
                          updateCoords(idx, String(stay.latitude ?? ""), e.target.value)
                        }
                        className="w-24 rounded border bg-background px-1 py-0.5 font-mono text-xs"
                        placeholder="lon"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Importing */}
      {step === "importing" && (
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t("importing")}</span>
        </div>
      )}

      {/* Done */}
      {step === "done" && result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            <span className="font-medium">{t("success")}</span>
          </div>
          <div className="rounded-lg border p-4 text-sm">
            <p>{result.imported} stays imported</p>
            <p>{result.linked} linked to existing trips</p>
            <p>{result.newTrips} new trips created</p>
          </div>
          <p className="text-xs text-muted-foreground">
            New trips created as drafts. Go to Trips to review and publish.
          </p>
        </div>
      )}
    </div>
  );
}
