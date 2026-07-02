"use client";

import { useTheme } from "../ThemeContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useQueueStore } from "@/store/useQueueStore";
import { Sun, Moon, Stethoscope, ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { activeUser } = useQueueStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getPortalLink = () => {
    if (!activeUser) return "/patient";
    return `/${activeUser.role.toLowerCase()}`;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border py-4 shadow-lg"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-md">
            <Stethoscope className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
            Chalo Care
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#stats" className="text-sm font-medium hover:text-primary transition-colors">
            Stats
          </Link>
          <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
            Testimonials
          </Link>
          <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Portal Button */}
          <Link
            href={getPortalLink()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all font-semibold shadow-md shadow-primary/20"
          >
            Enter Portal
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Buttons */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              <Link
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-2 border-b border-border"
              >
                Features
              </Link>
              <Link
                href="#stats"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-2 border-b border-border"
              >
                Stats
              </Link>
              <Link
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-2 border-b border-border"
              >
                Testimonials
              </Link>
              <Link
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-2 border-b border-border"
              >
                FAQ
              </Link>
              <Link
                href={getPortalLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
              >
                Enter Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
