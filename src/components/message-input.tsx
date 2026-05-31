"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMessage } from "@/lib/actions/message-actions";

export function MessageInput({ conversationId }: { conversationId: string }) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    try {
      await sendMessage(conversationId, body.trim());
      setBody("");
    } catch {} finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-zinc-800 p-4">
      <Input value={body} onChange={e => setBody(e.target.value)} placeholder="Type a message..." disabled={loading} className="flex-1" />
      <Button type="submit" disabled={loading || !body.trim()} size="sm">Send</Button>
    </form>
  );
}
