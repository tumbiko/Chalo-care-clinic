"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueueStore } from "@/store/useQueueStore";
import DashboardShell from "@/app/components/dashboard/dashboardshell";
import { StatCard } from "@/app/components/dashboard/StatCard";
import { AppointmentTable } from "@/app/components/dashboard/AppointmentTable";
import { HealthMetricChart } from "@/app/components/dashboard/HealthMetricChart";
import { checkSymptoms } from "@/lib/mockData";
import { encrypt, decrypt } from "@/lib/encrypt";
import { 
  Activity, 
  Calendar, 
  Clock, 
  FileText, 
  Plus, 
  MessageSquare, 
  ShieldAlert, 
  ChevronRight, 
  Search, 
  Send,
  Lock,
  Unlock,
  CheckCircle,
  Stethoscope,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function PatientDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const {
    activeUser,
    doctors,
    appointments,
    queue,
    messages,
    sendMessage,
    bookAppointment,
    notifications
  } = useQueueStore();

  // Redirect if not patient
  useEffect(() => {
    if (activeUser && activeUser.role !== "PATIENT") {
      router.push(`/${activeUser.role.toLowerCase()}`);
    }
  }, [activeUser, router]);

  // Booking states
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [symptomsInput, setSymptomsInput] = useState("");
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);

  // Symptom checker states
  const [symptomText, setSymptomText] = useState("");
  const [checkerResult, setCheckerResult] = useState<any>(null);

  // Secure Vault states
  const [encryptedFiles, setEncryptedFiles] = useState<Array<{ id: string; name: string; date: string; content: string; decrypted: boolean; key: string }>>([
    {
      id: "rec-1",
      name: "Cardiology Diagnostic Report.pdf",
      date: "2026-06-01",
      content: encrypt("ECG shows normal sinus rhythm. Slight tachycardia observed under stress. Advised low sodium diet."),
      decrypted: false,
      key: "aes-256-gcm-key"
    },
    {
      id: "rec-2",
      name: "Allergy Blood Panel.pdf",
      date: "2026-05-15",
      content: encrypt("High reaction detected for Oak and Birch pollen. IgE levels elevated at 142 kU/L."),
      decrypted: false,
      key: "aes-256-gcm-key"
    }
  ]);

  // Chat states
  const [chatDoctorId, setChatDoctorId] = useState("");
  const [chatInput, setChatInput] = useState("");

  // Find patient queue position
  const patientQueueEntries = queue.filter(q => q.patientId === activeUser?.id && (q.status === "WAITING" || q.status === "ACTIVE"));
  const activeQueueEntry = patientQueueEntries[0]; // first active queue line entry

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedSlot) return;

    bookAppointment(selectedDoctorId, selectedSlot, symptomsInput || "General health inquiry");
    setShowBookingSuccess(true);
    setTimeout(() => {
      setShowBookingSuccess(false);
      setSelectedDoctorId("");
      setSelectedSlot("");
      setSymptomsInput("");
      router.push("/patient?tab=appointments");
    }, 2000);
  };

  const handleSymptomAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomText.trim()) return;

    const analysis = checkSymptoms(symptomText);
    setCheckerResult(analysis);
  };

  const toggleDecryptFile = (id: string) => {
    setEncryptedFiles(prev => prev.map(file => {
      if (file.id === id) {
        return {
          ...file,
          decrypted: !file.decrypted
        };
      }
      return file;
    }));
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatDoctorId || !activeUser) return;

    sendMessage(activeUser.id, chatDoctorId, chatInput);
    setChatInput("");
  };

  // Set default chat doctor if none selected
  useEffect(() => {
    if (!chatDoctorId && doctors.length > 0) {
      setChatDoctorId(doctors[0].id);
    }
  }, [doctors, chatDoctorId]);

  return (
    <DashboardShell role="PATIENT">
      
      {/* Tab 1: Overview / Hub */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          
          {/* Welcome section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-3xl font-black text-foreground">
                Good day, {activeUser?.name || "Patient"}!
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Your medical queue metrics and telemetry dashboards are synchronized.
              </p>
            </div>
            <button
              onClick={() => router.push("/patient?tab=appointments")}
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/95 shadow-md shadow-primary/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Book New Session
            </button>
          </div>

          {/* Quick stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Heart Rate" value="74 bpm" trend="Healthy" icon={Activity} color="text-rose-500" />
            <StatCard title="Upcoming Visits" value={appointments.filter(a => a.patientId === activeUser?.id && a.status === "CONFIRMED").length.toString()} trend="Today/Tomorrow" icon={Calendar} color="text-cyan-500" />
            <StatCard title="Weight Index" value="68.4 kg" trend="No change" icon={Clock} color="text-teal-500" />
            <StatCard title="Encrypted Records" value={(encryptedFiles.length + appointments.filter(a => a.status === "COMPLETED" && a.prescription).length).toString()} trend="Protected" icon={FileText} color="text-amber-500" />
          </div>

          {/* Core Analytics & Queue details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-foreground">Blood Glucose Levels (mg/dL)</h3>
              <HealthMetricChart />
            </div>

            {/* Live Queue tracking card */}
            <div className="lg:col-span-4 rounded-2xl p-6 text-white bg-gradient-to-br from-cyan-600 to-teal-600 shadow-xl shadow-cyan-600/10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-8 -mt-8" />
              
              <div>
                <span className="text-xs uppercase font-bold tracking-wider opacity-75">LIVE WAITING ESTIMATOR</span>
                <h3 className="text-lg font-black mt-1">Virtual Queue Status</h3>
              </div>

              {activeQueueEntry ? (
                <div className="flex flex-col items-center py-6">
                  <div className="w-20 h-20 rounded-full border-4 border-white/20 border-t-white flex items-center justify-center animate-pulse mb-3 bg-white/5">
                    <span className="text-2xl font-black">#{activeQueueEntry.number}</span>
                  </div>
                  <p className="text-sm font-semibold opacity-90">Estimated Queue Number</p>
                  
                  <div className="mt-5 w-full space-y-2.5">
                    <div className="flex justify-between text-xs bg-white/10 p-2.5 rounded-lg">
                      <span className="opacity-80">Clinician</span>
                      <span className="font-bold">{activeQueueEntry.doctorName}</span>
                    </div>
                    <div className="flex justify-between text-xs bg-white/10 p-2.5 rounded-lg">
                      <span className="opacity-80">Wait Time</span>
                      <span className="font-bold">~{activeQueueEntry.estimatedWaitMinutes} Minutes</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center gap-2">
                  <Stethoscope className="w-10 h-10 opacity-40" />
                  <p className="text-sm font-semibold opacity-85">No active queue checkins found.</p>
                  <p className="text-xs opacity-75 max-w-[200px]">Book a virtual checkup slot to join the real-time queueing line.</p>
                </div>
              )}

              <button
                onClick={() => router.push("/patient?tab=appointments")}
                className="w-full py-2.5 mt-2 rounded-xl bg-white text-cyan-600 hover:bg-slate-50 text-sm font-bold transition-all shadow"
              >
                Join Queue Line
              </button>
            </div>
          </div>

          {/* Recent Consultations Table */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-4">Recent Clinic Consultations</h3>
            <AppointmentTable />
          </div>

        </div>
      )}

      {/* Tab 2: Appointment Booking */}
      {activeTab === "appointments" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: booking form */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-bold text-base text-foreground border-b border-border/50 pb-3.5">
                Book Virtual Consultation
              </h3>

              <form onSubmit={handleBookSession} className="flex flex-col gap-4 mt-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground uppercase">Select Practitioner</label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => {
                      setSelectedDoctorId(e.target.value);
                      setSelectedSlot("");
                    }}
                    required
                    className="w-full rounded-lg bg-muted border border-border p-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialization}) - ${d.fee}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDoctorId && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground uppercase">Available Slots</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {doctors.find(d => d.id === selectedDoctorId)?.slots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-1 rounded-lg border text-center text-xs font-bold transition-all ${
                            selectedSlot === slot 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-muted border-border hover:bg-muted/70 text-foreground"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground uppercase">Describe Symptoms</label>
                  <textarea
                    value={symptomsInput}
                    onChange={(e) => setSymptomsInput(e.target.value)}
                    placeholder="Describe chest tightness, muscle aches, skincare concerns..."
                    rows={3}
                    className="w-full rounded-lg bg-muted border border-border p-3 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedDoctorId || !selectedSlot || showBookingSuccess}
                  className="w-full mt-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {showBookingSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Session Reservation Complete!
                    </>
                  ) : (
                    "Reserve Slot & Join Queue"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right panel: Doctor list & credentials */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-bold text-base text-foreground border-b border-border/50 pb-3.5">
                Our Medical Staff Registry
              </h3>

              <div className="flex flex-col gap-4 mt-5">
                {doctors.map(d => (
                  <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/60 hover:bg-muted/20 transition-all gap-4">
                    <div className="flex items-start gap-3.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={d.avatar} alt={d.name} className="w-10 h-10 rounded-full object-cover border" />
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{d.name}</h4>
                        <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-0.5">{d.specialization}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed max-w-sm">{d.bio}</p>
                        <div className="flex items-center gap-3.5 mt-2">
                          <span className="text-xs font-bold text-muted-foreground flex items-center gap-0.5">
                            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                            {d.rating} Rating
                          </span>
                          <span className="text-xs font-bold text-muted-foreground">
                            {d.experience} Yrs Experience
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-border/40 pt-3.5 sm:pt-0">
                      <span className="text-sm font-bold text-foreground">${d.fee} / checkup</span>
                      <button
                        onClick={() => {
                          setSelectedDoctorId(d.id);
                          setSelectedSlot("");
                        }}
                        className="sm:mt-2.5 px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold transition-all"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: AI Symptom Checker */}
      {activeTab === "symptoms" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Checker Input */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3.5">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-foreground">
                  AI Symptom Analyzer (Interactive Dev Mode)
                </h3>
              </div>

              <form onSubmit={handleSymptomAnalysis} className="flex flex-col gap-4 mt-5">
                <p className="text-sm text-muted-foreground leading-normal">
                  Describe what symptoms you are experiencing (e.g. chest pain, severe tension headache, itchy skin rashes) to find recommendations.
                </p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground uppercase">Describe how you feel:</label>
                  <textarea
                    value={symptomText}
                    onChange={(e) => setSymptomText(e.target.value)}
                    placeholder="Type details here..."
                    rows={4}
                    required
                    className="w-full rounded-lg bg-muted border border-border p-3 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!symptomText.trim()}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/95 transition-all shadow-md"
                >
                  Analyze Symptoms & Match specialty
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel: Checker Output */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-full flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground border-b border-border/50 pb-3.5">
                  Clinical Triage Report
                </h3>

                {checkerResult ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">Matched Specialty:</span>
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary uppercase">
                        {checkerResult.specialty}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">Triage Severity:</span>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                        checkerResult.severity === "HIGH" 
                          ? "bg-rose-500/15 text-rose-500" 
                          : checkerResult.severity === "MEDIUM"
                          ? "bg-amber-500/15 text-amber-500"
                          : "bg-emerald-500/15 text-emerald-500"
                      }`}>
                        {checkerResult.severity}
                      </span>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-xl border text-xs leading-relaxed text-foreground">
                      <span className="font-bold block mb-1">Urgency Advice:</span>
                      {checkerResult.urgency}
                    </div>

                    <div>
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2">Self-Care Guidelines:</span>
                      <ul className="space-y-2">
                        {checkerResult.advice.map((item: string, idx: number) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-3 h-full">
                    <ShieldAlert className="w-10 h-10 text-muted-foreground/30 animate-bounce" />
                    <p className="text-sm font-bold text-foreground">Analyzer Ready</p>
                    <p className="text-xs text-muted-foreground max-w-xs leading-normal">
                      Input your current diagnostic details in the analyzer form, and clinical advice will be rendered securely here.
                    </p>
                  </div>
                )}
              </div>

              {checkerResult && (
                <div className="border-t border-border/50 pt-4 mt-4">
                  <button
                    onClick={() => {
                      const doc = doctors.find(d => d.name === checkerResult.recommendedDoctor) || doctors[0];
                      setSelectedDoctorId(doc.id);
                      router.push("/patient?tab=appointments");
                    }}
                    className="w-full py-2.5 rounded-lg bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 transition-all flex items-center justify-center gap-1.5"
                  >
                    Book Consultation with {checkerResult.recommendedDoctor}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Tab 4: Encrypted Records Vault */}
      {activeTab === "vault" && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-border/50 pb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Encrypted Medical Records Vault</h2>
              <p className="text-sm text-muted-foreground mt-0.5">HIPAA-compliant document management with client-side decryption.</p>
            </div>
            <button
              onClick={() => {
                alert("This simulation allows you to download and review medical prescriptions dynamically!");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold"
            >
              Upload Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Decryptable Files List */}
            {encryptedFiles.map((file) => (
              <div key={file.id} className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{file.name}</h4>
                      <span className="text-xs text-muted-foreground">{file.date}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleDecryptFile(file.id)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                    title={file.decrypted ? "Lock record" : "Decrypt record"}
                  >
                    {file.decrypted ? <Unlock className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-rose-500" />}
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-muted/30 border border-border/40 text-xs leading-relaxed">
                  <span className="font-bold text-foreground block mb-1">
                    {file.decrypted ? "Decrypted Content:" : "Encrypted Content (Ciphertext):"}
                  </span>
                  <p className={`font-mono text-xs break-all ${file.decrypted ? "text-foreground font-sans text-xs" : "text-muted-foreground"}`}>
                    {file.decrypted ? decrypt(file.content) : file.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Doctor written prescriptions */}
            {appointments
              .filter(a => a.patientId === activeUser?.id && a.status === "COMPLETED" && a.prescription)
              .map((apt) => (
                <div key={apt.id} className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Prescription - {apt.doctorName}</h4>
                        <span className="text-xs text-muted-foreground">{new Date(apt.dateTime).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs leading-relaxed">
                    <span className="font-bold text-foreground block mb-1">Diagnosis:</span>
                    <p className="text-muted-foreground mb-2">{apt.diagnosis}</p>
                    <span className="font-bold text-foreground block mb-1">Prescribed Meds:</span>
                    <p className="text-foreground font-mono bg-background p-2 rounded border">{apt.prescription}</p>
                  </div>
                </div>
              ))}

          </div>
        </div>
      )}

      {/* Tab 5: Chat with Doctors */}
      {activeTab === "chat" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg h-[550px] flex">
          
          {/* Left panel: doctor list */}
          <div className="w-1/3 border-r border-border/50 flex flex-col bg-muted/20">
            <div className="p-4 border-b border-border/50 flex items-center bg-card">
              <span className="text-sm font-bold text-foreground">Practitioner Contacts</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {doctors.map(d => (
                <button
                  key={d.id}
                  onClick={() => setChatDoctorId(d.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    chatDoctorId === d.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.avatar} alt={d.name} className="w-8 h-8 rounded-full object-cover border" />
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-bold text-foreground truncate">{d.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{d.specialization}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right panel: chat dialogue */}
          <div className="flex-1 flex flex-col bg-card">
            
            {/* Header */}
            {chatDoctorId ? (
              (() => {
                const doc = doctors.find(d => d.id === chatDoctorId);
                return (
                  <>
                    <div className="p-4 border-b border-border/50 flex items-center gap-3 bg-muted/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={doc?.avatar} alt={doc?.name} className="w-8 h-8 rounded-full object-cover border" />
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{doc?.name}</h4>
                        <span className="text-xs text-muted-foreground font-semibold">{doc?.specialization}</span>
                      </div>
                    </div>

                    {/* Messages panel */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                      {messages
                        .filter(m => (m.senderId === activeUser?.id && m.receiverId === chatDoctorId) || (m.senderId === chatDoctorId && m.receiverId === activeUser?.id))
                        .map(msg => (
                          <div
                            key={msg.id}
                            className={`flex flex-col max-w-[70%] rounded-2xl p-3 text-sm leading-relaxed ${
                              msg.senderId === activeUser?.id
                                ? "bg-primary text-primary-foreground self-end rounded-tr-none ml-auto"
                                : "bg-muted border border-border/40 text-foreground self-start rounded-tl-none"
                            }`}
                          >
                            <p>{msg.content}</p>
                            <span className={`text-[10px] mt-1 self-end ${
                              msg.senderId === activeUser?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        ))}
                    </div>

                    {/* Chat footer input */}
                    <form onSubmit={handleSendChat} className="p-4 border-t border-border/50 flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a secure message..."
                        className="flex-1 rounded-lg bg-muted border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </>
                );
              })()
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30" />
                <h4 className="text-sm font-bold text-foreground">Select a Doctor</h4>
                <p className="text-xs text-muted-foreground">Choose a medical contact on the sidebar to initiate a secure encrypted session.</p>
              </div>
            )}

          </div>
        </div>
      )}

    </DashboardShell>
  );
}

export default function PatientDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-semibold">Loading Patient Portal...</p>
        </div>
      </div>
    }>
      <PatientDashboardContent />
    </Suspense>
  );
}