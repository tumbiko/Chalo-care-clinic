"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueueStore } from "@/store/useQueueStore";
import { useTheme } from "../ThemeContext";
import {
  Stethoscope,
  Activity,
  Bell,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Menu,
  X,
  Database,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardShellProps {
  children: React.ReactNode;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
}

export default function DashboardShell({ children, role }: DashboardShellProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { activeUser, setActiveUser, notifications, markNotificationsAsRead, fetchInitialData } = useQueueStore();
  const [showNotif, setShowNotif] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  React.useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setActiveUser(data);
        }
      })
      .catch(() => {});

    // Fetch doctors, appointments, and queue entries from the database
    fetchInitialData();
  }, [setActiveUser, fetchInitialData]);

  const handleLogout = async () => {
    setActiveUser(null);
    const { signOutAction } = await import("@/app/actions/auth");
    await signOutAction();
  };

  const menuItems = {
    PATIENT: [
      { label: "Dashboard Hub", href: "/patient" },
      { label: "Appointments", href: "/patient?tab=appointments" },
      { label: "AI Symptom Checker", href: "/patient?tab=symptoms" },
      { label: "Encrypted Records Vault", href: "/patient?tab=vault" },
      { label: "Chat with Doctors", href: "/patient?tab=chat" },
    ],
    DOCTOR: [
      { label: "Overview Panel", href: "/doctor" },
      { label: "Active Consultations", href: "/doctor?tab=consultations" },
      { label: "Chat with Patients", href: "/doctor?tab=chat" },
      { label: "Schedule Manager", href: "/doctor?tab=schedule" },
      { label: "Analytics Panel", href: "/doctor?tab=analytics" },
    ],
    ADMIN: [
      { label: "Clinic Analytics", href: "/admin" },
      { label: "Doctor Registry", href: "/admin?tab=doctors" },
      { label: "Patient Directory", href: "/admin?tab=patients" },
      { label: "Queue Analytics", href: "/admin?tab=queue" },
      { label: "Clinic Schedules", href: "/admin?tab=schedules" },
    ],
  };

  const handleRoleSwap = async (targetRole: "PATIENT" | "DOCTOR" | "ADMIN") => {
    const defaultUsers = {
      PATIENT: { id: "pat-1", name: "Alex Rivera", email: "alex@example.com", role: "PATIENT" as const },
      DOCTOR: { id: "doc-5", name: "Dr. Priya Patel", email: "priya@chalocare.com", role: "DOCTOR" as const },
      ADMIN: { id: "admin-1", name: "Administrator", email: "admin@chalocare.com", role: "ADMIN" as const },
    };
    
    const user = defaultUsers[targetRole];
    
    try {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
    } catch (e) {
      console.error("Failed to update session cookie for role swap:", e);
    }

    setActiveUser(user);
    router.push(`/${targetRole.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/60 bg-card/40 backdrop-blur-md sticky top-0 h-screen p-5 justify-between z-30">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Chalo Care
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">v1.0</span>
          </Link>

          {/* User badge */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
            <div className="w-9 h-9 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-sm">
              {activeUser?.name?.charAt(0) || role.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold truncate">{activeUser?.name || "Active Session"}</h4>
              <p className="text-xs text-muted-foreground capitalize mt-0.5 font-semibold px-1.5 py-0.5 bg-muted rounded w-max">
                {role.toLowerCase()}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1.5">
            {menuItems[role].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-all group"
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-500" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          {/* Demo role switcher */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 text-white flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <Database className="w-3.5 h-3.5" />
              DEMO SWITCHER
            </div>
            <p className="text-xs text-slate-300 leading-normal">Toggle dashboard roles:</p>
            <div className="grid grid-cols-3 gap-1 mt-1">
              {(["PATIENT", "DOCTOR", "ADMIN"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwap(r)}
                  className={`py-1 rounded text-xs font-bold transition-all ${
                    role === r ? "bg-cyan-500 text-white" : "bg-white/10 hover:bg-white/20 text-slate-200"
                  }`}
                >
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-colors w-full"
          >
            <span>Sign Out</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border/50 bg-card/30 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold tracking-tight flex items-center gap-1.5 capitalize">
              <Activity className="w-4 h-4 text-cyan-500" />
              {role.toLowerCase()} Console
            </h1>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotif(!showNotif);
                  if (!showNotif) markNotificationsAsRead();
                }}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-3 w-80 rounded-xl bg-card border border-border shadow-xl p-4 z-50 flex flex-col gap-3 max-h-[350px] overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <h5 className="text-sm font-bold">Notifications</h5>
                    <span className="text-xs text-muted-foreground">Recent events</span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No new notifications.</p>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-2 rounded bg-muted/30 text-xs leading-normal text-muted-foreground border-l-2 border-cyan-500">
                          <p className="text-foreground font-medium">{n.text}</p>
                          <span className="text-[10px] text-muted-foreground mt-0.5 block">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold text-xs select-none">
              {activeUser?.name?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-background/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-72 bg-card border-r border-border p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-cyan-500" />
                    <span className="text-base font-bold bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">
                      Chalo Care
                    </span>
                  </Link>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold">
                    {activeUser?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{activeUser?.name || "Active Session"}</h4>
                    <span className="text-xs font-bold bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded capitalize">
                      {role.toLowerCase()}
                    </span>
                  </div>
                </div>

                <nav className="flex flex-col gap-1">
                  {menuItems[role].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-3 rounded-xl text-sm font-semibold hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 text-white flex flex-col gap-2">
                  <span className="text-xs font-bold text-cyan-400">DEMO SWITCHER</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(["PATIENT", "DOCTOR", "ADMIN"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => { handleRoleSwap(r); setMobileMenuOpen(false); }}
                        className={`py-1 rounded text-xs font-bold ${role === r ? "bg-cyan-500 text-white" : "bg-white/10 hover:bg-white/20 text-slate-200"}`}
                      >
                        {r.charAt(0) + r.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 w-full"
                >
                  <span>Sign Out</span>
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}