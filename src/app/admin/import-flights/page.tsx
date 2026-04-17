"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Upload, Loader2, Check, Merge, Split, GripVertical } from "lucide-react";
import Papa from "papaparse";
import {
  parseFlightRadarCSV,
  groupFlightsIntoTrips,
  type FlightRow,
  type FlightGroup,
} from "@/lib/utils/csv-parsers";
import { findAirport } from "@/lib/utils/airports";

type Step = "upload" | "preview" | "importing" | "done";

export default function ImportFlightsPage() {
  const t = useTranslations("import.flightradar");
  const tc = useTranslations("common");

  const [step, setStep] = useState<Step>("upload");
  const [flights, setFlights] = useState<FlightRow[]>([]);
  const [groups, setGroups] = useState<FlightGroup[]>([]);
  const [result, setResult] = useState<{ imported: { tripId: string; title: string; routeCount: number }[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseFlightRadarCSV(text);

      if (parsed.length === 0) {
        setError("No valid flights found in CSV");
        return;
      }

      setFlights(parsed);
      setGroups(groupFlightsIntoTrips(parsed));
      setStep("preview");
      setError(null);
    };
    reader.readAsText(file);
  }, []);

  function updateGroupTitle(groupId: string, title: string) {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, title } : g)),
    );
  }

  function mergeGroups(idx1: number, idx2: number) {
    setGroups((prev) => {
      const merged = [...prev];
      const g1 = merged[idx1];
      const g2 = merged[idx2];
      const combined: FlightGroup = {
        ...g1,
        flights: [...g1.flights, ...g2.flights].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
        startDate: g1.startDate < g2.startDate ? g1.startDate : g2.startDate,
        endDate: g1.endDate > g2.endDate ? g1.endDate : g2.endDate,
      };
      merged.splice(idx2, 1);
      merged[idx1] = combined;
      return merged;
    });
  }

  function moveFlightToGroup(flightIdx: number, fromGroupId: string, toGroupId: string) {
    setGroups((prev) => {
      const updated = prev.map((g) => ({ ...g, flights: [...g.flights] }));
      const fromGroup = updated.find((g) => g.id === fromGroupId);
      const toGroup = updated.find((g) => g.id === toGroupId);
      if (!fromGroup || !toGroup) return prev;

      const [flight] = fromGroup.flights.splice(flightIdx, 1);
      toGroup.flights.push(flight);
      toGroup.flights.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Recalculate dates
      if (toGroup.flights.length > 0) {
        const dates = toGroup.flights.map((f) => f.date).sort();
        toGroup.startDate = dates[0];
        toGroup.endDate = dates[dates.length - 1];
      }

      return updated.filter((g) => g.flights.length > 0);
    });
  }

  async function handleImport() {
    setStep("importing");
    setError(null);

    try {
      const res = await fetch("/api/import/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups }),
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

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="max-w-lg">
          <label className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 transition-colors hover:border-primary/50">
            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
            <span className="text-sm font-medium">{t("upload")}</span>
            <span className="mt-1 text-xs text-muted-foreground">
              CSV from my.flightradar24.com/settings/export
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {error && (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          )}
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {flights.length} flights → {groups.length} trips
            </p>
            <button
              onClick={handleImport}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("importButton")}
            </button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {groups.map((group, gIdx) => (
            <div key={group.id} className="rounded-lg border">
              <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3">
                <input
                  type="text"
                  value={group.title}
                  onChange={(e) => updateGroupTitle(group.id, e.target.value)}
                  className="flex-1 rounded-md border bg-background px-2 py-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="text-xs text-muted-foreground">
                  {group.startDate} → {group.endDate}
                </span>
                {gIdx < groups.length - 1 && (
                  <button
                    onClick={() => mergeGroups(gIdx, gIdx + 1)}
                    className="rounded p-1 text-xs text-muted-foreground hover:bg-accent"
                    title={t("mergeTrips")}
                  >
                    <Merge className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="divide-y">
                {group.flights.map((flight, fIdx) => {
                  const fromAp = findAirport(flight.from);
                  const toAp = findAirport(flight.to);
                  return (
                    <div
                      key={`${flight.date}-${flight.from}-${flight.to}-${fIdx}`}
                      className="flex items-center gap-3 px-4 py-2 text-sm"
                    >
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
                      <span className="w-24 text-muted-foreground">{flight.date}</span>
                      <span className="w-16 font-mono text-xs">{flight.flightNumber || "—"}</span>
                      <span className="flex-1">
                        <span className="font-medium">{flight.from}</span>
                        {fromAp && <span className="text-muted-foreground"> {fromAp.city}</span>}
                        <span className="mx-2 text-muted-foreground">→</span>
                        <span className="font-medium">{flight.to}</span>
                        {toAp && <span className="text-muted-foreground"> {toAp.city}</span>}
                      </span>
                      <span className="text-xs text-muted-foreground">{flight.airline}</span>

                      {/* Move to another group */}
                      {groups.length > 1 && (
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              moveFlightToGroup(fIdx, group.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="w-20 rounded border bg-background px-1 py-0.5 text-xs text-muted-foreground"
                        >
                          <option value="" disabled>Move</option>
                          {groups
                            .filter((g) => g.id !== group.id)
                            .map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.title.substring(0, 20)}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step: Importing */}
      {step === "importing" && (
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t("importing")}</span>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            <span className="font-medium">{t("success")}</span>
          </div>
          <div className="rounded-lg border p-4">
            <p className="mb-2 text-sm font-medium">
              {result.imported.length} trips created:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {result.imported.map((item) => (
                <li key={item.tripId}>
                  {item.title} — {item.routeCount} routes
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">
            Trips created as drafts. Go to Trips to review and publish.
          </p>
        </div>
      )}
    </div>
  );
}
