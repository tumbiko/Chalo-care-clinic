export interface MockDoctor {
  id: string;
  name: string;
  specialization: string;
  bio: string;
  fee: number;
  rating: number;
  experience: number;
  avatar: string;
  isAvailable: boolean;
  slots: string[];
}

export interface MockPatient {
  id: string;
  name: string;
  email: string;
  gender: string;
  bloodGroup: string;
  dateOfBirth: string;
  emergencyContact: string;
  medicalHistory: string;
  avatar: string;
}

export interface MockAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorAvatar?: string;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  type: "VIRTUAL" | "IN_PERSON";
  symptoms: string;
  diagnosis?: string;
  prescription?: string;
}

export interface MockQueueEntry {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  doctorId: string;
  doctorName: string;
  number: number;
  status: "WAITING" | "ACTIVE" | "SKIPPED" | "COMPLETED";
  estimatedWaitMinutes: number;
  checkInTime: string;
}

export interface MockChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export const mockDoctors: MockDoctor[] = [
  {
    id: "doc-1",
    name: "Dr. Sarah Jenkins",
    specialization: "Cardiologist",
    bio: "Dr. Jenkins is a board-certified cardiologist with over 12 years of experience in managing complex cardiovascular conditions and preventive medicine.",
    fee: 150,
    rating: 4.9,
    experience: 12,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&fit=crop",
    isAvailable: true,
    slots: ["09:00 AM", "10:30 AM", "11:00 AM", "02:00 PM", "03:30 PM"]
  },
  {
    id: "doc-2",
    name: "Dr. Marcus Vance",
    specialization: "Neurologist",
    bio: "Specializing in neuropathic pain disorders, epilepsy management, and cognitive wellness therapy, Dr. Vance brings 8+ years of dedicated clinical experience.",
    fee: 140,
    rating: 4.8,
    experience: 8,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&fit=crop",
    isAvailable: true,
    slots: ["09:30 AM", "11:30 AM", "01:30 PM", "04:00 PM"]
  },
  {
    id: "doc-3",
    name: "Dr. Elena Rostova",
    specialization: "Pediatrician",
    bio: "Dedicated to providing compassionate healthcare for infants, kids, and teens. Dr. Rostova is known for her warm, welcoming clinic environment.",
    fee: 90,
    rating: 5.0,
    experience: 15,
    avatar: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=200&h=200&fit=crop",
    isAvailable: true,
    slots: ["08:00 AM", "10:00 AM", "12:00 PM", "03:00 PM", "04:30 PM"]
  },
  {
    id: "doc-4",
    name: "Dr. Kenneth Cole",
    specialization: "Dermatologist",
    bio: "Dr. Cole is an expert in skin disease treatments, laser procedures, and advanced skin cancer screening techniques, utilizing top modern technologies.",
    fee: 110,
    rating: 4.7,
    experience: 10,
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&fit=crop",
    isAvailable: false,
    slots: ["09:00 AM", "10:00 AM", "02:30 PM"]
  },
  {
    id: "doc-5",
    name: "Dr. Priya Patel",
    specialization: "General Practitioner",
    bio: "Passionate about holistic healthcare and preventative clinic consulting. Dr. Patel is your primary contact for general checkups and health maintenance.",
    fee: 75,
    rating: 4.9,
    experience: 6,
    avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=200&h=200&fit=crop",
    isAvailable: true,
    slots: ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"]
  }
];

export const mockPatients: MockPatient[] = [
  {
    id: "pat-1",
    name: "Alex Rivera",
    email: "alex@example.com",
    gender: "Non-binary",
    bloodGroup: "O-Positive",
    dateOfBirth: "1994-08-14",
    emergencyContact: "+1 (555) 234-5678 (Maria Rivera)",
    medicalHistory: "Asthma diagnosed in childhood, well controlled. Regular pollen allergies during spring. Penicillin allergy.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&fit=crop"
  },
  {
    id: "pat-2",
    name: "James Thompson",
    email: "james@example.com",
    gender: "Male",
    bloodGroup: "A-Positive",
    dateOfBirth: "1982-11-03",
    emergencyContact: "+1 (555) 987-6543 (Linda Thompson)",
    medicalHistory: "Hypertension managed with Lisinopril 10mg daily. Mild spinal disc bulge (L4-L5). No known drug allergies.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&fit=crop"
  }
];

