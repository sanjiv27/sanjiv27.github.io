export const CONSENT_KEY = "portfolio.analytics.consent";
export const OWNER_OPTOUT_KEY = "portfolio.analytics.owner-opt-out";
export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
export const ANALYTICS_CONFIGURED = process.env.NODE_ENV === "production" && /^G-[A-Z0-9]+$/.test(GA_ID);

type AnalyticsEvent = "research_toggle" | "navigation_click" | "homepage_click" | "research_click" | "contact_click" | "research_view";
export interface EventDetails {
  section: string;
  element_id: string;
  action: string;
  item_id?: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let allowed = false;

export function readPreference(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}

export function savePreference(key: string, value: string): void {
  try { window.localStorage.setItem(key, value); } catch { /* Session choice still works. */ }
}

export function setAnalyticsAllowed(value: boolean): void {
  allowed = value && ANALYTICS_CONFIGURED && readPreference(OWNER_OPTOUT_KEY) !== "true";
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = !allowed;
  }
}

export function analyticsAllowed(): boolean {
  return allowed && typeof window !== "undefined" && readPreference(OWNER_OPTOUT_KEY) !== "true";
}

export function trackEvent(event: AnalyticsEvent, details: EventDetails): boolean {
  if (!analyticsAllowed() || !window.gtag) return false;
  try {
    window.gtag("event", event, { ...details, transport_type: "beacon" });
    return true;
  } catch { return false; }
}

/** Explicit annotations only: no DOM text, destination URL, or email extraction. */
export function trackAnnotatedClick(target: EventTarget | null): void {
  if (!(target instanceof Element)) return;
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path !== "/" && path !== "/research") return;
  const element = target.closest<HTMLElement>("[data-track-event]");
  if (!element) return;
  const { trackEvent: event, trackSection, trackElement, trackAction, trackItem } = element.dataset;
  if (!event || !["homepage_click", "research_click", "contact_click", "research_toggle"].includes(event)) return;
  if (!trackSection || !trackElement || !trackAction) return;
  const eventName = event === "homepage_click" && path !== "/" ? "navigation_click" : event;
  trackEvent(eventName as AnalyticsEvent, {
    section: trackSection,
    element_id: trackElement,
    action: trackAction,
    ...(trackItem ? { item_id: trackItem } : {}),
  });
}

/** Strip arbitrary query strings/hash; retain only conventional campaign slugs. */
export function analyticsPageLocation(href: string): string {
  const url = new URL(href);
  const clean = new URL(url.origin + url.pathname);
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = url.searchParams.get(key);
    if (value && /^[a-zA-Z0-9_-]{1,100}$/.test(value)) clean.searchParams.set(key, value);
  }
  return clean.href;
}
