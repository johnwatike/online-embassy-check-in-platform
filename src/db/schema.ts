import {
  boolean,
  date,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// Demo snapshots are intentionally separate from production identity/security.
// They provide a persistent, explicitly fictional sandbox experience.
export const demoSnapshots = pgTable("demo_snapshots", {
  id: text("id").primaryKey(),
  state: jsonb("state").notNull().$type<Record<string, unknown>>(),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  createdAt: createdAt(),
}, (table) => [uniqueIndex("users_email_unique").on(table.email)]);

export const citizenProfiles = pgTable("citizen_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  citizenship: text("citizenship").notNull(),
  phone: text("phone"),
  preferredLanguage: text("preferred_language").notNull().default("English"),
  createdAt: createdAt(),
}, (table) => [uniqueIndex("citizen_profiles_user_unique").on(table.userId)]);

export const emergencyContacts = pgTable("emergency_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  citizenId: uuid("citizen_id").notNull().references(() => citizenProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  relationship: text("relationship"),
  phone: text("phone"),
  createdAt: createdAt(),
});

export const missions = pgTable("missions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  missionType: text("mission_type").notNull(),
  hostCountry: text("host_country").notNull(),
  hostCountryCode: text("host_country_code").notNull(),
  hostCity: text("host_city").notNull(),
  address: text("address"),
  timezone: text("timezone").notNull(),
  contacts: jsonb("contacts").notNull().$type<Record<string, string>>(),
  openingHours: jsonb("opening_hours").notNull().$type<Record<string, string>>(),
  services: jsonb("services").notNull().$type<string[]>(),
  sourceUrl: text("source_url").notNull(),
  sourceLabel: text("source_label").notNull(),
  canProvideConsularSupport: boolean("can_provide_consular_support").notNull().default(true),
  verifiedAt: date("verified_at"),
  createdAt: createdAt(),
});

export const missionJurisdictions = pgTable("mission_jurisdictions", {
  id: uuid("id").primaryKey().defaultRandom(),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }),
  countryCode: text("country_code").notNull(),
  countryName: text("country_name").notNull(),
}, (table) => [uniqueIndex("mission_jurisdiction_unique").on(table.missionId, table.countryCode)]);

export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().defaultRandom(),
  citizenId: uuid("citizen_id").notNull().references(() => citizenProfiles.id, { onDelete: "cascade" }),
  reference: text("reference").notNull(),
  countryCode: text("country_code").notNull(),
  countryName: text("country_name").notNull(),
  region: text("region"),
  arrivalDate: date("arrival_date").notNull(),
  departureDate: date("departure_date"),
  departureUnknown: boolean("departure_unknown").notNull().default(false),
  purpose: text("purpose").notNull(),
  accommodation: text("accommodation"),
  status: text("status").notNull(),
  missionId: uuid("mission_id").references(() => missions.id),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("trips_reference_unique").on(table.reference), index("trips_citizen_status_idx").on(table.citizenId, table.status)]);

export const tripDestinations = pgTable("trip_destinations", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  countryCode: text("country_code").notNull(),
  countryName: text("country_name").notNull(),
  cityOrRegion: text("city_or_region"),
  arrivalDate: date("arrival_date"),
  departureDate: date("departure_date"),
});

export const dependants = pgTable("dependants", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  consentRecorded: boolean("consent_recorded").notNull().default(false),
  createdAt: createdAt(),
});

export const wellbeingUpdates = pgTable("wellbeing_updates", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripId: uuid("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  citizenId: uuid("citizen_id").notNull().references(() => citizenProfiles.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  note: text("note"),
  createdAt: createdAt(),
}, (table) => [index("wellbeing_trip_created_idx").on(table.tripId, table.createdAt)]);

export const alerts = pgTable("alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  missionId: uuid("mission_id").references(() => missions.id),
  title: text("title").notNull(),
  severity: text("severity").notNull(),
  location: text("location").notNull(),
  body: text("body").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  email: boolean("email").notNull().default(true),
  sms: boolean("sms").notNull().default(false),
  push: boolean("push").notNull().default(false),
  reminderDays: text("reminder_days").notNull().default("7"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("notification_preferences_user_unique").on(table.userId)]);

export const assistanceCases = pgTable("assistance_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  citizenId: uuid("citizen_id").notNull().references(() => citizenProfiles.id, { onDelete: "cascade" }),
  missionId: uuid("mission_id").references(() => missions.id),
  reference: text("reference").notNull(),
  category: text("category").notNull(),
  urgency: text("urgency").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  contactMethod: text("contact_method").notNull(),
  status: text("status").notNull(),
  assignedOfficer: text("assigned_officer"),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("assistance_cases_reference_unique").on(table.reference), index("assistance_cases_status_idx").on(table.status)]);

export const caseMessages = pgTable("case_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id").notNull().references(() => assistanceCases.id, { onDelete: "cascade" }),
  senderUserId: uuid("sender_user_id").references(() => users.id),
  senderRole: text("sender_role").notNull(),
  message: text("message").notNull(),
  createdAt: createdAt(),
}, (table) => [index("case_messages_case_created_idx").on(table.caseId, table.createdAt)]);

export const internalCaseNotes = pgTable("internal_case_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id").notNull().references(() => assistanceCases.id, { onDelete: "cascade" }),
  staffUserId: uuid("staff_user_id").references(() => users.id),
  body: text("body").notNull(),
  createdAt: createdAt(),
});

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  citizenId: uuid("citizen_id").notNull().references(() => citizenProfiles.id, { onDelete: "cascade" }),
  missionId: uuid("mission_id").notNull().references(() => missions.id),
  service: text("service").notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  timezone: text("timezone").notNull(),
  status: text("status").notNull(),
  createdAt: createdAt(),
});

export const crisisEvents = pgTable("crisis_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  missionId: uuid("mission_id").references(() => missions.id),
  title: text("title").notNull(),
  affectedArea: text("affected_area").notNull(),
  status: text("status").notNull(),
  createdAt: createdAt(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});

export const crisisResponses = pgTable("crisis_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  crisisEventId: uuid("crisis_event_id").notNull().references(() => crisisEvents.id, { onDelete: "cascade" }),
  citizenId: uuid("citizen_id").notNull().references(() => citizenProfiles.id, { onDelete: "cascade" }),
  response: text("response").notNull(),
  locationShared: boolean("location_shared").notNull().default(false),
  sharedLocation: text("shared_location"),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  createdAt: createdAt(),
}, (table) => [uniqueIndex("crisis_response_unique").on(table.crisisEventId, table.citizenId)]);

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  actorLabel: text("actor_label").notNull(),
  action: text("action").notNull(),
  recordType: text("record_type").notNull(),
  recordId: text("record_id").notNull(),
  createdAt: createdAt(),
}, (table) => [index("audit_events_record_idx").on(table.recordType, table.recordId)]);
