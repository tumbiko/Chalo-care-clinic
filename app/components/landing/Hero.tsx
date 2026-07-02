"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Stethoscope, Calendar, Heart, Shield, Activity, Star } from "lucide-react";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  } as const;

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  } as const;

  return (
        <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                {/* Hero Left Content */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="lg:col-span-6 flex flex-col items-start text-left gap-6"
                >
                    <motion.span
                        variants={itemVariants}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 backdrop-blur-md"
                    >
                        <Activity className="w-3.5 h-3.5" /> Next-Generation Telemedicine
                    </motion.span>

                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]"
                    >
                        Digital Healthcare <br />
                        <span className="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                            Made Accessible
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-muted-foreground max-w-xl leading-relaxed"
                    >
                        Chalo Care Clinic Portal connects you instantly with specialized medical professionals,
                        manages real-time appointments, and protects your medical vault with secure,
                        HIPAA-inspired encryption.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                        <Link
                            href="/patient"
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95"
                        >
                            <Calendar className="w-5 h-5" /> Book Appointment
                        </Link>
                        <Link
                            href="/patient?tab=appointments"
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm font-semibold hover:bg-muted/80 transition-all hover:scale-105 active:scale-95"
                        >
                            Meet Our Doctors
                        </Link>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-3 gap-6 pt-6 border-t border-border/50 w-full"
                    >
                        <div>
                            <p className="text-2xl font-bold">15k+</p>
                            <p className="text-xs text-muted-foreground">Patients Served</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">99.8%</p>
                            <p className="text-xs text-muted-foreground">Uptime SLA</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">4.9/5</p>
                            <p className="text-xs text-muted-foreground">Patient Rating</p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Hero Right — Interactive Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.3 }}
                    className="lg:col-span-6 relative w-full h-[450px] sm:h-[500px]"
                >
                    <div className="absolute inset-0 rounded-2xl border border-border/60 shadow-2xl bg-card/60 backdrop-blur-md p-6 overflow-hidden flex flex-col gap-6">
                        {/* Browser chrome bar */}
                        <div className="flex items-center justify-between pb-4 border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-xs text-muted-foreground font-mono ml-2">portal.chalocare.com</span>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold tracking-wider uppercase">
                                Patient Console
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 flex-1">
                            {/* Queue Status Widget */}
                            <div className="rounded-xl bg-background/80 p-4 border border-border shadow-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground font-semibold">Active Queue</span>
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black mt-2">02 <span className="text-xs font-normal text-muted-foreground">patients ahead</span></h3>
                                    <p className="text-[11px] text-muted-foreground mt-1">Wait: <span className="text-cyan-600 dark:text-cyan-400 font-bold">12 mins</span></p>
                                </div>
                                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-3">
                                    <div className="bg-cyan-500 h-full w-[75%]" />
                                </div>
                            </div>

                            {/* Heart Metric */}
                            <div className="rounded-xl bg-background/80 p-4 border border-border shadow-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground font-semibold">Heart Health</span>
                                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                                </div>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-3xl font-extrabold tracking-tight">72</span>
                                    <span className="text-xs text-muted-foreground">BPM</span>
                                </div>
                                <div className="w-full h-10 mt-2">
                                    <svg viewBox="0 0 100 30" className="w-full h-full stroke-cyan-500 stroke-2 fill-none">
                                        <path d="M0 15 H20 L25 5 L30 25 L35 15 H50 L53 10 L56 20 L60 15 H80 L85 0 L90 30 L95 15 H100" />
                                    </svg>
                                </div>
                            </div>

                            {/* Security banner */}
                            <div className="col-span-2 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 border border-white/10 shadow-md flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-white/10 text-cyan-400">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold">Medical Vault Encrypted</h4>
                                        <p className="text-[11px] text-slate-300">HIPAA Compliant AES-256 Active</p>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">SECURE</span>
                            </div>

                            {/* Doctor quick card */}
                            <div className="col-span-2 rounded-xl bg-background/80 p-4 border border-border shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=80&h=80&fit=crop"
                                            alt="Doctor"
                                            className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500/40"
                                        />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-bold">Dr. Sarah Jenkins</h5>
                                        <p className="text-[10px] text-muted-foreground">Cardiologist</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-muted">
                                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> 4.9
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating badges */}
                    <div className="absolute -top-4 -right-4 p-3 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-lg hidden sm:flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-semibold">Consultation Room Active</span>
                    </div>
                    <div className="absolute -bottom-4 -left-4 p-3.5 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-lg hidden sm:flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground">Next Reminder</span>
                        <span className="text-[11px] font-bold">Dr. Patel checkup — 10:00 AM</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}