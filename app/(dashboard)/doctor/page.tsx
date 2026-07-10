"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueueStore } from "@/store/useQueueStore";
import DashboardShell from "@/app/components/dashboard/dashboardshell";
import { 
  Users, 
  Activity, 
  Video, 
  Clipboard, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  VideoOff, 
  Send, 
  Star,
  FileText,
  Clock,
  ArrowRight,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function DoctorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const { 
    activeUser, 
    appointments, 
    doctors, 
    queue, 
    messages, 
    sendMessage, 
    fetchMessages,
    advanceQueue, 
    completeAppointment 
  } = useQueueStore();

  // Redirect if not doctor
  useEffect(() => {
    if (activeUser && activeUser.role !== "DOCTOR") {
      router.push(`/${activeUser.role.toLowerCase()}`);
    }
  }, [activeUser, router]);

  // Find active doctor details
  const currentDoctor = doctors.find(d => d.id === activeUser?.id) || doctors.find(d => d.specialization === "General Practitioner");

  // Local active consultation states
  const [activeConsultAptId, setActiveConsultAptId] = useState<string | null>(null);
  const [diagnosisInput, setDiagnosisInput] = useState("");
  const [prescriptionInput, setPrescriptionInput] = useState("");
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [chatInput, setChatInput] = useState("");

  // Doctor metrics
  const doctorAppointments = appointments.filter(a => a.doctorId === currentDoctor?.id);
  const pendingCount = doctorAppointments.filter(a => a.status === "CONFIRMED").length;
  const completedCount = doctorAppointments.filter(a => a.status === "COMPLETED").length;
  
  // Doctor Queue
  const doctorQueue = queue.filter(q => q.doctorId === currentDoctor?.id && (q.status === "WAITING" || q.status === "ACTIVE"));
  const activeQueuePatient = doctorQueue.find(q => q.status === "ACTIVE");

  // Polling for chat messages (Doctor side - Consultations tab)
  useEffect(() => {
    if (activeTab !== "consultations" || !currentDoctor || !activeQueuePatient) return;
    fetchMessages(currentDoctor.id, activeQueuePatient.patientId);
    const interval = setInterval(() => {
      fetchMessages(currentDoctor.id, activeQueuePatient.patientId);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTab, currentDoctor, activeQueuePatient, fetchMessages]);

  // Chat tab state
  const [chatPatientId, setChatPatientId] = useState("");
  const [doctorChatInput, setDoctorChatInput] = useState("");

  // Polling for chat messages (Doctor side - Chat tab)
  useEffect(() => {
    if (activeTab !== "chat" || !currentDoctor || !chatPatientId) return;
    fetchMessages(currentDoctor.id, chatPatientId);
    const interval = setInterval(() => {
      fetchMessages(currentDoctor.id, chatPatientId);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTab, currentDoctor, chatPatientId, fetchMessages]);

  const handleDoctorSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorChatInput.trim() || !chatPatientId || !currentDoctor) return;
    sendMessage(currentDoctor.id, chatPatientId, doctorChatInput);
    setDoctorChatInput("");
  };

  // Build a unique patient contact list from queue + appointments
  const patientContacts = [
    ...new Map(
      [
        ...queue
          .filter(q => q.doctorId === currentDoctor?.id)
          .map(q => ({ id: q.patientId, name: q.patientName, avatar: q.patientAvatar || "" })),
        ...appointments
          .filter(a => a.doctorId === currentDoctor?.id)
          .map(a => ({ id: a.patientId, name: a.patientName, avatar: a.patientAvatar || "" }))
      ].map(p => [p.id, p])
    ).values()
  ];

  const handleNextInQueue = () => {
    if (currentDoctor) {
      advanceQueue(currentDoctor.id);
      
      // Auto link to consultation tab if there is a patient
      const nextActive = queue.find(q => q.doctorId === currentDoctor.id && q.status === "WAITING");
      if (nextActive) {
        // Find if this patient has a confirmed appointment today
        const apt = appointments.find(a => a.patientId === nextActive.patientId && a.doctorId === currentDoctor.id && a.status === "CONFIRMED");
        if (apt) {
          setActiveConsultAptId(apt.id);
        }
      }
    }
  };

  const handleCompleteConsult = () => {
    if (!activeConsultAptId) return;
    
    completeAppointment(activeConsultAptId, diagnosisInput, prescriptionInput);
    
    // Clear states
    setActiveConsultAptId(null);
    setDiagnosisInput("");
    setPrescriptionInput("");
    setIsVideoActive(false);

    // Advance queue for doctor
    if (currentDoctor) {
      advanceQueue(currentDoctor.id);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentDoctor || !activeQueuePatient) return;
    
    sendMessage(currentDoctor.id, activeQueuePatient.patientId, chatInput);
    setChatInput("");
  };

  return (
    <DashboardShell role="DOCTOR">
      
      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-8">
          
          {/* Quick Metrics Header Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-muted-foreground uppercase font-bold">Queue Waiting</span>
              <div className="flex justify-between items-baseline mt-2">
                <h3 className="text-3xl font-black text-foreground">{doctorQueue.filter(q => q.status === "WAITING").length}</h3>
                <span className="text-xs text-primary font-bold">Patients waiting</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-muted-foreground uppercase font-bold">Pending Slots</span>
              <div className="flex justify-between items-baseline mt-2">
                <h3 className="text-3xl font-black text-foreground">{pendingCount}</h3>
                <span className="text-xs text-cyan-500 font-bold">Today's schedule</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-muted-foreground uppercase font-bold">Completed Checks</span>
              <div className="flex justify-between items-baseline mt-2">
                <h3 className="text-3xl font-black text-foreground">{completedCount}</h3>
                <span className="text-xs text-emerald-500 font-bold">Total this week</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-muted-foreground uppercase font-bold">Clinician Rating</span>
              <div className="flex justify-between items-baseline mt-2">
                <h3 className="text-3xl font-black text-foreground">{currentDoctor?.rating || "4.9"}</h3>
                <span className="text-xs text-yellow-500 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" /> average
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Queue Panel */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Live Queue Controller */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <h3 className="font-bold text-base text-foreground">Waiting Line Controller</h3>
                  <button
                    onClick={handleNextInQueue}
                    disabled={doctorQueue.length === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/95 disabled:opacity-50"
                  >
                    Admit Next Patient
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-4 mt-6">
                  {doctorQueue.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      All caught up! No patients currently checked into your line.
                    </div>
                  ) : (
                    doctorQueue.map((item) => (
                      <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        item.status === "ACTIVE" 
                          ? "bg-primary/5 border-primary/30" 
                          : "bg-muted/30 border-border/40"
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            item.status === "ACTIVE" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          }`}>
                            #{item.number}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">{item.patientName}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">Checked In: {new Date(item.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                        </div>

                        <div>
                          {item.status === "ACTIVE" ? (
                            <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase">
                              IN CONSULTATION
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                              WAITING
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right Schedule summary */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Daily schedule listing */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-bold text-base text-foreground border-b border-border/50 pb-4">
                  Today's Schedule ({doctorAppointments.filter(a => a.status === "CONFIRMED").length})
                </h3>
                
                <div className="flex flex-col gap-4 mt-6">
                  {doctorAppointments.filter(a => a.status === "CONFIRMED").length === 0 ? (
                    <p className="text-center py-6 text-sm text-muted-foreground">No pending sessions booked today.</p>
                  ) : (
                    doctorAppointments.filter(a => a.status === "CONFIRMED").map((apt) => (
                      <button
                        key={apt.id}
                        onClick={() => {
                          setActiveConsultAptId(apt.id);
                          // Force scroll/focus to consult interface or tab
                          router.push("/doctor?tab=consultations");
                        }}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted text-left border border-border/30 transition-all"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{apt.patientName}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">Type: {apt.type} • Reason: {apt.symptoms}</p>
                        </div>
                        <span className="text-xs text-primary font-bold">
                          {new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Active Consultations Console */}
      {activeTab === "consultations" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Console area (Video & prescription writer) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Consultation interface widget */}
            {activeConsultAptId ? (
              (() => {
                const activeApt = appointments.find(a => a.id === activeConsultAptId);
                return (
                  <div className="flex flex-col gap-6">
                    {/* Simulated Telehealth Video Screen */}
                    <div className="rounded-xl border border-border bg-slate-950 aspect-video shadow-lg relative overflow-hidden flex items-center justify-center text-white">
                      
                      {isVideoActive ? (
                        <>
                          {/* Simulated remote user camera stream mockup */}
                          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&fit=crop"
                              alt="Patient Stream"
                              className="w-full h-full object-cover opacity-80"
                            />
                            <div className="absolute bottom-4 left-4 p-2 bg-black/60 rounded backdrop-blur-md text-xs font-bold">
                              Live Stream: {activeApt?.patientName} (Patient)
                            </div>
                          </div>

                          {/* Self stream picture-in-picture */}
                          <div className="absolute top-4 right-4 w-32 aspect-video bg-slate-950 border border-white/20 rounded-lg overflow-hidden shadow-md">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={currentDoctor?.avatar}
                              alt="Doctor Stream"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <VideoOff className="w-12 h-12 text-slate-500" />
                          <h4 className="text-base font-bold text-slate-300">Camera Feed Suspended</h4>
                          <p className="text-xs text-slate-400">Click below to activate telehealth transmission.</p>
                        </div>
                      )}

                      {/* Control bar */}
                      <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        <button
                          onClick={() => setIsVideoActive(!isVideoActive)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all ${
                            isVideoActive ? "bg-rose-600 hover:bg-rose-700" : "bg-primary hover:bg-primary/95"
                          }`}
                        >
                          {isVideoActive ? "Mute Feed" : "Start Video Room"}
                        </button>
                      </div>
                    </div>

                    {/* Prescription Writer Form */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
                      <h3 className="font-bold text-base text-foreground flex items-center gap-1.5 border-b border-border/50 pb-3">
                        <Clipboard className="w-4 h-4 text-primary" />
                        Clinical Records & PrescriptionPad
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground uppercase tracking-wider">Diagnosis Details</label>
                          <textarea
                            value={diagnosisInput}
                            onChange={(e) => setDiagnosisInput(e.target.value)}
                            placeholder="Type diagnostic summary..."
                            rows={3}
                            className="w-full rounded-lg bg-muted border border-border p-3 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                          />
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-foreground uppercase tracking-wider">Prescribed Medications</label>
                          <textarea
                            value={prescriptionInput}
                            onChange={(e) => setPrescriptionInput(e.target.value)}
                            placeholder="e.g. Amoxicillin 500mg - 1 capsule every 8 hours..."
                            rows={3}
                            className="w-full rounded-lg bg-muted border border-border p-3 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border/50">
                        <button
                          onClick={() => {
                            setActiveConsultAptId(null);
                            setIsVideoActive(false);
                          }}
                          className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-bold hover:bg-muted"
                        >
                          Defer Session
                        </button>
                        <button
                          onClick={handleCompleteConsult}
                          disabled={!diagnosisInput.trim()}
                          className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/95 disabled:opacity-50 shadow-md"
                        >
                          Complete Consultation & Encrypt
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm flex flex-col items-center justify-center gap-3">
                <Video className="w-12 h-12 text-muted-foreground/30" />
                <h4 className="font-bold text-base text-foreground">No Session Admitted</h4>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Admit a patient from the waiting queue, or click on a daily schedule slot to initiate virtual consulting.
                </p>
                {doctorQueue.length > 0 && (
                  <button
                    onClick={handleNextInQueue}
                    className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold"
                  >
                    Admit Next Patient
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Right Console side panel (Patient file review & chat) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Active patient summary and files */}
            {activeQueuePatient ? (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
                <h3 className="font-bold text-base text-foreground border-b border-border/50 pb-4">
                  Active Patient Record
                </h3>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {activeQueuePatient.patientName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{activeQueuePatient.patientName}</h4>
                    <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">PATIENT</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/40 text-xs leading-relaxed">
                    <span className="font-bold text-foreground block mb-1">Medical Background:</span>
                    Asthma diagnosed in childhood, well controlled. Penicillin allergy.
                  </div>
                  
                  {/* secure chat box with current patient */}
                  <div className="border border-border/50 rounded-xl p-3 bg-muted/10 h-48 flex flex-col justify-between">
                    <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 mb-2">
                      {messages
                        .filter(m => (m.senderId === currentDoctor?.id && m.receiverId === activeQueuePatient.patientId) || (m.senderId === activeQueuePatient.patientId && m.receiverId === currentDoctor?.id))
                        .map(msg => (
                          <div key={msg.id} className={`p-2 rounded text-xs leading-normal ${
                            msg.senderId === currentDoctor?.id ? "bg-primary/15 text-primary border-l-2 border-primary ml-4" : "bg-card border border-border/40 text-muted-foreground mr-4"
                          }`}>
                            <p className="font-medium">{msg.content}</p>
                          </div>
                        ))}
                    </div>

                    <form onSubmit={handleSendChat} className="flex gap-1.5 items-center">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type secure chat..."
                        className="flex-1 rounded-lg bg-card border border-border px-3 py-1.5 text-sm text-foreground focus:outline-none"
                      />
                      <button type="submit" disabled={!chatInput.trim()} className="p-2 rounded-lg bg-primary text-primary-foreground">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm">
                No active patient file loaded.
              </div>
            )}

          </div>

        </div>
      )}

      {/* Tab 3: Schedule Manager */}
      {activeTab === "schedule" && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-bold text-base text-foreground border-b border-border/50 pb-4">
            Availabilities Slot Settings
          </h3>
          <div className="flex flex-col gap-6 mt-6">
            <div>
              <h4 className="text-sm font-bold text-foreground">Current Configured Slots</h4>
              <p className="text-xs text-muted-foreground mt-0.5">These time intervals will map to patient reservation calendars.</p>
              
              <div className="flex flex-wrap gap-2.5 mt-4">
                {currentDoctor?.slots.map((slot) => (
                  <span key={slot} className="px-3 py-1.5 rounded-lg bg-primary/15 text-primary border border-primary/20 text-sm font-bold">
                    {slot}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-border/50 pt-6">
              <h4 className="text-sm font-bold text-foreground">Quick Availability Switcher</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Toggle clinic checkin availability state:</p>
              
              <div className="mt-4 flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${currentDoctor?.isAvailable ? "bg-green-500 animate-pulse" : "bg-rose-500"}`} />
                <span className="text-sm font-bold text-foreground">
                  {currentDoctor?.isAvailable ? "Clinic checkin open" : "Clinic checkin suspended"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Analytics */}
      {activeTab === "analytics" && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-bold text-base text-foreground border-b border-border/50 pb-4">
            Clinician Performance Metrics
          </h3>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            Clinic consultation dashboards sync monthly revenue streams, patient distributions, average ratings, and wait durations. Refer to the admin console for clinic-wide telemetry charts.
          </p>
        </div>
      )}

      {/* Tab 5: Chat with Patients */}
      {activeTab === "chat" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg h-[580px] flex">

          {/* Left panel: patient contact list */}
          <div className="w-1/3 border-r border-border/50 flex flex-col bg-muted/20">
            <div className="p-4 border-b border-border/50 flex items-center gap-2 bg-card">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Patient Contacts</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {patientContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 gap-2 text-center">
                  <Users className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground px-4">No patient contacts yet. Patients will appear here once they book or join your queue.</p>
                </div>
              ) : (
                patientContacts.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => setChatPatientId(patient.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                      chatPatientId === patient.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50 border border-transparent"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-foreground truncate">{patient.name}</h4>
                      <p className="text-xs text-muted-foreground">Patient</p>
                    </div>
                    {chatPatientId === patient.id && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right panel: chat dialogue */}
          <div className="flex-1 flex flex-col bg-card">
            {chatPatientId ? (
              (() => {
                const patient = patientContacts.find(p => p.id === chatPatientId);
                const conversation = messages.filter(
                  m => (m.senderId === currentDoctor?.id && m.receiverId === chatPatientId) ||
                       (m.senderId === chatPatientId && m.receiverId === currentDoctor?.id)
                );
                return (
                  <>
                    {/* Header */}
                    <div className="p-4 border-b border-border/50 flex items-center gap-3 bg-muted/10">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {patient?.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{patient?.name}</h4>
                        <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                          Encrypted Channel Active
                        </span>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                      {conversation.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                          <MessageSquare className="w-8 h-8 text-muted-foreground/20" />
                          <p className="text-xs text-muted-foreground">No messages yet. Send the first secure message.</p>
                        </div>
                      ) : (
                        conversation.map(msg => (
                          <div
                            key={msg.id}
                            className={`flex flex-col max-w-[70%] rounded-2xl p-3 text-sm leading-relaxed ${
                              msg.senderId === currentDoctor?.id
                                ? "bg-primary text-primary-foreground self-end rounded-tr-none ml-auto"
                                : "bg-muted border border-border/40 text-foreground self-start rounded-tl-none"
                            }`}
                          >
                            <p>{msg.content}</p>
                            <span className={`text-[10px] mt-1 self-end ${
                              msg.senderId === currentDoctor?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleDoctorSendChat} className="p-4 border-t border-border/50 flex gap-2">
                      <input
                        type="text"
                        value={doctorChatInput}
                        onChange={e => setDoctorChatInput(e.target.value)}
                        placeholder="Type a secure message to patient..."
                        className="flex-1 rounded-lg bg-muted border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        disabled={!doctorChatInput.trim()}
                        className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow disabled:opacity-40"
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
                <h4 className="text-sm font-bold text-foreground">Select a Patient</h4>
                <p className="text-xs text-muted-foreground max-w-[200px]">Choose a patient from your contacts to open a secure encrypted chat session.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </DashboardShell>
  );
}

export default function DoctorDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-semibold">Loading Doctor Portal...</p>
        </div>
      </div>
    }>
      <DoctorDashboardContent />
    </Suspense>
  );
}
