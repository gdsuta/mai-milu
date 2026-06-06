// app/page.tsx — change from redirect('/login') to:
import { redirect } from "next/navigation";
import { createServer } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Logged-in users go to /home, everyone else sees the landing page
  if (user) redirect("/home");
  redirect("/landing");
}
