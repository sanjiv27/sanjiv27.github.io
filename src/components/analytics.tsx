"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ANALYTICS_CONFIGURED, GA_ID, CONSENT_KEY, OWNER_OPTOUT_KEY,
  analyticsAllowed, analyticsPageLocation, readPreference, savePreference,
  setAnalyticsAllowed, trackAnnotatedClick, trackEvent,
} from "@/lib/analytics";
import { observeResearch } from "@/lib/research-visibility";

type Consent = "granted" | "denied" | null;

function initializeTag() {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer!.push(arguments); };
  window.gtag("consent", "default", {
    analytics_storage: "granted", ad_storage: "denied",
    ad_user_data: "denied", ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: analyticsPageLocation(window.location.href),
    page_referrer: document.referrer ? new URL(document.referrer).origin : "",
    ...(readPreference("portfolio.analytics.debug") === "true" ? { debug_mode: true } : {}),
  });
  const script = document.createElement("script");
  script.id = "portfolio-analytics-tag";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

export function Analytics() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ownerOptOut, setOwnerOptOut] = useState(false);
  const lastPage = useRef<string | null>(null);
  const researchViewed = useRef(false);
  const settingsButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sync = () => {
      const stored = readPreference(CONSENT_KEY);
      setConsent(stored === "granted" || stored === "denied" ? stored : null);
      setOwnerOptOut(readPreference(OWNER_OPTOUT_KEY) === "true");
    };
    sync();
    setReady(true);
    // Reload if another tab withdraws consent, stopping already-loaded Google code.
    const onStorage = (event: StorageEvent) => {
      if (event.key === CONSENT_KEY || event.key === OWNER_OPTOUT_KEY || event.key === null) {
        setAnalyticsAllowed(false);
        window.location.reload();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const enabled = ready && consent === "granted" && !ownerOptOut && ANALYTICS_CONFIGURED;
    setAnalyticsAllowed(enabled);
    if (!enabled) return;
    initializeTag();
    if (lastPage.current !== pathname) {
      window.gtag?.("event", "page_view", {
        page_location: analyticsPageLocation(window.location.href),
        page_title: document.title,
      });
      lastPage.current = pathname;
      researchViewed.current = false;
    }
    const onClick = (event: MouseEvent) => trackAnnotatedClick(event.target);
    document.addEventListener("click", onClick, true);
    // Middle-button link openings also represent an intentional activation.
    const onAuxClick = (event: MouseEvent) => { if (event.button === 1) trackAnnotatedClick(event.target); };
    document.addEventListener("auxclick", onAuxClick, true);
    const stopObserving = pathname.replace(/\/$/, "") === "/research" && !researchViewed.current
      ? observeResearch(() => {
          if (researchViewed.current) return true;
          researchViewed.current = trackEvent("research_view", {
            section: "research", element_id: "section", action: "view",
          });
          return researchViewed.current;
        })
      : () => {};
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onAuxClick, true);
      stopObserving();
      setAnalyticsAllowed(false);
    };
  }, [consent, ownerOptOut, pathname, ready]);

  const choose = (choice: Exclude<Consent, null>) => {
    const wasEnabled = analyticsAllowed();
    savePreference(CONSENT_KEY, choice);
    setConsent(choice);
    setSettingsOpen(false);
    settingsButton.current?.focus();
    if (choice === "denied") {
      setAnalyticsAllowed(false);
      if (wasEnabled) window.location.reload();
    }
  };

  if (!ANALYTICS_CONFIGURED || !ready) return null;
  return (
    <div className="mx-auto max-w-2xl px-container-padding pb-28 text-sm">
      <button ref={settingsButton} type="button" onClick={() => setSettingsOpen(!settingsOpen)}
        aria-expanded={settingsOpen || (!consent && !ownerOptOut)} aria-controls="analytics-settings"
        className="text-muted-foreground underline underline-offset-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        Analytics settings
      </button>
      {(settingsOpen || (!consent && !ownerOptOut)) && (
        <section id="analytics-settings" aria-labelledby="analytics-settings-heading"
          className="fixed z-50 bottom-24 inset-x-4 sm:left-auto sm:right-6 sm:max-w-sm rounded-xl border border-border bg-background p-4 shadow-sm">
          <h2 id="analytics-settings-heading" className="font-medium">Optional analytics</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            Allow Google Analytics cookies to help me understand visits and clicks? Your choice won’t affect the site. You can change it here anytime.
          </p>
          {ownerOptOut && <p className="mt-2 text-muted-foreground">Analytics is excluded in this browser.</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => choose("denied")} className="rounded-md border px-4 py-2 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">Decline</button>
            <button type="button" onClick={() => choose("granted")} disabled={ownerOptOut} className="rounded-md border px-4 py-2 hover:bg-muted disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring">Allow analytics</button>
            {consent && <button type="button" onClick={() => { setSettingsOpen(false); settingsButton.current?.focus(); }} className="rounded-md px-3 py-2 text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring">Close</button>}
          </div>
        </section>
      )}
    </div>
  );
}
