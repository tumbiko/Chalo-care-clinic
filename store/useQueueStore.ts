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
  sendMessage: (senderId: string, receiverId: string, content: string) => void;
  advanceQueue: (doctorId: string) => void;
  completeAppointment: (aptId: string, diagnosis: string, prescription: string) => void;
  bookAppointment: (doctorId: string, slot: string, symptoms: string) => void;
  checkIntoQueue: (patientId: string, doctorId: string) => void;
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

  sendMessage: (senderId, receiverId, content) => set((state) => ({
    messages: [
      ...state.messages,
      { 
        id: `msg-${Date.now()}`, 
        senderId, 
        receiverId, 
        content, 
        createdAt: new Date().toISOString() 
      }
    ]
  })),

  advanceQueue: (doctorId) => set((state) => {
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

    return {
      queue: newQueue,
      notifications: addedNotifications
    };
  }),

  completeAppointment: (aptId, diagnosis, prescription) => set((state) => {
    const newApts = state.appointments.map(a => 
      a.id === aptId 
        ? { ...a, status: "COMPLETED" as const, diagnosis, prescription } 
        : a
    );
    
    const apt = state.appointments.find(a => a.id === aptId);
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

    return {
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
    };
  }),

  bookAppointment: (doctorId, slot, symptoms) => set((state) => {
    if (!state.activeUser) return {};
    const doctor = state.doctors.find(d => d.id === doctorId);
    if (!doctor) return {};
    
    const newApt: MockAppointment = {
      id: `apt-${Date.now()}`,
      patientId: state.activeUser.id,
      patientName: state.activeUser.name,
      doctorId,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      doctorAvatar: doctor.avatar,
      dateTime: new Date().toISOString().split('T')[0] + `T${slot.includes("AM") ? "09:00" : "14:00"}:00.000Z`, 
      status: "CONFIRMED",
      type: "VIRTUAL",
      symptoms
    };

    const docQueue = state.queue.filter(q => q.doctorId === doctorId && (q.status === "WAITING" || q.status === "ACTIVE"));
    const nextNumber = docQueue.length + 1;
    
    const newQueueEntry: MockQueueEntry = {
      id: `que-${Date.now()}`,
      patientId: state.activeUser.id,
      patientName: state.activeUser.name,
      doctorId,
      doctorName: doctor.name,
      number: nextNumber,
      status: "WAITING",
      estimatedWaitMinutes: nextNumber * 15,
      checkInTime: new Date().toISOString()
    };

    return {
      appointments: [...state.appointments, newApt],
      queue: [...state.queue, newQueueEntry],
      notifications: [
        { 
          id: `notif-${Date.now()}`, 
          text: `Successfully booked consultation with ${doctor.name} for slot ${slot}. Checked into queue #${nextNumber}.`, 
          time: "Just now", 
          read: false 
        },
        ...state.notifications
      ]
    };
  }),

  checkIntoQueue: (patientId, doctorId) => set((state) => {
    const patient = state.patients.find(p => p.id === patientId) || state.activeUser;
    const doctor = state.doctors.find(d => d.id === doctorId);
    if (!patient || !doctor) return {};

    const docQueue = state.queue.filter(q => q.doctorId === doctorId && (q.status === "WAITING" || q.status === "ACTIVE"));
    const nextNumber = docQueue.length + 1;

    const newQueueEntry: MockQueueEntry = {
      id: `que-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      doctorId,
      doctorName: doctor.name,
      number: nextNumber,
      status: "WAITING",
      estimatedWaitMinutes: nextNumber * 15,
      checkInTime: new Date().toISOString()
    };

    return {
      queue: [...state.queue, newQueueEntry],
      notifications: [
        { 
          id: `notif-${Date.now()}`, 
          text: `${patient.name} checked into virtual queue for ${doctor.name} (#${nextNumber}).`, 
          time: "Just now", 
          read: false 
        },
        ...state.notifications
      ]
    };
  })
}));