export const mockAppointments: MockAppointment[] = [
  {
    id: "apt-1",
    patientId: "pat-1",
    patientName: "Alex Rivera",
    doctorId: "doc-1",
    doctorName: "Dr. Sarah Jenkins",
    doctorSpecialization: "Cardiologist",
    doctorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&fit=crop",
    dateTime: "2026-06-07T10:30:00.000Z",
    status: "CONFIRMED",
    type: "VIRTUAL",
    symptoms: "Mild chest tightness and occasional rapid heartbeats after running."
  },
  {
    id: "apt-2",
    patientId: "pat-1",
    patientName: "Alex Rivera",
    doctorId: "doc-5",
    doctorName: "Dr. Priya Patel",
    doctorSpecialization: "General Practitioner",
    doctorAvatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=200&h=200&fit=crop",
    dateTime: "2026-06-03T14:00:00.000Z",
    status: "COMPLETED",
    type: "IN_PERSON",
    symptoms: "Routine annual checkup and refill of seasonal allergy medication.",
    diagnosis: "General health checkup normal. Blood pressure 120/80 mmHg. Refilled seasonal anti-histamines.",
    prescription: "Claritin (Loratadine) 10mg - Take 1 tablet daily orally as needed."
  },
  {
    id: "apt-3",
    patientId: "pat-2",
    patientName: "James Thompson",
    doctorId: "doc-2",
    doctorName: "Dr. Marcus Vance",
    doctorSpecialization: "Neurologist",
    doctorAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&fit=crop",
    dateTime: "2026-06-08T09:30:00.000Z",
    status: "CONFIRMED",
    type: "VIRTUAL",
    symptoms: "Recurring tension headaches radiating from neck to forehead, increased frequency."
  }
];

export const mockQueueEntries: MockQueueEntry[] = [
  {
    id: "que-1",
    patientId: "pat-2",
    patientName: "James Thompson",
    patientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&fit=crop",
    doctorId: "doc-2",
    doctorName: "Dr. Marcus Vance",
    number: 1,
    status: "ACTIVE",
    estimatedWaitMinutes: 0,
    checkInTime: "2026-06-06T13:45:00.000Z"
  },
  {
    id: "que-2",
    patientId: "pat-1",
    patientName: "Alex Rivera",
    patientAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&h=200&fit=crop",
    doctorId: "doc-1",
    doctorName: "Dr. Sarah Jenkins",
    number: 2,
    status: "WAITING",
    estimatedWaitMinutes: 15,
    checkInTime: "2026-06-06T13:58:00.000Z"
  }
];

export const mockChatMessages: MockChatMessage[] = [
  {
    id: "msg-1",
    senderId: "doc-5",
    receiverId: "pat-1",
    content: "Hi Alex, please make sure you don't drink coffee before your blood test tomorrow morning.",
    createdAt: "2026-06-02T16:45:00.000Z"
  },
  {
    id: "msg-2",
    senderId: "pat-1",
    receiverId: "doc-5",
    content: "Understood, Dr. Patel! I will fast after 10:00 PM tonight. See you tomorrow.",
    createdAt: "2026-06-02T16:50:00.000Z"
  }
];

