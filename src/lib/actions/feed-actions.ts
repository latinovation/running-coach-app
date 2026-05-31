"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createFeedPost(body: string, postType: "achievement" | "milestone" | "general" = "general") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("feed_posts").insert({
    author_id: user.id,
    body,
    post_type: postType,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/feed");
}

export async function toggleCheer(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if already cheered
  const { data: existing } = await supabase
    .from("feed_cheers")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    await supabase.from("feed_cheers").delete().eq("id", existing.id);
  } else {
    await supabase.from("feed_cheers").insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath("/feed");
}

export async function deleteFeedPost(postId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("feed_posts").delete().eq("id", postId);
  if (error) throw new Error(error.message);
  revalidatePath("/feed");
}
