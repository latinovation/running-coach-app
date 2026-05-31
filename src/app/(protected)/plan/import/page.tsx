"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExcelImportPreview } from "@/components/excel-import-preview";
import { parseTrainingPlanExcel, type ParsedPlan } from "@/lib/excel-parser";
import { createPlanFromImport } from "@/lib/actions/import-actions";

export default function ImportPlanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedPlan, setParsedPlan] = useState<ParsedPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const plan = parseTrainingPlanExcel(buffer);

      if (plan.weeks.length === 0) {
        setError("No week sheets found in the Excel file. Expected sheets named 'Week 1', 'Week 2', etc.");
        setLoading(false);
        return;
      }

      setParsedPlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse Excel file");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!parsedPlan) return;
    setImporting(true);

    try {
      await createPlanFromImport(parsedPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import plan");
      setImporting(false);
    }
  }

  function handleCancel() {
    setParsedPlan(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (parsedPlan) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Review Import</h1>
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}
        <ExcelImportPreview
          plan={parsedPlan}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          loading={importing}
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Import Training Plan</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
          <CardDescription>
            Upload your coach&apos;s training plan spreadsheet (.xlsx). The file should have
            weekly sheets named &quot;Week 1&quot;, &quot;Week 2&quot;, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="file">Training plan file</Label>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {loading && <p className="text-sm text-muted-foreground">Parsing file...</p>}
        </CardContent>
      </Card>
    </div>
  );
}
