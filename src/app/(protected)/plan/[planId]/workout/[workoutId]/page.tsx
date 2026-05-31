import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutLogForm } from "@/components/workout-log-form";
import { WorkoutComments } from "@/components/workout-comments";
import { WorkoutMediaGallery } from "@/components/workout-media-gallery";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ planId: string; workoutId: string }>;
}) {
  const { planId, workoutId } = await params;
  const supabase = await createClient();

  const { data: workout } = await supabase
    .from("workouts")
    .select(`
      *,
      training_weeks!inner (
        week_number, focus,
        training_plans!inner (id, title)
      )
    `)
    .eq("id", workoutId)
    .single();

  if (!workout) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select(`
      id, body, created_at,
      profiles:author_id (display_name, role)
    `)
    .eq("workout_id", workoutId)
    .order("created_at");

  const { data: media } = await supabase
    .from("workout_media")
    .select("id, file_url, media_type, created_at")
    .eq("workout_id", workoutId)
    .order("created_at");

  const statusColors: Record<string, string> = {
    completed: "bg-green-500/15 text-green-400 border-green-500/30",
    missed: "bg-red-500/15 text-red-400 border-red-500/30",
    modified: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    upcoming: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/plan/${planId}`}>
          <Button variant="ghost" size="sm" className="mb-2">
            &larr; Back to plan
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{workout.day_of_week}</h1>
          <span className="text-muted-foreground">{workout.date}</span>
          <Badge variant="outline" className={statusColors[workout.status]}>
            {workout.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Week {workout.training_weeks.week_number}
          {workout.training_weeks.focus && ` — ${workout.training_weeks.focus}`}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prescribed Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{workout.prescribed_workout}</p>
        </CardContent>
      </Card>

      <WorkoutLogForm
        workoutId={workoutId}
        planId={planId}
        existingLog={workout.log}
        existingAvgHr={workout.avg_hr}
        existingEffort={workout.perceived_effort}
        existingMiles={workout.miles}
        existingStrength={workout.strength_misc}
      />

      <WorkoutMediaGallery
        media={media ?? []}
        workoutId={workoutId}
        planId={planId}
      />

      <WorkoutComments
        comments={(comments ?? []) as any}
        workoutId={workoutId}
        planId={planId}
      />
    </div>
  );
}
