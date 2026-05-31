import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WeekCard } from "@/components/week-card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user!.id)
    .single();

  const today = new Date().toISOString().split("T")[0];

  // Get the user's plan
  const { data: plan } = await supabase
    .from("training_plans")
    .select("id, title")
    .or(`athlete_id.eq.${user!.id},coach_id.eq.${user!.id}`)
    .limit(1)
    .single();

  // Get current week if a plan exists
  let currentWeek = null;
  if (plan) {
    const { data: week } = await supabase
      .from("training_weeks")
      .select(`
        id, week_number, date_start, date_end, focus,
        workouts (
          id, date, day_of_week, prescribed_workout, status, miles, perceived_effort
        )
      `)
      .eq("plan_id", plan.id)
      .lte("date_start", today)
      .gte("date_end", today)
      .order("date", { referencedTable: "workouts" })
      .single();

    currentWeek = week;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">
        Welcome, {profile?.display_name}
      </h1>

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
