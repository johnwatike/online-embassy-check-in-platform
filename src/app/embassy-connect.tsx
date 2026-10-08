"use client";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  CalendarDays,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  HeartHandshake,
  Home,
  Info,
  LifeBuoy,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquareText,
  Navigation,
  Pencil,
  Phone,
  Plane,
  Plus,
  Printer,
  Search,
  Send,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  UserCog,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  createInitialDemoState,
  type ActivityItem,
  type AlertItem,
  type AlertSeverity,
  type Appointment,
  type AssistanceCase,
  type CaseMessage,
  type CaseStatus,
  type CrisisEvent,
  type DemoRole,
  type DemoState,
  type InternalNote,
  type Mission,
  type Trip,
  type WellbeingStatus,
} from "@/lib/demo-data";
import { dateTimeInputInZone, formatDate, formatDateTime, makeId, relativeDate, zonedDateTimeToIso } from "@/lib/utils";
import { KENYAN_DIRECTORY_COUNTRIES, MFA_CONTACT_URL, MFA_DIRECTORY_URL, MFA_MISSIONS_URL } from "@/lib/kenyan-missions";

type View =
  | "overview"
  | "trips"
  | "directory"
  | "alerts"
  | "cases"
  | "appointments"
  | "emergency-card"
  | "profile"
  | "registrations"
  | "registration-detail"
  | "staff-cases"
  | "staff-alerts"
  | "crisis"
  | "mission-settings"
  | "audit"
  | "case-detail";

type Dialog = "trip" | "status" | "help" | "appointment" | "alert" | "crisis" | "mission" | "urgent" | "checkout" | "profile" | "resolve" | null;
type ToastData = { title: string; body: string } | null;
type TripDraft = {
  country: string;
  city: string;
  region: string;
  arrivalDate: string;
  departureDate: string;
  departureUnknown: boolean;
  purpose: string;
  address: string;
};
type HelpDraft = { category: string; description: string; location: string; contactMethod: string; urgency: "standard" | "urgent" };
type AppointmentDraft = { service: string; date: string; time: string };
type AlertDraft = { title: string; severity: AlertSeverity; location: string; body: string; expiresDate: string };

type NavItem = { id: View; label: string; icon: LucideIcon; badge?: number };
type NavGroup = { label: string; items: NavItem[] };

const COUNTRY_CODES: Record<string, string> = {
  Algeria: "DZ", Angola: "AO", Botswana: "BW", Burundi: "BI", "Democratic Republic of the Congo": "CD", Djibouti: "DJ", Egypt: "EG", Ethiopia: "ET", Ghana: "GH", Mozambique: "MZ", Namibia: "NA", Nigeria: "NG", Rwanda: "RW", Senegal: "SN", Somalia: "SO", "South Africa": "ZA", "South Sudan": "SS", Sudan: "SD", Tanzania: "TZ", Uganda: "UG", Zambia: "ZM", Zimbabwe: "ZW", "Côte d’Ivoire": "CI", Morocco: "MA",
  Brazil: "BR", Canada: "CA", Cuba: "CU", "United States": "US", China: "CN", India: "IN", Indonesia: "ID", Japan: "JP", Malaysia: "MY", "Republic of Korea": "KR", "South Korea": "KR", Thailand: "TH", Austria: "AT", Belgium: "BE", France: "FR", Germany: "DE", Ireland: "IE", Italy: "IT", Netherlands: "NL", Russia: "RU", Spain: "ES", Sweden: "SE", Switzerland: "CH", "United Kingdom": "GB", Türkiye: "TR", Turkey: "TR", Iran: "IR", Israel: "IL", Kuwait: "KW", Oman: "OM", Pakistan: "PK", Qatar: "QA", "Saudi Arabia": "SA", "United Arab Emirates": "AE", Australia: "AU",
  "Central African Republic": "CF", "Republic of the Congo": "CG", Gabon: "GA", Eritrea: "ER", Jordan: "JO", Benin: "BJ", Guinea: "GN", "Guinea-Bissau": "GW", Liberia: "LR", "Sierra Leone": "SL", Togo: "TG", Eswatini: "SZ", Lesotho: "LS", Malawi: "MW", Argentina: "AR", Chile: "CL", Colombia: "CO", Venezuela: "VE", "Costa Rica": "CR", "El Salvador": "SV", Honduras: "HN", Mexico: "MX", Nicaragua: "NI", Bangladesh: "BD", "Sri Lanka": "LK", Singapore: "SG", Philippines: "PH", Cambodia: "KH", Laos: "LA", Vietnam: "VN", Hungary: "HU", Slovakia: "SK", Luxembourg: "LU", Portugal: "PT", Serbia: "RS", Monaco: "MC", "Holy See": "VA", Poland: "PL", "Czech Republic": "CZ", Romania: "RO", Bulgaria: "BG", Greece: "GR", Malta: "MT", Cyprus: "CY", Belarus: "BY", Kazakhstan: "KZ", Ukraine: "UA", "New Zealand": "NZ", Bahamas: "BS", "The Bahamas": "BS", Jamaica: "JM", "Côte d'Ivoire": "CI",
};

function isDemoState(value: unknown): value is DemoState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const state = value as Record<string, unknown>;
  const profile = state.profile as Record<string, unknown> | null;
  const crisis = state.crisis as Record<string, unknown> | null;
  const collections = ["missions", "trips", "alerts", "cases", "appointments", "activity", "audit"];
  if (!profile || typeof profile.fullName !== "string" || typeof profile.citizenship !== "string") return false;
  if (!crisis || !Array.isArray(crisis.responses) || !state.notificationPreferences) return false;
  if (state.activeRole !== "citizen" && state.activeRole !== "staff") return false;
  if (!collections.every((key) => Array.isArray(state[key]))) return false;
  const missions = state.missions as Array<Record<string, unknown>>;
  const trips = state.trips as Array<Record<string, unknown>>;
  const cases = state.cases as Array<Record<string, unknown>>;
  return missions.every((mission) => typeof mission.id === "string" && typeof mission.name === "string" && Array.isArray(mission.serves)) &&
    trips.every((trip) => typeof trip.id === "string" && typeof trip.country === "string" && typeof trip.city === "string") &&
    cases.every((item) => typeof item.id === "string" && Array.isArray(item.messages) && Array.isArray(item.progress) && Array.isArray(item.internalNotes));
}

function normalizeCountry(value: string) {
  const plain = value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’‘]/g, "'").replace(/\s+/g, " ");
  const aliases: Record<string, string> = {
    "the republic of korea": "south korea", "republic of korea": "south korea", "korea, republic of": "south korea", "south korea": "south korea", "the democratic republic of the congo": "democratic republic of the congo", "democratic republic of congo": "democratic republic of the congo", "dr congo": "democratic republic of the congo", drc: "democratic republic of the congo", "the republic of the congo": "republic of the congo", "congo-brazzaville": "republic of the congo", "the united states of america": "united states", "united states of america": "united states", usa: "united states", us: "united states", "the united kingdom": "united kingdom", uk: "united kingdom", "the czech republic": "czech republic", czechia: "czech republic", "ivory coast": "cote d'ivoire", "cote d'ivoire": "cote d'ivoire", "the cote d'ivoire": "cote d'ivoire", "the republic of cote d'ivoire": "cote d'ivoire", "the bahamas": "bahamas", "the republic of tanzania": "tanzania", "the united republic of tanzania": "tanzania", "the republic of south korea": "south korea", turkiye: "turkiye", turkey: "turkiye", "holy see (vatican city state)": "holy see", "vatican city": "holy see", "the holy see": "holy see", "the republic of portugal": "portugal", "the republic of france": "france", "the kingdom of spain": "spain", "the kingdom of thailand": "thailand", "the federal republic of nigeria": "nigeria", "the republic of south africa": "south africa", "the state of israel": "israel", "the people's republic of china": "china", "the republic of india": "india", "the republic of kenya": "kenya",
  };
  if (aliases[plain]) return aliases[plain];
  return plain.replace(/^(the )?(federal democratic|federal|arab|islamic|people's democratic|people's|united|democratic|commonwealth|kingdom|republic|state) of (the )?/, "").replace(/^the /, "");
}

const CASE_STATUSES: { value: CaseStatus; label: string }[] = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "awaiting_response", label: "Awaiting your response" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
];
const PURPOSES = ["Tourism", "Study", "Work", "Business", "Residency", "Other"];

function dateToday() {
  return new Date().toISOString().slice(0, 10);
}

function emptyTripDraft(trip?: Trip): TripDraft {
  return {
    country: trip?.country ?? "",
    city: trip?.city ?? "",
    region: trip?.region ?? "",
    arrivalDate: trip?.arrivalDate ?? dateToday(),
    departureDate: trip?.departureDate ?? "",
    departureUnknown: trip?.departureUnknown ?? false,
    purpose: trip?.purpose ?? "Tourism",
    address: trip?.address ?? "",
  };
}

function addActivity(state: DemoState, title: string, detail: string, kind: ActivityItem["kind"], at = new Date().toISOString()): DemoState {
  const item: ActivityItem = { id: makeId("activity"), title, detail, at, kind };
  return { ...state, activity: [item, ...state.activity].slice(0, 30) };
}

