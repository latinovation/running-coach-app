import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user!.id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Welcome, {profile?.display_name}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {profile?.role === "coach"
          ? "Your athletes and their training plans will appear here."
          : "Your training plan and workouts will appear here."}
      </p>
    </div>
  );
}
