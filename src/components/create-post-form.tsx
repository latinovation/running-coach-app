"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFeedPost } from "@/lib/actions/feed-actions";

export function CreatePostForm() {
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState<"general" | "achievement" | "milestone">("general");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    try {
      await createFeedPost(body.trim(), postType);
      setBody("");
      setPostType("general");
    } catch {
      // Post won't appear
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Share an Update</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Tabs value={postType} onValueChange={(v) => setPostType(v as typeof postType)}>
            <TabsList className="w-full">
              <TabsTrigger value="general" className="flex-1 text-xs">General</TabsTrigger>
              <TabsTrigger value="achievement" className="flex-1 text-xs">Achievement</TabsTrigger>
              <TabsTrigger value="milestone" className="flex-1 text-xs">Milestone</TabsTrigger>
            </TabsList>
          </Tabs>
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share a run, a PR, or just how you're feeling..."
          />
          <Button type="submit" disabled={loading || !body.trim()} size="sm">
            {loading ? "Posting..." : "Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