function addAudit(state: DemoState, action: string, record: string, actor = "Officer Elena R. (demo)"): DemoState {
  return {
    ...state,
    audit: [{ id: makeId("audit"), actor, action, record, at: new Date().toISOString() }, ...state.audit].slice(0, 60),
  };
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    registered: "Registered",
    arrived: "Arrived",
    departed: "Trip closed",
    safe: "I’m safe",
    plans_changed: "Plans changed",
    needs_assistance: "Needs assistance",
    left: "Left the country",
    submitted: "Submitted",
    under_review: "Under review",
    awaiting_response: "Awaiting your response",
    in_progress: "In progress",
    resolved: "Resolved",
    booked: "Booked",
    cancelled: "Cancelled",
    completed: "Completed",
    urgent: "Urgent",
    standard: "Standard",
    advisory: "Travel guidance",
    service: "Service update",
    crisis: "Wellbeing check",
    not_affected: "Not in affected area",
    need_help: "Need help",
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

function severityIcon(severity: AlertSeverity) {
  if (severity === "urgent" || severity === "crisis") return <Siren size={15} />;
  if (severity === "service") return <Building2 size={15} />;
  return <Globe2 size={15} />;
}

function Modal({ title, description, children, onClose, wide = false }: { title: string; description?: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", closeOnEscape);
    modalRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      previous?.focus();
    };
  }, []);
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={`modal${wide ? " wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabIndex={-1} ref={modalRef}>
        <div className="modal-head">
          <div>
            <h2 id="dialog-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button className="modal-close" type="button" aria-label="Close dialog" onClick={onClose}><X size={15} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow"><Sparkles size={12} />{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </div>
  );
}

function PanelHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="panel-head">
      <div><h2 className="panel-title">{title}</h2>{subtitle && <p className="panel-subtitle">{subtitle}</p>}</div>
      {action}
    </div>
  );
}

function Pill({ value, children }: { value?: string; children?: ReactNode }) {
  const tone = (value ?? "").toLowerCase().replaceAll(" ", "_");
  return <span className={`pill ${tone}`}>{children ?? statusLabel(value ?? "")}</span>;
}

function DemoNotice({ staff = false }: { staff?: boolean }) {
  return (
    <div className="demo-notice" role="note">
      <Info className="demo-notice-icon" size={16} />
      <div>
        <strong>{staff ? "Kenya MFA staff portal · prototype" : "Kenya consular-service prototype"}</strong>
        <p>{staff
          ? "Designed for the Ministry of Foreign and Diaspora Affairs and Kenyan missions abroad. Example records, role switching, staff authentication, and jurisdiction permissions are simulated—not operational Ministry systems."
          : "This prototype is designed for Kenyan citizens abroad but is not yet an operational Ministry service. Sample records and messages are illustrative. Travel registration does not replace visas, immigration requirements, or local emergency services."}</p>
      </div>
    </div>
  );
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return <button type="button" className="switch" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} />;
}

export default function EmbassyConnect() {
  const [data, setData] = useState<DemoState>(() => createInitialDemoState());
  const [ready, setReady] = useState(false);
  const [syncState, setSyncState] = useState<"loading" | "postgres" | "local">("loading");
  const [view, setView] = useState<View>("overview");
  const [showLanding, setShowLanding] = useState(true);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState<ToastData>(null);
  const [tripStep, setTripStep] = useState(1);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [checkoutTripId, setCheckoutTripId] = useState<string | null>(null);
  const [tripDraft, setTripDraft] = useState<TripDraft>(() => emptyTripDraft());
  const [tripError, setTripError] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [helpStep, setHelpStep] = useState(1);
  const [helpDraft, setHelpDraft] = useState<HelpDraft>({ category: "Lost or stolen passport", description: "", location: "", contactMethod: "Email", urgency: "standard" });
  const [helpError, setHelpError] = useState("");
  const [appointmentEditingId, setAppointmentEditingId] = useState<string | null>(null);
  const [appointmentDraft, setAppointmentDraft] = useState<AppointmentDraft>({ service: "Consular appointment", date: "", time: "10:00" });
  const [appointmentError, setAppointmentError] = useState("");
  const [alertDraft, setAlertDraft] = useState<AlertDraft>({ title: "", severity: "advisory", location: "", body: "", expiresDate: "" });
  const [alertStep, setAlertStep] = useState(1);
  const [resolutionCaseId, setResolutionCaseId] = useState<string | null>(null);
  const [resolutionDraft, setResolutionDraft] = useState("");
  const [crisisDraft, setCrisisDraft] = useState({ title: "", affectedArea: "" });
  const [crisisAnswer, setCrisisAnswer] = useState<"safe" | "need_help" | "not_affected">("safe");
  const [shareCrisisLocation, setShareCrisisLocation] = useState(false);
  const [crisisLocation, setCrisisLocation] = useState("");
  const [missionEditingId, setMissionEditingId] = useState<string | null>(null);
  const [profileDraft, setProfileDraft] = useState(data.profile);
  const [profileError, setProfileError] = useState("");
  const [selectedMissionId, setSelectedMissionId] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [wellbeingFilter, setWellbeingFilter] = useState("all");
  const [tripDateFrom, setTripDateFrom] = useState("");
  const [tripDateTo, setTripDateTo] = useState("");
  const [tripSort, setTripSort] = useState<"arrival" | "destination" | "status">("arrival");
  const [caseReply, setCaseReply] = useState("");
  const [internalNoteDraft, setInternalNoteDraft] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [alertFilter, setAlertFilter] = useState("all");
  const [missionFilter, setMissionFilter] = useState("all");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let cached = false;
    try {
      const saved = window.localStorage.getItem("kenya-embassy-connect-demo-v1");
      if (saved) {
        const parsed = JSON.parse(saved) as DemoState;
        if (isDemoState(parsed)) {
          cached = true;
          setData(parsed);
          setSyncState("local");
        }
      }
    } catch {
      try { window.localStorage.removeItem("kenya-embassy-connect-demo-v1"); } catch { /* Storage can be disabled by browser policy. */ }
    }
    fetch("/api/demo", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Demo storage is currently unavailable");
        return await response.json() as { state?: DemoState };
      })
      .then((payload) => {
        if (!cancelled && isDemoState(payload.state)) {
          setData(payload.state);
          setSyncState("postgres");
        }
      })
      .catch(() => {
        if (!cancelled) setSyncState(cached ? "local" : "local");
      })
      .finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem("kenya-embassy-connect-demo-v1", JSON.stringify(data)); } catch { /* Browser storage is optional in this demo. */ }
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/demo", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state: data }) });
        setSyncState(response.ok ? "postgres" : "local");
      } catch {
        setSyncState("local");
      }
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [data, ready]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 6500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const currentTrip = useMemo(() => data.trips.find((trip) => trip.status !== "departed") ?? null, [data.trips]);
  const unreadAlerts = useMemo(() => data.alerts.filter((alert) => !alert.read).length, [data.alerts]);
  const activeCases = useMemo(() => data.cases.filter((item) => item.status !== "resolved"), [data.cases]);
  const missionForTrip = (trip: Trip | null) => {
    if (!trip) return null;
    const mission = data.missions.find((item) => item.id === trip.missionId);
    return mission ? { ...mission, locallyPresent: normalizeCountry(mission.hostCountry) === normalizeCountry(trip.country) } : null;
  };
  const firstName = data.profile.fullName.trim().split(/\s+/)[0] || "traveller";
  const activeMission = missionForTrip(currentTrip);
  const staffMission = data.missions.find((mission) => mission.id === "kenya-paris") ?? data.missions[0];
  const scopedTrips = data.trips.filter((trip) => trip.missionId === staffMission?.id);
  const scopedCases = data.cases.filter((item) =>
    (staffMission?.serves ?? []).some((country) => item.location.toLowerCase().includes(country.toLowerCase())) ||
    scopedTrips.some((trip) => item.location.toLowerCase().includes(trip.country.toLowerCase()) || item.location.toLowerCase().includes(trip.city.toLowerCase()))
  );
  const scopedOpenCases = scopedCases.filter((item) => item.status !== "resolved");
  const latestAppointment = data.appointments.find((appointment) => appointment.status === "booked");
  const pageTitle: Record<View, string> = {
    overview: data.activeRole === "staff" ? "Mission overview" : "Your travel overview",
    trips: "My trips",
    directory: "Kenya missions & consulates",
    alerts: "Alerts & updates",
    cases: "Help & assistance",
    appointments: "Appointments",
    "emergency-card": "Emergency contact card",
    profile: "Profile & privacy",
    registrations: "Citizen registrations",
    "registration-detail": "Registration details",
    "staff-cases": "Assistance cases",
    "staff-alerts": "Alerts management",
    crisis: "Crisis wellbeing checks",
    "mission-settings": "Mission settings",
    audit: "Roles & audit history",
    "case-detail": "Case details",
  };

  const showToast = (title: string, body: string) => setToast({ title, body });
  const closeDialog = () => { setDialog(null); setFormError(""); setTripError(""); setHelpError(""); setAppointmentError(""); setProfileError(""); };
  const goTo = (next: View) => { setView(next); setMobileOpen(false); setSearch(""); setStatusFilter("all"); setWellbeingFilter("all"); setMissionFilter("all"); setTripDateFrom(""); setTripDateTo(""); };
  const changeRole = () => {
    const role: DemoRole = data.activeRole === "citizen" ? "staff" : "citizen";
    setData((previous) => ({ ...previous, activeRole: role }));
    setView("overview");
    setMobileOpen(false);
    showToast(role === "staff" ? "Staff preview opened" : "Citizen preview opened", "This demo role switch changes the interface only; it is not an authentication or permissions control.");
  };

  const openTripForm = (trip?: Trip) => {
    setEditingTripId(trip?.id ?? null);
    setTripDraft(emptyTripDraft(trip));
    setTripStep(1);
    setTripError("");
    setFormError("");
    setDialog("trip");
  };
  const enterCitizen = (startCheckIn = false) => {
    if (data.activeRole !== "citizen") setData((previous) => ({ ...previous, activeRole: "citizen" }));
    setShowLanding(false);
    goTo("overview");
    if (startCheckIn) openTripForm();
  };
  const enterStaff = () => {
    if (data.activeRole !== "staff") setData((previous) => ({ ...previous, activeRole: "staff" }));
    setShowLanding(false);
    goTo("overview");
  };
  const findEmbassyFromLanding = () => {
    if (data.activeRole !== "citizen") setData((previous) => ({ ...previous, activeRole: "citizen" }));
    setShowLanding(false);
    goTo("directory");
  };
  const resolveMission = (country: string, cityOrRegion = "") => {
    const normalized = normalizeCountry(country);
    const eligible = data.missions.filter((mission) => mission.canProvideConsularSupport && mission.serves.some((served) => normalizeCountry(served) === normalized));
    const localOffices = eligible.filter((mission) => normalizeCountry(mission.hostCountry) === normalized);
    if (localOffices.length === 1) return localOffices[0];
    if (localOffices.length > 1) {
      const place = normalizeCountry(cityOrRegion);
      const cityMatch = localOffices.find((mission) => place.includes(normalizeCountry(mission.hostCity)) || normalizeCountry(mission.hostCity).includes(place));
      return cityMatch ?? null;
    }
    const accredited = eligible.filter((mission) => normalizeCountry(mission.hostCountry) !== normalized);
    return accredited.length === 1 ? accredited[0] : null;
  };
  const destinationCode = (country: string) => COUNTRY_CODES[country] ?? Object.entries(COUNTRY_CODES).find(([name]) => normalizeCountry(name) === normalizeCountry(country))?.[1] ?? data.missions.find((mission) => normalizeCountry(mission.hostCountry) === normalizeCountry(country))?.hostCountryCode ?? "XX";
  const submitTrip = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const arrival = new Date(`${tripDraft.arrivalDate}T12:00:00`);
    const departure = tripDraft.departureUnknown || !tripDraft.departureDate ? null : new Date(`${tripDraft.departureDate}T12:00:00`);
    if (!tripDraft.country.trim()) { setTripError("Choose or type a destination country before continuing."); setTripStep(1); return; }
    if (!tripDraft.arrivalDate) { setTripError("Choose an arrival date before continuing."); setTripStep(1); return; }
    if (departure && departure < arrival) { setTripError("Expected departure must be on or after arrival."); setTripStep(1); return; }
    if (!tripDraft.city.trim()) { setTripError("Add a city or region so the mission can route your check-in."); setTripStep(1); return; }
    const existing = editingTripId ? data.trips.find((trip) => trip.id === editingTripId) : undefined;
    const route = resolveMission(tripDraft.country, `${tripDraft.city} ${tripDraft.region}`);
    const now = new Date().toISOString();
    const countryCode = destinationCode(tripDraft.country);
    const trip: Trip = {
      id: existing?.id ?? makeId("trip"),
      reference: existing?.reference ?? `KFA-${countryCode}-${Math.floor(10000 + Math.random() * 89999)}`,
      country: tripDraft.country.trim(),
      countryCode: countryCode === "XX" ? existing?.countryCode ?? "XX" : countryCode,
      city: tripDraft.city.trim(),
      region: tripDraft.region.trim() || tripDraft.city.trim(),
      arrivalDate: tripDraft.arrivalDate,
      departureDate: tripDraft.departureUnknown ? "" : tripDraft.departureDate,
      departureUnknown: tripDraft.departureUnknown,
      purpose: tripDraft.purpose,
      address: tripDraft.address.trim(),
      status: existing?.status ?? "registered",
      wellbeing: existing?.wellbeing ?? "safe",
      registeredAt: existing?.registeredAt ?? now,
      updatedAt: now,
      missionId: route?.id ?? "",
    };
    setData((previous) => {
      const trips = existing ? previous.trips.map((item) => item.id === trip.id ? trip : item) : [trip, ...previous.trips];
      const updated = addActivity({ ...previous, trips }, existing ? "Trip details updated" : "Travel registration received", `${trip.city}, ${trip.country} · ${trip.reference}`, "trip", now);
      return existing ? updated : addAudit(updated, "Created travel registration", trip.reference, previous.profile.fullName);
    });
    closeDialog();
    goTo("trips");
    showToast(existing ? "Trip details saved" : "Registration receipt created", `${trip.reference} · ${trip.city}, ${trip.country}. ${route ? `Responsible mission: ${route.name} in ${route.hostCity}, ${route.hostCountry}.` : "The prototype could not identify one responsible mission. Check the full Ministry directory before relying on a route."}`);
  };

  const applyWellbeing = (status: WellbeingStatus, note = "") => {
    const trip = currentTrip;
    if (!trip) { showToast("No active trip", "Register a destination before updating your trip status."); setDialog(null); openTripForm(); return; }
    const now = new Date().toISOString();
    setData((previous) => {
      const trips = previous.trips.map((item) => item.id !== trip.id ? item : {
        ...item,
        wellbeing: status,
        status: status === "left" ? "departed" : item.status,
        departureDate: status === "left" ? dateToday() : item.departureDate,
        updatedAt: now,
      });
      const title = status === "safe" ? "You confirmed you’re safe" : status === "left" ? "Trip checked out" : "Travel status updated";
      const detail = `${trip.city}, ${trip.country}${note.trim() ? ` · ${note.trim()}` : ""}`;
      return addActivity({ ...previous, trips }, title, detail, "status", now);
    });
    setDialog(null);
    if (status === "plans_changed") {
      showToast("Status updated", "Your trip is still active. Update dates or destination if you need to.");
      openTripForm(trip);
    } else {
      showToast(status === "left" ? "Trip closed" : "Wellbeing updated", status === "left" ? `${trip.reference} is saved in your trip history.` : "A missed reminder is never treated as evidence of danger.");
    }
  };

  const openHelpForm = (category?: string, urgent = false) => {
    setHelpDraft({ category: category ?? "Lost or stolen passport", description: "", location: currentTrip ? `${currentTrip.city}, ${currentTrip.country}` : "", contactMethod: "Email", urgency: urgent ? "urgent" : "standard" });
    setHelpStep(1);
    setHelpError("");
    setDialog("help");
  };
  const submitHelp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (helpStep === 1) {
      if (!helpDraft.description.trim() || !helpDraft.location.trim()) { setHelpError("Add a short description and your current location to continue."); return; }
      setHelpError("");
      setHelpStep(2);
      return;
    }
    const now = new Date().toISOString();
    const reference = `EC-${new Date().getUTCFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`;
    const newCase: AssistanceCase = {
      id: makeId("case"),
      reference,
      category: helpDraft.category,
      urgency: helpDraft.urgency,
      location: helpDraft.location.trim(),
      description: helpDraft.description.trim(),
      contactMethod: helpDraft.contactMethod,
      status: "submitted",
      assignedTo: "Not assigned",
      createdAt: now,
      updatedAt: now,
      progress: [{ id: makeId("progress"), label: "Request received", detail: "Your request is recorded in the demonstration workspace.", at: now }],
      messages: [],
      internalNotes: [],
    };
    setData((previous) => addActivity({ ...previous, cases: [newCase, ...previous.cases] }, "Assistance request submitted", `${newCase.category} · ${reference}`, "case", now));
    closeDialog();
    setSelectedCaseId(newCase.id);
    setView("case-detail");
    showToast("Request receipt created", `${reference} · You can follow the case status in this demo.`);
  };

  const setCaseStatus = (caseId: string, status: CaseStatus, resolutionNote = "") => {
    const now = new Date().toISOString();
    const label = CASE_STATUSES.find((item) => item.value === status)?.label ?? status;
    setData((previous) => {
      const cases = previous.cases.map((item) => item.id === caseId ? {
        ...item,
        status,
        updatedAt: now,
        progress: [...item.progress, { id: makeId("progress"), label, detail: status === "resolved" ? `Resolution note: ${resolutionNote.trim()}` : "Case status updated by the demonstration staff workspace.", at: now }],
      } : item);
      const target = previous.cases.find((item) => item.id === caseId)?.reference ?? caseId;
      return addAudit({ ...previous, cases }, `Changed case status to ${label}`, target);
    });
    showToast("Case status updated", `${label} · visible in the citizen preview.`);
  };

  const changeCasePriority = (caseId: string, urgency: "standard" | "urgent") => {
    setData((previous) => {
      const cases = previous.cases.map((item) => item.id === caseId ? { ...item, urgency, updatedAt: new Date().toISOString() } : item);
      const target = previous.cases.find((item) => item.id === caseId)?.reference ?? caseId;
      return addAudit({ ...previous, cases }, `Changed case priority to ${urgency}`, target);
    });
    showToast("Case priority updated", `${statusLabel(urgency)} · recorded in the demo audit history.`);
  };

  const sendCaseMessage = (caseId: string, body: string, role: "citizen" | "staff") => {
    if (!body.trim()) return;
    const now = new Date().toISOString();
    const message: CaseMessage = { id: makeId("message"), sender: role === "staff" ? "Officer Elena R. (demo)" : data.profile.fullName, role, body: body.trim(), at: now };
    setData((previous) => {
      const cases = previous.cases.map((item) => item.id === caseId ? { ...item, messages: [...item.messages, message], updatedAt: now } : item);
      const target = previous.cases.find((item) => item.id === caseId)?.reference ?? caseId;
      const updated = addActivity({ ...previous, cases }, role === "staff" ? "Secure case message sent" : "You replied to your case", target, "case", now);
      return role === "staff" ? addAudit(updated, "Sent citizen-visible case message", target) : updated;
    });
    setCaseReply("");
    showToast("Message added", "This is a simulated secure case thread in the demo.");
  };

  const addInternalNote = (caseId: string) => {
    if (!internalNoteDraft.trim()) return;
    const note: InternalNote = { id: makeId("note"), author: "Officer Elena R. (demo)", body: internalNoteDraft.trim(), at: new Date().toISOString() };
    setData((previous) => {
      const cases = previous.cases.map((item) => item.id === caseId ? { ...item, internalNotes: [...item.internalNotes, note], updatedAt: note.at } : item);
      const target = previous.cases.find((item) => item.id === caseId)?.reference ?? caseId;
      return addAudit({ ...previous, cases }, "Added internal case note", target);
    });
    setInternalNoteDraft("");
    showToast("Internal note added", "This note is visible only in the staff demonstration view.");
  };

  const changeCaseAssignment = (caseId: string, assignedTo: string) => {
    setData((previous) => {
      const cases = previous.cases.map((item) => item.id === caseId ? { ...item, assignedTo, updatedAt: new Date().toISOString() } : item);
      const target = previous.cases.find((item) => item.id === caseId)?.reference ?? caseId;
      return addAudit({ ...previous, cases }, `Assigned case to ${assignedTo}`, target);
    });
    showToast("Assignment updated", "The change is recorded in the demo audit history.");
  };

  const markArrival = (trip: Trip) => {
    const now = new Date().toISOString();
    setData((previous) => {
      const trips = previous.trips.map((item) => item.id === trip.id ? { ...item, status: "arrived" as const, updatedAt: now } : item);
      return addActivity({ ...previous, trips }, "Arrival confirmed", `${trip.city}, ${trip.country} · ${trip.reference}`, "trip", now);
    });
    showToast("Arrival confirmed", `${trip.reference} · Your registration is now marked arrived.`);
  };

  const confirmCheckout = () => {
    const trip = data.trips.find((item) => item.id === checkoutTripId);
    if (!trip) { closeDialog(); return; }
    const now = new Date().toISOString();
    setData((previous) => {
      const trips = previous.trips.map((item) => item.id === trip.id ? { ...item, status: "departed" as const, wellbeing: "left" as const, departureDate: dateToday(), updatedAt: now } : item);
      return addActivity({ ...previous, trips }, "Trip checked out", `${trip.city}, ${trip.country} · ${trip.reference}. Trip history retained.`, "trip", now);
    });
    closeDialog();
    setCheckoutTripId(null);
    showToast("You’ve checked out", `${trip.reference} is closed. Your trip history has been kept.`);
  };

  const openAppointment = (appointment?: Appointment) => {
    setAppointmentEditingId(appointment?.id ?? null);
    const appointmentMission = appointment ? data.missions.find((item) => item.id === appointment.missionId) : missionForTrip(currentTrip) ?? staffMission;
    const localStart = appointment && appointmentMission ? dateTimeInputInZone(appointment.startAt, appointment.timezone || appointmentMission.timezone) : null;
    setAppointmentDraft({
      service: appointment?.service ?? "Consular appointment",
      date: localStart?.date ?? "",
      time: localStart?.time ?? "10:00",
    });
    setAppointmentError("");
    setDialog("appointment");
  };
  const submitAppointment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!appointmentDraft.date || !appointmentDraft.time) { setAppointmentError("Choose a date and time to continue."); return; }
    const existing = appointmentEditingId ? data.appointments.find((item) => item.id === appointmentEditingId) : undefined;
    const mission = (existing ? data.missions.find((item) => item.id === existing.missionId) : null) ?? missionForTrip(currentTrip) ?? staffMission;
    if (!mission) { setAppointmentError("No mission details are available in this demo."); return; }
    const appointmentZone = existing?.timezone ?? mission.timezone;
    const startAt = zonedDateTimeToIso(appointmentDraft.date, appointmentDraft.time, appointmentZone);
    if (data.appointments.some((item) => item.status === "booked" && item.id !== existing?.id && item.startAt === startAt && item.missionId === mission.id)) {
      setAppointmentError("That sample time is already booked. Choose another time."); return;
    }
    const appointment: Appointment = {
      id: existing?.id ?? makeId("appointment"),
      reference: existing?.reference ?? `AP-${Math.floor(10000 + Math.random() * 89999)}`,
      service: appointmentDraft.service,
      missionId: existing?.missionId ?? mission.id,
      startAt,
      timezone: existing?.timezone ?? mission.timezone,
      status: "booked",
      requirements: existing?.requirements ?? ["Arrive 10 minutes early", "Bring relevant original documents if requested"],
    };
    setData((previous) => {
      const appointments = existing ? previous.appointments.map((item) => item.id === existing.id ? appointment : item) : [appointment, ...previous.appointments];
      const updated = addActivity({ ...previous, appointments }, existing ? "Appointment rescheduled" : "Appointment booked", `${appointment.service} · ${appointment.reference}`, "appointment");
      return addAudit(updated, existing ? "Rescheduled appointment" : "Booked appointment", appointment.reference, previous.profile.fullName);
    });
    closeDialog();
    goTo("appointments");
    showToast(existing ? "Appointment rescheduled" : "Appointment booked", `${appointment.reference} · ${formatDateTime(startAt, appointment.timezone)} (${appointment.timezone}).`);
  };

  const cancelAppointment = (appointment: Appointment) => {
    setData((previous) => {
      const appointments = previous.appointments.map((item) => item.id === appointment.id ? { ...item, status: "cancelled" as const } : item);
      const updated = addActivity({ ...previous, appointments }, "Appointment cancelled", `${appointment.reference} · ${appointment.service}`, "appointment");
      return addAudit(updated, "Cancelled appointment", appointment.reference, previous.profile.fullName);
    });
    showToast("Appointment cancelled", `${appointment.reference} remains in your history.`);
  };

  const publishAlert = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!alertDraft.title.trim() || !alertDraft.body.trim() || !alertDraft.location.trim() || !alertDraft.expiresDate) {
      setFormError("Complete the title, affected location, message, and expiry date."); return;
    }
    if (alertStep === 1) { setFormError(""); setAlertStep(2); return; }
    const now = new Date().toISOString();
    const alert: AlertItem = {
      id: makeId("alert"),
      title: alertDraft.title.trim(),
      severity: alertDraft.severity,
      location: alertDraft.location.trim(),
      body: alertDraft.body.trim(),
      publishedAt: now,
      expiresAt: new Date(`${alertDraft.expiresDate}T23:59:00`).toISOString(),
      verified: false,
      read: false,
    };
    setData((previous) => addAudit(addActivity({ ...previous, alerts: [alert, ...previous.alerts] }, "Official demo alert published", alert.title, "alert", now), "Published targeted alert", alert.title));
    closeDialog();
    goTo(data.activeRole === "staff" ? "staff-alerts" : "alerts");
    showToast("Sample alert published", `${scopedTrips.filter((trip) => trip.status !== "departed").length} sample registrations in the ${staffMission?.name ?? "assigned mission"} jurisdiction. Delivery is simulated.`);
  };

  const openCrisisCheck = () => {
    setCrisisDraft({ title: "Wellbeing check · DEMO ONLY", affectedArea: staffMission?.serves.find((country) => normalizeCountry(country) !== normalizeCountry(staffMission.hostCountry)) ?? staffMission?.hostCountry ?? "Kenya" });
    setDialog("crisis");
    setFormError("");
  };
  const sendCrisisCheck = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!crisisDraft.title.trim() || !crisisDraft.affectedArea.trim()) { setFormError("Enter a check-in name and affected area."); return; }
    const now = new Date().toISOString();
    const nextCrisis: CrisisEvent = {
      id: makeId("crisis"),
      title: crisisDraft.title.trim(),
      affectedArea: crisisDraft.affectedArea.trim(),
      createdAt: now,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      status: "active",
      responses: [{ id: makeId("response"), citizen: data.profile.fullName, response: "awaiting", respondedAt: null, locationShared: false, location: "" }],
    };
    setData((previous) => addAudit({ ...previous, crisis: nextCrisis }, "Created targeted wellbeing check", nextCrisis.title));
    closeDialog();
    goTo("crisis");
    showToast("Wellbeing request sent", "One fictional registration is targeted in this preview. Delivery is simulated; nonresponse does not imply danger.");
  };

  const respondToCrisis = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const now = new Date().toISOString();
    const response = { safe: "safe" as const, need_help: "need_help" as const, not_affected: "not_affected" as const }[crisisAnswer];
    setData((previous) => {
      const existing = previous.crisis.responses.find((item) => item.citizen === previous.profile.fullName);
      const responseRecord = {
        id: existing?.id ?? makeId("response"),
        citizen: previous.profile.fullName,
        response,
        respondedAt: now,
        locationShared: shareCrisisLocation,
        location: shareCrisisLocation ? crisisLocation.trim() : "",
      };
      const responses = existing
        ? previous.crisis.responses.map((item) => item.id === existing.id ? responseRecord : item)
        : [...previous.crisis.responses, responseRecord];
      return addActivity({ ...previous, crisis: { ...previous.crisis, responses } }, "You responded to a wellbeing request", `${previous.crisis.title} · ${statusLabel(response)}`, "status", now);
    });
    closeDialog();
    if (response === "need_help") openHelpForm("Crisis or evacuation information", true);
    else showToast("Response recorded", "Your response is saved for this specific demo request. Location is only included if you chose to share it.");
  };

  const openProfile = () => { setProfileDraft({ ...data.profile, emergencyContact: data.profile.emergencyContact ? { ...data.profile.emergencyContact } : null }); setDialog("profile"); };
  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profileDraft.fullName.trim() || !profileDraft.email.trim() || !profileDraft.citizenship.trim()) { setProfileError("Add your name, citizenship, and email address."); return; }
    setData((previous) => addActivity({ ...previous, profile: { ...profileDraft, fullName: profileDraft.fullName.trim(), email: profileDraft.email.trim() } }, "Profile details updated", "Your emergency contact is not automatically notified or shared.", "status"));
    closeDialog();
    showToast("Profile updated", "Changes are saved to the shared fictional demo workspace.");
  };

  const saveMission = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!missionEditingId) return;
    const form = new FormData(event.currentTarget);
    const mission = data.missions.find((item) => item.id === missionEditingId);
    if (!mission) return;
    const updatedMission: Mission = {
      ...mission,
      name: String(form.get("name") ?? "").trim(),
      address: String(form.get("address") ?? "").trim(),
      hours: String(form.get("hours") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      timezone: String(form.get("timezone") ?? "").trim(),
    };
    setData((previous) => addAudit({ ...previous, missions: previous.missions.map((item) => item.id === updatedMission.id ? updatedMission : item) }, "Updated mission contact settings", updatedMission.name));
    closeDialog();
    showToast("Mission settings saved", "Changes are stored in this demonstration only.");
  };

  const toggleAlertRead = (alertId: string) => {
    setData((previous) => ({ ...previous, alerts: previous.alerts.map((item) => item.id === alertId ? { ...item, read: !item.read } : item) }));
  };

  const downloadText = (filename: string, contents: string) => {
    const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadEmergencyCard = () => {
    const trip = currentTrip;
    const mission = missionForTrip(trip);
    const lines = [
      "EMBASSY CONNECT — KENYA MFA SERVICE PROTOTYPE CONTACT CARD",
      `Citizen: ${data.profile.fullName}`,
      `Trip reference: ${trip?.reference ?? "No active trip"}`,
      `Destination: ${trip ? `${trip.city}, ${trip.country}` : "Not set"}`,
      `Possible mission from published accreditation: ${mission?.name ?? "No single route identified"}`,
      `Mission location: ${mission ? `${mission.hostCity}, ${mission.hostCountry}` : "Check the official MFA directory"}`,
      `Mission address: ${mission?.address || "Not included in this prototype record"}`, 
      `Published general office phone: ${mission?.phone || "Not listed in the selected source"}`,
      `Published general office email: ${mission?.email || "Not listed in the selected source"}`,
      `Dedicated emergency line: ${mission?.emergency || "Not verified or included"}`,
      `Official source: ${mission?.sourceUrl ?? MFA_DIRECTORY_URL}`, 
      `Citizen-selected emergency contact: ${data.profile.emergencyContact ? `${data.profile.emergencyContact.name} · ${data.profile.emergencyContact.phone}` : "Not provided"}`,
      `Card generated: ${formatDate(new Date())}`,
      "The citizen profile and trip in this prototype are fictional. Published mission contacts are not checked in real time; confirm them from the linked Ministry/mission source.",
      "General office contacts are not assumed to be emergency lines. For immediate danger, contact local emergency services using official local information.",
    ];
    downloadText("kenya-mfa-contact-card-prototype.txt", lines.join("\n"));
    showToast("Prototype contact card downloaded", "Fictional citizen details are labelled, with a link to the official mission source.");
  };

  const downloadDataExport = () => {
    downloadText("embassy-connect-demo-export.json", JSON.stringify({ profile: data.profile, trips: data.trips, alerts: data.alerts, cases: data.cases, appointments: data.appointments }, null, 2));
    showToast("Demo export downloaded", "The export contains fictional profile and travel information from this shared demo.");
  };

  const navigation: NavGroup[] = data.activeRole === "citizen"
    ? [
        { label: "Workspace", items: [{ id: "overview", label: "Overview", icon: Home }] },
        { label: "Your travel", items: [{ id: "trips", label: "My trips", icon: Plane }, { id: "directory", label: "Kenya missions & consulates", icon: Building2 }] },
        { label: "Stay informed", items: [{ id: "alerts", label: "Alerts & updates", icon: Bell, badge: unreadAlerts }] },
        { label: "Get support", items: [{ id: "cases", label: "Help & assistance", icon: HeartHandshake, badge: activeCases.length }, { id: "appointments", label: "Appointments", icon: CalendarDays }, { id: "emergency-card", label: "Emergency contact card", icon: FileText }] },
        { label: "Account", items: [{ id: "profile", label: "Profile & privacy", icon: UserRound }] },
      ]
    : [
        { label: "Mission workspace", items: [{ id: "overview", label: "Mission overview", icon: Home }] },
        { label: "Consular operations", items: [{ id: "registrations", label: "Registrations", icon: UsersRound }, { id: "staff-cases", label: "Assistance cases", icon: HeartHandshake, badge: scopedOpenCases.length }, { id: "appointments", label: "Appointments", icon: CalendarDays }] },
        { label: "Communications", items: [{ id: "staff-alerts", label: "Alerts management", icon: Bell }, { id: "crisis", label: "Wellbeing checks", icon: ShieldAlert }] },
        { label: "Administration", items: [{ id: "mission-settings", label: "Mission settings", icon: Settings2 }, { id: "audit", label: "Roles & audit history", icon: FileText }] },
      ];

  const activeView = data.activeRole === "staff" && ["trips", "directory", "alerts", "cases", "emergency-card", "profile"].includes(view)
    ? "overview"
    : data.activeRole === "citizen" && ["registrations", "registration-detail", "staff-cases", "staff-alerts", "crisis", "mission-settings", "audit"].includes(view)
      ? "overview"
      : view;

  const filteredTrips = (data.activeRole === "staff" ? scopedTrips : data.trips).filter((trip) => {
    const query = search.toLowerCase();
    const staffList = data.activeRole === "staff" && view === "registrations";
    const searchable = [trip.country, trip.city, trip.region, trip.reference, trip.purpose, ...(staffList ? [data.profile.fullName, data.profile.email] : [])];
    const matchesSearch = !query || searchable.some((value) => value.toLowerCase().includes(query));
    const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
    const matchesWellbeing = !staffList || wellbeingFilter === "all" || trip.wellbeing === wellbeingFilter;
    const overlapsStart = !staffList || !tripDateFrom || (trip.departureDate ? trip.departureDate >= tripDateFrom : trip.arrivalDate >= tripDateFrom);
    const overlapsEnd = !staffList || !tripDateTo || trip.arrivalDate <= tripDateTo;
    return matchesSearch && matchesStatus && matchesWellbeing && overlapsStart && overlapsEnd;
  }).sort((left, right) => {
    if (tripSort === "destination") return left.country.localeCompare(right.country) || left.city.localeCompare(right.city);
    if (tripSort === "status") return left.status.localeCompare(right.status);
    return right.arrivalDate.localeCompare(left.arrivalDate);
  });
  const filteredCases = (data.activeRole === "staff" ? scopedCases : data.cases).filter((item) => {
    const query = search.toLowerCase();
    const matchesSearch = !query || [item.reference, item.category, item.location, item.description, item.assignedTo].some((value) => value.toLowerCase().includes(query));
    return matchesSearch && (statusFilter === "all" || item.status === statusFilter);
  });
  const staffAlertRecords = data.alerts.filter((item) => (staffMission?.serves ?? []).some((country) => item.location.toLowerCase().includes(country.toLowerCase())) || item.location.toLowerCase().includes((staffMission?.hostCity ?? "").toLowerCase()));
  const filteredAlerts = (data.activeRole === "staff" ? staffAlertRecords : data.alerts).filter((item) => {
    if (alertFilter === "unread" && item.read) return false;
    if (alertFilter !== "all" && alertFilter !== "unread" && item.severity !== alertFilter) return false;
    const query = search.toLowerCase();
    return !query || [item.title, item.location, item.body].some((value) => value.toLowerCase().includes(query));
  });
  const selectedCase = data.cases.find((item) => item.id === selectedCaseId) ?? null;
  const selectedTrip = data.trips.find((item) => item.id === selectedTripId) ?? null;

  const renderCitizenOverview = () => (
    <>
      <DemoNotice />
      <PageHeading
        eyebrow="Your consular companion"
        title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, ${firstName}`}
        description="A clear place to check in, stay informed, and find consular support while you’re abroad."
        actions={<><button className="btn btn-secondary" onClick={() => goTo("directory")}><Building2 size={14} /> Find an embassy</button><button className="btn btn-primary" onClick={() => openTripForm()}><Plus size={14} /> Check in</button></>}
      />
      {data.crisis.status === "active" && (
        <div className="urgent-banner" style={{ marginBottom: 16 }}>
          <ShieldAlert size={17} />
          <div style={{ flex: 1 }}><strong>Wellbeing request for {data.crisis.affectedArea}</strong><p>{data.crisis.title}. Respond if this applies to you. A missing reply is not treated as evidence of danger.</p></div>
          <button className="btn btn-sm btn-secondary" onClick={() => { setCrisisAnswer("safe"); setShareCrisisLocation(false); setDialog("crisis"); }}>Respond <ArrowRight size={12} /></button>
        </div>
      )}
      <div className="dashboard-grid">
        <div className="stack">
          {currentTrip ? (
            <section className="panel trip-hero" aria-label="Current trip">
              <div className="trip-hero-top">
                <div><p className="kicker">Your current destination</p><h2>{currentTrip.city}, {currentTrip.country}</h2><p className="trip-hero-copy">{currentTrip.purpose} · Registration {currentTrip.reference}</p></div>
                <span className="trip-badge"><span className="demo-stamp-dot" style={{ width: 6, height: 6, background: "#9cd3b8", boxShadow: "none", margin: 0 }} />{statusLabel(currentTrip.status)}</span>
              </div>
              <div className="trip-meta">
                <div className="trip-meta-item"><div className="trip-meta-label">Arrived</div><div className="trip-meta-value">{formatDate(currentTrip.arrivalDate)}</div></div>
                <div className="trip-meta-item"><div className="trip-meta-label">Expected departure</div><div className="trip-meta-value">{currentTrip.departureUnknown || !currentTrip.departureDate ? "Not set yet" : formatDate(currentTrip.departureDate)}</div></div>
                <div className="trip-meta-item"><div className="trip-meta-label">Last updated</div><div className="trip-meta-value">{relativeDate(currentTrip.updatedAt)}</div></div>
              </div>
              <div className="trip-hero-actions">
                <button className="btn btn-sm btn-secondary" onClick={() => openTripForm(currentTrip)}><Pencil size={12} /> Edit trip</button>
                {currentTrip.status === "registered" && <button className="btn btn-sm btn-secondary" onClick={() => markArrival(currentTrip)}><Check size={12} /> Confirm arrival</button>}
                {currentTrip.status === "arrived" && <button className="btn btn-sm btn-secondary" onClick={() => { setCheckoutTripId(currentTrip.id); setDialog("checkout"); }}><ArrowUpRight size={12} /> Check out</button>}
              </div>
            </section>
          ) : (
            <section className="panel panel-pad"><div className="empty-state"><div className="empty-icon"><Plane size={20} /></div><h3>No active trip yet</h3><p>Register a destination before departure or after arrival. Your closed trips remain available in your history.</p><button className="btn btn-primary" onClick={() => openTripForm()}><Plus size={14} /> Register a trip</button></div></section>
          )}
          {activeMission ? (
            <div className="embassy-inline"><div className="embassy-mark"><Building2 size={17} /></div><div><div className="embassy-title">{activeMission.name}</div><div className="embassy-loc">Responsible mission · {activeMission.locallyPresent ? `${activeMission.hostCity}, ${activeMission.hostCountry}` : `serves ${currentTrip?.country} from ${activeMission.hostCity}, ${activeMission.hostCountry}`}</div></div><button className="text-button" onClick={() => { setSelectedMissionId(activeMission.id); goTo("directory"); }}>Contact mission <ChevronRight size={12} /></button></div>
          ) : currentTrip ? (
            <div className="routing-note"><Info size={14} /><span>No sample mission is listed for {currentTrip.country}. This demo does not provide live contact details. Use the directory to review available missions or contact the relevant government service.</span></div>
          ) : null}
          {currentTrip && (
            <div className="status-card">
              <div className="status-icon"><ShieldCheck size={17} /></div>
              <div style={{ flex: 1 }}><div className="status-title">{currentTrip.wellbeing === "safe" ? "Your latest update: I’m safe" : `Your latest update: ${statusLabel(currentTrip.wellbeing)}`}</div><div className="status-copy">Last updated {formatDateTime(currentTrip.updatedAt)}. Travel registration and assistance case status are tracked separately.</div><div className="status-actions"><button className="btn btn-sm btn-secondary" onClick={() => { setStatusNote(""); setDialog("status"); }}><RefreshIcon /> Update my status</button><button className="btn btn-sm btn-ghost" onClick={() => openHelpForm()}>Get assistance</button></div></div>
            </div>
          )}
          <div className="grid-2">
            <button className="action-tile" onClick={() => openTripForm()}><span className="action-tile-icon"><Plus size={15} /></span><span><strong>Register another trip</strong><small>Start a new destination check-in</small></span><ChevronRight size={14} style={{ marginLeft: "auto", color: "#97a5a3" }} /></button>
            <button className="action-tile urgent" onClick={() => setDialog("urgent")}><span className="action-tile-icon"><Siren size={16} /></span><span><strong>Get urgent help</strong><small>See emergency contact guidance</small></span><ChevronRight size={14} style={{ marginLeft: "auto", color: "#97a5a3" }} /></button>
          </div>
          <section className="panel panel-pad">
            <PanelHeader title="Your recent activity" subtitle="A record of updates you’ve made in this demo." action={<button className="text-button" onClick={() => goTo("trips")}>View trips <ChevronRight size={12} /></button>} />
            <div className="activity-list">{[...data.activity].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 4).map((item) => <ActivityRow key={item.id} item={item} />)}</div>
          </section>
        </div>
        <div className="stack">
          <section className="panel panel-pad">
            <PanelHeader title="Alerts for you" subtitle={`${unreadAlerts} unread · prototype notices, not official MFA alerts`} action={<button className="text-button" onClick={() => goTo("alerts")}>All alerts <ChevronRight size={12} /></button>} />
            {data.alerts.slice(0, 2).map((alert) => <AlertRow key={alert.id} item={alert} compact />)}
            {data.alerts.length === 0 && <EmptyInline message="There are no current alerts for your saved trips." />}
          </section>
          <section className="panel panel-pad">
            <PanelHeader title="Assistance requests" subtitle="Case progress is separate from your travel status." action={<button className="text-button" onClick={() => goTo("cases")}>View cases <ChevronRight size={12} /></button>} />
            {activeCases.slice(0, 2).map((item) => <button className="case-banner btn-wide" key={item.id} style={{ marginBottom: 8, textAlign: "left", cursor: "pointer" }} onClick={() => { setSelectedCaseId(item.id); goTo("case-detail"); }}><span className="case-banner-icon"><HeartHandshake size={17} /></span><span className="case-banner-text"><strong>{item.category}</strong><span>{item.reference} · {statusLabel(item.status)}</span></span><ChevronRight size={14} color="#79908d" /></button>)}
            {activeCases.length === 0 && <EmptyInline message="You don’t have an open assistance case." />}
            <button className="btn btn-secondary btn-wide" style={{ marginTop: 8 }} onClick={() => openHelpForm()}><Plus size={13} /> Start an assistance request</button>
          </section>
          <section className="panel panel-pad">
            <PanelHeader title="Next appointment" action={<button className="text-button" onClick={() => goTo("appointments")}>Manage <ChevronRight size={12} /></button>} />
            {latestAppointment ? <AppointmentSummary appointment={latestAppointment} mission={data.missions.find((mission) => mission.id === latestAppointment.missionId)} /> : <EmptyInline message="No upcoming consular appointments." />}
            <button className="btn btn-ghost btn-wide" style={{ marginTop: 8 }} onClick={() => openAppointment()}><CalendarDays size={13} /> Book an appointment</button>
          </section>
        </div>
      </div>
    </>
  );

  const renderStaffOverview = () => {
    const activeRegs = scopedTrips.filter((trip) => trip.status !== "departed").length;
    const arrivalCount = scopedTrips.filter((trip) => trip.status === "arrived").length;
    const departureCount = scopedTrips.filter((trip) => trip.status === "departed").length;
    const urgentCount = scopedOpenCases.filter((item) => item.urgency === "urgent").length;
    const responded = data.crisis.responses.filter((item) => item.response !== "awaiting").length;
    const awaiting = data.crisis.responses.filter((item) => item.response === "awaiting").length;
    return (
      <>
        <DemoNotice staff />
        <PageHeading eyebrow={`Consular operations · ${staffMission?.name ?? "Kenyan mission"} · prototype`} title="Mission overview" description="A focused view of sample Kenyan citizen registrations, consular requests, and mission communications within this mission’s listed jurisdiction." actions={<><button className="btn btn-secondary" onClick={() => goTo("registrations")}><UsersRound size={14} /> View registrations</button><button className="btn btn-primary" onClick={() => openCrisisCheck()}><ShieldAlert size={14} /> Start wellbeing check</button></>} />
        <div className="grid-4" style={{ marginBottom: 16 }}>
          <StatCard label="Active registrations" value={activeRegs.toString()} foot="In this demo jurisdiction" icon={UsersRound} onClick={() => goTo("registrations")} />
          <StatCard label="Arrivals / departures" value={`${arrivalCount} / ${departureCount}`} foot="Arrived · checked out" icon={Plane} onClick={() => goTo("registrations")} />
          <StatCard label="Open cases" value={scopedOpenCases.length.toString()} foot={`${urgentCount} marked urgent`} icon={HeartHandshake} onClick={() => goTo("staff-cases")} />
          <StatCard label="Wellbeing responses" value={`${responded} / ${responded + awaiting}`} foot={`${awaiting} not yet responded · no danger inferred`} icon={ShieldCheck} onClick={() => goTo("crisis")} />
        </div>
        <div className="dashboard-grid">
          <div className="stack">
            <section className="panel panel-pad">
              <PanelHeader title="Registration activity" subtitle="Illustrative sample activity · active registrations by day" action={<span className="inline-tag"><Activity size={11} /> Demo trend</span>} />
              <div className="staff-chart" aria-label="Illustrative sample registrations chart">
                {[{ day: "Mon", a: 42, b: 25 }, { day: "Tue", a: 68, b: 34 }, { day: "Wed", a: 53, b: 30 }, { day: "Thu", a: 83, b: 48 }, { day: "Fri", a: 60, b: 29 }, { day: "Sat", a: 37, b: 18 }, { day: "Sun", a: 48, b: 23 }].map((column) => <div className="chart-col" key={column.day}><div className="chart-bars"><span className="chart-bar secondary" style={{ height: `${column.b}%` }} /><span className="chart-bar" style={{ height: `${column.a}%` }} /></div><span className="chart-label">{column.day}</span></div>)}
              </div>
              <div className="chart-legend"><span><i className="legend-swatch" /> New check-ins</span><span><i className="legend-swatch light" /> Arrivals confirmed</span></div>
            </section>
            <section className="panel panel-pad">
              <PanelHeader title="Recently updated cases" subtitle="Prioritise urgent requests and keep citizen messages separate from internal notes." action={<button className="text-button" onClick={() => goTo("staff-cases")}>Open case queue <ChevronRight size={12} /></button>} />
              <div className="stack-sm">{scopedOpenCases.slice(0, 3).map((item) => <CaseQueueRow key={item.id} item={item} onClick={() => { setSelectedCaseId(item.id); goTo("case-detail"); }} />)}{scopedOpenCases.length === 0 && <EmptyInline message="No open cases in this sample jurisdiction." />}</div>
            </section>
          </div>
          <div className="stack">
            <section className="panel panel-pad">
              <PanelHeader title="Crisis wellbeing check" subtitle={data.crisis.affectedArea} action={<Pill value={data.crisis.status} />} />
              <p style={{ margin: "0 0 11px", color: "#526c70", fontSize: 10, fontWeight: 700 }}>{data.crisis.title}</p>
              <div className="response-bar" aria-label={`${responded} of ${responded + awaiting} responses received`}><div className="response-bar-fill" style={{ width: `${responded + awaiting ? responded / (responded + awaiting) * 100 : 0}%` }} /></div>
              <div className="response-legend" style={{ marginTop: 10 }}><span><i />{data.crisis.responses.filter((item) => item.response === "safe").length} safe</span><span><i className="help-dot" />{data.crisis.responses.filter((item) => item.response === "need_help").length} need help</span><span><i className="wait-dot" />{awaiting} awaiting</span></div>
              <div className="form-help" style={{ marginTop: 13 }}>Nonresponse is shown separately. It is never treated as evidence that someone is missing or injured.</div>
              <button className="btn btn-secondary btn-wide" style={{ marginTop: 11 }} onClick={() => goTo("crisis")}>Review responses <ArrowRight size={13} /></button>
            </section>
            <section className="panel panel-pad">
              <PanelHeader title="Upcoming appointments" action={<button className="text-button" onClick={() => goTo("appointments")}>Manage <ChevronRight size={12} /></button>} />
              {data.appointments.filter((appointment) => appointment.status === "booked").slice(0, 2).map((appointment) => <AppointmentSummary key={appointment.id} appointment={appointment} mission={data.missions.find((mission) => mission.id === appointment.missionId)} />)}
              {data.appointments.every((appointment) => appointment.status !== "booked") && <EmptyInline message="No upcoming bookings in this sample." />}
            </section>
            <button className="action-tile" onClick={() => goTo("staff-alerts")}><span className="action-tile-icon"><Bell size={15} /></span><span><strong>Manage mission alerts</strong><small>Publish a targeted service or safety update</small></span><ChevronRight size={14} style={{ marginLeft: "auto", color: "#97a5a3" }} /></button>
          </div>
        </div>
      </>
    );
  };

  const renderTrips = () => {
    const active = filteredTrips.filter((trip) => trip.status !== "departed");
    const history = filteredTrips.filter((trip) => trip.status === "departed");
    return <>
      <PageHeading eyebrow="Travel registration" title="My trips" description="Register, update, and close trips. Checking out keeps a record in your trip history." actions={<button className="btn btn-primary" onClick={() => openTripForm()}><Plus size={14} /> Register a trip</button>} />
      <div className="demo-notice"><Info className="demo-notice-icon" size={16} /><div><strong>Before you travel</strong><p>Registration helps an embassy communicate with you. It does not replace visas, immigration registration, travel insurance, or local emergency services.</p></div></div>
      <div className="filter-row"><label className="search-bar"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search destination or reference" aria-label="Search trips" /></label><select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter trips by status"><option value="all">All trip statuses</option><option value="registered">Registered</option><option value="arrived">Arrived</option><option value="departed">Trip closed</option></select></div>
      <section className="panel panel-pad" style={{ marginBottom: 16 }}><PanelHeader title="Current and upcoming" subtitle={`${active.length} active registration${active.length === 1 ? "" : "s"}`} />{active.length ? <div className="stack-sm">{active.map((trip) => <TripCard key={trip.id} trip={trip} mission={missionForTrip(trip)} onEdit={() => openTripForm(trip)} onArrival={() => markArrival(trip)} onCheckout={() => { setCheckoutTripId(trip.id); setDialog("checkout"); }} onContact={() => { const mission = missionForTrip(trip); if (mission) { setSelectedMissionId(mission.id); goTo("directory"); } else goTo("directory"); }} />)}</div> : <div className="empty-state"><div className="empty-icon"><Plane size={20} /></div><h3>No matching trips</h3><p>Try a different filter or register a destination to get started.</p><button className="btn btn-primary" onClick={() => openTripForm()}><Plus size={13} /> Register a trip</button></div>}</section>
      <section className="panel panel-pad"><PanelHeader title="Trip history" subtitle="Departed trips remain available here." />{history.length ? <div className="stack-sm">{history.map((trip) => <TripCard key={trip.id} trip={trip} mission={missionForTrip(trip)} onEdit={() => openTripForm(trip)} onArrival={() => markArrival(trip)} onCheckout={() => { setCheckoutTripId(trip.id); setDialog("checkout"); }} onContact={() => goTo("directory")} compact />)}</div> : <EmptyInline message="Completed trips will appear here after you check out." />}</section>
    </>;
  };

  const renderDirectory = () => {
    const normalized = search.trim().toLowerCase();
    const matchesType = (mission: Mission) => {
      if (missionFilter === "embassies") return mission.missionType === "Embassy" || mission.missionType === "High Commission";
      if (missionFilter === "consulates") return mission.missionType === "Consulate" || mission.missionType === "Consulate General" || mission.missionType === "Honorary Consulate";
      if (missionFilter === "permanent") return mission.missionType === "Permanent Mission" || mission.missionType === "Liaison Office";
      return true;
    };
    const missions = data.missions.filter((mission) => matchesType(mission) && (!normalized || [mission.name, mission.missionType, mission.hostCountry, mission.hostCity, ...mission.serves, ...mission.districts, mission.phone, mission.email].some((item) => item.toLowerCase().includes(normalized)))).sort((left, right) => left.hostCountry.localeCompare(right.hostCountry) || left.hostCity.localeCompare(right.hostCity));
    const focusMission = data.missions.find((mission) => mission.id === selectedMissionId);
    return <>
      <PageHeading eyebrow="Republic of Kenya · worldwide missions" title="Embassies, high commissions & consulates" description="Search Kenyan diplomatic posts by host city, destination, accredited country, or region. Each record links to its Ministry or mission source. Confirm the responsible post and current contact details before relying on them." actions={<><a className="btn btn-secondary" href={MFA_MISSIONS_URL} target="_blank" rel="noreferrer"><ExternalLink size={13} /> MFA mission listing</a><a className="btn btn-primary" href={MFA_DIRECTORY_URL} target="_blank" rel="noreferrer"><FileText size={13} /> Full MFA directory</a></>} />
      <div className="demo-notice"><Info className="demo-notice-icon" size={16} /><div><strong>Kenya mission directory · prototype</strong><p>Compiled from the Ministry’s published diplomatic-missions listing and its 2025/26 diplomatic directory. These source publications do not fully agree on every listing. This page is not a live Ministry directory; recheck the linked source. General office contacts are not emergency lines.</p></div></div>
      <div className="filter-row"><label className="search-bar"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search country, city, mission, or region" aria-label="Search Kenyan missions" /></label><select className="filter-select" value={missionFilter} onChange={(event) => setMissionFilter(event.target.value)} aria-label="Filter by mission type"><option value="all">All mission types</option><option value="embassies">Embassies & high commissions</option><option value="consulates">Consulates</option><option value="permanent">Permanent missions</option></select><span className="inline-tag"><Building2 size={11} /> {missions.length} records in this prototype</span></div>
      <div className="grid-2">{missions.map((mission) => {
        const accreditedElsewhere = mission.serves.filter((country) => normalizeCountry(country) !== normalizeCountry(mission.hostCountry));
        const expanded = focusMission?.id === mission.id;
        return <article className="panel directory-card" key={mission.id}>
          <div className="directory-card-top"><div><div className="embassy-mark"><Building2 size={17} /></div><h3>{mission.name}</h3><p>{mission.missionType} · {mission.hostCity}, {mission.hostCountry}</p></div><span className="pill service">MFA source linked</span></div>
          {accreditedElsewhere.length > 0 && <div className="routing-note" style={{ marginTop: 12 }}><Navigation size={13} /><span>This post is listed as accredited to {accreditedElsewhere.join(", ")}. Check the Ministry source to confirm the responsible mission for your exact destination.</span></div>}
          {!mission.canProvideConsularSupport && <div className="form-help" style={{ marginTop: 12 }}>This is a permanent/multilateral mission, not a country consular service desk.</div>}
          <div className="directory-details">
            {mission.address && <div className="directory-detail"><MapPin size={12} /><span>{mission.address}</span></div>}
            {mission.phone && <div className="directory-detail"><Phone size={12} /><a href={`tel:${mission.phone.replaceAll(/[^+\\d]/g, "")}`}>{mission.phone}</a></div>}
            {mission.email && <div className="directory-detail"><Mail size={12} /><a href={`mailto:${mission.email}`}>{mission.email}</a></div>}
            <div className="directory-detail"><Clock3 size={12} /><span>Time zone reference: {mission.timezone}. Opening hours are not listed in this prototype.</span></div>
            <div className="directory-detail"><ShieldAlert size={12} /><span>No separate emergency number is listed here. Use the linked official source and local emergency-services information.</span></div>
          </div>
          <div className="directory-services">{mission.serves.map((country) => <span className="service-tag" key={country}>Serves {country}</span>)}{mission.districts.map((district) => <span className="service-tag" key={`district-${district}`}>District: {district}</span>)}{mission.services.map((service) => <span className="service-tag" key={service}>{service}</span>)}</div>
          <div className="panel-head" style={{ alignItems: "center", marginBottom: 0 }}><span className="panel-subtitle">Source checked {formatDate(mission.verifiedAt)} · {mission.sourceLabel}</span><button className="btn btn-sm btn-secondary" type="button" onClick={() => setSelectedMissionId(expanded ? "" : mission.id)}>{expanded ? "Hide source note" : "Source details"} <ChevronDown size={12} /></button></div>
          {expanded && <div className="form-help" style={{ marginTop: 12 }}><strong>{mission.contactNote}</strong><br />Contact data is published for general enquiries only unless the linked Ministry source states otherwise. Current services, opening hours, emergency arrangements, and accreditation must be reconfirmed with the mission.<br /><a href={mission.sourceUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, color: "#347b70", fontWeight: 700, textDecoration: "none" }}>Open official Ministry/mission source <ExternalLink size={11} /></a></div>}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}><a className="btn btn-sm btn-secondary" href={mission.sourceUrl} target="_blank" rel="noreferrer">Open official source <ExternalLink size={11} /></a></div>
        </article>;
      })}</div>
      {missions.length === 0 && <div className="panel"><div className="empty-state"><div className="empty-icon"><Search size={20} /></div><h3>No Kenyan post matches that search</h3><p>This does not mean Kenya has no consular representation there. Check the full Ministry diplomatic directory or contact the Ministry before assuming no office is responsible.</p><a className="btn btn-secondary" href={MFA_DIRECTORY_URL} target="_blank" rel="noreferrer">Open full Ministry directory <ExternalLink size={12} /></a></div></div>}
      <div className="routing-note" style={{ marginTop: 16 }}><Info size={14} /><span>Kenya also publishes information about honorary consuls and other posts in the full MFA directory. Honorary consuls may have limited or different service capability; confirm the post and service directly.</span></div>
    </>;
  };

  const renderAlerts = (staff = false) => {
    const active = filteredAlerts.filter((alert) => new Date(alert.expiresAt).getTime() > Date.now());
    const expired = filteredAlerts.filter((alert) => new Date(alert.expiresAt).getTime() <= Date.now());
    return <>
      <PageHeading eyebrow={staff ? "Mission communications · prototype" : "Travel updates · prototype"} title={staff ? "Alerts management" : "Alerts & updates"} description={staff ? "Draft, review, and publish targeted sample notices. Delivery is simulated." : "Safety notices and service updates relevant to your travel. Always check current official guidance."} actions={staff ? <button className="btn btn-primary" onClick={() => { setAlertDraft({ title: "", severity: "advisory", location: staffMission?.serves.find((country) => normalizeCountry(country) !== normalizeCountry(staffMission.hostCountry)) ?? staffMission?.hostCountry ?? "Kenya", body: "", expiresDate: dateToday() }); setAlertStep(1); setFormError(""); setDialog("alert"); }}><Plus size={14} /> Create alert</button> : <button className="btn btn-secondary" onClick={() => { setData((previous) => ({ ...previous, alerts: previous.alerts.map((alert) => ({ ...alert, read: true })) })); showToast("Alerts marked as read", "Your read status is saved in this demo."); }}><CheckCheck size={14} /> Mark all read</button>} />
      <DemoNotice staff={staff} />
      {staff && <div className="panel panel-pad" style={{ marginBottom: 16 }}><PanelHeader title="Before publishing" subtitle="Preview your audience and make sure the scope and expiry are clear." /><div className="grid-3"><div className="form-help"><strong>Audience preview</strong><br />{scopedTrips.filter((trip) => trip.status !== "departed").length} active sample registrations linked to {staffMission?.name ?? "this mission"}.</div><div className="form-help"><strong>Delivery</strong><br />Simulated only. No email, SMS, or push provider is connected.</div><div className="form-help"><strong>Official source</strong><br />Use the mission’s verified publication process in production.</div></div></div>}
      <div className="filter-row">{["all", "unread", "urgent", "advisory", "service", "crisis"].map((filter) => <button className={`alert-filter-tab${alertFilter === filter ? " active" : ""}`} type="button" key={filter} onClick={() => setAlertFilter(filter)}>{filter === "all" ? "All alerts" : filter === "unread" ? "Unread" : statusLabel(filter)}</button>)}<label className="search-bar" style={{ marginLeft: "auto" }}><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notices" aria-label="Search alerts" /></label></div>
      <div className="grid-2" style={{ alignItems: "start" }}><section className="panel panel-pad"><PanelHeader title="Current alerts" subtitle={`${active.length} current message${active.length === 1 ? "" : "s"}`} />{active.map((alert) => <AlertRow key={alert.id} item={alert} onMarkRead={() => toggleAlertRead(alert.id)} showAction />)}{active.length === 0 && <div className="empty-state"><div className="empty-icon"><Bell size={20} /></div><h3>No current alerts</h3><p>There are no current sample messages for this filter.</p></div>}</section><section className="panel panel-pad"><PanelHeader title="About these messages" /><div className="stack-sm"><div className="form-help"><strong>Prototype notice label</strong><br />Alerts on this page are illustrative and are not issued or authenticated by Kenya’s Ministry or an embassy.</div><div className="form-help"><strong>Expiry and relevance</strong><br />Check publication and expiry times. Always rely on authorised local and embassy sources for current instructions.</div><div className="form-help"><strong>Notification delivery</strong><br />Email, SMS, and push preferences are saved as settings only. No delivery provider is connected.</div></div></section></div>
      {expired.length > 0 && <section className="panel panel-pad" style={{ marginTop: 16 }}><PanelHeader title="Expired notices" subtitle="Kept for reference in this demo." />{expired.map((alert) => <AlertRow key={alert.id} item={alert} compact />)}</section>}
    </>;
  };

  const renderCases = (staff = false) => <>
    <PageHeading eyebrow={staff ? `Mission case queue · ${staffMission?.name ?? "Kenyan mission"}` : "Consular support"} title={staff ? "Assistance cases" : "Help & assistance"} description={staff ? "Review and prioritise sample requests within this mission’s listed jurisdiction. Keep staff notes separate from citizen-visible replies." : "Track assistance case progress separately from travel registration and wellbeing status."} actions={staff ? <span className="inline-tag"><UsersRound size={11} /> Mission demo scope</span> : <button className="btn btn-primary" onClick={() => openHelpForm()}><Plus size={14} /> Request assistance</button>} />
    {staff ? <DemoNotice staff /> : <div className="urgent-banner" style={{ marginBottom: 16 }}><Siren size={16} /><div><strong>Need immediate help?</strong><p>Online requests may not be monitored continuously. If there is immediate danger, contact local emergency services or the embassy’s published emergency line.</p></div><button className="btn btn-sm btn-danger" onClick={() => setDialog("urgent")}>Urgent guidance</button></div>}
    <section className="panel panel-pad"><div className="filter-row"><label className="search-bar"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, category, or location" aria-label="Search assistance cases" /></label><select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter cases by status"><option value="all">All statuses</option>{CASE_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div>
      {filteredCases.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Case</th><th>Category</th><th>Priority</th><th>Location</th><th>Status</th><th>Updated</th><th /></tr></thead><tbody>{filteredCases.map((item) => <tr key={item.id}><td className="table-primary">{item.reference}<span className="table-sub">Created {relativeDate(item.createdAt)}</span></td><td>{item.category}</td><td><Pill value={item.urgency} /></td><td>{item.location}</td><td><Pill value={item.status} /></td><td>{relativeDate(item.updatedAt)}</td><td><button className="table-action" onClick={() => { setSelectedCaseId(item.id); goTo("case-detail"); }}>Open <ArrowUpRight size={11} /></button></td></tr>)}</tbody></table></div> : <div className="empty-state"><div className="empty-icon"><HeartHandshake size={20} /></div><h3>No cases to show</h3><p>{staff ? "No assistance cases currently match this jurisdiction and filter." : "You have no assistance requests matching this filter."}</p>{!staff && <button className="btn btn-primary" onClick={() => openHelpForm()}><Plus size={13} /> Request assistance</button>}</div>}
    </section>
    {!staff && <div className="form-help" style={{ marginTop: 14 }}>Requests, updates, and response times depend on the mission’s actual services and capacity. Do not include passport numbers, bank details, or other sensitive documents in this demonstration.</div>}
  </>;

  const renderCaseDetail = () => {
    if (!selectedCase) return <><PageHeading eyebrow="Case record" title="Case not found" description="This case may no longer be available in the demo." actions={<button className="btn btn-secondary" onClick={() => goTo(data.activeRole === "staff" ? "staff-cases" : "cases")}><ArrowLeft size={13} /> Back to cases</button>} /><div className="panel"><EmptyInline message="Return to the case list to continue." /></div></>;
    const isStaff = data.activeRole === "staff";
    return <>
      <PageHeading eyebrow={`Assistance case · ${selectedCase.reference}`} title={selectedCase.category} description={`${selectedCase.location} · Created ${formatDateTime(selectedCase.createdAt)}`} actions={<><Pill value={selectedCase.status} /><button className="btn btn-secondary" onClick={() => goTo(isStaff ? "staff-cases" : "cases")}><ArrowLeft size={13} /> Back to cases</button></>} />
      <div className="demo-notice"><Info className="demo-notice-icon" size={15} /><div><strong>{isStaff ? "Staff demo access" : "Your case, your updates"}</strong><p>{isStaff ? "Record visibility and assignments in this demo are not enforced server-side. Production access must be scoped by role and jurisdiction." : "Your travel status does not automatically close this case. Only authorised staff can update case progress in production."}</p></div></div>
      <div className="dashboard-grid">
        <div className="stack">
          <section className="panel panel-pad"><PanelHeader title="Request summary" subtitle={`Reference ${selectedCase.reference}`} /><div className="grid-2"><div><p className="kicker">Category</p><p className="table-primary">{selectedCase.category}</p></div><div><p className="kicker">Urgency</p><Pill value={selectedCase.urgency} /></div><div><p className="kicker">Location</p><p className="table-primary">{selectedCase.location}</p></div><div><p className="kicker">Preferred contact</p><p className="table-primary">{selectedCase.contactMethod}</p></div></div><hr className="divider" /><p className="kicker">Description</p><p style={{ margin: 0, color: "#63787b", fontSize: 10, lineHeight: 1.65 }}>{selectedCase.description}</p>{isStaff && <div className="grid-3" style={{ marginTop: 17 }}><label className="field"><span className="kicker">Case status</span><select className="control" value={selectedCase.status} onChange={(event) => { const status = event.target.value as CaseStatus; if (status === "resolved") { setResolutionCaseId(selectedCase.id); setResolutionDraft(""); setDialog("resolve"); } else setCaseStatus(selectedCase.id, status); }}>{CASE_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label><label className="field"><span className="kicker">Priority</span><select className="control" value={selectedCase.urgency} onChange={(event) => changeCasePriority(selectedCase.id, event.target.value as "standard" | "urgent")}><option value="standard">Standard</option><option value="urgent">Urgent</option></select></label><label className="field"><span className="kicker">Assigned officer</span><select className="control" value={selectedCase.assignedTo} onChange={(event) => changeCaseAssignment(selectedCase.id, event.target.value)}><option>Not assigned</option><option>Officer Elena R. (demo)</option><option>Officer Malik T. (demo)</option><option>Consular duty team (demo)</option></select></label></div>}</section>
          <section className="panel panel-pad"><PanelHeader title="Secure message thread" subtitle="Citizen-visible messages · simulated delivery" />{selectedCase.messages.length ? <div className="stack-sm">{selectedCase.messages.map((message) => <div className={`case-message${message.role === "staff" ? " staff-message" : ""}`} key={message.id}><div className="case-message-meta"><span>{message.sender}</span><span>{formatDateTime(message.at)}</span></div>{message.body}</div>)}</div> : <div className="form-help">There are no messages in this case yet.</div>}
            {selectedCase.status !== "resolved" && <form onSubmit={(event) => { event.preventDefault(); sendCaseMessage(selectedCase.id, caseReply, isStaff ? "staff" : "citizen"); }} style={{ marginTop: 14 }}><label className="field"><span className="kicker">{isStaff ? "Reply to citizen" : "Send a message"}</span><textarea className="control" value={caseReply} onChange={(event) => setCaseReply(event.target.value)} placeholder="Write a short message. Avoid sending identity numbers or sensitive documents." /></label><div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}><button className="btn btn-primary btn-sm" type="submit" disabled={!caseReply.trim()}><Send size={12} /> Send message</button></div></form>}
          </section>
        </div>
        <div className="stack">
          <section className="panel panel-pad"><PanelHeader title="Case progress" subtitle="Timestamped status history" /><div className="timeline">{[...selectedCase.progress].sort((a, b) => a.at.localeCompare(b.at)).map((entry) => <div className="timeline-item" key={entry.id}><span className="timeline-point" /><div className="timeline-copy"><strong>{entry.label}</strong><p>{entry.detail}</p><time>{formatDateTime(entry.at)}</time></div></div>)}</div></section>
          {isStaff && <section className="panel panel-pad"><PanelHeader title="Internal staff notes" subtitle="Not visible in the citizen view." />{selectedCase.internalNotes.length ? <div className="stack-sm" style={{ marginBottom: 12 }}>{selectedCase.internalNotes.map((note) => <div className="internal-note" key={note.id}><strong>{note.author}</strong> · {formatDateTime(note.at)}<br />{note.body}</div>)}</div> : <div className="form-help" style={{ marginBottom: 12 }}>No internal notes.</div>}<form onSubmit={(event) => { event.preventDefault(); addInternalNote(selectedCase.id); }}><label className="field"><span className="kicker">Add internal note</span><textarea className="control" value={internalNoteDraft} onChange={(event) => setInternalNoteDraft(event.target.value)} placeholder="Staff-only case note" /></label><button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} type="submit" disabled={!internalNoteDraft.trim()}><Plus size={12} /> Add note</button></form></section>}
          {!isStaff && <section className="panel panel-pad"><PanelHeader title="Need to add information?" /><p className="panel-subtitle" style={{ marginTop: -7 }}>Reply in the secure message thread above. The emergency contact on your profile is not notified automatically.</p><button className="btn btn-secondary btn-wide" style={{ marginTop: 13 }} onClick={() => setDialog("urgent")}><Siren size={13} /> Immediate danger?</button></section>}
        </div>
      </div>
    </>;
  };

  const renderAppointments = (staff = false) => {
    const appointments = staff ? data.appointments.filter((appointment) => appointment.missionId === staffMission?.id) : data.appointments;
    const ordered = [...appointments].sort((a, b) => a.startAt.localeCompare(b.startAt));
    return <>
      <PageHeading eyebrow={staff ? "Mission scheduling · demo" : "Consular services"} title={staff ? "Appointment management" : "Appointments"} description={staff ? "Review bookings and update attendance in this sample mission." : "Book a consular service and manage your appointment. Times are shown in the embassy timezone."} actions={!staff ? <button className="btn btn-primary" onClick={() => openAppointment()}><Plus size={14} /> Book appointment</button> : <span className="inline-tag"><CalendarCheck2 size={11} /> Mission timezone shown</span>} />
      {staff && <DemoNotice staff />}
      <section className="panel panel-pad"><PanelHeader title={staff ? "Mission bookings" : "Your appointments"} subtitle={`${ordered.filter((item) => item.status === "booked").length} upcoming booking${ordered.filter((item) => item.status === "booked").length === 1 ? "" : "s"}`} />
        {ordered.length ? <div className="stack-sm">{ordered.map((appointment) => {
          const mission = data.missions.find((item) => item.id === appointment.missionId);
          const isPast = new Date(appointment.startAt).getTime() < Date.now();
          return <div className="trip-list-card" key={appointment.id} style={{ border: "1px solid #e7ede8", borderRadius: 10, background: "#fff" }}><div className="trip-list-top"><div><div className="trip-list-title">{appointment.service}</div><div className="trip-list-location"><Building2 size={11} /> {mission?.name ?? "Mission details unavailable"}</div></div><Pill value={appointment.status} /></div><div className="trip-details-grid"><div><div className="trip-detail-label">Date & time</div><div className="trip-detail-value">{formatDateTime(appointment.startAt, appointment.timezone)}</div></div><div><div className="trip-detail-label">Time zone</div><div className="trip-detail-value">{appointment.timezone}</div></div><div><div className="trip-detail-label">Reference</div><div className="trip-detail-value">{appointment.reference}</div></div><div><div className="trip-detail-label">Service</div><div className="trip-detail-value">{appointment.service}</div></div></div><div className="trip-actions">{appointment.status === "booked" && !staff && <><button className="btn btn-sm btn-secondary" onClick={() => openAppointment(appointment)}><Pencil size={12} /> Reschedule</button><button className="btn btn-sm btn-danger" onClick={() => cancelAppointment(appointment)}><X size={12} /> Cancel</button></>}{appointment.status === "booked" && staff && <button className="btn btn-sm btn-secondary" onClick={() => { setData((previous) => addAudit({ ...previous, appointments: previous.appointments.map((item) => item.id === appointment.id ? { ...item, status: "completed" as const } : item) }, "Marked appointment attended", appointment.reference)); showToast("Attendance updated", appointment.reference); }}><Check size={12} /> Mark attended</button>}{appointment.status === "booked" && staff && <button className="btn btn-sm btn-danger" onClick={() => cancelAppointment(appointment)}><X size={12} /> Cancel booking</button>}{isPast && appointment.status === "booked" && <span className="form-help">Past appointment in local browser time. Staff may update attendance.</span>}</div><p className="panel-subtitle" style={{ marginTop: 11 }}>Requirements: {appointment.requirements.join(" · ")}</p></div>;
        })}</div> : <div className="empty-state"><div className="empty-icon"><CalendarDays size={20} /></div><h3>No appointments yet</h3><p>Choose a service and an available demo date to create a booking.</p>{!staff && <button className="btn btn-primary" onClick={() => openAppointment()}><Plus size={13} /> Book an appointment</button>}</div>}
      </section>
      <div className="form-help" style={{ marginTop: 14 }}>Appointments are simulated in this demonstration. Confirm availability, service scope, and required documents with the relevant mission in production.</div>
    </>;
  };

  const renderEmergencyCard = () => <>
    <PageHeading eyebrow="Offline reference · prototype" title="Kenya mission contact card" description="Download a source-linked contact reference for offline use. Confirm the mission route before relying on it; no dedicated emergency line is provided here." actions={<button className="btn btn-primary" onClick={downloadEmergencyCard}><Download size={14} /> Download card</button>} />
    <div className="urgent-banner" style={{ marginBottom: 16 }}><AlertTriangle size={16} /><div><strong>This is a prototype reference, not a government document</strong><p>Citizen and trip details are fictional. Office contacts link to published MFA/mission sources, but are not checked live here. General office numbers are not treated as emergency lines.</p></div></div>
    <div className="panel panel-pad"><div className="print-card"><div className="print-card-top"><div className="print-card-brand"><span className="brand-mark" style={{ width: 30, height: 30, color: "#9a7844", borderColor: "#d6c49f" }}>EC</span><span>Embassy Connect <small style={{ display: "block", color: "#9a855e", fontSize: 7, letterSpacing: ".1em" }}>DEMONSTRATION CARD</small></span></div><span className="print-card-ref">{currentTrip?.reference ?? "No active trip"}</span></div><h2>{currentTrip ? `${currentTrip.city}, ${currentTrip.country}` : "Your travel contact card"}</h2><p>Keep this page or its downloaded text copy for reference. Last updated {formatDate(currentTrip?.updatedAt ?? new Date())}.</p><div className="contact-card-row"><div className="contact-card-block"><label>Possible responsible mission</label><strong>{activeMission?.name ?? "Route not identified"}<br />{activeMission ? `${activeMission.hostCity}, ${activeMission.hostCountry}` : "Check the official MFA directory"}</strong></div><div className="contact-card-block"><label>Published general office contact</label><strong>{activeMission?.phone || "Phone not listed in selected source"}<br />{activeMission?.email || "Email not listed in selected source"}</strong></div><div className="contact-card-block"><label>Dedicated emergency line</label><strong>Not verified or included. Check official local sources and the linked mission page.</strong></div><div className="contact-card-block"><label>Your selected contact</label><strong>{data.profile.emergencyContact ? `${data.profile.emergencyContact.name} · ${data.profile.emergencyContact.relationship}` : "Not provided"}<br />{data.profile.emergencyContact?.phone ?? "Not provided"}</strong></div></div><div className="form-help" style={{ marginTop: 13 }}>Your selected emergency contact is included only because you chose to add it to this card. Their details are not shared automatically. Citizen and trip details are fictional; confirm mission responsibility and current contacts directly from the linked official source. {activeMission && <a href={activeMission.sourceUrl} target="_blank" rel="noreferrer">Open {activeMission.sourceLabel} <ExternalLink size={10} /></a>}</div></div><div style={{ maxWidth: 570, margin: "14px auto 0", display: "flex", justifyContent: "flex-end", gap: 8 }}><button className="btn btn-secondary" onClick={() => window.print()}><Printer size={13} /> Print</button><button className="btn btn-primary" onClick={downloadEmergencyCard}><Download size={13} /> Download text card</button></div></div>
  </>;

  const renderProfile = () => <>
    <PageHeading eyebrow="Your details and choices" title="Profile & privacy" description="Keep contact details current and choose which reminder channels you prefer. No continuous location tracking is used." actions={<button className="btn btn-primary" onClick={openProfile}><Pencil size={13} /> Edit profile</button>} />
    <DemoNotice />
    <div className="grid-2" style={{ alignItems: "start" }}><div className="stack">
      <section className="panel panel-pad"><PanelHeader title="Profile details" /><div className="grid-2"><div><p className="kicker">Full name</p><p className="table-primary">{data.profile.fullName}</p></div><div><p className="kicker">Citizenship</p><p className="table-primary">{data.profile.citizenship}</p></div><div><p className="kicker">Email</p><p className="table-primary">{data.profile.email}</p></div><div><p className="kicker">Phone</p><p className="table-primary">{data.profile.phone || "Not provided"}</p></div><div><p className="kicker">Preferred language</p><p className="table-primary">{data.profile.language}</p></div></div></section>
      <section className="panel panel-pad"><PanelHeader title="Emergency contact" subtitle="Optional · never notified or shared automatically." />{data.profile.emergencyContact ? <div className="embassy-inline"><div className="embassy-mark"><UserRound size={16} /></div><div><div className="embassy-title">{data.profile.emergencyContact.name}</div><div className="embassy-loc">{data.profile.emergencyContact.relationship} · {data.profile.emergencyContact.phone}</div></div><button className="text-button" onClick={openProfile}>Edit</button></div> : <div className="form-help">No emergency contact added. You can add one if you choose, or leave this blank.</div>}</section>
      <section className="panel panel-pad"><PanelHeader title="Download or manage your information" /><p className="panel-subtitle" style={{ marginTop: -5, marginBottom: 13 }}>Review, correct, or download the fictional records in this demonstration. Production retention and deletion handling must be defined by the authorised service operator.</p><div className="filter-row"><button className="btn btn-secondary" onClick={downloadDataExport}><Download size={13} /> Export demo data</button><button className="btn btn-danger" onClick={() => showToast("Deletion request simulated", "No personal record was deleted. A production service needs a verified retention and deletion process.")}><MessageCircle size={13} /> Request deletion</button></div><div className="form-help">Demo role switching is not real access control. Do not enter sensitive or identifying information in this sample.</div></section>
    </div><div className="stack">
      <section className="panel panel-pad"><PanelHeader title="Notifications & reminders" subtitle="Preferences are saved in the demo. Delivery is not connected." />{(["email", "sms", "push"] as const).map((channel) => <div className="preferences-row" key={channel}><div><div className="preferences-title">{channel === "email" ? "Email alerts" : channel === "sms" ? "SMS updates" : "Push notifications"}</div><div className="preferences-desc">{channel === "email" ? "Travel guidance and case updates" : channel === "sms" ? "Text delivery is simulated" : "Device notifications are not connected"}</div></div><Toggle checked={data.notificationPreferences[channel]} label={`${channel} notifications`} onChange={() => setData((previous) => ({ ...previous, notificationPreferences: { ...previous.notificationPreferences, [channel]: !previous.notificationPreferences[channel] } }))} /></div>)}<div className="preferences-row"><div><div className="preferences-title">Wellbeing reminder frequency</div><div className="preferences-desc">A missed reminder never changes your safety status.</div></div><select className="filter-select" value={data.notificationPreferences.reminderDays} onChange={(event) => setData((previous) => ({ ...previous, notificationPreferences: { ...previous.notificationPreferences, reminderDays: Number(event.target.value) } }))}><option value={3}>Every 3 weeks</option><option value={7}>Every week</option><option value={14}>Every 2 weeks</option><option value={30}>Every month</option></select></div><span className="inline-tag" style={{ marginTop: 13 }}><Info size={11} /> No notification provider connected</span></section>
      <section className="panel panel-pad"><PanelHeader title="How your information is used" /><div className="stack-sm"><div className="form-help"><strong>Purpose</strong><br />Travel registration helps a responsible mission communicate and provide consular assistance. It is not an immigration record or visa application.</div><div className="form-help"><strong>Location privacy</strong><br />There is no continuous tracking. A wellbeing request may ask for a location; sharing is optional and specific to that request.</div><div className="form-help"><strong>Production safeguards</strong><br />This demo does not provide identity verification, role-based server permissions, encryption claims, or a live retention policy.</div></div></section>
    </div></div>
  </>;

  const renderRegistrations = () => <>
    <PageHeading eyebrow={`Kenyan citizen records · ${staffMission?.name ?? "Mission"}`} title="Citizen registrations" description="Search the sample active and past trip records assigned to this mission’s listed jurisdiction." actions={<span className="inline-tag"><LockIcon /> Mission-scoped prototype</span>} />
    <DemoNotice staff />
    <section className="panel panel-pad"><div className="filter-row"><label className="search-bar"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search citizen, destination, or reference" aria-label="Search registrations" /></label><select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter registrations"><option value="all">All trip statuses</option><option value="registered">Registered</option><option value="arrived">Arrived</option><option value="departed">Trip closed</option></select><select className="filter-select" value={wellbeingFilter} onChange={(event) => setWellbeingFilter(event.target.value)} aria-label="Filter latest wellbeing status"><option value="all">All wellbeing</option><option value="safe">I’m safe</option><option value="plans_changed">Plans changed</option><option value="needs_assistance">Needs assistance</option><option value="left">Left the country</option></select><input className="filter-select" type="date" value={tripDateFrom} onChange={(event) => setTripDateFrom(event.target.value)} aria-label="Trips ending on or after" title="Trips ending on or after this date" /><input className="filter-select" type="date" value={tripDateTo} onChange={(event) => setTripDateTo(event.target.value)} aria-label="Trips arriving on or before" title="Trips arriving on or before this date" /><select className="filter-select" value={tripSort} onChange={(event) => setTripSort(event.target.value as typeof tripSort)} aria-label="Sort registrations"><option value="arrival">Newest arrival</option><option value="destination">Destination A–Z</option><option value="status">Registration status</option></select><span className="inline-tag"><UsersRound size={11} /> {filteredTrips.length} records</span></div>
      {filteredTrips.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Citizen</th><th>Destination</th><th>Travel dates</th><th>Registration</th><th>Wellbeing</th><th>Last updated</th><th /></tr></thead><tbody>{filteredTrips.map((trip) => <tr key={trip.id}><td className="table-primary">{data.profile.fullName}<span className="table-sub">{trip.reference}</span></td><td>{trip.city}, {trip.country}<span className="table-sub">{trip.region}</span></td><td>{formatDate(trip.arrivalDate)} – {trip.departureUnknown || !trip.departureDate ? "Unknown" : formatDate(trip.departureDate)}</td><td><Pill value={trip.status} /></td><td><Pill value={trip.wellbeing} /></td><td>{formatDateTime(trip.updatedAt)}</td><td><button className="table-action" onClick={() => { setSelectedTripId(trip.id); goTo("registration-detail"); }}>Open record <ArrowUpRight size={11} /></button></td></tr>)}</tbody></table></div> : <div className="empty-state"><div className="empty-icon"><UsersRound size={20} /></div><h3>No registrations match</h3><p>Try a different filter. Staff visibility is meant to be constrained by jurisdiction in production.</p></div>}
    </section>
  </>;

  const renderRegistrationDetail = () => {
    if (!selectedTrip) return <><PageHeading eyebrow="Staff record" title="Registration not found" description="Return to the assigned registration list to continue." actions={<button className="btn btn-secondary" onClick={() => goTo("registrations")}><ArrowLeft size={13} /> Back to registrations</button>} /><div className="panel"><EmptyInline message="This registration is not available in the current demo jurisdiction." /></div></>;
    const mission = missionForTrip(selectedTrip);
    const relatedCases = data.cases.filter((item) => item.location.toLowerCase().includes(selectedTrip.country.toLowerCase()));
    const recordActivity = data.activity.filter((item) => item.detail.includes(selectedTrip.reference) || item.detail.toLowerCase().includes(selectedTrip.country.toLowerCase())).sort((a, b) => b.at.localeCompare(a.at));
    return <>
      <PageHeading eyebrow={`Staff registration · ${selectedTrip.reference}`} title={`${selectedTrip.city}, ${selectedTrip.country}`} description={`${data.profile.fullName} · ${selectedTrip.region}`} actions={<><Pill value={selectedTrip.status} /><button className="btn btn-secondary" onClick={() => goTo("registrations")}><ArrowLeft size={13} /> Back to registrations</button></>} />
      <DemoNotice staff />
      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="stack">
          <section className="panel panel-pad"><PanelHeader title="Citizen and trip details" subtitle="Visible only in this fictional staff preview." /><div className="grid-2"><div><p className="kicker">Citizen</p><p className="table-primary">{data.profile.fullName}</p></div><div><p className="kicker">Citizenship</p><p className="table-primary">{data.profile.citizenship}</p></div><div><p className="kicker">Email</p><p className="table-primary">{data.profile.email}</p></div><div><p className="kicker">Contact while abroad</p><p className="table-primary">{data.profile.phone || "Not provided"}</p></div><div><p className="kicker">Arrival</p><p className="table-primary">{formatDate(selectedTrip.arrivalDate)}</p></div><div><p className="kicker">Expected departure</p><p className="table-primary">{selectedTrip.departureUnknown || !selectedTrip.departureDate ? "Not set" : formatDate(selectedTrip.departureDate)}</p></div><div><p className="kicker">Purpose</p><p className="table-primary">{selectedTrip.purpose}</p></div><div><p className="kicker">Travel registration</p><Pill value={selectedTrip.status} /></div><div><p className="kicker">Latest wellbeing update</p><Pill value={selectedTrip.wellbeing} /></div><div><p className="kicker">Last updated</p><p className="table-primary">{formatDateTime(selectedTrip.updatedAt)}</p></div></div>{selectedTrip.address && <><hr className="divider" /><p className="kicker">Optional address or region</p><p style={{ margin: 0, color: "#667c7f", fontSize: 10 }}>{selectedTrip.address}</p></>}</section>
          <section className="panel panel-pad"><PanelHeader title="Trip and wellbeing history" subtitle="Travel status does not automatically change assistance case status." />{recordActivity.length ? <div className="activity-list">{recordActivity.slice(0, 8).map((item) => <ActivityRow key={item.id} item={item} />)}</div> : <div className="form-help">Registration created {formatDateTime(selectedTrip.registeredAt)}. No other history is available for this record yet.</div>}</section>
        </div>
        <div className="stack">
          <section className="panel panel-pad"><PanelHeader title="Responsible mission" subtitle={mission ? (mission.locallyPresent ? `Located in ${mission.hostCountry}` : `Serves this destination from ${mission.hostCountry}`) : "No sample jurisdiction is assigned"} />{mission ? <><div className="embassy-inline"><span className="embassy-mark"><Building2 size={17} /></span><span><span className="embassy-title">{mission.name}</span><span className="embassy-loc">Jurisdiction match · {selectedTrip.country}</span></span></div><div className="directory-details"><div className="directory-detail"><MapPin size={12} /><span>{mission.address || "Street address not included in this prototype record"}</span></div><div className="directory-detail"><Clock3 size={12} /><span>Time zone: {mission.timezone} · Opening hours not listed</span></div><div className="directory-detail"><Phone size={12} /><span>{mission.phone || "General office phone not listed"}</span></div><div className="directory-detail"><Mail size={12} /><span>{mission.email || "General office email not listed"}</span></div></div><div className="form-help">Source-linked prototype record. Reconfirm this mission’s jurisdiction, services, contacts, and opening hours directly with the Ministry source. <a href={mission.sourceUrl} target="_blank" rel="noreferrer">Open official source <ExternalLink size={10} /></a></div></> : <div className="routing-note"><Info size={13} />No mission is mapped for this destination in the sample data.</div>}</section>
          <section className="panel panel-pad"><PanelHeader title="Related assistance cases" subtitle={`${relatedCases.length} linked case${relatedCases.length === 1 ? "" : "s"}`} />{relatedCases.length ? <div className="stack-sm">{relatedCases.map((item) => <CaseQueueRow key={item.id} item={item} onClick={() => { setSelectedCaseId(item.id); goTo("case-detail"); }} />)}</div> : <EmptyInline message="No assistance cases are linked to this destination." />}</section>
          <div className="form-help">Staff access shown here is illustrative only. Production access must be authenticated and scoped server-side by jurisdiction.</div>
        </div>
      </div>
    </>;
  };

  const renderCrisis = () => {
    const responses = data.crisis.responses;
    const safe = responses.filter((item) => item.response === "safe");
    const needsHelp = responses.filter((item) => item.response === "need_help");
    const notAffected = responses.filter((item) => item.response === "not_affected");
    const waiting = responses.filter((item) => item.response === "awaiting");
    const citizenResponse = responses.find((item) => item.citizen === data.profile.fullName);
    return <>
      <PageHeading eyebrow="Targeted communications · demo" title="Crisis wellbeing checks" description="Send a time-limited check-in request to an affected area and review responses separately from nonresponses." actions={<button className="btn btn-primary" onClick={openCrisisCheck}><Plus size={14} /> Create check-in</button>} />
      <DemoNotice staff />
      <section className="panel panel-pad" style={{ marginBottom: 16 }}><PanelHeader title={data.crisis.title} subtitle={`${data.crisis.affectedArea} · Opened ${formatDateTime(data.crisis.createdAt)}`} action={<Pill value={data.crisis.status} />} /><div className="grid-4" style={{ marginBottom: 17 }}><StatCard label="Safe" value={safe.length.toString()} foot="Responded: safe" icon={CheckCircle2} /><StatCard label="Need help" value={needsHelp.length.toString()} foot="Response received" icon={LifeBuoy} /><StatCard label="Not affected" value={notAffected.length.toString()} foot="Responded outside area" icon={MapPin} /><StatCard label="Awaiting response" value={waiting.length.toString()} foot="Not an indication of danger" icon={Clock3} /></div><div className="response-bar"><div className="response-bar-fill" style={{ width: `${responses.length ? ((responses.length - waiting.length) / responses.length) * 100 : 0}%` }} /></div><div className="response-legend" style={{ marginTop: 10 }}><span><i />{responses.length - waiting.length} responses</span><span><i className="wait-dot" />{waiting.length} awaiting</span><span>Expires {formatDateTime(data.crisis.expiresAt)}</span></div>
        <div className="urgent-banner" style={{ marginTop: 15 }}><Info size={15} /><div><strong>Nonresponse is not a risk finding</strong><p>People who haven’t replied are listed separately. The system does not infer that anyone is missing, injured, or unsafe.</p></div></div>
      </section>
      <section className="panel panel-pad"><PanelHeader title="Response list" subtitle="Fictional sample response records" />{responses.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Citizen</th><th>Response</th><th>Location shared?</th><th>Response time</th><th>Next step</th></tr></thead><tbody>{responses.map((item) => <tr key={item.id}><td className="table-primary">{item.citizen}</td><td><Pill value={item.response} /></td><td>{item.locationShared ? `Yes · ${item.location}` : "No"}</td><td>{item.respondedAt ? formatDateTime(item.respondedAt) : "No response"}</td><td>{item.response === "need_help" ? <button className="table-action" onClick={() => goTo("staff-cases")}>Review assistance <ArrowUpRight size={11} /></button> : item.response === "awaiting" ? <span style={{ color: "#9aa4a4", fontSize: 9 }}>No automatic escalation</span> : <span style={{ color: "#89999a", fontSize: 9 }}>Response recorded</span>}</td></tr>)}</tbody></table></div> : <div className="empty-state"><div className="empty-icon"><ShieldCheck size={20} /></div><h3>No responses yet</h3><p>Responses will appear here when a citizen chooses to reply.</p></div>}</section>
      {data.activeRole === "citizen" && data.crisis.status === "active" && <section className="panel panel-pad" style={{ marginTop: 16 }}><PanelHeader title="Respond to this request" subtitle="Only share location if you choose to, for this specific request." action={citizenResponse && <Pill value={citizenResponse.response} />} /><button className="btn btn-primary" onClick={() => { setCrisisAnswer("safe"); setShareCrisisLocation(false); setDialog("crisis"); }}>{citizenResponse ? "Update my response" : "Respond now"}</button></section>}
    </>;
  };

  const renderMissionSettings = () => <>
    <PageHeading eyebrow="Mission administration · demo" title="Mission settings" description="Maintain example mission contacts, opening hours, jurisdictions, and services. These sample details are not real." />
    <DemoNotice staff />
    <div className="grid-2">{data.missions.map((mission) => <section className="panel panel-pad" key={mission.id}><div className="directory-card-top"><div><div className="embassy-mark"><Building2 size={17} /></div><h3 className="panel-title">{mission.name}</h3><p className="panel-subtitle">{mission.locallyPresent ? `Located in ${mission.hostCountry}` : `Responsible from ${mission.hostCountry}`}</p></div><span className="pill service">Sample</span></div><div className="directory-details"><div className="directory-detail"><MapPin size={12} /><span>{mission.address}</span></div><div className="directory-detail"><Clock3 size={12} /><span>{mission.hours} · {mission.timezone}</span></div><div className="directory-detail"><Phone size={12} /><span>{mission.phone}</span></div><div className="directory-detail"><Mail size={12} /><span>{mission.email}</span></div></div><div className="directory-services">{mission.serves.map((country) => <span className="service-tag" key={country}>{country}</span>)}</div><button className="btn btn-secondary" onClick={() => { setMissionEditingId(mission.id); setDialog("mission"); }}><Pencil size={12} /> Edit sample contact details</button></section>)}</div>
      <div className="form-help" style={{ marginTop: 16 }}>Production mission settings require authenticated mission administrators, dual review for sensitive contact changes, and an audit trail.</div>
    </>;

  const renderAudit = () => <>
    <PageHeading eyebrow="Governance · demo log" title="Roles & audit history" description="Review example access and change records. This UI role switch does not enforce least-privilege access or strong staff authentication." />
    <DemoNotice staff />
    <div className="grid-2" style={{ alignItems: "start" }}><section className="panel panel-pad"><PanelHeader title="Role model" subtitle="Production permissions should be enforced server-side." />{[{ role: "Citizen", detail: "Manage own profile, trips, alerts, and assistance cases.", icon: UserRound }, { role: "Consular officer", detail: "Work assigned cases and access records in their mission jurisdiction.", icon: BriefcaseBusiness }, { role: "Mission administrator", detail: "Manage mission content, communications, schedules, and staff within a mission.", icon: Settings2 }, { role: "Platform administrator", detail: "Manage platform configuration and cross-mission technical operations.", icon: UserCog }].map((item) => <div className="preferences-row" key={item.role}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span className="action-tile-icon"><item.icon size={15} /></span><div><div className="preferences-title">{item.role}</div><div className="preferences-desc">{item.detail}</div></div></div><ChevronRight size={13} color="#9aa7a5" /></div>)}</section><section className="panel panel-pad"><PanelHeader title="Recent audit activity" subtitle="Fictional sample entries; sensitive data is not logged here." />{data.audit.length ? <div className="timeline">{data.audit.slice(0, 12).map((item) => <div className="timeline-item" key={item.id}><span className="timeline-point" /><div className="timeline-copy"><strong>{item.action}</strong><p>{item.actor} · {item.record}</p><time>{formatDateTime(item.at)}</time></div></div>)}</div> : <EmptyInline message="No audit entries have been recorded in this demo yet." />}</section></div>
    <section className="panel panel-pad" style={{ marginTop: 16 }}><PanelHeader title="Production security checklist" /><div className="grid-3"><div className="form-help">Authenticate every citizen and staff action on the server.</div><div className="form-help">Scope citizen data to its owner and staff data to assigned jurisdictions.</div><div className="form-help">Use strong staff authentication, private audit logs, encryption, and retention controls.</div></div></section>
  </>;

  const pageContent = (() => {
    switch (activeView) {
      case "overview": return data.activeRole === "staff" ? renderStaffOverview() : renderCitizenOverview();
      case "trips": return renderTrips();
      case "directory": return renderDirectory();
      case "alerts": return renderAlerts(false);
      case "staff-alerts": return renderAlerts(true);
      case "cases": return renderCases(false);
      case "staff-cases": return renderCases(true);
      case "case-detail": return renderCaseDetail();
      case "appointments": return renderAppointments(data.activeRole === "staff");
      case "emergency-card": return renderEmergencyCard();
      case "profile": return renderProfile();
      case "registrations": return renderRegistrations();
      case "registration-detail": return renderRegistrationDetail();
      case "crisis": return renderCrisis();
      case "mission-settings": return renderMissionSettings();
      case "audit": return renderAudit();
      default: return renderCitizenOverview();
    }
  })();

  const activeHelpCategoryOptions = ["Lost or stolen passport", "Medical emergency", "Arrest or detention", "Crime or personal safety", "Crisis or evacuation information", "Other consular assistance"];
  const currentMissionForEdit = data.missions.find((mission) => mission.id === missionEditingId);

  if (showLanding) return <PublicLanding loading={!ready} onGetStarted={() => enterCitizen(true)} onCitizenDemo={() => enterCitizen()} onStaffDemo={enterStaff} onFindEmbassy={findEmbassyFromLanding} />;

  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-nav-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar${mobileOpen ? " open" : ""}`}>
        <a href="#welcome" className="brand" onClick={(event) => { event.preventDefault(); setShowLanding(true); setMobileOpen(false); }}><span className="brand-mark">EC</span><span><span className="brand-name">Embassy Connect</span><span className="brand-subtitle">Your consular companion</span></span></a>
        <div className="demo-stamp"><span className="demo-stamp-dot" /> DEMONSTRATION ONLY</div>
        <nav className="nav-scroll" aria-label="Main navigation">{navigation.map((group) => <div key={group.label}><div className="nav-group">{group.label}</div>{group.items.map((item) => <button key={item.id} className={`nav-item${activeView === item.id ? " active" : ""}`} onClick={() => goTo(item.id)}><item.icon size={15} strokeWidth={1.8} /><span>{item.label}</span>{item.badge ? <span className="nav-badge">{item.badge}</span> : null}</button>)}</div>)}</nav>
        <div className="sidebar-bottom"><div className="demo-role-card"><div className="demo-role-top"><div className="mini-avatar">{data.activeRole === "citizen" ? initials(data.profile.fullName) : "ER"}</div><div><div className="demo-role-name">{data.activeRole === "citizen" ? data.profile.fullName : "Consular team"}</div><div className="demo-role-caption">{data.activeRole === "citizen" ? "Citizen demo session" : "Officer demo session"}</div></div></div><button className="role-switch" onClick={changeRole}><span>Switch to {data.activeRole === "citizen" ? "staff" : "citizen"} preview</span><ArrowRight size={12} /></button></div><p className="sidebar-note">Fictional citizen records · role switching is a prototype preview, not real Ministry access control.</p></div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-start"><button className="mobile-menu-button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={17} /></button><div><div className="breadcrumb">Embassy Connect <ChevronRight size={10} style={{ verticalAlign: "middle", margin: "0 3px" }} /> {data.activeRole === "staff" ? "Staff portal" : "Citizen portal"}</div><div className="topbar-title">{pageTitle[activeView] ?? "Embassy Connect"}</div></div></div>
          <div className="topbar-actions"><span className="sync-pill" title="Demo state persistence"><span className="sync-dot" />{syncState === "loading" ? "Connecting demo" : syncState === "postgres" ? "Demo data saved" : "Browser demo storage"}</span>{data.activeRole === "staff" && <span className="staff-mode-pill">STAFF PREVIEW</span>}<button className="icon-button" aria-label={`Alerts${unreadAlerts ? `, ${unreadAlerts} unread` : ""}`} onClick={() => goTo(data.activeRole === "staff" ? "staff-alerts" : "alerts")}><Bell size={15} />{unreadAlerts > 0 && <span className="notification-dot" />}</button><button className="top-avatar" aria-label="Open profile" onClick={() => data.activeRole === "citizen" ? goTo("profile") : changeRole()}>{data.activeRole === "citizen" ? initials(data.profile.fullName) : "ER"}</button></div>
        </header>
        <main className="main-content" id="main">
          {pageContent}
          <footer className="page-footer"><span>Kenya consular-service prototype · Fictional citizen records · Not yet an operational Ministry service</span><span className="footer-links"><button className="text-button" onClick={() => setDialog("urgent")}>Urgent help guidance</button><button className="text-button" onClick={() => { goTo("profile"); }}>Privacy information</button><button className="text-button" onClick={() => showToast("Feedback noted", "Thank you. Feedback collection is simulated in this demonstration.")}>Send feedback</button></span></footer>
        </main>
      </div>

      {dialog === "trip" && <Modal title={editingTripId ? "Update trip details" : "Register your travel"} description={editingTripId ? "Correct your travel details or extend your stay." : "Check in before you leave or after you arrive. No passport number or upload is needed."} onClose={closeDialog} wide>
        <div className="modal-step"><span className={tripStep >= 1 ? "active" : ""} /><span className={tripStep >= 2 ? "active" : ""} /></div>
        <div className="modal-step-label">Step {tripStep} of 2 · {tripStep === 1 ? "Destination & dates" : "Travel details & review"}</div>
        <form onSubmit={submitTrip}>
          {tripStep === 1 ? <div className="form-grid">
            <label className="field"><span>Destination country <b aria-hidden="true">*</b></span><input className="control" required list="kenya-destination-countries" value={tripDraft.country} onChange={(event) => setTripDraft((previous) => ({ ...previous, country: event.target.value }))} placeholder="Type any country, e.g. Portugal" /><datalist id="kenya-destination-countries">{KENYAN_DIRECTORY_COUNTRIES.map((country) => <option value={country} key={country} />)}{["France", "Germany", "India", "Kenya", "Qatar", "Saudi Arabia", "United Arab Emirates", "United States", "United Kingdom"].map((country) => <option value={country} key={`suggested-${country}`} />)}</datalist><small>Suggestions use the Ministry’s published mission and accreditation listings. You can enter any destination; an unclear route needs confirmation.</small></label>
            <label className="field"><span>City or region <b aria-hidden="true">*</b></span><input className="control" required value={tripDraft.city} onChange={(event) => setTripDraft((previous) => ({ ...previous, city: event.target.value }))} placeholder="e.g. Lisbon" /></label>
            <label className="field"><span>Arrival date <b aria-hidden="true">*</b></span><input className="control" type="date" required value={tripDraft.arrivalDate} onChange={(event) => setTripDraft((previous) => ({ ...previous, arrivalDate: event.target.value }))} /></label>
            <label className="field"><span>Expected departure</span><input className="control" type="date" disabled={tripDraft.departureUnknown} value={tripDraft.departureDate} min={tripDraft.arrivalDate} onChange={(event) => setTripDraft((previous) => ({ ...previous, departureDate: event.target.value }))} /><small>Embassy local dates are shown in your browser’s locale.</small></label>
            <label className="checkbox-row field full"><input type="checkbox" checked={tripDraft.departureUnknown} onChange={(event) => setTripDraft((previous) => ({ ...previous, departureUnknown: event.target.checked, departureDate: event.target.checked ? "" : previous.departureDate }))} />I don’t know my departure date yet.</label>
            {tripError && <p className="form-error field full" role="alert">{tripError}</p>}
            <div className="form-help field full">{resolveMission(tripDraft.country, `${tripDraft.city} ${tripDraft.region}`) ? <><strong>Possible responsible mission from the published jurisdiction listing:</strong> {resolveMission(tripDraft.country, `${tripDraft.city} ${tripDraft.region}`)?.name} · {resolveMission(tripDraft.country, `${tripDraft.city} ${tripDraft.region}`)?.hostCity}, {resolveMission(tripDraft.country, `${tripDraft.city} ${tripDraft.region}`)?.hostCountry}. Check the linked Ministry source before relying on this route.</> : <>The prototype cannot identify one responsible mission for {tripDraft.country} from its available jurisdiction data. You can still save the trip; check the complete official MFA directory before relying on a route.</>}</div>
          </div> : <div className="form-grid">
            <label className="field"><span>Purpose of travel <b aria-hidden="true">*</b></span><select className="control" value={tripDraft.purpose} onChange={(event) => setTripDraft((previous) => ({ ...previous, purpose: event.target.value }))}>{PURPOSES.map((purpose) => <option key={purpose}>{purpose}</option>)}</select></label>
            <label className="field"><span>Contact while abroad</span><input className="control" value={data.profile.phone} readOnly /><small>Update your profile if your contact details change.</small></label>
            <label className="field full"><span>Optional accommodation address or region</span><textarea className="control" value={tripDraft.address} onChange={(event) => setTripDraft((previous) => ({ ...previous, address: event.target.value }))} placeholder="You can leave this blank or share only a region." /></label>
            <div className="form-help field full"><strong>Review:</strong> {tripDraft.city || "City or region"}, {tripDraft.country} · {formatDate(tripDraft.arrivalDate)} – {tripDraft.departureUnknown || !tripDraft.departureDate ? "departure date unknown" : formatDate(tripDraft.departureDate)} · {tripDraft.purpose}. Sensitive accommodation details are optional.</div>
            <div className="form-help field full">Emergency contacts are not notified automatically. Check-in does not replace a visa, immigration registration, or local emergency services.</div>
            {tripError && <p className="form-error field full" role="alert">{tripError}</p>}
          </div>}
          <div className="form-actions">{tripStep === 2 && <button className="btn btn-secondary" type="button" onClick={() => { setTripError(""); setTripStep(1); }}><ArrowLeft size={13} /> Back</button>}<button className="btn btn-ghost" type="button" onClick={closeDialog}>Cancel</button>{tripStep === 1 ? <button className="btn btn-primary" type="button" onClick={() => { if (!tripDraft.country.trim()) { setTripError("Choose or type a destination country to continue."); return; } if (!tripDraft.city.trim()) { setTripError("Add a city or region to continue."); return; } if (!tripDraft.arrivalDate) { setTripError("Choose an arrival date to continue."); return; } if (tripDraft.departureDate && tripDraft.departureDate < tripDraft.arrivalDate) { setTripError("Expected departure must be on or after arrival."); return; } setTripError(""); setTripStep(2); }}>Continue <ArrowRight size={13} /></button> : <button className="btn btn-primary" type="submit"><Check size={13} /> {editingTripId ? "Save trip changes" : "Submit registration"}</button>}</div>
        </form>
      </Modal>}

      {dialog === "status" && <Modal title="Update your wellbeing" description="Choose the update that best fits. A missed reminder never marks you missing or in danger." onClose={closeDialog}>
        <div className="stack-sm"><button className="action-tile btn-wide" onClick={() => applyWellbeing("safe", statusNote)}><span className="action-tile-icon"><CheckCircle2 size={16} /></span><span><strong>I’m safe</strong><small>Save a timestamped wellbeing update</small></span><ChevronRight size={14} style={{ marginLeft: "auto" }} /></button><button className="action-tile btn-wide" onClick={() => applyWellbeing("plans_changed", statusNote)}><span className="action-tile-icon"><Plane size={16} /></span><span><strong>My travel plans changed</strong><small>Update your trip dates or destination next</small></span><ChevronRight size={14} style={{ marginLeft: "auto" }} /></button><button className="action-tile btn-wide urgent" onClick={() => { setDialog(null); openHelpForm("Other consular assistance", true); }}><span className="action-tile-icon"><LifeBuoy size={16} /></span><span><strong>I need assistance</strong><small>Open a separate assistance request</small></span><ChevronRight size={14} style={{ marginLeft: "auto" }} /></button><button className="action-tile btn-wide" onClick={() => { setDialog(null); setCheckoutTripId(currentTrip?.id ?? null); setDialog("checkout"); }}><span className="action-tile-icon"><ArrowRight size={16} /></span><span><strong>I have left the country</strong><small>Close your trip without deleting its history</small></span><ChevronRight size={14} style={{ marginLeft: "auto" }} /></button><label className="field" style={{ marginTop: 8 }}><span>Optional note</span><textarea className="control" value={statusNote} onChange={(event) => setStatusNote(event.target.value)} placeholder="Share only what is helpful." /></label></div>
      </Modal>}

      {dialog === "help" && <Modal title={helpStep === 1 ? "Request consular assistance" : "Review your request"} description={helpStep === 1 ? "Share only the details needed for the mission to understand your request." : "Check your summary before submitting. Your request will be stored in this demo only."} onClose={closeDialog} wide>
        <div className="urgent-banner" style={{ marginBottom: 16 }}><Siren size={15} /><div><strong>Online requests may not be monitored continuously</strong><p>If there is immediate danger, contact local emergency services or the embassy’s published emergency line. This demo has no live response team.</p></div></div>
        <form onSubmit={submitHelp}>{helpStep === 1 ? <div className="form-grid">
          <label className="field"><span>Type of assistance <b>*</b></span><select className="control" value={helpDraft.category} onChange={(event) => setHelpDraft((previous) => ({ ...previous, category: event.target.value }))}>{activeHelpCategoryOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="field"><span>Urgency</span><select className="control" value={helpDraft.urgency} onChange={(event) => setHelpDraft((previous) => ({ ...previous, urgency: event.target.value as HelpDraft["urgency"] }))}><option value="standard">Standard</option><option value="urgent">Urgent — please review promptly</option></select><small>Urgent does not guarantee immediate response.</small></label>
          <label className="field full"><span>Short description <b>*</b></span><textarea className="control" required value={helpDraft.description} onChange={(event) => setHelpDraft((previous) => ({ ...previous, description: event.target.value }))} placeholder="Describe what support you are requesting. Do not include passport numbers or banking details." /></label>
          <label className="field"><span>Current location <b>*</b></span><input className="control" required value={helpDraft.location} onChange={(event) => setHelpDraft((previous) => ({ ...previous, location: event.target.value }))} placeholder="City or region" /></label>
          <label className="field"><span>Preferred contact method</span><select className="control" value={helpDraft.contactMethod} onChange={(event) => setHelpDraft((previous) => ({ ...previous, contactMethod: event.target.value }))}><option>Email</option><option>Phone</option><option>Secure case message</option></select></label>
          <label className="field full"><span>Optional attachment</span><input className="control" type="file" disabled aria-describedby="attachment-note" /><small id="attachment-note">Attachments are disabled in this demo. No files are uploaded or stored.</small></label>
          {helpError && <p className="form-error field full" role="alert">{helpError}</p>}
        </div> : <div className="stack-sm"><div className="case-banner"><span className="case-banner-icon"><HeartHandshake size={17} /></span><span className="case-banner-text"><strong>{helpDraft.category} · {statusLabel(helpDraft.urgency)}</strong><span>{helpDraft.location} · Contact by {helpDraft.contactMethod}</span></span></div><div className="form-help"><strong>Your description</strong><br />{helpDraft.description}</div><div className="form-help">Submitting does not guarantee a response time, evacuation, funding, or any specific service. The mission’s actual services and capacity apply.</div>{helpError && <p className="form-error" role="alert">{helpError}</p>}</div>}
          <div className="form-actions">{helpStep === 2 && <button className="btn btn-secondary" type="button" onClick={() => setHelpStep(1)}><ArrowLeft size={13} /> Edit details</button>}<button className="btn btn-ghost" type="button" onClick={closeDialog}>Cancel</button><button className="btn btn-primary" type="submit">{helpStep === 1 ? <>Review request <ArrowRight size={13} /></> : <>Submit request <Send size={13} /></>}</button></div>
        </form>
      </Modal>}

      {dialog === "appointment" && <Modal title={appointmentEditingId ? "Reschedule appointment" : "Book a consular appointment"} description={`Choose a service and time. The embassy timezone is ${missionForTrip(currentTrip)?.timezone ?? staffMission?.timezone ?? "shown on your booking"}.`} onClose={closeDialog}>
        <form onSubmit={submitAppointment} className="stack-sm"><label className="field"><span>Consular service</span><select className="control" value={appointmentDraft.service} onChange={(event) => setAppointmentDraft((previous) => ({ ...previous, service: event.target.value }))}><option>Consular appointment</option><option>Emergency travel document</option><option>Notarial services</option><option>Citizenship services</option><option>Other consular service</option></select></label><div className="form-grid"><label className="field"><span>Date</span><input className="control" type="date" required min={dateToday()} value={appointmentDraft.date} onChange={(event) => setAppointmentDraft((previous) => ({ ...previous, date: event.target.value }))} /></label><label className="field"><span>Time · {missionForTrip(currentTrip)?.timezone ?? staffMission?.timezone ?? "mission local time"}</span><select className="control" value={appointmentDraft.time} onChange={(event) => setAppointmentDraft((previous) => ({ ...previous, time: event.target.value }))}>{["09:00", "09:30", "10:00", "10:30", "11:00", "13:00", "13:30", "14:00", "14:30"].map((time) => <option key={time}>{time}</option>)}</select></label></div><div className="form-help"><strong>Typical preparation:</strong> arrive 10 minutes early and bring original documents if requested. Confirm service availability with the responsible mission. Availability shown here is fictional.</div>{appointmentError && <p className="form-error" role="alert">{appointmentError}</p>}<div className="form-actions"><button className="btn btn-ghost" type="button" onClick={closeDialog}>Cancel</button><button className="btn btn-primary" type="submit">{appointmentEditingId ? "Save new time" : "Confirm booking"} <CalendarCheck2 size={13} /></button></div></form>
      </Modal>}

      {dialog === "alert" && <Modal title={alertStep === 1 ? "Draft a mission alert" : "Review alert before publishing"} description={alertStep === 1 ? "Write a clear, targeted notice. You can preview it before publishing." : "Review the affected area, audience, message, and expiry before you publish."} onClose={closeDialog} wide><form onSubmit={publishAlert} className="form-grid">{alertStep === 2 && <div className="form-help field full"><strong>Preview · {statusLabel(alertDraft.severity)} · {alertDraft.location}</strong><br /><span style={{ display: "block", marginTop: 5, color: "#536d70", fontSize: 11, fontWeight: 700 }}>{alertDraft.title}</span><span style={{ display: "block", marginTop: 5 }}>{alertDraft.body}</span><span style={{ display: "block", marginTop: 7 }}>Audience: {scopedTrips.filter((trip) => trip.status !== "departed").length} active sample registrations · Expires {formatDate(alertDraft.expiresDate)} · Delivery simulated</span></div>}<label className="field full"><span>Alert title</span><input className="control" required maxLength={120} value={alertDraft.title} onChange={(event) => setAlertDraft((previous) => ({ ...previous, title: event.target.value }))} placeholder="Short, specific headline" /></label><label className="field"><span>Severity</span><select className="control" value={alertDraft.severity} onChange={(event) => setAlertDraft((previous) => ({ ...previous, severity: event.target.value as AlertSeverity }))}><option value="service">Service update</option><option value="advisory">Travel guidance</option><option value="urgent">Urgent safety notice</option><option value="crisis">Wellbeing check</option></select></label><label className="field"><span>Affected country or region</span><input className="control" required value={alertDraft.location} onChange={(event) => setAlertDraft((previous) => ({ ...previous, location: event.target.value }))} placeholder="e.g. Lisbon region" /></label><label className="field full"><span>Message</span><textarea className="control" required maxLength={1000} value={alertDraft.body} onChange={(event) => setAlertDraft((previous) => ({ ...previous, body: event.target.value }))} placeholder="Use plain language. Explain what citizens should do and where to find official updates." /></label><label className="field"><span>Expires on</span><input className="control" type="date" required min={dateToday()} value={alertDraft.expiresDate} onChange={(event) => setAlertDraft((previous) => ({ ...previous, expiresDate: event.target.value }))} /></label><div className="field"><span>Audience preview</span><div className="control" style={{ display: "flex", alignItems: "center", color: "#667e7e" }}>{scopedTrips.filter((trip) => trip.status !== "departed").length} active sample registrations</div></div><div className="form-help field full">Delivery is simulated in this demo. Publishing does not send email, SMS, push notifications, or provide crisis response capacity.</div>{formError && <p className="form-error field full">{formError}</p>}<div className="form-actions field full"><button className="btn btn-ghost" type="button" onClick={closeDialog}>Cancel</button>{alertStep === 2 && <button className="btn btn-secondary" type="button" onClick={() => setAlertStep(1)}><Pencil size={12} /> Back to draft</button>}<button className="btn btn-primary" type="submit">{alertStep === 1 ? <>Preview alert <ArrowRight size={13} /></> : <><Bell size={13} /> Publish demo alert</>}</button></div></form></Modal>}

      {dialog === "crisis" && <Modal title={data.activeRole === "staff" ? "Create a targeted wellbeing check" : "Respond to wellbeing request"} description={data.activeRole === "staff" ? "Contact sample registrations in a defined area. Nonresponse must never be interpreted as danger." : `Request for ${data.crisis.affectedArea}. Sharing your location is optional and only applies to this request.`} onClose={closeDialog}>
        {data.activeRole === "staff" ? <form onSubmit={sendCrisisCheck} className="stack-sm"><label className="field"><span>Check-in title</span><input className="control" required maxLength={100} value={crisisDraft.title} onChange={(event) => setCrisisDraft((previous) => ({ ...previous, title: event.target.value }))} placeholder="Short wellbeing request name" /></label><label className="field"><span>Affected country or region</span><input className="control" required value={crisisDraft.affectedArea} onChange={(event) => setCrisisDraft((previous) => ({ ...previous, affectedArea: event.target.value }))} placeholder="Country or region" /></label><div className="form-help"><strong>Audience preview:</strong> {scopedTrips.filter((trip) => trip.status !== "departed").length} active sample registration. The initial request expires in 72 hours. Notification delivery is simulated.</div>{formError && <p className="form-error">{formError}</p>}<div className="form-actions"><button type="button" className="btn btn-ghost" onClick={closeDialog}>Cancel</button><button className="btn btn-primary" type="submit"><Send size={13} /> Send check-in</button></div></form> : <form onSubmit={respondToCrisis} className="stack-sm"><div className="stack-sm"><ChoiceButton active={crisisAnswer === "safe"} icon={<CheckCircle2 size={16} />} title="I’m safe" detail="Send a safe response" onClick={() => setCrisisAnswer("safe")} /><ChoiceButton active={crisisAnswer === "need_help"} icon={<LifeBuoy size={16} />} title="I need help" detail="Send a response and open an assistance request" onClick={() => setCrisisAnswer("need_help")} /><ChoiceButton active={crisisAnswer === "not_affected"} icon={<MapPin size={16} />} title="I’m not in the affected area" detail="Let the mission know this request doesn’t apply" onClick={() => setCrisisAnswer("not_affected")} /></div><label className="checkbox-row"><input type="checkbox" checked={shareCrisisLocation} onChange={(event) => setShareCrisisLocation(event.target.checked)} />Share my location for this specific wellbeing request (optional).</label>{shareCrisisLocation && <label className="field"><span>Location to share</span><input className="control" required value={crisisLocation} onChange={(event) => setCrisisLocation(event.target.value)} placeholder="Enter a city or region" /><small>This is not continuous tracking and is not sent to emergency contacts.</small></label>}<div className="form-actions"><button type="button" className="btn btn-ghost" onClick={closeDialog}>Cancel</button><button className="btn btn-primary" type="submit">Send response <ArrowRight size={13} /></button></div></form>}
      </Modal>}

      {dialog === "mission" && currentMissionForEdit && <Modal title="Edit mission sample" description="Changes affect fictional directory details in this demo only." onClose={closeDialog}><form onSubmit={saveMission} className="stack-sm"><label className="field"><span>Mission display name</span><input className="control" name="name" required defaultValue={currentMissionForEdit.name} /></label><label className="field"><span>Address</span><input className="control" name="address" defaultValue={currentMissionForEdit.address} /></label><label className="field"><span>Opening hours</span><input className="control" name="hours" defaultValue={currentMissionForEdit.hours} /></label><div className="form-grid"><label className="field"><span>Demo phone</span><input className="control" name="phone" defaultValue={currentMissionForEdit.phone} /></label><label className="field"><span>Demo email</span><input className="control" name="email" type="email" defaultValue={currentMissionForEdit.email} /></label></div><label className="field"><span>Timezone</span><input className="control" name="timezone" defaultValue={currentMissionForEdit.timezone} /></label><div className="form-help">All sample phone numbers, addresses, and emails are fictitious and should not be published as real contacts.</div><div className="form-actions"><button type="button" className="btn btn-ghost" onClick={closeDialog}>Cancel</button><button className="btn btn-primary" type="submit">Save sample settings</button></div></form></Modal>}

      {dialog === "profile" && <Modal title="Edit your profile" description="Only add details that help this service work for you. Passport details are not required." onClose={closeDialog} wide><form onSubmit={saveProfile} className="form-grid"><label className="field"><span>Full name *</span><input className="control" required value={profileDraft.fullName} onChange={(event) => setProfileDraft((previous) => ({ ...previous, fullName: event.target.value }))} /></label><label className="field"><span>Citizenship *</span><input className="control" required value={profileDraft.citizenship} onChange={(event) => setProfileDraft((previous) => ({ ...previous, citizenship: event.target.value }))} /></label><label className="field"><span>Email *</span><input className="control" type="email" required value={profileDraft.email} onChange={(event) => setProfileDraft((previous) => ({ ...previous, email: event.target.value }))} /></label><label className="field"><span>Phone with country code</span><input className="control" value={profileDraft.phone} onChange={(event) => setProfileDraft((previous) => ({ ...previous, phone: event.target.value }))} placeholder="Optional" /></label><label className="field"><span>Preferred language</span><select className="control" value={profileDraft.language} onChange={(event) => setProfileDraft((previous) => ({ ...previous, language: event.target.value }))}><option>English</option><option>French</option><option>Spanish</option><option>Portuguese</option><option>Japanese</option><option>Other</option></select></label><div className="form-help">Emergency contact details are optional. They will not be automatically notified or given access to your location.</div><div className="field full"><label className="checkbox-row"><input type="checkbox" checked={!!profileDraft.emergencyContact} onChange={(event) => setProfileDraft((previous) => ({ ...previous, emergencyContact: event.target.checked ? { name: "", relationship: "", phone: "" } : null }))} />Add an optional emergency contact</label></div>{profileDraft.emergencyContact && <><label className="field"><span>Contact name</span><input className="control" value={profileDraft.emergencyContact.name} onChange={(event) => setProfileDraft((previous) => ({ ...previous, emergencyContact: previous.emergencyContact ? { ...previous.emergencyContact, name: event.target.value } : null }))} /></label><label className="field"><span>Relationship</span><input className="control" value={profileDraft.emergencyContact.relationship} onChange={(event) => setProfileDraft((previous) => ({ ...previous, emergencyContact: previous.emergencyContact ? { ...previous.emergencyContact, relationship: event.target.value } : null }))} /></label><label className="field"><span>Contact phone</span><input className="control" value={profileDraft.emergencyContact.phone} onChange={(event) => setProfileDraft((previous) => ({ ...previous, emergencyContact: previous.emergencyContact ? { ...previous.emergencyContact, phone: event.target.value } : null }))} /></label></>}{profileError && <p className="form-error field full">{profileError}</p>}<div className="form-actions field full"><button type="button" className="btn btn-ghost" onClick={closeDialog}>Cancel</button><button type="submit" className="btn btn-primary"><Check size={13} /> Save profile</button></div></form></Modal>}

      {dialog === "resolve" && <Modal title="Resolve assistance case" description="Add a resolution note that will appear in the citizen-visible case timeline." onClose={closeDialog}><form onSubmit={(event) => { event.preventDefault(); if (!resolutionCaseId || !resolutionDraft.trim()) return; setCaseStatus(resolutionCaseId, "resolved", resolutionDraft); setResolutionCaseId(null); setResolutionDraft(""); closeDialog(); }}><label className="field"><span>Resolution note *</span><textarea className="control" required value={resolutionDraft} onChange={(event) => setResolutionDraft(event.target.value)} placeholder="Summarise the action taken or guidance provided." /></label><div className="form-help" style={{ marginTop: 12 }}>Do not include sensitive personal information. The note is shown to the citizen and recorded in this demo case history.</div><div className="form-actions"><button type="button" className="btn btn-ghost" onClick={closeDialog}>Cancel</button><button type="submit" className="btn btn-primary" disabled={!resolutionDraft.trim()}><Check size={13} /> Resolve case</button></div></form></Modal>}

      {dialog === "urgent" && <Modal title="Get urgent help" description="This prototype cannot dispatch assistance. An online request does not replace local emergency services." onClose={closeDialog}><div className="urgent-card"><h2>If there is immediate danger</h2><p>Contact local emergency services using an official local source. This prototype does not provide local emergency numbers or operate a live response line.</p><div className="urgent-contact-row"><strong>Possible responsible Kenya mission</strong><span>{activeMission?.name ?? "Choose your destination and check the full Kenya MFA directory."}{activeMission && <><br />{activeMission.hostCity}, {activeMission.hostCountry}</>}</span></div><div className="urgent-contact-row"><strong>Mission emergency contact</strong><span>No dedicated emergency line is included in this prototype. Open the linked official mission source and confirm its current emergency arrangements. General office numbers in the directory are not treated as emergency lines.</span></div><div className="urgent-contact-row"><strong>Kenya MFA headquarters · general enquiries</strong><span>+254 20 331 8888 · +254 20 224 0066 · info@mfa.go.ke<br />These are Ministry headquarters enquiry contacts, not a confirmed 24/7 emergency response line.</span></div><div className="urgent-contact-row"><strong>Online assistance requests</strong><span>May not be monitored continuously. Submitting a request does not guarantee an immediate response, evacuation, or financial support.</span></div></div><div className="form-actions"><a className="btn btn-secondary" href={activeMission?.sourceUrl ?? MFA_CONTACT_URL} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Open official contact source</a><button type="button" className="btn btn-secondary" onClick={() => { closeDialog(); goTo("directory"); }}>Browse Kenyan missions</button><button type="button" className="btn btn-primary" onClick={() => openHelpForm(undefined, true)}>Create online request <ArrowRight size={13} /></button></div></Modal>}

      {dialog === "checkout" && <Modal title="Check out of this trip?" description="This closes your registration but keeps its history and receipt." onClose={closeDialog}><div className="case-banner"><span className="case-banner-icon"><Plane size={17} /></span><span className="case-banner-text"><strong>{data.trips.find((trip) => trip.id === checkoutTripId)?.city}, {data.trips.find((trip) => trip.id === checkoutTripId)?.country}</strong><span>{data.trips.find((trip) => trip.id === checkoutTripId)?.reference}</span></span></div><div className="form-help" style={{ marginTop: 12 }}>Your trip will be marked as departed and kept in your trip history. This does not close any separate assistance case.</div><div className="form-actions"><button className="btn btn-ghost" onClick={closeDialog}>Keep trip open</button><button className="btn btn-primary" onClick={confirmCheckout}>Check out and close trip</button></div></Modal>}

      {toast && <div className="toast" role="status" aria-live="polite"><CheckCircle2 size={16} className="toast-icon" /><div><strong>{toast.title}</strong><p>{toast.body}</p></div><button className="toast-close" aria-label="Dismiss message" onClick={() => setToast(null)}><X size={13} /></button></div>}
    </div>
  );
}

function PublicLanding({ loading, onGetStarted, onCitizenDemo, onStaffDemo, onFindEmbassy }: { loading: boolean; onGetStarted: () => void; onCitizenDemo: () => void; onStaffDemo: () => void; onFindEmbassy: () => void }) {
  return <div className="landing-shell">
    <header className="landing-nav">
      <a href="#welcome" className="brand" onClick={(event) => event.preventDefault()}><span className="brand-mark">EC</span><span><span className="brand-name">Embassy Connect</span><span className="brand-subtitle">Your consular companion</span></span></a>
      <div className="landing-nav-links"><a href="#how-it-works">How it works</a><button type="button" onClick={onFindEmbassy} disabled={loading}>Find Kenyan missions</button><button type="button" className="btn btn-secondary btn-sm" onClick={onCitizenDemo} disabled={loading}>Kenyan citizen demo</button><button type="button" className="btn btn-primary btn-sm" onClick={onStaffDemo} disabled={loading}>Mission staff preview</button></div>
    </header>
    <main id="welcome" className="landing-main">
      <section className="landing-hero">
        <div className="landing-copy">
          <div className="landing-eyebrow"><span className="demo-stamp-dot" /> FOR KENYANS ABROAD · MFA SERVICE PROTOTYPE</div>
          <h1>Travel with confidence.<br /><em>Stay connected</em> abroad.</h1>
          <p>A digital consular-service concept for Kenyan citizens travelling or living abroad. Register a trip, find a responsible Kenya mission, and keep track of support requests.</p>
          <div className="landing-actions"><button className="btn btn-primary" onClick={onGetStarted} disabled={loading}>Start Kenyan citizen demo <ArrowRight size={14} /></button><button className="btn btn-secondary" onClick={onFindEmbassy} disabled={loading}><Building2 size={14} /> Find a Kenyan mission</button></div>
          <div className="landing-demo-caption"><ShieldCheck size={13} />{loading ? "Loading the saved demo session…" : "Choose a citizen or staff demo. No real account or password is used."}</div>
        </div>
        <div className="landing-visual" aria-label="Illustration of a connected trip and embassy support">
          <div className="landing-orbit landing-orbit-one" /><div className="landing-orbit landing-orbit-two" />
          <div className="landing-map-dot dot-one" /><div className="landing-map-dot dot-two" /><div className="landing-map-dot dot-three" />
          <div className="landing-route-line" />
          <div className="landing-location-pin"><MapPin size={15} /></div>
          <div className="landing-trip-card"><div className="landing-trip-head"><span className="landing-small-mark">EC</span><span className="landing-chip"><span /> SAMPLE TRIP</span></div><div className="landing-trip-place">Lisbon, Portugal</div><div className="landing-trip-dates"><span><small>ARRIVAL</small> Jun 12</span><span><small>EXPECTED DEPARTURE</small> Jun 28</span></div><div className="landing-card-divider" /><div className="landing-mission"><span className="landing-mission-icon"><Building2 size={14} /></span><span><strong>Possible Kenya mission</strong><small>Paris · listed as serving Portugal</small></span><CheckCircle2 size={14} /></div></div>
          <div className="landing-safe-card"><span className="landing-safe-icon"><CheckCircle2 size={15} /></span><span><strong>Wellbeing update</strong><small>You’re marked safe</small></span></div>
          <div className="landing-sparkle"><Sparkles size={17} /></div>
        </div>
      </section>
      <div className="landing-disclaimer"><Info size={15} /><div><strong>Kenya consular-service prototype — not yet an official Ministry service</strong><span>Citizen profiles, trip records, case records, alerts, and appointments are fictional. The mission directory links to published MFA/mission sources; recheck current details there. Online requests do not replace local emergency services.</span></div></div>
      <section className="landing-features" id="how-it-works"><div className="landing-section-heading"><span>SUPPORT THROUGH EVERY STAGE</span><h2>More than a check-in.</h2><p>A helpful place to stay connected before departure and throughout your stay.</p></div><div className="landing-feature-grid">
        <article><span className="landing-feature-icon"><Plane size={17} /></span><h3>Register your travel</h3><p>Share a destination and expected dates. Update your plans when they change.</p></article>
        <article><span className="landing-feature-icon"><Bell size={17} /></span><h3>Stay informed</h3><p>Keep relevant mission notices and service updates together in one place.</p></article>
        <article><span className="landing-feature-icon"><HeartHandshake size={17} /></span><h3>Ask for support</h3><p>Submit a request and follow its progress separately from your travel status.</p></article>
        <article><span className="landing-feature-icon"><ShieldCheck size={17} /></span><h3>Designed for trust</h3><p>Plain language, optional details, and no continuous location tracking.</p></article>
      </div></section>
      <section className="landing-bottom-callout"><div><span className="landing-eyebrow">A CLEAR START TO YOUR JOURNEY</span><h2>Wherever you’re headed, start with a check-in.</h2><p>Travel registration helps an embassy communicate and provide consular assistance. It does not replace visas or immigration requirements.</p></div><button className="btn btn-primary" onClick={onGetStarted} disabled={loading}>Register a trip <ArrowRight size={14} /></button></section>
      <footer className="landing-footer"><span>Embassy Connect · Kenya consular-service prototype · Not yet operated by the Ministry</span><span>Citizen data is fictional. Reconfirm mission contacts through the linked official MFA/mission sources; no emergency line is provided here.</span></footer>
    </main>
  </div>;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase() || "EC";
}

function ClipboardIcon(props: { size?: number; strokeWidth?: number }) { return <FileText {...props} />; }
function RefreshIcon() { return <Activity size={12} />; }
function LockIcon() { return <ShieldCheck size={11} />; }

function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = item.kind === "trip" ? Plane : item.kind === "status" ? ShieldCheck : item.kind === "case" ? HeartHandshake : item.kind === "appointment" ? CalendarDays : Bell;
  return <div className="activity-row"><span className="activity-dot"><Icon size={12} /></span><div className="activity-text"><strong>{item.title}</strong><span>{item.detail}</span></div><time className="activity-time">{relativeDate(item.at)}</time></div>;
}

function AlertRow({ item, compact = false, onMarkRead, showAction = false }: { item: AlertItem; compact?: boolean; onMarkRead?: () => void; showAction?: boolean }) {
  return <div className="alert-row"><span className={`alert-severity-icon ${item.severity}`}>{severityIcon(item.severity)}</span><div className="alert-main"><div className="alert-title">{item.title}{!item.read && <span className="unread-mark" aria-label="Unread" />}</div><div className="alert-copy">{compact ? item.body.slice(0, 120) + (item.body.length > 120 ? "…" : "") : item.body}</div><div className="alert-meta"><span>{item.location}</span><span>{formatDateTime(item.publishedAt)}</span><span>Expires {formatDate(item.expiresAt)}</span><span className="verified-mark"><Info size={10} /> Prototype notice · not official</span></div>{showAction && <button className="text-button" style={{ marginTop: 8 }} onClick={onMarkRead}>{item.read ? "Mark unread" : "Mark as read"}</button>}</div></div>;
}

function EmptyInline({ message }: { message: string }) { return <p className="panel-subtitle" style={{ padding: "7px 0 2px" }}>{message}</p>; }

function StatCard({ label, value, foot, icon: Icon, onClick }: { label: string; value: string; foot: string; icon: LucideIcon; onClick?: () => void }) {
  return <div className="panel stat-card" role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} onClick={onClick} onKeyDown={(event) => { if (onClick && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onClick(); } }}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={15} /></span></div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></div>;
}

function TripCard({ trip, mission, onEdit, onArrival, onCheckout, onContact, compact = false }: { trip: Trip; mission: Mission | null; onEdit: () => void; onArrival: () => void; onCheckout: () => void; onContact: () => void; compact?: boolean }) {
  return <article className="trip-list-card" style={{ border: "1px solid #e7ede8", borderRadius: 10, background: "#fff" }}><div className="trip-list-top"><div><div className="trip-list-title">{trip.city}, {trip.country}</div><div className="trip-list-location"><MapPin size={11} /> {trip.region} · {trip.purpose}</div></div><Pill value={trip.status} /></div><div className="trip-details-grid"><div><div className="trip-detail-label">Arrival</div><div className="trip-detail-value">{formatDate(trip.arrivalDate)}</div></div><div><div className="trip-detail-label">Expected departure</div><div className="trip-detail-value">{trip.departureUnknown || !trip.departureDate ? "Not set" : formatDate(trip.departureDate)}</div></div><div><div className="trip-detail-label">Last updated</div><div className="trip-detail-value">{relativeDate(trip.updatedAt)}</div></div><div><div className="trip-detail-label">Registration reference</div><div className="trip-detail-value">{trip.reference}</div></div></div>{mission ? <div className="embassy-inline" style={{ marginBottom: 12 }}><span className="embassy-mark"><Building2 size={15} /></span><span><span className="embassy-title">{mission.name}</span><span className="embassy-loc">{mission.locallyPresent ? `Local · ${mission.hostCity}` : `Served from ${mission.hostCity}, ${mission.hostCountry}`}</span></span><button className="text-button" onClick={onContact}>Contact <ChevronRight size={11} /></button></div> : <div className="form-help" style={{ marginBottom: 12 }}>No sample mission is assigned for this destination. Confirm jurisdiction using an authorised government source.</div>}<div className="trip-actions">{!compact && <button className="btn btn-sm btn-secondary" onClick={onEdit}><Pencil size={11} /> Edit details</button>}{trip.status === "registered" && !compact && <button className="btn btn-sm btn-primary" onClick={onArrival}><Check size={11} /> Confirm arrival</button>}{trip.status === "arrived" && !compact && <button className="btn btn-sm btn-secondary" onClick={onCheckout}><ArrowRight size={11} /> Check out</button>}{trip.status === "departed" && <span className="inline-tag"><Check size={10} /> History retained</span>}</div></article>;
}

function AppointmentSummary({ appointment, mission }: { appointment: Appointment; mission?: Mission }) {
  return <div className="case-banner" style={{ marginBottom: 8 }}><span className="case-banner-icon"><CalendarDays size={16} /></span><span className="case-banner-text"><strong>{appointment.service}</strong><span>{formatDateTime(appointment.startAt, appointment.timezone)} · {appointment.timezone}<br />{mission?.hostCountry ?? "Mission"} · {appointment.reference}</span></span><Pill value={appointment.status} /></div>;
}

function CaseQueueRow({ item, onClick }: { item: AssistanceCase; onClick: () => void }) {
  return <button className="case-banner btn-wide" style={{ textAlign: "left", cursor: "pointer" }} onClick={onClick}><span className="case-banner-icon"><HeartHandshake size={16} /></span><span className="case-banner-text"><strong>{item.category}</strong><span>{item.reference} · {item.location} · {relativeDate(item.updatedAt)}</span></span><span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}><Pill value={item.urgency} /><Pill value={item.status} /></span></button>;
}

function ChoiceButton({ active, icon, title, detail, onClick }: { active: boolean; icon: ReactNode; title: string; detail: string; onClick: () => void }) {
  return <button type="button" className="action-tile btn-wide" onClick={onClick} style={{ borderColor: active ? "#83bca6" : undefined, background: active ? "#f0f8f2" : undefined }}><span className="action-tile-icon">{icon}</span><span><strong>{title}</strong><small>{detail}</small></span>{active && <CheckCircle2 size={15} style={{ marginLeft: "auto", color: "#528c70" }} />}</button>;
}
