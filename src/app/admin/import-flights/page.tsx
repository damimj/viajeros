"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Upload, Plane } from "lucide-react";
import { parseFlightRadarCSV, groupFlightsIntoTrips } from "@/lib/utils/csv-parsers";
import type { FlightGroup } from "@/lib/utils/csv-parsers";
import { useToast } from "@/components/shared/toast";

export default function ImportFlightsPage() {
  const t = useTranslations("import.flights");
  const { showToast } = useToast();
  const [groups, setGroups] = useState<FlightGroup[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const flights = parseFlightRadarCSV(text);
      const grouped = groupFlightsIntoTrips(flights);
      setGroups(grouped);
      setSelected(new Set(grouped.map((_, i) => i)));
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    const toImport = groups.filter((_, i) => selected.has(i));
    if (!toImport.length) return;

    setImporting(true);
    try {
      const res = await fetch("/api/import/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups: toImport }),
      });
      if (!res.ok) throw new Error();
      showToast(t("success"), "success");
      setGroups([]);
      setSelected(new Set());
      setFileName(null);
    } catch {
      showToast(t("error"), "error");
    } finally {
      setImporting(false);
    }
  }

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

      {groups.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {t("groups")}: {groups.length}
            </p>
            <button
              onClick={handleImport}
              disabled={importing || selected.size === 0}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Plane className="h-4 w-4" />
              {importing ? t("importing") : t("import")} ({selected.size})
            </button>
          </div>

          <div className="space-y-3">
            {groups.map((group, i) => (
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
                className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                  selected.has(i) ? "border-primary bg-primary/5" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{group.suggestedTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {group.startDate} — {group.endDate} · {group.flights.length} flights
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selected.has(i)}
                    onChange={() => {}}
                    className="h-4 w-4"
                  />
                </div>
                <div className="mt-2 space-y-0.5">
                  {group.flights.slice(0, 3).map((f, j) => (
                    <p key={j} className="text-xs text-muted-foreground">
                      {f.date} · {f.flightNumber} · {f.from} → {f.to}
                    </p>
                  ))}
                  {group.flights.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{group.flights.length - 3} more…
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
