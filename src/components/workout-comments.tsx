import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/role-badge";
import { CommentForm } from "@/components/comment-form";

interface Comment {
  id: string;
  body: string;
  created_at: string;
  profiles: {
    display_name: string;
    role: "runner" | "coach";
  };
}

interface WorkoutCommentsProps {
  comments: Comment[];
  workoutId: string;
  planId: string;
}

export function WorkoutComments({ comments, workoutId, planId }: WorkoutCommentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Comments</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        )}
        {comments.map((comment) => {
          const initials = comment.profiles.display_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          return (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.profiles.display_name}</span>
                  <RoleBadge role={comment.profiles.role} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{comment.body}</p>
              </div>
            </div>
          );
        })}
        <CommentForm workoutId={workoutId} planId={planId} />
      </CardContent>
    </Card>
  );
}
