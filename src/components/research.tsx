"use client";

import { useState } from "react";
import { RESEARCH, type ResearchEntry } from "@/data/research";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";

function HighlightedSummary({ entry }: { entry: ResearchEntry }) {
  const highlights = entry.highlights?.filter(Boolean) ?? [];
  if (!highlights.length) return <>{entry.summary}</>;
  const pattern = new RegExp(`(${highlights.map(text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return <>{entry.summary.split(pattern).map((part, index) => highlights.includes(part)
    ? <strong key={index} className="font-medium text-foreground">{part}</strong>
    : part)}</>;
}

function ResearchItem({ entry, index }: { entry: ResearchEntry; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const panelId = `research-details-${entry.id}`;
  const titleId = `research-title-${entry.id}`;

  return (
    <article id={index === 0 ? "research-first-entry" : undefined}
      className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 py-7 first:pt-0 sm:grid-cols-[2rem_minmax(0,1fr)] sm:gap-x-4">
      <span aria-hidden="true" className="pt-1 font-mono text-xs tabular-nums text-muted-foreground/60">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
          <h2 id={titleId} className="min-w-0 flex-1 text-base font-semibold tracking-tight">
            <button type="button" aria-expanded={expanded} aria-controls={panelId}
              onClick={() => setExpanded(value => !value)}
              data-track-event="research_toggle" data-track-section="research" data-track-element="details"
              data-track-item={entry.id} data-track-action={expanded ? "collapse" : "expand"}
              className="group -my-2 flex w-full items-center gap-2 rounded-sm py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="min-w-0 break-words">{entry.title}</span>
              <ChevronDown aria-hidden="true" className={`size-3.5 shrink-0 text-muted-foreground/60 transition-[transform,color] duration-200 group-hover:text-foreground motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} />
            </button>
          </h2>
          <div className="flex shrink-0 items-center gap-3">
            {entry.driveUrl && (
              <a href={entry.driveUrl} target="_blank" rel="noopener noreferrer"
                aria-label={`Read ${entry.title} paper (new tab)`}
                data-track-event="research_click" data-track-section="research" data-track-element="drive"
                data-track-item={entry.id} data-track-action="open"
                className="inline-flex shrink-0 items-center gap-0.5 rounded-sm py-2 -my-2 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Paper <ArrowUpRight aria-hidden="true" className="size-3" />
              </a>
            )}
            {entry.codeUrl && (
              <a href={entry.codeUrl} target="_blank" rel="noopener noreferrer"
                aria-label={`View ${entry.title} code on GitHub (new tab)`}
                data-track-event="research_click" data-track-section="research" data-track-element="code"
                data-track-item={entry.id} data-track-action="open"
                className="inline-flex items-center gap-0.5 rounded-sm py-2 -my-2 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Code <ArrowUpRight aria-hidden="true" className="size-3" />
              </a>
            )}
          </div>
        </div>
        {entry.subtitle && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{entry.subtitle}</p>}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div id={panelId} role="region" aria-labelledby={titleId}
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }} className="overflow-hidden">
              <p className="pt-4 text-sm leading-7 text-muted-foreground break-words">
                <HighlightedSummary entry={entry} />
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}

export function Research() {
  return (
    <section id="research" aria-labelledby="research-heading" className="mb-section-lg scroll-mt-8">
      <h1 id="research-heading" className="text-2xl font-semibold tracking-tight mb-10">Research</h1>
      {RESEARCH.length === 0 && <p className="text-sm leading-relaxed text-muted-foreground">Research updates coming soon.</p>}
      <div className="divide-y divide-border/30">
        {RESEARCH.map((entry, index) => <ResearchItem key={entry.id} entry={entry} index={index} />)}
      </div>
    </section>
  );
}
