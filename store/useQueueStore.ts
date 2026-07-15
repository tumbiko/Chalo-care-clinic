"use client";

import { create } from "zustand";
import { 
  mockDoctors, 
  mockPatients, 
  mockAppointments, 
  mockQueueEntries, 
  mockChatMessages, 
  MockDoctor, 
  MockPatient, 
  MockAppointment, 
  MockQueueEntry, 
  MockChatMessage 
} from "@/lib/mockData";

interface NotificationItem {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

interface QueueState {
  activeUser: { id: string; name: string; email: string; role: "PATIENT" | "DOCTOR" | "ADMIN" } | null;
  doctors: MockDoctor[];
  patients: MockPatient[];
  appointments: MockAppointment[];
  queue: MockQueueEntry[];
  messages: MockChatMessage[];
  notifications: NotificationItem[];
  
  setActiveUser: (user: { id: string; name: string; email: string; role: "PATIENT" | "DOCTOR" | "ADMIN" } | null) => void;
  addNotification: (text: string) => void;
  markNotificationsAsRead: () => void;
  sendMessage: (senderId: string, receiverId: string, content: string) => Promise<void>;
  fetchMessages: (senderId: string, receiverId: string) => Promise<void>;
  advanceQueue: (doctorId: string) => Promise<void>;
  completeAppointment: (aptId: string, diagnosis: string, prescription: string) => Promise<void>;
  bookAppointment: (doctorId: string, slot: string, symptoms: string) => Promise<void>;
  checkIntoQueue: (patientId: string, doctorId: string) => Promise<void>;
  fetchDoctors: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
  fetchQueue: () => Promise<void>;
  fetchInitialData: () => Promise<void>;
}

function parseSlotToTime24h(slot: string): string {
  const match = slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return "09:00";
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const ampm = match[3].toUpperCase();

  if (ampm === "PM" && hour < 12) {
    hour += 12;
  } else if (ampm === "AM" && hour === 12) {
    hour = 0;
  }

  const hourStr = hour.toString().padStart(2, "0");
  return `${hourStr}:${minute}`;
}

export const useQueueStore = create<QueueState>((set) => ({
  activeUser: { 
    id: "pat-1", 
    name: "Alex Rivera", 
    email: "alex@example.com", 
    role: "PATIENT" 
  },
  doctors: mockDoctors,
  patients: mockPatients,
  appointments: mockAppointments,
  queue: mockQueueEntries,
  messages: mockChatMessages,
  notifications: [
    { 
      id: "n-1", 
      text: "Welcome to Chalo Care Clinic! Switch roles using the Demo Switcher at the bottom-left to explore Patient, Doctor, or Admin consoles.", 
      time: "Just now", 
      read: false 
    }
  ],

  setActiveUser: (user) => set({ activeUser: user }),
  
  addNotification: (text) => set((state) => ({
    notifications: [
      { 
        id: `notif-${Date.now()}`, 
        text, 
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), 
        read: false 
      },
      ...state.notifications
    ]
  })),

  markNotificationsAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),

  sendMessage: async (senderId, receiverId, content) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      senderId,
      receiverId,
      content,
      createdAt: new Date().toISOString()
    };

