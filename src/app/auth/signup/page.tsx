"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserPlus } from "lucide-react";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) return setError("Full name is required");
    if (!email.trim()) return setError("Email is required");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    try {
      await signUp(email, password, fullName);
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
          <UserPlus className="w-6 h-6 text-[#00B4F0]" />
        </div>
        <h1 className="text-2xl font-bold text-[#05080B]">Create Account</h1>
        <p className="text-gray-500 mt-1">Start tracking your productivity today</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
        <Button type="submit" variant="primary" fullWidth loading={loading}>Create Account</Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-[#00B4F0] font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
