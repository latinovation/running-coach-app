import { createClient } from "@/lib/supabase/server";
import { CreatePostForm } from "@/components/create-post-form";
import { FeedPostCard } from "@/components/feed-post-card";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from("feed_posts")
    .select(`
      id, body, post_type, created_at,
      profiles:author_id (display_name, role),
      feed_cheers (id, user_id)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Community</h1>

      <CreatePostForm />

      {(!posts || posts.length === 0) ? (
        <p className="text-center text-sm text-muted-foreground py-12">
          No posts yet. Be the first to share!
        </p>
      ) : (
        posts.map((post) => {
          const profile = post.profiles as unknown as { display_name: string; role: "runner" | "coach" } | null;
          const cheers = (post.feed_cheers ?? []) as unknown as Array<{ id: string; user_id: string }>;
          const hasCheered = cheers.some((c) => c.user_id === user?.id);

          return (
            <FeedPostCard
              key={post.id}
              id={post.id}
              body={post.body}
              postType={post.post_type}
              authorName={profile?.display_name ?? "Unknown"}
              authorRole={profile?.role ?? "runner"}
              createdAt={post.created_at}
              cheerCount={cheers.length}
              hasCheered={hasCheered}
            />
          );
        })
      )}
    </div>
  );
}
