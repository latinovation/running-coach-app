import { Badge } from "@/components/ui/badge";

export function RoleBadge({ role }: { role: "runner" | "coach" }) {
  return (
    <Badge variant={role === "coach" ? "default" : "secondary"}>
      {role === "coach" ? "Coach" : "Runner"}
    </Badge>
  );
}
