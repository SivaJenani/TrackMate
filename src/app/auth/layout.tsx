// Force dynamic rendering for auth pages (they use Supabase client which requires valid env vars)
export const dynamic = "force-dynamic";

import { Activity } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50/50 via-white to-blue-50/30 flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl bg-[#00B4F0] flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-bold text-[#05080B]">TrackMate</span>
      </Link>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 p-8">
        {children}
      </div>
    </div>
  );
}
