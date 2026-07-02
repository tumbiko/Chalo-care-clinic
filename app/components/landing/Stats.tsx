"use client";

import { motion } from "framer-motion";
import { Clock, CalendarDays, ShieldAlert, Radio } from "lucide-react";

export default function Stats() {
  const stats = [
    {
      id: 1,
      value: "60%",
      label: "Reduced Waiting Time",
      desc: "Instant live queue slots optimize consultation transitions.",
      icon: Clock,
      color: "text-cyan-500 bg-cyan-500/10",
      border: "border-cyan-500/20"
    },
    {
      id: 2,
      value: "24/7",
      label: "Appointment Access",
      desc: "Book, modify, or join patient consultation lines any hour.",
      icon: CalendarDays,
      color: "text-primary bg-primary/10",
      border: "border-primary/20"
    },
    {
      id: 3,
      value: "AES-256",
      label: "Encrypted Medical Records",
      desc: "Sensitive patient clinical files encrypted at rest for maximum confidentiality.",
      icon: ShieldAlert,
      color: "text-emerald-500 bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      id: 4,
      value: "100%",
      label: "Remote Consultations",
      desc: "Fully virtual video consultations, chats, and digital prescriptions.",
      icon: Radio,
      color: "text-indigo-500 bg-indigo-500/10",
      border: "border-indigo-500/20"
    }
  ];

  return (
    <section id="stats" className="py-24 relative overflow-hidden bg-card/30 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Streamlining Healthcare Excellence
          </h2>
          <p className="mt-4 text-muted-foreground">
            Our clinic infrastructure is engineered to remove bottlenecks and expand remote access to professional specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`rounded-2xl p-6 glass-card border ${stat.border} shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col justify-between`}
              >
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl ${stat.color} transition-all duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-foreground tracking-tight group-hover:scale-110 transition-transform">
                    {stat.value}
                  </span>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-base font-bold text-foreground tracking-tight">
                    {stat.label}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {stat.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
