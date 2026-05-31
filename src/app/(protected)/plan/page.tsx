import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PlanListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: plans } = await supabase
    .from("training_plans")
    .select("id, title, goal_race, goal_date, created_at")
    .order("created_at", { ascending: false });

  if (plans && plans.length === 1) {
    redirect(`/plan/${plans[0].id}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Training Plans</h1>
        <Link href="/plan/import">
          <Button>Import Plan</Button>
        </Link>
      </div>

      {!plans || plans.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No training plans yet</CardTitle>
            <CardDescription>
              Import your coach&apos;s training plan from an Excel file to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/plan/import">
              <Button>Import Training Plan</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {plans.map((plan) => (
            <Link key={plan.id} href={`/plan/${plan.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle>{plan.title}</CardTitle>
                  <CardDescription>
                    {plan.goal_race && `${plan.goal_race} — `}
                    {plan.goal_date ?? "No target date"}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
