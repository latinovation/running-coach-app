import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkoutRow } from "@/components/workout-row";

interface Workout {
  id: string;
  date: string;
  day_of_week: string;
  prescribed_workout: string;
  status: "upcoming" | "completed" | "missed" | "modified";
  miles: number | null;
  perceived_effort: number | null;
}

interface WeekCardProps {
  planId: string;
  weekNumber: number;
  dateStart: string;
  dateEnd: string;
  focus: string | null;
  workouts: Workout[];
  isCurrentWeek?: boolean;
}

export function WeekCard({
  planId,
  weekNumber,
  dateStart,
  dateEnd,
  focus,
  workouts,
  isCurrentWeek,
}: WeekCardProps) {
  return (
    <Card className={isCurrentWeek ? "border-primary" : undefined}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            Week {weekNumber}
            {isCurrentWeek && <Badge>Current</Badge>}
          </CardTitle>
          {focus && <Badge variant="secondary">{focus}</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">
          {dateStart} — {dateEnd}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {workouts.map((workout) => (
          <WorkoutRow
            key={workout.id}
            id={workout.id}
            planId={planId}
            date={workout.date}
            dayOfWeek={workout.day_of_week}
            prescribedWorkout={workout.prescribed_workout}
            status={workout.status}
            miles={workout.miles}
            perceivedEffort={workout.perceived_effort}
          />
        ))}
      </CardContent>
    </Card>
  );
}
