"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) return setError("Please fill in all fields");

    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#00B4F0]/10 flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-6 h-6 text-[#00B4F0]" />
        </div>
        <h1 className="text-2xl font-bold text-[#05080B]">Welcome Back</h1>
        <p className="text-gray-500 mt-1">Sign in to your TrackMate account</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-sm text-[#00B4F0] hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" variant="primary" fullWidth loading={loading}>Sign In</Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-[#00B4F0] font-medium hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