    set((state) => ({
      messages: [...state.messages, optimisticMsg]
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId, receiverId, content })
      });

      if (res.ok) {
        const savedMsg = await res.json();
        set((state) => ({
          messages: state.messages.map(m => m.id === tempId ? savedMsg : m)
        }));
      }
    } catch (error) {
      console.error("Failed to send message via API:", error);
    }
  },

  fetchMessages: async (senderId, receiverId) => {
    try {
      const res = await fetch(`/api/chat?senderId=${senderId}&receiverId=${receiverId}`);
      if (res.ok) {
        const newMsgs = await res.json();
        set((state) => {
          const otherMsgs = state.messages.filter(
            m => !((m.senderId === senderId && m.receiverId === receiverId) ||
                   (m.senderId === receiverId && m.receiverId === senderId))
          );
          return {
            messages: [...otherMsgs, ...newMsgs]
          };
        });
      }
    } catch (error) {
      console.error("Failed to fetch messages via API:", error);
    }
  },

  fetchDoctors: async () => {
    try {
      const res = await fetch("/api/doctors");
      if (res.ok) {
        const data = await res.json();
        set({ doctors: data });
      }
    } catch (error) {
      console.error("Failed to fetch doctors via API:", error);
    }
  },

  fetchAppointments: async () => {
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = await res.json();
        set({ appointments: data });
      }
    } catch (error) {
      console.error("Failed to fetch appointments via API:", error);
    }
  },

  fetchQueue: async () => {
    try {
      const res = await fetch("/api/queue");
      if (res.ok) {
        const data = await res.json();
        set({ queue: data });
      }
    } catch (error) {
      console.error("Failed to fetch queue entries via API:", error);
    }
  },

  fetchInitialData: async () => {
    const { fetchDoctors, fetchAppointments, fetchQueue } = useQueueStore.getState();
    await Promise.all([fetchDoctors(), fetchAppointments(), fetchQueue()]);
  },

  advanceQueue: async (doctorId) => {
    const state = useQueueStore.getState();
    const docQueue = state.queue.filter(q => q.doctorId === doctorId && q.status !== "COMPLETED" && q.status !== "SKIPPED");
    const activeEntry = docQueue.find(q => q.status === "ACTIVE");
    const nextWaiting = docQueue.find(q => q.status === "WAITING");
    
    const newQueue = state.queue.map(q => {
      if (q.doctorId === doctorId) {
        if (activeEntry && q.id === activeEntry.id) {
          return { ...q, status: "COMPLETED" as const };
        }
        if (nextWaiting && q.id === nextWaiting.id) {
          return { ...q, status: "ACTIVE" as const };
        }
      }
      return q;
    });

    const addedNotifications = [...state.notifications];
    if (nextWaiting) {
      addedNotifications.unshift({
        id: `notif-${Date.now()}`,
        text: `Patient ${nextWaiting.patientName} is now active in consultation.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false
      });
    }

    set({
      queue: newQueue,
      notifications: addedNotifications
    });

    try {
      const res = await fetch("/api/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, action: "advance" })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.queue) {
          set({ queue: data.queue });
        }
      }
    } catch (error) {
      console.error("Failed to advance queue via API:", error);
    }
  },

  completeAppointment: async (aptId, diagnosis, prescription) => {
    const state = useQueueStore.getState();
    const apt = state.appointments.find(a => a.id === aptId);
    
    const newApts = state.appointments.map(a => 
      a.id === aptId 
        ? { ...a, status: "COMPLETED" as const, diagnosis, prescription } 
        : a
    );
    
    let newQueue = state.queue;
    if (apt) {
      newQueue = state.queue.map(q => 
        (q.patientId === apt.patientId && q.doctorId === apt.doctorId && q.status === "ACTIVE")
          ? { ...q, status: "COMPLETED" as const }
          : q
      );
    }

    const doctorName = apt ? apt.doctorName : "Doctor";
    const patientName = apt ? apt.patientName : "Patient";

    set({
      appointments: newApts,
      queue: newQueue,
      notifications: [
        { 
          id: `notif-${Date.now()}`, 
          text: `Consultation complete: ${doctorName} finalized clinical charts and medical prescriptions for ${patientName}.`, 
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), 
          read: false 
        },
        ...state.notifications
      ]
    });

    try {
      const aptRes = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: aptId, status: "COMPLETED", diagnosis, prescription })
      });

      if (apt) {
        const activeQueueEntry = state.queue.find(
          q => q.patientId === apt.patientId && q.doctorId === apt.doctorId && q.status === "ACTIVE"
        );
        if (activeQueueEntry) {
          await fetch("/api/queue", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: activeQueueEntry.id, status: "COMPLETED" })
          });
        }
      }

      if (aptRes.ok) {
        const { fetchAppointments, fetchQueue } = useQueueStore.getState();
        await Promise.all([fetchAppointments(), fetchQueue()]);
      }
    } catch (error) {
      console.error("Failed to complete appointment via API:", error);
    }
  },

  bookAppointment: async (doctorId, slot, symptoms) => {
    const state = useQueueStore.getState();
    if (!state.activeUser) return;
    const doctor = state.doctors.find(d => d.id === doctorId);
    if (!doctor) return;
    
    const timeStr = parseSlotToTime24h(slot);
    const today = new Date();
    const dateTimeStr = `${today.toISOString().split("T")[0]}T${timeStr}:00.000Z`;

    const tempAptId = `apt-${Date.now()}`;
    const tempQueId = `que-${Date.now()}`;

    const optimisticApt: MockAppointment = {
      id: tempAptId,
      patientId: state.activeUser.id,
      patientName: state.activeUser.name,
      doctorId,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      doctorAvatar: doctor.avatar,
      dateTime: dateTimeStr,
      status: "CONFIRMED",
      type: "VIRTUAL",
      symptoms
    };

    const docQueue = state.queue.filter(q => q.doctorId === doctorId && (q.status === "WAITING" || q.status === "ACTIVE"));
    const nextNumber = docQueue.length + 1;
    
    const optimisticQueueEntry: MockQueueEntry = {
      id: tempQueId,
      patientId: state.activeUser.id,
      patientName: state.activeUser.name,
      doctorId,
      doctorName: doctor.name,
      number: nextNumber,
      status: "WAITING",
      estimatedWaitMinutes: nextNumber * 15,
      checkInTime: new Date().toISOString()
    };

    set((state) => ({
      appointments: [...state.appointments, optimisticApt],
      queue: [...state.queue, optimisticQueueEntry],
      notifications: [
        { 
          id: `notif-${Date.now()}`, 
          text: `Successfully booked consultation with ${doctor.name} for slot ${slot}. Checked into queue #${nextNumber}.`, 
          time: "Just now", 
          read: false 
        },
        ...state.notifications
      ]
    }));

    try {
      const aptRes = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: state.activeUser.id,
          doctorId,
          dateTime: dateTimeStr,
          type: "VIRTUAL",
          symptoms
        })
      });

      const queRes = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: state.activeUser.id,
          doctorId
        })
      });

      if (aptRes.ok && queRes.ok) {
        const savedApt = await aptRes.json();
        const savedQue = await queRes.json();

        set((state) => ({
          appointments: state.appointments.map(a => a.id === tempAptId ? savedApt : a),
          queue: state.queue.map(q => q.id === tempQueId ? savedQue : q)
        }));
      }
    } catch (error) {
      console.error("Failed to book appointment via API:", error);
    }
  },

  checkIntoQueue: async (patientId, doctorId) => {
    const state = useQueueStore.getState();
    const patient = state.patients.find(p => p.id === patientId) || state.activeUser;
    const doctor = state.doctors.find(d => d.id === doctorId);
    if (!patient || !doctor) return;

    const tempQueId = `que-${Date.now()}`;
    const docQueue = state.queue.filter(q => q.doctorId === doctorId && (q.status === "WAITING" || q.status === "ACTIVE"));
    const nextNumber = docQueue.length + 1;

    const optimisticQueueEntry: MockQueueEntry = {
      id: tempQueId,
      patientId: patient.id,
      patientName: patient.name,
      doctorId,
      doctorName: doctor.name,
      number: nextNumber,
      status: "WAITING",
      estimatedWaitMinutes: nextNumber * 15,
      checkInTime: new Date().toISOString()
    };

    set((state) => ({
      queue: [...state.queue, optimisticQueueEntry],
      notifications: [
        { 
          id: `notif-${Date.now()}`, 
          text: `${patient.name} checked into virtual queue for ${doctor.name} (#${nextNumber}).`, 
          time: "Just now", 
          read: false 
        },
        ...state.notifications
      ]
    }));

    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, doctorId })
      });
      if (res.ok) {
        const savedQue = await res.json();
        set((state) => ({
          queue: state.queue.map(q => q.id === tempQueId ? savedQue : q)
        }));
      }
    } catch (error) {
      console.error("Failed to check into queue via API:", error);
    }
  }
}));