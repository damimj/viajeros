"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Globe, EyeOff } from "lucide-react";
import { useToast } from "@/components/shared/toast";
import type { TripStatus } from "@/types/domain";

interface TripActionsProps {
  tripId: string;
  currentStatus: TripStatus;
}

export function TripActions({ tripId, currentStatus }: TripActionsProps) {
  const t = useTranslations("admin");
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function togglePublish() {
    setLoading(true);
    const newStatus: TripStatus = currentStatus === "published" ? "draft" : "published";

    try {
      const res = await fetch(`/api/trips/${tripId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      showToast(t("saved"), "success");
      router.refresh();
    } catch {
      showToast(t("error"), "error");
    } finally {
      setLoading(false);
    }
  }

  const isPublished = currentStatus === "published";

  return (
    <button
      type="button"
      onClick={togglePublish}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent disabled:opacity-50"
    >
      {isPublished ? (
        <>
          <EyeOff className="h-3.5 w-3.5" />
          {t("unpublish")}
        </>
      ) : (
        <>
          <Globe className="h-3.5 w-3.5" />
          {t("publish")}
        </>
      )}
    </button>
  );
}
