"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logWorkout } from "@/lib/actions/workout-actions";

interface WorkoutLogFormProps {
  workoutId: string;
  planId: string;
  existingLog: string | null;
  existingAvgHr: number | null;
  existingEffort: number | null;
  existingMiles: number | null;
  existingStrength: string | null;
}

export function WorkoutLogForm({
  workoutId,
  planId,
  existingLog,
  existingAvgHr,
  existingEffort,
  existingMiles,
  existingStrength,
}: WorkoutLogFormProps) {
  const [log, setLog] = useState(existingLog ?? "");
  const [avgHr, setAvgHr] = useState(existingAvgHr?.toString() ?? "");
  const [effort, setEffort] = useState(existingEffort?.toString() ?? "");
  const [miles, setMiles] = useState(existingMiles?.toString() ?? "");
  const [strength, setStrength] = useState(existingStrength ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await logWorkout(workoutId, planId, {
        log,
        avgHr: avgHr ? parseInt(avgHr, 10) : null,
        perceivedEffort: effort ? parseInt(effort, 10) : null,
        miles: miles ? parseFloat(miles) : null,
        strengthMisc: strength || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Log Your Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="log">What did you do?</Label>
            <Input id="log" value={log} onChange={(e) => setLog(e.target.value)} placeholder="e.g., 5 miles easy, felt good" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="miles">Miles</Label>
              <Input id="miles" type="number" step="0.1" value={miles} onChange={(e) => setMiles(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="avgHr">Avg HR</Label>
              <Input id="avgHr" type="number" value={avgHr} onChange={(e) => setAvgHr(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="effort">Perceived Effort (1-5)</Label>
              <Input id="effort" type="number" min="1" max="5" value={effort} onChange={(e) => setEffort(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="strength">Strength / Misc</Label>
              <Input id="strength" value={strength} onChange={(e) => setStrength(e.target.value)} placeholder="e.g., band routine" />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Log"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
