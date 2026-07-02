"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueueStore } from "@/store/useQueueStore";
import DashboardShell from "@/app/components/dashboard/dashboardshell";
import { WeeklyRevenueChart, SpecialtyDistributionChart } from "@/app/components/dashboard/adminstats";
import { adminAnalytics } from "@/lib/mockData";
import { 
  Users, 
  UserCheck, 
  Activity, 
  DollarSign, 
  Plus, 
  AlertCircle, 
  Settings, 
  ListTodo, 
  FileSpreadsheet,
  BellRing,
  Star,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const { 
    activeUser, 
    doctors, 
    appointments, 
    queue, 
    addNotification 
  } = useQueueStore();

  // Redirect if not admin
  useEffect(() => {
    if (activeUser && activeUser.role !== "ADMIN") {
      router.push(`/${activeUser.role.toLowerCase()}`);
    }
  }, [activeUser, router]);

  // States
  const [announcementText, setAnnouncementText] = useState("");
  const [isAnnounceLoading, setIsAnnounceLoading] = useState(false);

  // Form states to add new mock Doctor
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocSpecial, setNewDocSpecial] = useState("General Practitioner");
  const [newDocFee, setNewDocFee] = useState("100");

  const totalRevenue = appointments
    .filter(a => a.status === "COMPLETED")
    .reduce((acc, curr) => {
      const doc = doctors.find(d => d.id === curr.doctorId);
      return acc + (doc?.fee || 50);
    }, 0);

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    
    setIsAnnounceLoading(true);
    setTimeout(() => {
      addNotification(`Clinic Announcement: ${announcementText}`);
      setAnnouncementText("");
      setIsAnnounceLoading(false);
    }, 800);
  };

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    // Trigger Zustand logic to append doc
    const newId = `doc-${Date.now()}`;
    const newDoctorObj = {
      id: newId,
      name: newDocName,
      specialization: newDocSpecial,
      bio: `Dr. ${newDocName} is a board-certified ${newDocSpecial} committed to patient care.`,
      fee: parseFloat(newDocFee) || 100,
      rating: 5.0,
      experience: 5,
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&fit=crop",
      isAvailable: true,
      slots: ["09:00 AM", "10:30 AM", "02:00 PM"]
    };

    // We can directly mutate the Zustand state or push. 
    // In our store, we have doctors as state, so we update the store
    useQueueStore.setState((state) => ({
      doctors: [...state.doctors, newDoctorObj]
    }));

    setIsAddDocOpen(false);
    setNewDocName("");
    setNewDocFee("100");
  };

  return (
    <DashboardShell role="ADMIN">
      
      {/* Tab 1: Overview & Analytics */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-8">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Revenue</span>
                <h3 className="text-2xl font-black text-foreground mt-1">${totalRevenue + 2800}</h3>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Clinic Bookings</span>
                <h3 className="text-2xl font-black text-foreground mt-1">{appointments.length}</h3>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Registered Staff</span>
                <h3 className="text-2xl font-black text-foreground mt-1">{doctors.length}</h3>
              </div>
              <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-500">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Active Waiting</span>
                <h3 className="text-2xl font-black text-foreground mt-1">
                  {queue.filter(q => q.status === "WAITING" || q.status === "ACTIVE").length}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Recharts Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-bold text-sm text-foreground">Clinic Traffic & Revenue Trends</h3>
              <WeeklyRevenueChart />
            </div>

            <div className="lg:col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-bold text-sm text-foreground">Clinician Specialization Share</h3>
              <SpecialtyDistributionChart />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* System Logs */}
            <div className="lg:col-span-7 rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-bold text-sm text-foreground border-b border-border/50 pb-4">
                System Activity Logs
              </h3>
              
              <div className="flex flex-col gap-3.5 mt-6">
                {adminAnalytics.systemLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between text-[11px] leading-normal border-b border-border/30 pb-2">
                    <div>
                      <span className="font-bold text-foreground">{log.user}: </span>
                      <span className="text-muted-foreground">{log.action}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground font-semibold">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Post Announcements */}
            <div className="lg:col-span-5 rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-bold text-sm text-foreground border-b border-border/50 pb-4">
                Push Clinic Announcement
              </h3>
              
              <form onSubmit={handlePostAnnouncement} className="flex flex-col gap-4 mt-6">
                <textarea
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g. Server maintenance tonight / Dr. Jenkins slot updates..."
                  rows={3}
                  required
                  className="w-full rounded-lg bg-muted border border-border p-3 text-xs text-foreground focus:outline-none resize-none"
                />
                <button
                  type="submit"
                  disabled={isAnnounceLoading || !announcementText.trim()}
                  className="py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 flex items-center justify-center gap-1.5"
                >
                  <BellRing className="w-4 h-4" />
                  {isAnnounceLoading ? "Publishing Alert..." : "Broadcast Alert"}
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Doctor Registry */}
      {activeTab === "doctors" && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-border/50 pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Clinic Staff Registry</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Manage doctor availability status, fee structures, and bios.</p>
            </div>
            <button
              onClick={() => setIsAddDocOpen(true)}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
            >
              <Plus className="w-4 h-4" /> Add Doctor
            </button>
          </div>

          {/* Roster Grid */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="p-4 font-bold text-foreground">Practitioner</th>
                  <th className="p-4 font-bold text-foreground">Specialty</th>
                  <th className="p-4 font-bold text-foreground">Session Fee</th>
                  <th className="p-4 font-bold text-foreground">Status</th>
                  <th className="p-4 font-bold text-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={doc.avatar} alt={doc.name} className="w-8 h-8 rounded-full object-cover border" />
                      <div>
                        <span className="font-bold text-foreground block">{doc.name}</span>
                        <span className="text-[10px] text-yellow-500 font-bold flex items-center gap-0.5 mt-0.5">
                          <Star className="w-3 h-3 fill-yellow-500" /> {doc.rating}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground font-medium">{doc.specialization}</td>
                    <td className="p-4 font-bold text-foreground">${doc.fee}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        doc.isAvailable ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      }`}>
                        {doc.isAvailable ? "AVAILABLE" : "OFF-DUTY"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          // Toggle availability in Zustand store
                          useQueueStore.setState((state) => ({
                            doctors: state.doctors.map(d => d.id === doc.id ? { ...d, isAvailable: !d.isAvailable } : d)
                          }));
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-border text-[10px] font-bold hover:bg-muted text-foreground"
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Patient Directory */}
      {activeTab === "patients" && (
        <div className="flex flex-col gap-6">
          <div className="border-b border-border/50 pb-4">
            <h2 className="text-base font-bold text-foreground">Clinic Patient Directory</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Manage patient chronicles and emergency files.</p>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="p-4 font-bold text-foreground">Patient Profile</th>
                  <th className="p-4 font-bold text-foreground">Details</th>
                  <th className="p-4 font-bold text-foreground">Emergency Line</th>
                  <th className="p-4 font-bold text-foreground">Clinical Summary</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-muted/10 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">AR</div>
                    <div>
                      <span className="font-bold text-foreground block">Alex Rivera</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">alex@example.com</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">O-Positive • Age 31 • Non-binary</td>
                  <td className="p-4 text-foreground font-semibold">+1 (555) 234-5678 (Maria Rivera)</td>
                  <td className="p-4 text-muted-foreground max-w-xs truncate">Childhood Asthma, pollen allergies. Penicillin allergy.</td>
                </tr>
                <tr className="border-b border-border hover:bg-muted/10 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">JT</div>
                    <div>
                      <span className="font-bold text-foreground block">James Thompson</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">james@example.com</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">A-Positive • Age 43 • Male</td>
                  <td className="p-4 text-foreground font-semibold">+1 (555) 987-6543 (Linda Thompson)</td>
                  <td className="p-4 text-muted-foreground max-w-xs truncate">Hypertension managed with Lisinopril, mild disc bulge.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Doctor Modal overlay */}
      {isAddDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl flex flex-col gap-5"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="font-bold text-sm text-foreground">Add New Medical Officer</h3>
              <button
                onClick={() => setIsAddDocOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-foreground uppercase">Officer Name</label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Pendelton"
                  required
                  className="rounded-lg bg-muted border border-border p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-foreground uppercase">Specialty Area</label>
                <select
                  value={newDocSpecial}
                  onChange={(e) => setNewDocSpecial(e.target.value)}
                  className="rounded-lg bg-muted border border-border p-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="General Practitioner">General Practitioner</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Neurologist">Neurologist</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-foreground uppercase">Session Fee ($)</label>
                <input
                  type="number"
                  value={newDocFee}
                  onChange={(e) => setNewDocFee(e.target.value)}
                  required
                  className="rounded-lg bg-muted border border-border p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-md"
              >
                Save Practitioner Profile
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </DashboardShell>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-semibold">Loading Admin Portal...</p>
        </div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
