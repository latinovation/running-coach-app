"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { type ParsedCalendarPlan } from "@/lib/calendar-parser";

export async function importCalendarPlan(plan: ParsedCalendarPlan) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: calPlan, error: planError } = await supabase
    .from("calendar_plans")
    .insert({ user_id: user.id, title: plan.title })
    .select("id")
    .single();
  if (planError) throw new Error(planError.message);

  if (plan.events.length > 0) {
    const rows = plan.events.map(e => ({
      plan_id: calPlan.id,
      date: e.date,
      phase: e.phase,
      location: e.location,
      activities: e.activities,
      notes: e.notes,
      conflict_type: e.conflictType,
    }));
    const { error } = await supabase.from("calendar_events").insert(rows);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function deleteCalendarPlan(planId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("calendar_plans").delete().eq("id", planId);
  if (error) throw new Error(error.message);
  revalidatePath("/calendar");
}

export async function updateEventConflictType(eventId: string, conflictType: "travel" | "hiking" | "rest" | "none") {
  const supabase = await createClient();
  const { error } = await supabase.from("calendar_events").update({ conflict_type: conflictType }).eq("id", eventId);
  if (error) throw new Error(error.message);
  revalidatePath("/calendar");
}
