import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MessageBubbleProps {
  body: string;
  senderName: string;
  isOwn: boolean;
  timestamp: string;
}

export function MessageBubble({ body, senderName, isOwn, timestamp }: MessageBubbleProps) {
  const initials = senderName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className={`max-w-[70%] ${isOwn ? "items-end" : ""}`}>
        <div className={`rounded-xl px-3 py-2 text-sm ${isOwn ? "bg-primary text-primary-foreground" : "bg-zinc-800"}`}>
          {body}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 px-1">
          {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
