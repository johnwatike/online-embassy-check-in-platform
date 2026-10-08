import { KENYAN_MISSIONS } from "@/lib/kenyan-missions";

export type DemoRole = "citizen" | "staff";
export type TripStatus = "registered" | "arrived" | "departed";
export type WellbeingStatus = "safe" | "plans_changed" | "needs_assistance" | "left";
export type CaseStatus = "submitted" | "under_review" | "awaiting_response" | "in_progress" | "resolved";
export type CaseUrgency = "standard" | "urgent";
export type AlertSeverity = "urgent" | "advisory" | "service" | "crisis";
export type MissionType = "Embassy" | "High Commission" | "Consulate" | "Consulate General" | "Permanent Mission" | "Liaison Office" | "Honorary Consulate";

export interface CitizenProfile {
  fullName: string;
  citizenship: string;
  email: string;
  phone: string;
  language: string;
  emergencyContact: { name: string; relationship: string; phone: string } | null;
}

export interface Mission {
  id: string;
  name: string;
  missionType: MissionType;
  hostCountry: string;
  hostCountryCode: string;
  hostCity: string;
  serves: string[];
  districts: string[];
  address: string;
  hours: string;
  timezone: string;
  phone: string;
  email: string;
  emergency: string;
  website: string;
  sourceUrl: string;
  sourceLabel: string;
  contactNote: string;
  services: string[];
  verifiedAt: string;
  locallyPresent: boolean;
  canProvideConsularSupport: boolean;
}

export interface Trip {
  id: string;
  reference: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  arrivalDate: string;
  departureDate: string;
  departureUnknown: boolean;
  purpose: string;
  address: string;
  status: TripStatus;
  wellbeing: WellbeingStatus;
  registeredAt: string;
  updatedAt: string;
  missionId: string;
}

export interface AlertItem {
  id: string;
  title: string;
  severity: AlertSeverity;
  location: string;
  body: string;
  publishedAt: string;
  expiresAt: string;
  verified: boolean;
  read: boolean;
}

export interface CaseProgress {
  id: string;
  label: string;
  detail: string;
  at: string;
}

export interface CaseMessage {
  id: string;
  sender: string;
  role: "citizen" | "staff";
  body: string;
  at: string;
}

export interface InternalNote {
  id: string;
  author: string;
  body: string;
  at: string;
}

export interface AssistanceCase {
  id: string;
  reference: string;
  category: string;
  urgency: CaseUrgency;
  location: string;
  description: string;
  contactMethod: string;
  status: CaseStatus;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  progress: CaseProgress[];
  messages: CaseMessage[];
  internalNotes: InternalNote[];
}

export interface Appointment {
  id: string;
  reference: string;
  service: string;
  missionId: string;
  startAt: string;
  timezone: string;
  status: "booked" | "cancelled" | "completed";
  requirements: string[];
}

export interface CrisisResponse {
  id: string;
  citizen: string;
  response: "safe" | "need_help" | "not_affected" | "awaiting";
  respondedAt: string | null;
  locationShared: boolean;
  location: string;
}

export interface CrisisEvent {
  id: string;
  title: string;
  affectedArea: string;
  createdAt: string;
  expiresAt: string;
  status: "active" | "closed";
  responses: CrisisResponse[];
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  at: string;
  kind: "trip" | "status" | "case" | "alert" | "appointment" | "staff";
}

export interface AuditItem {
  id: string;
  actor: string;
  action: string;
  record: string;
  at: string;
}

