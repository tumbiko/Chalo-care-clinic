"use client";

import Link from "next/link";
import { Stethoscope, ExternalLink, Globe, Link2, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border/50 py-16 relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Brand Column */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
              Chalo Care
            </span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Revolutionizing healthcare accessibility by bringing board-certified clinicians, secure medical records, and live queueing technology straight to your browser.
          </p>
          <div className="flex gap-4 mt-2">
            <a href="#" className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Globe className="w-4 h-4" />
            </a>

            <a href="#" className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Link2 className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-foreground">Services</h4>
          <Link href="#features" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Telehealth Rooms
          </Link>
          <Link href="#features" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            AI Diagnostics
          </Link>
          <Link href="#features" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Queue Management
          </Link>
          <Link href="#features" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Secure Records Vault
          </Link>
        </div>

        {/* Links Column 2 */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-foreground">Portal Access</h4>
          <Link href="/patient" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Patient Console
          </Link>
          <Link href="/doctor" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Doctor Console
          </Link>
          <Link href="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Admin Console
          </Link>
        </div>

        {/* Newsletter Column */}
        <div className="md:col-span-3 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-foreground">Health Newsletter</h4>
          <p className="text-xs text-muted-foreground">
            Subscribe to get weekly wellness tips and clinic schedules.
          </p>
          <form className="flex gap-2 mt-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="px-3.5 py-2 rounded-lg text-xs bg-muted border border-border focus:outline-none focus:border-primary w-full text-foreground"
            />
            <button className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-all">
              Join
            </button>
          </form>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-border/30 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground">
          © {currentYear} Chalo Care Clinic. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          Designed with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for medical innovation.
        </p>
      </div>
    </footer>
  );
}
