"use client";

import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const data = [
  { time: "8 AM", value: 95 },
  { time: "10 AM", value: 120 },
  { time: "12 PM", value: 140 },
  { time: "2 PM", value: 110 },
  { time: "4 PM", value: 98 },
  { time: "6 PM", value: 105 },
  { time: "8 PM", value: 115 },
];

export function HealthMetricChart() {
  return (
    <div className="w-full h-64 pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="time" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} unit=" mg" />
          <Tooltip 
            contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "10px" }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
          />
          <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorGlucose)" strokeWidth={2} name="Glucose (mg/dL)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
