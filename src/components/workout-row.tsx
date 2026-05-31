import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface WorkoutRowProps {
  id: string;
  planId: string;
  date: string;
  dayOfWeek: string;
  prescribedWorkout: string;
  status: "upcoming" | "completed" | "missed" | "modified";
  miles: number | null;
  perceivedEffort: number | null;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-500/15 text-green-400 border-green-500/30",
  missed: "bg-red-500/15 text-red-400 border-red-500/30",
  modified: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  upcoming: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export function WorkoutRow({
  id,
  planId,
  date,
  dayOfWeek,
  prescribedWorkout,
  status,
  miles,
  perceivedEffort,
}: WorkoutRowProps) {
  return (
    <Link
      href={`/plan/${planId}/workout/${id}`}
      className="flex items-center gap-4 rounded-md border px-4 py-3 transition-colors hover:bg-muted/50"
    >
      <div className="w-20 shrink-0">
        <p className="text-sm font-medium">{dayOfWeek}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{prescribedWorkout}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {miles != null && (
          <span className="text-sm text-muted-foreground">{miles} mi</span>
        )}
        {perceivedEffort != null && (
          <span className="text-sm text-muted-foreground">RPE {perceivedEffort}</span>
        )}
        <Badge variant="outline" className={statusColors[status]}>
          {status}
        </Badge>
      </div>
    </Link>
  );
}
