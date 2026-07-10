"use client";

import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  Legend,
  BarChart,
  Bar
} from "recharts";
import { adminAnalytics } from "@/lib/mockData";

export function WeeklyRevenueChart() {
  return (
    <div className="w-full h-80 pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={adminAnalytics.weeklyRevenue}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip 
            contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "10px" }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
          />
          <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} activeDot={{ r: 6 }} name="Revenue ($)" />
          <Line type="monotone" dataKey="appointments" stroke="#06b6d4" strokeWidth={2} name="Appointments" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SpecialtyDistributionChart() {
  return (
    <div className="w-full h-80 flex items-center justify-center pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={adminAnalytics.specialtyDistribution}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {adminAnalytics.specialtyDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "10px" }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Fallback for previous import matches
export function ClinicFlowChart() {
  const data = [
    { name: "Mon", patients: 40 },
    { name: "Tue", patients: 30 },
    { name: "Wed", patients: 65 },
    { name: "Thu", patients: 45 },
    { name: "Fri", patients: 90 },
    { name: "Sat", patients: 20 },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
          />
          <Bar dataKey="patients" fill="#0D9488" radius={[10, 10, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}