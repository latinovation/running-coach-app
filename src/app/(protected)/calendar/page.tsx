"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { parseCalendarCSV, type ParsedCalendarPlan } from "@/lib/calendar-parser";
import { importCalendarPlan } from "@/lib/actions/calendar-actions";

const conflictColors: Record<string, string> = {
  travel: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  hiking: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  rest: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  none: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export default function CalendarPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ParsedCalendarPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const text = await file.text();
    const plan = parseCalendarCSV(text, file.name.replace(/\.\w+$/, ""));
    if (plan.events.length === 0) {
      setError("No events found. Make sure the CSV has a 'Date' column.");
      return;
    }
    setPreview(plan);
  }

  async function handleImport() {
    if (!preview) return;
    setImporting(true);
    try {
      await importCalendarPlan(preview);
      setImported(true);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  if (imported) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Calendar Plans</h1>
        <Card>
          <CardHeader>
            <CardTitle>Plan Imported</CardTitle>
            <CardDescription>Your calendar plan has been imported. Conflicts will appear on your training calendar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => { setImported(false); if (fileRef.current) fileRef.current.value = ""; }}>
              Import Another Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (preview) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Review Calendar Import</h1>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{preview.title}</CardTitle>
            <CardDescription>{preview.events.length} events found</CardDescription>
          </CardHeader>
        </Card>
        <div className="flex flex-col gap-2 mb-6">
          {preview.events.map((event, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md border border-zinc-800 px-4 py-2 text-sm">
              <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">{event.date}</span>
              <span className="flex-1 truncate">{event.activities || event.location || "—"}</span>
              {event.location && <span className="text-xs text-muted-foreground hidden sm:block">{event.location}</span>}
              <Badge variant="outline" className={conflictColors[event.conflictType]}>{event.conflictType}</Badge>
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}>Cancel</Button>
          <Button onClick={handleImport} disabled={importing}>{importing ? "Importing..." : `Import ${preview.events.length} events`}</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Calendar Plans</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Upload Calendar Plan</CardTitle>
          <CardDescription>Upload a CSV with a Date column. Conflicts (travel, hiking, rest) are auto-detected from activity keywords.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="csv">Calendar file (.csv)</Label>
            <Input ref={fileRef} id="csv" type="file" accept=".csv" onChange={handleFile} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
