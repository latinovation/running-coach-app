"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "calendar";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Tabs value={view} onValueChange={handleChange}>
      <TabsList>
        <TabsTrigger value="calendar" className="text-xs px-3">
          Calendar
        </TabsTrigger>
        <TabsTrigger value="list" className="text-xs px-3">
          List
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
