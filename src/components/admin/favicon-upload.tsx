"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FaviconUploadProps {
  currentUrl: string;
  onUploaded: (url: string) => void;
}

export function FaviconUpload({ currentUrl, onUploaded }: FaviconUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const fileName = `favicon-${Date.now()}.${file.name.split(".").pop()}`;

      const { error: uploadErr } = await supabase.storage
        .from("settings")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("settings")
        .getPublicUrl(fileName);

      onUploaded(urlData.publicUrl);
    } catch (err) {
      console.error("Favicon upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {currentUrl && (
        <img
          src={currentUrl}
          alt="Favicon"
          className="h-8 w-8 rounded border object-contain"
        />
      )}
      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent">
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        {uploading ? "Uploading..." : "Upload favicon"}
        <input
          type="file"
          accept=".ico,.png,.jpg,.jpeg,.svg"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  );
}
