"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      q: "How does the real-time queueing system work?",
      a: "When you book a virtual consultation, you can check into the queue up to 1 hour before your appointment. The portal assigns you a number and provides a live, synchronized wait time estimate. You will receive an alert when the doctor admits you into the active consultation room."
    },
    {
      q: "Are my medical records safe and encrypted?",
      a: "Absolutely. Chalo Care uses AES-256-GCM encryption at rest to protect sensitive clinical records. Diagnostics, medical history entries, and prescriptions are stored as secure ciphertexts, compliant with HIPAA data-security standards."
    },
    {
      q: "What do I need for a virtual consultation?",
      a: "You only need a modern web browser on a smartphone, tablet, or laptop equipped with a working camera and microphone. The portal handles video streams and chats inside your browser session without requiring external apps."
    },
    {
      q: "Can I download my prescriptions and diagnosis?",
      a: "Yes. Once a doctor completes an appointment, they generate a digital prescription. You can view this instantly inside your Patient Vault and download a validated PDF copy for pharmacies or insurance archives."
    },
    {
      q: "How do you handle emergency requests?",
      a: "For immediate life-threatening conditions, please call emergency services. For urgent clinic matters, patient accounts can trigger an 'Emergency Queue Request' which prioritizes their booking slot at the top of the General Practitioner list."
    }
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Quickly locate answers to common administrative, tech-support, and safety questions.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="flex items-center justify-between w-full px-6 py-5 text-left font-bold text-base text-foreground hover:bg-muted/30 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <Minus className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 pt-2 text-sm text-muted-foreground leading-relaxed border-t border-border/30">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