export interface DemoState {
  profile: CitizenProfile;
  missions: Mission[];
  trips: Trip[];
  alerts: AlertItem[];
  cases: AssistanceCase[];
  appointments: Appointment[];
  crisis: CrisisEvent;
  activity: ActivityItem[];
  audit: AuditItem[];
  notificationPreferences: { email: boolean; sms: boolean; push: boolean; reminderDays: number };
  activeRole: DemoRole;
}

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const shiftDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
const atTime = (days: number, hours = 10) => {
  const date = shiftDate(days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
};

export function createInitialDemoState(): DemoState {
  const today = isoDate(new Date());
  return {
    profile: {
      fullName: "Amina Wanjiku",
      citizenship: "Kenyan",
      email: "amina.wanjiku@example.test",
      phone: "+254 700 000 000 (fictional demo number)",
      language: "English",
      emergencyContact: { name: "Njeri Wanjiku", relationship: "Sister", phone: "+254 711 000 000 (fictional demo number)" },
    },
    missions: KENYAN_MISSIONS,
    trips: [
      {
        id: "trip-lisbon",
        reference: "KFA-PT-48291",
        country: "Portugal",
        countryCode: "PT",
        city: "Lisbon",
        region: "Lisbon Metropolitan Area",
        arrivalDate: isoDate(shiftDate(-4)),
        departureDate: isoDate(shiftDate(16)),
        departureUnknown: false,
        purpose: "Tourism",
        address: "",
        status: "arrived",
        wellbeing: "safe",
        registeredAt: atTime(-5, 14),
        updatedAt: atTime(-1, 9),
        missionId: "kenya-paris",
      },
      {
        id: "trip-tokyo",
        reference: "KFA-JP-19370",
        country: "Japan",
        countryCode: "JP",
        city: "Tokyo",
        region: "Tokyo Metropolis",
        arrivalDate: isoDate(shiftDate(-51)),
        departureDate: isoDate(shiftDate(-36)),
        departureUnknown: false,
        purpose: "Tourism",
        address: "",
        status: "departed",
        wellbeing: "left",
        registeredAt: atTime(-52),
        updatedAt: atTime(-36),
        missionId: "kenya-tokyo",
      },
    ],
    alerts: [
      {
        id: "alert-journey-guidance",
        title: "DEMO SAMPLE — check current travel guidance before departure",
        severity: "advisory",
        location: "International travel · sample notice",
        body: "This is a fictional interface example, not a Kenya Ministry alert. Confirm entry rules, safety updates, and travel advice through official government and local-authority sources before travelling.",
        publishedAt: atTime(-1, 8),
        expiresAt: atTime(6, 18),
        verified: false,
        read: false,
      },
      {
        id: "alert-mission-directory",
        title: "Kenya mission contact details — confirm before relying on them",
        severity: "service",
        location: "Worldwide · Ministry directory links",
        body: "The prototype displays contacts and accredited territories published by the Ministry. Source pages and directory editions can differ; open the linked Ministry source to check the latest details. General office numbers are not assumed to be emergency lines.",
        publishedAt: atTime(-3, 12),
        expiresAt: atTime(40, 18),
        verified: false,
        read: true,
      },
      {
        id: "alert-demo-exercise",
        title: "DEMO ONLY — sample wellbeing check",
        severity: "crisis",
        location: "Lisbon, Portugal · fictional exercise",
        body: "This training example is not a safety notice or official crisis message. Do not interpret the sample list or any nonresponse as evidence that a Kenyan citizen is missing or in danger.",
        publishedAt: atTime(-2, 10),
        expiresAt: atTime(12, 18),
        verified: false,
        read: false,
      },
    ],
    cases: [
      {
        id: "case-passport-demo",
        reference: "KFA-2026-01482",
        category: "Lost or stolen passport",
        urgency: "standard",
        location: "Lisbon, Portugal",
        description: "Fictional demo request: I misplaced my passport and would like guidance on the next steps for an emergency travel document.",
        contactMethod: "Email",
        status: "in_progress",
        assignedTo: "Consular officer (demo)",
        createdAt: atTime(-2, 11),
        updatedAt: atTime(-1, 15),
        progress: [
          { id: "p1", label: "Request received · demo", detail: "This sample request was recorded in the demonstration workspace.", at: atTime(-2, 11) },
          { id: "p2", label: "Under review · demo", detail: "A fictional consular officer is reviewing the sample request.", at: atTime(-2, 13) },
          { id: "p3", label: "In progress · demo", detail: "A sample secure reply is shown for interface demonstration.", at: atTime(-1, 15) },
        ],
        messages: [
          { id: "m1", sender: "Consular team (demo)", role: "staff", body: "Sample reply only: consult the responsible Kenya mission for current lost-passport and emergency-travel-document guidance. Do not send passport numbers or identity documents in this demo thread.", at: atTime(-1, 15) },
        ],
        internalNotes: [{ id: "n1", author: "Consular officer (demo)", body: "Fictional training note: verify contact preferences before follow-up.", at: atTime(-1, 14) }],
      },
    ],
    appointments: [
      {
        id: "appt-kenya-demo",
        reference: "KFA-61804",
        service: "Consular appointment · sample",
        missionId: "kenya-paris",
        startAt: atTime(8, 11),
        timezone: "Europe/Paris",
        status: "booked",
        requirements: ["Availability is fictional", "Confirm service scope and documents with the mission"],
      },
    ],
    crisis: {
      id: "crisis-kenya-demo-1",
      title: "DEMO EXERCISE — sample wellbeing check",
      affectedArea: "Lisbon, Portugal · fictional exercise",
      createdAt: atTime(-1, 16),
      expiresAt: atTime(3, 18),
      status: "active",
      responses: [
        { id: "r1", citizen: "Amina Wanjiku", response: "safe", respondedAt: atTime(-1, 17), locationShared: false, location: "" },
        { id: "r2", citizen: "Kibet Kiptoo (fictional)", response: "need_help", respondedAt: atTime(-1, 17), locationShared: true, location: "Lisbon, Portugal · sample only" },
        { id: "r3", citizen: "Wanjiru Kariuki (fictional)", response: "not_affected", respondedAt: atTime(-1, 18), locationShared: false, location: "" },
        { id: "r4", citizen: "Otieno Omondi (fictional)", response: "awaiting", respondedAt: null, locationShared: false, location: "" },
      ],
    },
    activity: [
      { id: "a1", title: "You checked in to Portugal", detail: "Lisbon · Trip KFA-PT-48291", at: atTime(-4, 12), kind: "trip" },
      { id: "a2", title: "You confirmed you’re safe", detail: "Your wellbeing status is separate from your assistance case.", at: atTime(-1, 9), kind: "status" },
      { id: "a3", title: "Assistance request updated · demo", detail: "Case KFA-2026-01482 is in progress in this sample.", at: atTime(-1, 15), kind: "case" },
      { id: "a4", title: "Appointment booked · demo", detail: "Consular appointment · Paris mission local time", at: atTime(-3, 10), kind: "appointment" },
    ],
    audit: [
      { id: "audit-1", actor: "Consular officer (demo)", action: "Viewed sample assistance case", record: "KFA-2026-01482", at: atTime(-1, 14) },
      { id: "audit-2", actor: "Mission administrator (demo)", action: "Published a sample service notice", record: "Kenya mission directory", at: atTime(-3, 12) },
      { id: "audit-3", actor: "Consular officer (demo)", action: "Assigned sample case", record: "KFA-2026-01482", at: atTime(-2, 13) },
    ],
    notificationPreferences: { email: true, sms: false, push: false, reminderDays: 7 },
    activeRole: "citizen",
  };
}
