// Force dynamic rendering for dashboard (uses Supabase auth)
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
