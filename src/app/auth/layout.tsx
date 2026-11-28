// Force dynamic rendering for auth pages (they use Supabase client which requires valid env vars)
export const dynamic = "force-dynamic";

import { Activity } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-dark min-h-screen bg-[#090D19] flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl bg-[#00B4F0] flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-bold text-[#05080B]">TrackMate</span>
      </Link>
      <div className="auth-card w-full max-w-md bg-[#0F1424] rounded-2xl shadow-xl shadow-black/30 border border-white/[0.08] p-8">
        {children}
      </div>
    </div>
  );
}
