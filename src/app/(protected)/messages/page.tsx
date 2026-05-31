import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageList } from "@/components/message-list";
import { MessageInput } from "@/components/message-input";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user's conversations
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, type, created_at")
    .order("created_at", { ascending: false });

  if (!conversations || conversations.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <Card>
          <CardHeader>
            <CardTitle>No conversations yet</CardTitle>
            <CardDescription>
              Messages with your coach will appear here once a coaching relationship is established.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // For V1, show the first conversation
  const convo = conversations[0];

  const { data: messages } = await supabase
    .from("messages")
    .select("id, body, sender_type, sender_id, created_at, profiles:sender_id(display_name)")
    .eq("conversation_id", convo.id)
    .order("created_at");

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <Card className="flex-1 flex flex-col overflow-hidden">
        <MessageList messages={(messages ?? []) as any} currentUserId={user.id} />
        <MessageInput conversationId={convo.id} />
      </Card>
    </div>
  );
}
