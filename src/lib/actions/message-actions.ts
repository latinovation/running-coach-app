"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function sendMessage(conversationId: string, body: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId, sender_id: user.id, sender_type: "user", body,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/messages");
}

export async function getOrCreateConversation(otherUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check for existing conversation via relationship
  const { data: relationship } = await supabase
    .from("coach_athlete_relationships")
    .select("id")
    .or(`and(coach_id.eq.${user.id},athlete_id.eq.${otherUserId}),and(coach_id.eq.${otherUserId},athlete_id.eq.${user.id})`)
    .eq("status", "active")
    .single();

  if (relationship) {
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("type", "coach_athlete")
      .eq("relationship_id", relationship.id)
      .single();
    if (existing) return existing.id;

    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ type: "coach_athlete", relationship_id: relationship.id })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return created!.id;
  }
  throw new Error("No active relationship found");
}
