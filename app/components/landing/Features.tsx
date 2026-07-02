"use client";

import { motion } from "framer-motion";
import { 
  Calendar, 
  Video, 
  ListOrdered, 
  BrainCircuit, 
  FileLock2, 
  TrendingUp 
} from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Online Scheduling",
      desc: "Instantly view practitioner availability schedules in real-time, pick suitable slots, and coordinate follow-up alerts.",
      icon: Calendar,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10"
    },
    {
      title: "Virtual Consultation Room",
      desc: "Conduct high-fidelity video/audio consultations with built-in text chat, document review, and live digital prescriptions.",
      icon: Video,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: "Real-time Queue Monitor",
      desc: "Synchronized patient queues displaying exact positions, live wait times, and instant notifications when it is your turn.",
      icon: ListOrdered,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "AI Symptom Checker",
      desc: "Interactive preliminary consultation matching medical complaints to specialized branches and recommended physicians.",
      icon: BrainCircuit,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    },
    {
      title: "Encrypted Records Vault",
      desc: "HIPAA-compliant document storage encrypting medical records and clinical scan files at rest under local AES-256 standards.",
      icon: FileLock2,
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      title: "Health Analytics Console",
      desc: "Visual charts detailing weekly appointments, clinic revenue, consultation logs, and medical report PDF downloads.",
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            A Complete Medical Ecosystem
          </h2>
          <p className="mt-4 text-muted-foreground">
            Explore advanced components developed to digitize healthcare workflow, safeguard patient records, and enhance telemedicine consultation experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="group relative rounded-2xl p-6 glass-card border border-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">
                    {feature.title}
                  </h3>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
