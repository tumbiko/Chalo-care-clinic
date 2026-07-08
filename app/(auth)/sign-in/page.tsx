"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import { signInAction } from "@/app/actions/auth";
import { Stethoscope, Key, Mail, ShieldAlert, ArrowRight, ArrowLeft, CheckCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ForgotStep = "idle" | "request" | "sent" | "reset" | "done";

export default function SignIn() {
  const [state, formAction, isPending] = useActionState(signInAction, null);

  // Forgot password flow state
  const [forgotStep, setForgotStep] = useState<ForgotStep>("idle");
  const [forgotEmail, setForgotEmail] = useState("");
  const [devToken, setDevToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || "Something went wrong.");
      } else {
        if (data.devToken) setDevToken(data.devToken);
        setForgotStep("sent");
      }
    } catch {
      setForgotError("Network error. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters.");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || "Something went wrong.");
      } else {
        setForgotStep("done");
      }
    } catch {
      setForgotError("Network error. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const resetForgotFlow = () => {
    setForgotStep("idle");
    setForgotEmail("");
    setDevToken("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotError("");
  };

  const showForgot = forgotStep !== "idle";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12 px-6">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3 translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-card/60 backdrop-blur-xl border border-border/80 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 text-center mb-8">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary w-max">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-foreground">
            {showForgot ? "Reset Password" : "Welcome Back"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {showForgot
              ? "We'll help you get back into your account."
              : "Access your secured patient, clinician, or admin portal."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* ── SIGN IN FORM ── */}
          {!showForgot && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {state?.error && (
                <div className="p-3.5 mb-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5 animate-pulse">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{state.error}</p>
                </div>
              )}

              <form action={formAction} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl bg-muted/50 border border-border pl-10 pr-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotStep("request")}
                      className="text-[10px] text-primary font-bold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-muted/50 border border-border pl-10 pr-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1.5"
                >
                  {isPending ? "Verifying Credentials..." : "Authenticate Session"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-[11px] text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/sign-up" className="text-primary font-bold hover:underline">
                    Create Account
                  </Link>
                </p>
              </div>

              {/* Demo Credentials Box */}
              <div className="mt-8 p-4 bg-muted/30 border border-border/40 rounded-2xl flex flex-col gap-2 text-[10px] leading-relaxed">
                <span className="font-bold text-foreground uppercase text-[9px] tracking-wider text-cyan-600 dark:text-cyan-400">
                  Developer Access Credentials (Mock Fallback)
                </span>
                <div className="grid grid-cols-1 gap-1.5 text-muted-foreground">
                  <div>🔑 **Patient**: `alex@example.com` / `patient123`</div>
                  <div>🔑 **Doctor**: `doc-5` / `doctor123`</div>
                  <div>🔑 **Admin**: `admin@chalocare.com` / `admin123`</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 1: Request Reset ── */}
          {forgotStep === "request" && (
            <motion.div
              key="request"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={resetForgotFlow}
                className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground font-semibold mb-6 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>

              <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                Enter the email address associated with your account and we&apos;ll generate a password reset link.
              </p>

              {forgotError && (
                <div className="p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" /> {forgotError}
                </div>
              )}

              <form onSubmit={handleForgotRequest} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl bg-muted/50 border border-border pl-10 pr-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {forgotLoading ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                  ) : (
                    <><ArrowRight className="w-4 h-4" /> Send Reset Link</>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── STEP 2: Sent Confirmation ── */}
          {forgotStep === "sent" && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col items-center gap-3 text-center py-4">
                <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Reset Link Generated</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  In production this would be emailed to <span className="font-bold text-foreground">{forgotEmail}</span>.
                  During development, use the token below to reset your password.
                </p>
              </div>

              {devToken && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
                  <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase mb-1.5">Dev Token (expires in 1 hr)</p>
                  <p className="text-[10px] font-mono text-foreground break-all">{devToken}</p>
                </div>
              )}

              <button
                onClick={() => setForgotStep("reset")}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-2"
              >
                <Key className="w-3.5 h-3.5" /> Enter New Password
              </button>
              <button
                onClick={resetForgotFlow}
                className="w-full py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                Back to Sign In
              </button>
            </motion.div>
          )}

          {/* ── STEP 3: New Password Form ── */}
          {forgotStep === "reset" && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={() => setForgotStep("sent")}
                className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground font-semibold mb-6 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              {forgotError && (
                <div className="p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" /> {forgotError}
                </div>
              )}

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">Reset Token</label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={e => setResetToken(e.target.value)}
                    placeholder="Paste the reset token here"
                    className="w-full rounded-xl bg-muted/50 border border-border px-4 py-3 text-xs font-mono text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full rounded-xl bg-muted/50 border border-border pl-10 pr-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full rounded-xl bg-muted/50 border border-border pl-10 pr-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {forgotLoading ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Updating...</>
                  ) : (
                    <><CheckCircle className="w-3.5 h-3.5" /> Set New Password</>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── STEP 4: Done ── */}
          {forgotStep === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-5 text-center py-4"
            >
              <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Password Updated!</h3>
                <p className="text-xs text-muted-foreground mt-1">Your password has been changed. You can now sign in with your new credentials.</p>
              </div>
              <button
                onClick={resetForgotFlow}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
