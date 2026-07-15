"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      quote: "Chalo Care completely cut down my medical waiting times. I joined the queue from home, checked in, and saw Dr. Jenkins online in under 15 minutes. Pure genius!",
      author: "Alex Rivera",
      role: "Heart Patient",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&h=150&fit=crop",
      stars: 5
    },
    {
      id: 2,
      quote: "The digital prescription suite and HIPAA-encrypted history vault allow me to practice telehealth safely. Highly recommend Chalo Care Clinic for private practices.",
      author: "Dr. Sarah Jenkins",
      role: "Consulting Cardiologist",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=150&h=150&fit=crop",
      stars: 5
    },
    {
      id: 3,
      quote: "Managing 15+ doctors, scheduling clinic hours, and monitoring live queue capacities has never been this smooth. The admin dashboards have all stats in one view.",
      author: "Derrick Banda",
      role: "Operations Director",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&fit=crop",
      stars: 5
    }
  ];

  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-24 bg-card/30 border-y border-border/50 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by Doctors & Patients
          </h2>
          <p className="mt-4 text-muted-foreground">
            Hear from our medical staff and active patients about their experiences.
          </p>
        </div>

        <div className="relative min-h-[300px] flex flex-col justify-center items-center">
          <Quote className="absolute top-0 left-0 w-24 h-24 text-primary/5 -translate-y-8 -translate-x-6 z-0" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center relative z-10 flex flex-col items-center gap-6"
            >
              <div className="flex gap-1">
                {[...Array(testimonials[active].stars)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>

              <blockquote className="text-xl md:text-2xl font-medium italic text-foreground max-w-2xl leading-normal">
                &ldquo;{testimonials[active].quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3 mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={testimonials[active].avatar}
                  alt={testimonials[active].author}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                />
                <div className="text-left">
                  <cite className="not-italic font-bold text-foreground text-sm block">
                    {testimonials[active].author}
                  </cite>
                  <span className="text-xs text-muted-foreground">
                    {testimonials[active].role}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex gap-4 mt-12 relative z-10">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full border border-border hover:bg-muted text-foreground transition-colors"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-full border border-border hover:bg-muted text-foreground transition-colors"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
