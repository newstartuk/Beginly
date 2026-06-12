import type {
  User,
  ArrivalProfile,
  UserTask,
  ReminderPrefs,
  SupportTicket,
} from "@/types";

// ─── Key names ────────────────────────────────────────────────────────────────
const KEYS = {
  USER: "nsk_user",
  PROFILE: "nsk_profile",
  TASKS: "nsk_tasks",
  REMINDERS: "nsk_reminders",
  TICKETS: "nsk_tickets",
} as const;

// ─── Generic helpers ─────────────────────────────────────────────────────────
function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

// ─── Auth / User ─────────────────────────────────────────────────────────────
// Cookie helpers — both session and admin are httpOnly for security
function setSessionCookie(token: string, isAdmin: boolean): void {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  // httpOnly: true — prevents JavaScript from reading the session token
  document.cookie = `nsk_session=${encodeURIComponent(token)}; path=/; expires=${expires.toUTCString()}; SameSite=Lax; HttpOnly; Secure`;
  // httpOnly: true — prevents JavaScript from spoofing admin access
  document.cookie = `nsk_is_admin=${encodeURIComponent(isAdmin ? "true" : "false")}; path=/; expires=${expires.toUTCString()}; SameSite=Lax; HttpOnly`;
}

function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = "nsk_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly";
  document.cookie = "nsk_is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly";
}

export function getUser(): User | null {
  return safeGet<User | null>(KEYS.USER, null);
}

export function setUser(user: User, token?: string): void {
  safeSet(KEYS.USER, user);
  // Sync session cookie for middleware-based route guards
  // Admin emails: simple MVP rule — emails starting with 'admin@' are admins
  const isAdmin = user.email.toLowerCase().startsWith("admin@");
  // token param should be the JWT string from the API response cookie
  setSessionCookie(token ?? user.id, isAdmin);
}

export function clearUser(): void {
  if (typeof window !== "undefined") localStorage.removeItem(KEYS.USER);
  clearSessionCookie();
}

// DEPRECATED — password hashing is done server-side in /api/auth/signup and /api/auth/login
// using PBKDF2 with 100,000 iterations (lib/utils.ts is client-side only).
// This weak hash is kept only for backwards compatibility during the localStorage → Supabase migration.
export function hashPassword(password: string): string {
  console.warn("[Beginly DEPRECATED] hashPassword called — migrate to server-side PBKDF2");
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `demo_${Math.abs(hash).toString(16)}`;
}

export function createUser(name: string, email: string, password: string): User {
  return {
    id: generateId(),
    name,
    email,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    profileCompleted: false,
  };
}

// DEPRECATED — password verification is done server-side in /api/auth/login.
// This weak comparison is kept only for backwards compatibility during the migration.
export function verifyPassword(password: string, storedHash: string): boolean {
  console.warn("[Beginly DEPRECATED] verifyPassword called — migrate to server-side PBKDF2");
  return hashPassword(password) === storedHash;
}

// ─── Arrival Profile ──────────────────────────────────────────────────────────
export function getArrivalProfile(): ArrivalProfile | null {
  return safeGet<ArrivalProfile | null>(KEYS.PROFILE, null);
}

export function setArrivalProfile(profile: ArrivalProfile): void {
  safeSet(KEYS.PROFILE, profile);
}

export function clearArrivalProfile(): void {
  if (typeof window !== "undefined") localStorage.removeItem(KEYS.PROFILE);
}

// ─── User Tasks ──────────────────────────────────────────────────────────────
export function getUserTasks(): UserTask[] {
  return safeGet<UserTask[]>(KEYS.TASKS, []);
}

export function setUserTasks(tasks: UserTask[]): void {
  safeSet(KEYS.TASKS, tasks);
}

export function getUserTask(taskId: string): UserTask | undefined {
  return getUserTasks().find((t) => t.taskId === taskId);
}

export function upsertUserTask(taskId: string, status: UserTask["status"]): void {
  const tasks = getUserTasks();
  const idx = tasks.findIndex((t) => t.taskId === taskId);
  if (idx >= 0) {
    tasks[idx] = { taskId, status, completedAt: status === "complete" ? new Date().toISOString() : undefined };
  } else {
    tasks.push({ taskId, status, completedAt: status === "complete" ? new Date().toISOString() : undefined });
  }
  setUserTasks(tasks);
}

// ─── Reminder Preferences ─────────────────────────────────────────────────────
export function getReminderPrefs(): ReminderPrefs {
  return safeGet<ReminderPrefs>(KEYS.REMINDERS, {
    emailReminders: false,
    frequency: "weekly",
  });
}

export function setReminderPrefs(prefs: ReminderPrefs): void {
  safeSet(KEYS.REMINDERS, prefs);
}

// ─── Support Tickets ─────────────────────────────────────────────────────────
export function getSupportTickets(): SupportTicket[] {
  return safeGet<SupportTicket[]>(KEYS.TICKETS, []);
}

export function addSupportTicket(ticket: SupportTicket): void {
  const tickets = getSupportTickets();
  tickets.push(ticket);
  safeSet(KEYS.TICKETS, tickets);
}

// ─── Clear all data ──────────────────────────────────────────────────────────
export function clearAllData(): void {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  clearSessionCookie();
}

// ─── Utilities ────────────────────────────────────────────────────────────────
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
