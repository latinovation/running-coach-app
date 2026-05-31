import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { WeekCard } from "@/components/week-card";
import { TrainingCalendar } from "@/components/training-calendar";
import { ViewToggle } from "@/components/view-toggle";

export default async function PlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { planId } = await params;
  const { view = "calendar" } = await searchParams;
  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("training_plans")
    .select("id, title, goal_race, goal_date, goal_time, athlete_id")
    .eq("id", planId)
    .single();

  if (!plan) notFound();

  const { data: weeks } = await supabase
    .from("training_weeks")
    .select(`
      id, week_number, date_start, date_end, focus,
      workouts (
        id, date, day_of_week, prescribed_workout, status, miles, perceived_effort, log, avg_hr, strength_misc
      )
    `)
    .eq("plan_id", planId)
    .order("week_number")
    .order("date", { referencedTable: "workouts" });

  const today = new Date().toISOString().split("T")[0];

  // Fetch calendar conflicts for the athlete
  const athleteId = plan.athlete_id;
  let conflicts: Array<{ date: string; location: string | null; activities: string | null; conflict_type: string }> = [];
  if (athleteId) {
    const { data: calPlans } = await supabase
      .from("calendar_plans")
      .select("id")
      .eq("user_id", athleteId);
    if (calPlans && calPlans.length > 0) {
      const planIds = calPlans.map((p) => p.id);
      const { data: calEvents } = await supabase
        .from("calendar_events")
        .select("date, location, activities, conflict_type")
        .in("plan_id", planIds);
      conflicts = calEvents ?? [];
    }
  }

  // Flatten workouts for the calendar view
  const allWorkouts = (weeks ?? []).flatMap((w) =>
    (w.workouts ?? []).map((workout) => ({
      ...workout,
      log: workout.log ?? null,
      avg_hr: workout.avg_hr ?? null,
      strength_misc: workout.strength_misc ?? null,
    })),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{plan.title}</h1>
          <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
            {plan.goal_race && <span>{plan.goal_race}</span>}
            {plan.goal_date && <span>{plan.goal_date}</span>}
            {plan.goal_time && <span>Target: {plan.goal_time}</span>}
          </div>
        </div>
        <Suspense>
          <ViewToggle />
        </Suspense>
      </div>

      {view === "calendar" ? (
        <TrainingCalendar workouts={allWorkouts} planId={planId} conflicts={conflicts} />
      ) : (
        <div className="flex flex-col gap-6">
          {weeks?.map((week) => {
            const isCurrentWeek = today >= week.date_start && today <= week.date_end;
            return (
              <WeekCard
                key={week.id}
                planId={planId}
                weekNumber={week.week_number}
                dateStart={week.date_start}
                dateEnd={week.date_end}
                focus={week.focus}
                workouts={week.workouts ?? []}
                isCurrentWeek={isCurrentWeek}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
