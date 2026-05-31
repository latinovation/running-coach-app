"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadWorkoutMedia } from "@/lib/actions/media-actions";

interface MediaUploadButtonProps {
  workoutId: string;
  planId: string;
}

export function MediaUploadButton({ workoutId, planId }: MediaUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadWorkoutMedia(workoutId, planId, formData);
    } catch {
      // Upload error
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
      <Button variant="outline" size="sm" disabled={loading} onClick={() => fileInputRef.current?.click()}>
        {loading ? "Uploading..." : "Upload Screenshot"}
      </Button>
    </>
  );
}
