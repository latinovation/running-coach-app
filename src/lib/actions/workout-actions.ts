"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function logWorkout(
  workoutId: string,
  planId: string,
  data: {
    log: string;
    avgHr: number | null;
    perceivedEffort: number | null;
    miles: number | null;
    strengthMisc: string | null;
  },
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workouts")
    .update({
      log: data.log,
      avg_hr: data.avgHr,
      perceived_effort: data.perceivedEffort,
      miles: data.miles,
      strength_misc: data.strengthMisc,
      status: "completed",
    })
    .eq("id", workoutId);

  if (error) throw new Error(`Failed to log workout: ${error.message}`);

  revalidatePath(`/plan/${planId}/workout/${workoutId}`);
  revalidatePath(`/plan/${planId}`);
}

export async function updateWorkoutStatus(
  workoutId: string,
  planId: string,
  status: "upcoming" | "completed" | "missed" | "modified",
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workouts")
    .update({ status })
    .eq("id", workoutId);

  if (error) throw new Error(`Failed to update status: ${error.message}`);

  revalidatePath(`/plan/${planId}/workout/${workoutId}`);
  revalidatePath(`/plan/${planId}`);
}
