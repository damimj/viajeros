"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { generateUploadPath } from "@/lib/utils/image";
import { useToast } from "@/components/shared/toast";

interface FaviconUploadProps {
  currentUrl: string;
  onUploaded: (url: string) => void;
}

export function FaviconUpload({ currentUrl, onUploaded }: FaviconUploadProps) {
  const t = useTranslations("settings");
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);

  async function handleFile(file: File) {
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const path = generateUploadPath("settings", null, file.name);
      const { error } = await supabase.storage.from("settings").upload(path, file, {
        upsert: true,
      });
      if (error) throw error;

      const { data } = supabase.storage.from("settings").getPublicUrl(path);
      setPreview(data.publicUrl);
      onUploaded(data.publicUrl);
      showToast(t("saved"), "success");
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {preview && (
        <div className="relative h-10 w-10 overflow-hidden rounded border">
          <Image src={preview} alt="favicon" fill className="object-contain" />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.ico"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent disabled:opacity-50"
      >
        <Upload className="h-3.5 w-3.5" />
        {uploading ? "Uploading…" : t("favicon")}
      </button>
    </div>
  );
}
