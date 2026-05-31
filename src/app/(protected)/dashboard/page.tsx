import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WeekCard } from "@/components/week-card";
import { TrainingCalendar } from "@/components/training-calendar";
import { ViewToggle } from "@/components/view-toggle";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view = "calendar" } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user!.id)
    .single();

  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];

  // Get the user's plan
  const { data: plan } = await supabase
    .from("training_plans")
    .select("id, title")
    .or(`athlete_id.eq.${user!.id},coach_id.eq.${user!.id}`)
    .limit(1)
    .single();

  // Get all workouts for the current month (for calendar view)
  let monthWorkouts: Array<{
    id: string;
    date: string;
    day_of_week: string;
    prescribed_workout: string;
    status: "upcoming" | "completed" | "missed" | "modified";
    miles: number | null;
    perceived_effort: number | null;
    log: string | null;
    avg_hr: number | null;
    strength_misc: string | null;
  }> = [];

  let currentWeek = null;
  let conflicts: Array<{ date: string; location: string | null; activities: string | null; conflict_type: string }> = [];

  if (plan) {
    // Get all workouts across all weeks for this plan (calendar needs the full picture)
    const { data: weeks } = await supabase
      .from("training_weeks")
      .select(`
        id, week_number, date_start, date_end, focus,
        workouts (
          id, date, day_of_week, prescribed_workout, status, miles, perceived_effort, log, avg_hr, strength_misc
        )
      `)
      .eq("plan_id", plan.id)
      .order("week_number")
      .order("date", { referencedTable: "workouts" });

    monthWorkouts = (weeks ?? []).flatMap((w) =>
      (w.workouts ?? []).map((workout) => ({
        ...workout,
        log: workout.log ?? null,
        avg_hr: workout.avg_hr ?? null,
        strength_misc: workout.strength_misc ?? null,
      })),
    );

    // Fetch calendar conflicts for the current user
    const { data: calPlans } = await supabase
      .from("calendar_plans")
      .select("id")
      .eq("user_id", user!.id);
    if (calPlans && calPlans.length > 0) {
      const calPlanIds = calPlans.map((p) => p.id);
      const { data: calEvents } = await supabase
        .from("calendar_events")
        .select("date, location, activities, conflict_type")
        .in("plan_id", calPlanIds);
      conflicts = calEvents ?? [];
    }

    // Find current week for list view
    currentWeek = (weeks ?? []).find(
      (w) => todayKey >= w.date_start && todayKey <= w.date_end,
    ) ?? null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Welcome, {profile?.display_name}
        </h1>
        {plan && (
          <Suspense>
            <ViewToggle />
          </Suspense>
        )}
      </div>

      {!plan ? (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              {profile?.role === "coach"
                ? "Create a training plan for your athletes."
                : "Import your training plan to start tracking workouts."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/plan/import">
              <Button>Import Training Plan</Button>
            </Link>
          </CardContent>
        </Card>
      ) : view === "calendar" ? (
        <>
          <TrainingCalendar workouts={monthWorkouts} planId={plan.id} conflicts={conflicts} />
          <Link href={`/plan/${plan.id}`}>
            <Button variant="outline">View Full Plan</Button>
          </Link>
        </>
      ) : (
        <>
          {currentWeek ? (
            <div>
              <h2 className="text-lg font-semibold mb-3">This Week</h2>
              <WeekCard
                planId={plan.id}
                weekNumber={currentWeek.week_number}
                dateStart={currentWeek.date_start}
                dateEnd={currentWeek.date_end}
                focus={currentWeek.focus}
                workouts={currentWeek.workouts ?? []}
                isCurrentWeek
              />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No workouts this week</CardTitle>
                <CardDescription>
                  Check your <Link href={`/plan/${plan.id}`} className="text-primary underline">full training plan</Link> for upcoming weeks.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <Link href={`/plan/${plan.id}`}>
            <Button variant="outline">View Full Plan</Button>
          </Link>
        </>
      )}
    </div>
  );
}
