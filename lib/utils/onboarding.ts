import { MANAGER_PATH, RIVALS_PATH } from '@/lib/constants/routes';

const DONE_KEY = 'glizzy-onboarding-done';
const RESUME_STEP_KEY = 'glizzy-onboarding-step';

// The tour opens on its own only on the hub and the two mode landing pages.
// A guest who follows an invite link straight into a room is left alone,
// and gets the tour the first time they come to the hub instead
const TOUR_PATHS: readonly string[] = ['/', MANAGER_PATH, RIVALS_PATH];

export function tourAllowedOn(pathname: string): boolean {
  return TOUR_PATHS.includes(pathname);
}

export function isOnboardingDone(): boolean {
  try {
    return localStorage.getItem(DONE_KEY) === '1';
  } catch {
    return true;
  }
}

export function markOnboardingDone(): void {
  try {
    localStorage.setItem(DONE_KEY, '1');
  } catch {
    // storage unavailable, the tour shows again on the next load
  }
}

// A language switch reloads the page; the step is parked in sessionStorage
// so the tour reopens where it was, in the new language
export function rememberOnboardingStep(step: number): void {
  try {
    sessionStorage.setItem(RESUME_STEP_KEY, String(step));
  } catch {
    // best-effort
  }
}

export function readOnboardingResumeStep(): number | null {
  try {
    const raw = sessionStorage.getItem(RESUME_STEP_KEY);
    if (raw === null) return null;
    const step = Number(raw);
    return Number.isInteger(step) && step >= 0 ? step : null;
  } catch {
    return null;
  }
}

export function clearOnboardingResumeStep(): void {
  try {
    sessionStorage.removeItem(RESUME_STEP_KEY);
  } catch {
    // best-effort
  }
}

// "Show the tutorial again" lives in the settings modal, the tour itself is
// mounted by the layout; this flag connects the two
const listeners = new Set<() => void>();
let requested = false;

export const onboardingRequest = {
  isRequested(): boolean {
    return requested;
  },
  open(): void {
    requested = true;
    listeners.forEach((listener) => listener());
  },
  clear(): void {
    requested = false;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getServerSnapshot(): boolean {
    return false;
  },
};
