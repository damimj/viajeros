"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Upload, Home, Loader2 } from "lucide-react";
import { parseAirbnbCSV } from "@/lib/utils/csv-parsers";
import type { AirbnbRow } from "@/lib/utils/csv-parsers";
import { useToast } from "@/components/shared/toast";

interface GeocodedStay extends AirbnbRow {
  lat?: number;
  lng?: number;
  geocoded?: boolean;
}

export default function ImportAirbnbPage() {
  const t = useTranslations("import.airbnb");
  const { showToast } = useToast();
  const [rows, setRows] = useState<GeocodedStay[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [geocoding, setGeocoding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [tripId, setTripId] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseAirbnbCSV(text);
      setRows(parsed);
      setSelected(new Set(parsed.map((_, i) => i)));
    };
    reader.readAsText(file);
  }

  async function geocodeAll() {
    setGeocoding(true);
    const updated = [...rows];

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].geocoded || !updated[i].listingAddress) continue;
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          updated[i].listingAddress,
        )}&format=json&limit=1`;
        await new Promise((r) => setTimeout(r, 1100)); // 1 req/sec Nominatim limit
        const res = await fetch(url, { headers: { "User-Agent": "Viajeros/1.0" } });
        const data = await res.json();
        if (data[0]) {
          updated[i] = {
            ...updated[i],
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
            geocoded: true,
          };
          setRows([...updated]);
        }
      } catch {
        // skip
      }
    }

    setGeocoding(false);
  }

  async function handleImport() {
    const toImport = rows
      .filter((_, i) => selected.has(i) && rows[i].geocoded)
      .map((row) => ({ ...row, trip_id: tripId }));

    if (!toImport.length) return;
    if (!tripId) {
      showToast("Please select a trip ID", "error");
      return;
    }

    setImporting(true);
    try {
      const res = await fetch("/api/import/airbnb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stays: toImport }),
      });
      if (!res.ok) throw new Error();
      showToast(t("success"), "success");
      setRows([]);
      setSelected(new Set());
    } catch {
      showToast(t("error"), "error");
    } finally {
      setImporting(false);
    }
  }

  const geocodedCount = rows.filter((r) => r.geocoded).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent">
          <Upload className="h-4 w-4" />
          {fileName ?? t("selectFile")}
          <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
        </label>
      </div>

      {rows.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Trip ID (UUID)"
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
              className="rounded-md border px-3 py-1.5 text-sm font-mono w-72"
            />
            <button
              onClick={geocodeAll}
              disabled={geocoding}
              className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
            >
              {geocoding && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {t("geocoding")} ({geocodedCount}/{rows.length})
            </button>
            <button
              onClick={handleImport}
              disabled={importing || geocodedCount === 0 || !tripId}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Home className="h-4 w-4" />
              {importing ? t("importing") : t("import")} ({selected.size})
            </button>
          </div>

          <div className="space-y-2">
            {rows.map((row, i) => (
              <div
                key={i}
                onClick={() => {
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (next.has(i)) next.delete(i);
                    else next.add(i);
                    return next;
                  });
                }}
                className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                  selected.has(i) ? "border-primary bg-primary/5" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{row.listingName}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.checkIn} — {row.checkOut} · {row.listingAddress}
                    </p>
                    {row.geocoded && (
                      <p className="text-xs text-green-600">
                        ✓ {row.lat?.toFixed(4)}, {row.lng?.toFixed(4)}
                      </p>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={selected.has(i)}
                    onChange={() => {}}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
