"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type ParsedPlan } from "@/lib/excel-parser";

export async function createPlanFromImport(parsedPlan: ParsedPlan) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Profile not found");

  const { data: plan, error: planError } = await supabase
    .from("training_plans")
    .insert({
      athlete_id: user.id,
      coach_id: user.id,
      title: parsedPlan.title,
      goal_race: parsedPlan.goalRace,
      goal_date: parsedPlan.goalDate,
      goal_time: parsedPlan.goalTime,
    })
    .select("id")
    .single();

  if (planError) throw new Error(`Failed to create plan: ${planError.message}`);

  for (const week of parsedPlan.weeks) {
    const { data: weekRow, error: weekError } = await supabase
      .from("training_weeks")
      .insert({
        plan_id: plan.id,
        week_number: week.weekNumber,
        date_start: week.dateStart,
        date_end: week.dateEnd,
        focus: week.focus,
      })
      .select("id")
      .single();

    if (weekError) throw new Error(`Failed to create week ${week.weekNumber}: ${weekError.message}`);

    const workoutRows = week.workouts.map((w) => ({
      week_id: weekRow.id,
      date: w.date,
      day_of_week: w.dayOfWeek,
      prescribed_workout: w.prescribedWorkout,
      log: w.log,
      avg_hr: w.avgHr,
      perceived_effort: w.perceivedEffort,
      miles: w.miles,
      strength_misc: w.strengthMisc,
      status: w.log ? "completed" as const : "upcoming" as const,
    }));

    const { error: workoutsError } = await supabase
      .from("workouts")
      .insert(workoutRows);

    if (workoutsError) throw new Error(`Failed to create workouts for week ${week.weekNumber}: ${workoutsError.message}`);
  }

  redirect(`/plan/${plan.id}`);
}
