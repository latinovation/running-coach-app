import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface CalendarWorkout {
  id: string;
  date: string;
  day_of_week: string;
  prescribed_workout: string;
  status: "upcoming" | "completed" | "missed" | "modified";
  miles: number | null;
  perceived_effort: number | null;
  log?: string | null;
  avg_hr?: number | null;
  strength_misc?: string | null;
}

interface CalendarDayDetailProps {
  workout: CalendarWorkout | null;
  planId: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: { label: "Completed", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  missed: { label: "Missed", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  modified: { label: "Modified", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  upcoming: { label: "Upcoming", className: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
};

export function CalendarDayDetail({ workout, planId }: CalendarDayDetailProps) {
  if (!workout) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-center px-6">
        <div className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-700 mb-3" />
        <p className="text-sm text-muted-foreground">Select a day to see workout details</p>
      </div>
    );
  }

  const status = statusConfig[workout.status];
  const dateObj = new Date(workout.date + "T12:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Date header */}
      <div>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
          {formattedDate}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Prescribed workout */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Prescribed</p>
        <p className="text-sm font-medium leading-relaxed">{workout.prescribed_workout}</p>
      </div>

      {/* Logged data */}
      {workout.log && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Logged</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{workout.log}</p>
        </div>
      )}

      {/* Metrics row */}
      {(workout.miles != null || workout.perceived_effort != null || workout.avg_hr != null) && (
        <div className="grid grid-cols-3 gap-2">
          {workout.miles != null && (
            <div className="rounded-md bg-zinc-900 border border-zinc-800 p-2 text-center">
              <p className="text-lg font-mono font-semibold tabular-nums">{workout.miles}</p>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Miles</p>
            </div>
          )}
          {workout.avg_hr != null && (
            <div className="rounded-md bg-zinc-900 border border-zinc-800 p-2 text-center">
              <p className="text-lg font-mono font-semibold tabular-nums">{workout.avg_hr}</p>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Avg HR</p>
            </div>
          )}
          {workout.perceived_effort != null && (
            <div className="rounded-md bg-zinc-900 border border-zinc-800 p-2 text-center">
              <p className="text-lg font-mono font-semibold tabular-nums">{workout.perceived_effort}</p>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">RPE</p>
            </div>
          )}
        </div>
      )}

      {workout.strength_misc && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Strength / Misc</p>
          <p className="text-sm text-muted-foreground">{workout.strength_misc}</p>
        </div>
      )}

      <Link href={`/plan/${planId}/workout/${workout.id}`}>
        <Button variant="outline" size="sm" className="w-full mt-1">
          Open Full Detail
        </Button>
      </Link>
    </div>
  );
}
