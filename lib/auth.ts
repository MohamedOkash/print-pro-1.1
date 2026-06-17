// ────────────────────────────────────────────────────────────────────────────
// Print Pro — simple credential auth.
// A fixed allow-list of accounts. Only these can sign in; there is NO public
// registration and NO guest access. The session is stored in localStorage and
// mirrored to a cookie so it survives reloads.
// ────────────────────────────────────────────────────────────────────────────

export interface Account {
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
}

/** Shared password for all 10 hand-out user accounts. */
export const USER_PASSWORD = "PrintPro@2025";

/** The ONLY accounts allowed to sign in. */
export const ACCOUNTS: Account[] = [
  { email: "okash@printpro.com", password: "Admin@1234", name: "okash", role: "admin" },
  // 10 ready-to-hand-out accounts — all share one unified password.
  { email: "user1@printpro.com",  password: USER_PASSWORD, name: "مستخدم 1",  role: "user" },
  { email: "user2@printpro.com",  password: USER_PASSWORD, name: "مستخدم 2",  role: "user" },
  { email: "user3@printpro.com",  password: USER_PASSWORD, name: "مستخدم 3",  role: "user" },
  { email: "user4@printpro.com",  password: USER_PASSWORD, name: "مستخدم 4",  role: "user" },
  { email: "user5@printpro.com",  password: USER_PASSWORD, name: "مستخدم 5",  role: "user" },
  { email: "user6@printpro.com",  password: USER_PASSWORD, name: "مستخدم 6",  role: "user" },
  { email: "user7@printpro.com",  password: USER_PASSWORD, name: "مستخدم 7",  role: "user" },
  { email: "user8@printpro.com",  password: USER_PASSWORD, name: "مستخدم 8",  role: "user" },
  { email: "user9@printpro.com",  password: USER_PASSWORD, name: "مستخدم 9",  role: "user" },
  { email: "user10@printpro.com", password: USER_PASSWORD, name: "مستخدم 10", role: "user" },
];

export interface Session {
  email: string;
  name: string;
  role: "admin" | "user";
}

const KEY = "printpro_session";

/** Validate credentials against the allow-list. Returns a session or null. */
export function validateLogin(email: string, password: string): Session | null {
  const e = email.trim().toLowerCase();
  const acc = ACCOUNTS.find(
    (a) => a.email.toLowerCase() === e && a.password === password
  );
  if (!acc) return null;
  return { email: acc.email, name: acc.name, role: acc.role };
}

/** Persist the session (localStorage + cookie). */
export function setSession(session: Session) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(session));
  document.cookie = `${KEY}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

/** Read the current session, or null if not signed in. */
export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

/** Clear the session entirely. */
export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  document.cookie = `${KEY}=; path=/; max-age=0; SameSite=Lax`;
}
