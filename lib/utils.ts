import type {
  User,
  ArrivalProfile,
  UserTask,
  ReminderPrefs,
  SupportTicket,
} from "@/types";

// ─── Key names ────────────────────────────────────────────────────────────────
const KEYS = {
  USER: "beginly_user",
  PROFILE: "beginly_profile",
  TASKS: "beginly_tasks",
  REMINDERS: "beginly_reminders",
  TICKETS: "beginly_tickets",
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
// Supabase Auth is the single source of truth. These helpers now cache only
// non-sensitive display data for offline UI fallback; they do not create auth
// cookies, admin cookies, or session authority.

export function getCachedDisplayUser(): User | null {
  return safeGet<User | null>(KEYS.USER, null);
}

export function setUser(user: User): void {
  safeSet(KEYS.USER, user);
}

export function clearUser(): void {
  if (typeof window !== "undefined") localStorage.removeItem(KEYS.USER);
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