// Admin metrics mock data
export const adminAnalytics = {
  weeklyRevenue: [
    { name: "Mon", revenue: 1250, appointments: 12 },
    { name: "Tue", revenue: 1850, appointments: 18 },
    { name: "Wed", revenue: 1600, appointments: 15 },
    { name: "Thu", revenue: 2100, appointments: 22 },
    { name: "Fri", revenue: 2350, appointments: 24 },
    { name: "Sat", revenue: 950, appointments: 8 },
    { name: "Sun", revenue: 450, appointments: 4 }
  ],
  specialtyDistribution: [
    { name: "General Practice", value: 38, color: "#06b6d4" },
    { name: "Cardiology", value: 22, color: "#3b82f6" },
    { name: "Pediatrics", value: 18, color: "#14b8a6" },
    { name: "Neurology", value: 12, color: "#6366f1" },
    { name: "Dermatology", value: 10, color: "#a855f7" }
  ],
  systemLogs: [
    { id: "log-1", time: "14:02 PM", user: "Admin", action: "Updated Dr. Sarah Jenkins availability slot" },
    { id: "log-2", time: "13:58 PM", user: "Alex Rivera", action: "Checked into Virtual Queue for Dr. Jenkins" },
    { id: "log-3", time: "13:45 PM", user: "James Thompson", action: "Checked into Virtual Queue for Dr. Vance" },
    { id: "log-4", time: "12:15 PM", user: "Dr. Priya Patel", action: "Uploaded prescription for Alex Rivera" },
    { id: "log-5", time: "11:30 AM", user: "System", action: "Auto-backup of patient health records completed" }
  ]
};

// Simple rule-based Symptom Checker engine
export interface SymptomCheckerResult {
  specialty: string;
  recommendedDoctor: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  urgency: string;
  advice: string[];
}

export function checkSymptoms(symptomsText: string): SymptomCheckerResult {
  const text = symptomsText.toLowerCase();
  
  if (text.includes("chest pain") || text.includes("heart rate") || text.includes("palpitation") || text.includes("shortness of breath") && text.includes("chest")) {
    return {
      specialty: "Cardiologist",
      recommendedDoctor: "Dr. Sarah Jenkins",
      severity: "HIGH",
      urgency: "Immediate Consultation Recommended",
      advice: [
        "Avoid any strenuous activity immediately.",
        "Rest in a comfortable, upright position.",
        "If pain radiates to the arm, jaw, or neck, call local emergency services immediately.",
        "Have a cardiovascular specialist check your ECG."
      ]
    };
  }
  
  if (text.includes("headache") || text.includes("migraine") || text.includes("dizzy") || text.includes("numbness") || text.includes("seizure") || text.includes("tremor")) {
    return {
      specialty: "Neurologist",
      recommendedDoctor: "Dr. Marcus Vance",
      severity: "MEDIUM",
      urgency: "Schedule Consultation within 48 Hours",
      advice: [
        "Rest in a dark, quiet room.",
        "Hydrate properly and avoid bright screens.",
        "Keep a log of when the headaches start and what you ate prior.",
        "Seek emergency attention if you experience sudden loss of speech or balance."
      ]
    };
  }

  if (text.includes("rash") || text.includes("skin") || text.includes("itch") || text.includes("acne") || text.includes("mole") || text.includes("burn")) {
    return {
      specialty: "Dermatologist",
      recommendedDoctor: "Dr. Kenneth Cole",
      severity: "LOW",
      urgency: "Routine Appointment Suggested",
      advice: [
        "Do not scratch or rub the affected skin area.",
        "Apply a gentle, non-scented moisturizer if dry.",
        "Avoid applying harsh soaps or cosmetic items to the area.",
        "Take high-resolution photos of the rash to show the doctor in case it changes."
      ]
    };
  }
  
  if (text.includes("child") || text.includes("baby") || text.includes("kid") || text.includes("toddler") || text.includes("pediatric")) {
    return {
      specialty: "Pediatrician",
      recommendedDoctor: "Dr. Elena Rostova",
      severity: "MEDIUM",
      urgency: "Consultation Suggested within 24 Hours",
      advice: [
        "Monitor your child's temperature regularly.",
        "Ensure the child is well hydrated with fluids or electrolytes.",
        "Look out for signs of extreme lethargy or unusual crying.",
        "Consult Dr. Rostova for child-appropriate dosage before administering medications."
      ]
    };
  }

  // Fallback / General checkup
  return {
    specialty: "General Practitioner",
    recommendedDoctor: "Dr. Priya Patel",
    severity: "LOW",
    urgency: "Standard Booking Recommended",
    advice: [
      "Keep track of body temperature twice daily if running a fever.",
      "Get plenty of rest and stay hydrated.",
      "Consider writing down minor symptoms to discuss during consultation.",
      "Book an appointment with Dr. Patel for a complete primary wellness examination."
    ]
  };
}
