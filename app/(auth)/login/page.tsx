"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { sendOTP, verifyOTP, signInWithGoogle } from "@/lib/auth";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOTP] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setUser, setSession } = useAuthStore();

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleSendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setError("");
    setLoading(true);
    const res = await sendOTP(phone);
    setLoading(false);
    if (res.success) {
      setStep("otp");
      setResendTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } else {
      setError(res.message || "Failed to send OTP");
    }
  };

  const handleOTPChange = useCallback(
    (index: number, value: string) => {
      if (value.length > 1) {
        // Paste handling
        const digits = value.replace(/\D/g, "").slice(0, 6).split("");
        const newOTP = [...otp];
        digits.forEach((d, i) => {
          if (index + i < 6) newOTP[index + i] = d;
        });
        setOTP(newOTP);
        const nextIndex = Math.min(index + digits.length, 5);
        otpRefs.current[nextIndex]?.focus();
        if (newOTP.every((d) => d !== "")) {
          handleVerifyOTP(newOTP.join(""));
        }
        return;
      }

      const newOTP = [...otp];
      newOTP[index] = value;
      setOTP(newOTP);

      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }

      if (newOTP.every((d) => d !== "")) {
        handleVerifyOTP(newOTP.join(""));
      }
    },
    [otp]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handleVerifyOTP = async (otpString?: string) => {
    const otpValue = otpString || otp.join("");
    if (otpValue.length !== 6) return;
    setError("");
    setLoading(true);
    const res = await verifyOTP(phone, otpValue);
    setLoading(false);
    if (res.success) {
      setUser(res.data?.user || { id: "", phone, role: "CUSTOMER" });
      setSession(res.data?.session);
      window.location.href = "/account";
    } else {
      setError(res.message || "Invalid OTP");
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError("");
    setLoading(true);
    const res = await sendOTP(phone);
    setLoading(false);
    if (res.success) {
      setResendTimer(30);
      setOTP(["", "", "", "", "", ""]);
    } else {
      setError(res.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — desktop only */}
      <div className="hidden w-1/2 bg-[var(--color-obsidian)] md:flex md:flex-col md:items-center md:justify-center">
        <h1 className="font-display text-4xl font-medium uppercase tracking-widest text-[var(--color-ivory)]">
          BOOGIEBUGI
        </h1>
        <p className="mt-3 text-sm text-[var(--color-warm-gray)]">
          Luxury unisex clothing for the modern individual
        </p>
      </div>

      {/* Right panel */}
      <div className="flex w-full flex-col items-center justify-center bg-[var(--color-ivory)] px-page md:w-1/2">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-medium text-[var(--color-obsidian)]">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-[var(--color-warm-gray)]">
            Sign in to continue
          </p>

          {step === "phone" ? (
            <div className="mt-6 space-y-4">
              {/* Phone input */}
              <div>
                <label className="text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)]">
                  Phone Number
                </label>
                <div className="mt-2 flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-white)]">
                  <span className="border-r border-[var(--color-border)] px-3 py-2.5 text-xs text-[var(--color-warm-gray)]">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="9876543210"
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--color-obsidian)] placeholder:text-[var(--color-warm-gray)] focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-obsidian)] text-[10px] font-medium uppercase tracking-widest text-[var(--color-ivory)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)] disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--color-border)]" />
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-warm-gray)]">
                  or
                </span>
                <div className="h-px flex-1 bg-[var(--color-border)]" />
              </div>

              {/* Google sign in */}
              <button
                onClick={signInWithGoogle}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-white)] text-[10px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] transition-colors hover:border-[var(--color-obsidian)]"
              >
                Continue with Google
              </button>

              <p className="text-center text-xs text-[var(--color-warm-gray)]">
                New here?{" "}
                <Link
                  href="/register"
                  className="font-medium text-[var(--color-gold)]"
                >
                  Create account
                </Link>
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {/* OTP info */}
              <p className="text-sm text-[var(--color-warm-gray)]">
                OTP sent to{" "}
                <span className="font-medium text-[var(--color-obsidian)]">
                  +91 {phone}
                </span>
              </p>

              {/* OTP boxes */}
              <div className="flex justify-between">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOTPChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="h-12 w-10 rounded-md border border-[var(--color-border)] bg-[var(--color-white)] text-center text-sm font-medium text-[var(--color-obsidian)] focus:border-[var(--color-gold)] focus:outline-none"
                  />
                ))}
              </div>

              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}

              <button
                onClick={() => handleVerifyOTP()}
                disabled={loading || otp.some((d) => !d)}
                className="flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-obsidian)] text-[10px] font-medium uppercase tracking-widest text-[var(--color-ivory)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)] disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              {/* Resend */}
              <div className="flex items-center justify-between">
                {resendTimer > 0 ? (
                  <span className="text-xs text-[var(--color-warm-gray)]">
                    Resend OTP in {resendTimer}s
                  </span>
                ) : (
                  <button
                    onClick={handleResend}
                    className="text-xs font-medium text-[var(--color-gold)]"
                  >
                    Resend OTP
                  </button>
                )}
                <button
                  onClick={() => {
                    setStep("phone");
                    setOTP(["", "", "", "", "", ""]);
                    setError("");
                  }}
                  className="text-xs text-[var(--color-warm-gray)]"
                >
                  Change number
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
