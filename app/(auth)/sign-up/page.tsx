"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { signUpAction } from "@/app/actions/auth";
import { Stethoscope, Key, Mail, User, ShieldAlert, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SignUp() {
  const [state, formAction, isPending] = useActionState(signUpAction, null);

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
          <h2 className="text-xl font-black tracking-tight text-foreground">Create Account</h2>
          <p className="text-sm text-muted-foreground">Create your patient account to book appointments and access care.</p>
        </div>

        {/* Action state error banner */}
        {state?.error && (
          <div className="p-3.5 mb-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5 animate-pulse">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{state.error}</p>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <input
                name="name"
                type="text"
                required
                placeholder="John Doe"
                className="w-full rounded-xl bg-muted/50 border border-border pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl bg-muted/50 border border-border pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Password</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl bg-muted/50 border border-border pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Role is always PATIENT — doctors are added by the admin */}
          <input type="hidden" name="role" value="PATIENT" />

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 mt-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1.5"
          >
            {isPending ? "Creating Account..." : "Register Profile"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
