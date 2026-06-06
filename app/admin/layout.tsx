import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin route — redirect to home if not logged in
  if (!user) {
    console.log("[AdminLayout] Redirecting: No user found in Supabase Auth.");
    redirect("/");
  }

  // Query role from our DB not user_metadata
  const { data: dbUser, error } = await supabase
    .from("User")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("[AdminLayout] Supabase Error querying User table:", error);
  }

  if (!dbUser || dbUser.role !== "ADMIN") {
    console.log("[AdminLayout] Redirecting: dbUser is missing or role is not ADMIN.", dbUser);
    redirect("/");
  }

  return (
    <div className="flex h-screen flex-col md:flex-row bg-[var(--color-ivory)] overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
