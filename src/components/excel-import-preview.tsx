"use client";

import { type ParsedPlan } from "@/lib/excel-parser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ExcelImportPreviewProps {
  plan: ParsedPlan;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export function ExcelImportPreview({ plan, onConfirm, onCancel, loading }: ExcelImportPreviewProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{plan.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {plan.goalRace && <p><span className="text-muted-foreground">Goal race:</span> {plan.goalRace}</p>}
          {plan.goalDate && <p><span className="text-muted-foreground">Date:</span> {plan.goalDate}</p>}
          {plan.goalTime && <p><span className="text-muted-foreground">Target:</span> {plan.goalTime}</p>}
          <p><span className="text-muted-foreground">Weeks parsed:</span> {plan.weeks.length}</p>
          <p><span className="text-muted-foreground">Total workouts:</span> {plan.weeks.reduce((sum, w) => sum + w.workouts.length, 0)}</p>
        </CardContent>
      </Card>

      {plan.weeks.map((week) => (
        <Card key={week.weekNumber}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Week {week.weekNumber}
              </CardTitle>
              {week.focus && (
                <Badge variant="secondary">{week.focus}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {week.dateStart} to {week.dateEnd}
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Day</TableHead>
                  <TableHead>Workout</TableHead>
                  <TableHead className="w-16">Miles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {week.workouts.map((workout) => (
                  <TableRow key={workout.date}>
                    <TableCell className="text-muted-foreground">{workout.dayOfWeek}</TableCell>
                    <TableCell>{workout.prescribedWorkout}</TableCell>
                    <TableCell>{workout.miles ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={loading}>
          {loading ? "Importing..." : `Import ${plan.weeks.length} weeks`}
        </Button>
      </div>
    </div>
  );
}
