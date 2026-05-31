"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addComment(
  workoutId: string,
  planId: string,
  body: string,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("comments")
    .insert({
      workout_id: workoutId,
      author_id: user.id,
      body,
    });

  if (error) throw new Error(`Failed to add comment: ${error.message}`);

  revalidatePath(`/plan/${planId}/workout/${workoutId}`);
}
