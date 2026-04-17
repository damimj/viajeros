"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TripActionsProps {
  tripId: string;
  tripTitle: string;
}

export function TripActions({ tripId, tripTitle }: TripActionsProps) {
  const t = useTranslations("trips");
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(t("deleteConfirm"))) return;

    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("trips").delete().eq("id", tripId);
      if (error) throw error;
      router.refresh();
    } catch {
      alert(tc("error"));
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-md p-1 hover:bg-accent"
        disabled={deleting}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-40 rounded-md border bg-popover p-1 shadow-md">
            <Link
              href={`/admin/trips/${tripId}`}
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              <Pencil className="h-3.5 w-3.5" />
              {tc("edit")}
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {tc("delete")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
