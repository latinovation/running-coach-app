"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addComment } from "@/lib/actions/comment-actions";

interface CommentFormProps {
  workoutId: string;
  planId: string;
}

export function CommentForm({ workoutId, planId }: CommentFormProps) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    try {
      await addComment(workoutId, planId, body.trim());
      setBody("");
    } catch {
      // Comment won't appear if it fails
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add a comment..." disabled={loading} />
      <Button type="submit" disabled={loading || !body.trim()} size="sm">Post</Button>
    </form>
  );
}
