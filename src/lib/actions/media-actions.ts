"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadWorkoutMedia(
  workoutId: string,
  planId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const ext = file.name.split(".").pop() || "png";
  const path = `${user.id}/${workoutId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("workout-media")
    .upload(path, file);

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from("workout-media")
    .getPublicUrl(path);

  const isImage = file.type.startsWith("image/");
  const mediaType = isImage ? "screenshot" : "document";

  const { error: insertError } = await supabase
    .from("workout_media")
    .insert({
      workout_id: workoutId,
      uploaded_by: user.id,
      file_url: publicUrl,
      media_type: mediaType,
    });

  if (insertError) throw new Error(`Failed to save media record: ${insertError.message}`);

  revalidatePath(`/plan/${planId}/workout/${workoutId}`);
}
