"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/role-badge";
import { toggleCheer } from "@/lib/actions/feed-actions";

interface FeedPostCardProps {
  id: string;
  body: string;
  postType: "achievement" | "milestone" | "general";
  authorName: string;
  authorRole: "runner" | "coach";
  createdAt: string;
  cheerCount: number;
  hasCheered: boolean;
}

const postTypeLabels: Record<string, string> = {
  achievement: "Achievement",
  milestone: "Milestone",
  general: "",
};

export function FeedPostCard({
  id,
  body,
  postType,
  authorName,
  authorRole,
  createdAt,
  cheerCount,
  hasCheered,
}: FeedPostCardProps) {
  const [optimisticCheered, setOptimisticCheered] = useState(hasCheered);
  const [optimisticCount, setOptimisticCount] = useState(cheerCount);
  const [loading, setLoading] = useState(false);

  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleCheer() {
    setLoading(true);
    setOptimisticCheered(!optimisticCheered);
    setOptimisticCount(optimisticCheered ? optimisticCount - 1 : optimisticCount + 1);
    try {
      await toggleCheer(id);
    } catch {
      setOptimisticCheered(hasCheered);
      setOptimisticCount(cheerCount);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{authorName}</span>
              <RoleBadge role={authorRole} />
              {postType !== "general" && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">
                  {postTypeLabels[postType]}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3 whitespace-pre-wrap">{body}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCheer}
          disabled={loading}
          className={optimisticCheered ? "text-amber-400" : "text-muted-foreground"}
        >
          {optimisticCheered ? "🎉" : "👏"} {optimisticCount > 0 && optimisticCount}
          {optimisticCount === 0 ? " Cheer" : ""}
        </Button>
      </CardContent>
    </Card>
  );
}
