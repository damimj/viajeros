"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/shared/toast";

interface EntityActionsProps {
  onDelete: () => Promise<void>;
  redirectPath?: string;
}

export function EntityActions({ onDelete, redirectPath }: EntityActionsProps) {
  const t = useTranslations("admin");
  const { showToast } = useToast();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    try {
      await onDelete();
      showToast(t("deleted"), "success");
      if (redirectPath) router.push(redirectPath);
    } catch {
      showToast(t("error"), "error");
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {confirming && !deleting && (
        <span className="text-sm text-destructive">{t("confirmDelete")}</span>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="flex items-center gap-1.5 rounded-md border border-destructive/50 px-3 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {deleting ? t("deleting") : t("delete")}
      </button>
    </div>
  );
}
