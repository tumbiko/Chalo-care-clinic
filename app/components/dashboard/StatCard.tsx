"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  color: string;
}

export function StatCard({ title, value, trend, icon: Icon, color }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground font-medium">{title}</span>
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        <p className="text-[10px] text-emerald-500 font-semibold">{trend}</p>
      </div>
      <div className={`p-3 rounded-xl bg-muted/50 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
