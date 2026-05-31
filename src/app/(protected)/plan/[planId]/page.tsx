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
    .select("id, title, goal_race, goal_date, goal_time")
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
        <TrainingCalendar workouts={allWorkouts} planId={planId} />
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
