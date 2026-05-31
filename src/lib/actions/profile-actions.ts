"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(displayName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function inviteAthlete(email: string) {
  // For V1, this creates a placeholder relationship
  // Full invite flow (email notification) is a future feature
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Find the athlete by email (they must already be registered)
  const { data: athleteAuth } = await supabase.auth.admin.listUsers();
  // Note: admin.listUsers requires service_role key, not available client-side
  // For V1, athletes accept invites via a code/link system
  throw new Error("Invite system requires setup — coming soon");
}
