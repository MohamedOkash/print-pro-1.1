// lib/auth.ts — Session helpers built on top of Firebase Auth
// The old static allow-list has been removed. Auth is now handled entirely
// by Firebase (email/password + Google). This file only keeps the lightweight
// localStorage session mirror so the rest of the app can read the user name
// without waiting for the Firebase SDK on every render.

export interface Session {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
}

const KEY = "printpro_session";

/** Persist a Firebase user as a local session (localStorage + cookie). */
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

/** Clear the session entirely (call on logout). */
export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  document.cookie = `${KEY}=; path=/; max-age=0; SameSite=Lax`;
}
