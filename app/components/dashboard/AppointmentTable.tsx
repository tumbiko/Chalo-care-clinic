"use client";

import React from "react";
import { useQueueStore } from "@/store/useQueueStore";

export function AppointmentTable() {
  const { appointments, activeUser } = useQueueStore();
  
  // Filter appointments for active user (if patient)
  const patientApts = appointments.filter(a => a.patientId === activeUser?.id || a.patientId === "pat-1");

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="p-4 font-bold text-foreground">Doctor</th>
            <th className="p-4 font-bold text-foreground">Specialty</th>
            <th className="p-4 font-bold text-foreground">Date & Time</th>
            <th className="p-4 font-bold text-foreground">Symptoms</th>
            <th className="p-4 font-bold text-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {patientApts.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-muted-foreground">No recent appointments found.</td>
            </tr>
          ) : (
            patientApts.map((apt) => (
              <tr key={apt.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                <td className="p-4 font-bold text-foreground">{apt.doctorName}</td>
                <td className="p-4 text-muted-foreground">{apt.doctorSpecialization}</td>
                <td className="p-4 text-muted-foreground">
                  {new Date(apt.dateTime).toLocaleDateString()} at{" "}
                  {new Date(apt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="p-4 text-muted-foreground truncate max-w-xs">{apt.symptoms}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    apt.status === "COMPLETED" 
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                      : apt.status === "CONFIRMED"
                      ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                      : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  }`}>
                    {apt.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
