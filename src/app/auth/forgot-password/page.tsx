"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { KeyRound, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Please enter your email");

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#05080B] mb-2">Check Your Email</h1>
        <p className="text-gray-500 mb-6">We&apos;ve sent password reset instructions to <strong>{email}</strong></p>
        <Link href="/auth/login" className="text-[#00B4F0] font-medium hover:underline">Back to Sign In</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#00B4F0]/10 flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-6 h-6 text-[#00B4F0]" />
        </div>
        <h1 className="text-2xl font-bold text-[#05080B]">Reset Password</h1>
        <p className="text-gray-500 mt-1">Enter your email to receive reset instructions</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required />
        <Button type="submit" variant="primary" fullWidth loading={loading}>Send Reset Link</Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        <Link href="/auth/login" className="text-[#00B4F0] font-medium hover:underline">Back to Sign In</Link>
      </p>
    </div>
  );
}
