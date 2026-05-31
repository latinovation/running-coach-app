"use client";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { MessageBubble } from "@/components/message-bubble";

interface Message {
  id: string;
  body: string;
  sender_type: string;
  created_at: string;
  sender_id: string | null;
  profiles: { display_name: string } | null;
}

export function MessageList({ messages, currentUserId }: { messages: Message[]; currentUserId: string }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscribe to realtime messages
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("messages").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      () => { router.refresh(); }
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [router]);

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      {messages.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">No messages yet. Start the conversation!</p>
      )}
      {messages.map(msg => (
        <MessageBubble
          key={msg.id}
          body={msg.body}
          senderName={msg.profiles?.display_name ?? "AI"}
          isOwn={msg.sender_id === currentUserId}
          timestamp={msg.created_at}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
