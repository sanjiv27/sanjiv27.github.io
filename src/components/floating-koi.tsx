"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { KOI_VERSION } from "@/generated/koi-version";

const SIZE = 208;
const BODY_X = SIZE * 0.5;
const BODY_Y = SIZE * 0.5;
const FOLLOW_DISTANCE = 88;
const ART_SIZE = 320;
const FRAME_COUNT = 24;
const SHEET_COLUMNS = 6;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function FloatingKoi() {
  const fish = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const note = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const position = useRef({ x: 0, y: 0 });
  const noteIsOpen = useRef(false);
  const [showNote, setShowNote] = useState(false);
  const [notePosition, setNotePosition] = useState({ left: 0, top: 0 });
  const reduceMotion = useReducedMotion();

  const openNote = useCallback((x: number, y: number) => {
    const left = x + 244 < window.innerWidth - 12 ? x + 20 : Math.max(12, x - 244);
    const top = y + 180 < window.innerHeight - 12 ? y + 16 : Math.max(12, y - 172);
    setNotePosition({ left, top });
    noteIsOpen.current = true;
    setShowNote(true);
  }, []);

  const hideNote = useCallback(() => {
    noteIsOpen.current = false;
    setShowNote(false);
  }, []);

  useEffect(() => {
    if (showNote) closeButton.current?.focus();
  }, [showNote]);

  useEffect(() => {
    const element = fish.current;
    const context = canvas.current?.getContext("2d");
    if (!element || !context) return;
    context.imageSmoothingEnabled = false;

    const artwork = new Image();
    let artworkReady = false;
    let stillOnly = Boolean(reduceMotion);
    let drawnFrame = -1;
    let swimPhase = 0;
    const draw = (frame: number) => {
      if (!artworkReady || frame === drawnFrame) return;
      context.clearRect(0, 0, ART_SIZE, ART_SIZE);
      if (stillOnly) {
        context.drawImage(artwork, 0, 0, ART_SIZE, ART_SIZE);
      } else {
        context.drawImage(
          artwork,
          (frame % SHEET_COLUMNS) * ART_SIZE,
          Math.floor(frame / SHEET_COLUMNS) * ART_SIZE,
          ART_SIZE,
          ART_SIZE,
          0,
          0,
          ART_SIZE,
          ART_SIZE
        );
      }
      drawnFrame = frame;
      element.style.opacity = "1";
    };
    artwork.onload = () => {
      artworkReady = true;
      draw(0);
    };
    artwork.onerror = () => {
      if (!stillOnly) {
        stillOnly = true;
        artwork.src = `/koi/koi-still.png?v=${KOI_VERSION}`;
      }
    };
    artwork.src = stillOnly
      ? `/koi/koi-still.png?v=${KOI_VERSION}`
      : `/koi/koi-swim-sheet.png?v=${KOI_VERSION}`;

    let bodyX = window.innerWidth * 0.76;
    let bodyY = window.innerHeight * 0.35;
    let velocityX = 0;
    let velocityY = 0;
    let rotation = 0;
    let cursorX = bodyX;
    let cursorY = bodyY;
    let hasCursor = false;
    let previousTime = performance.now();
    let frameId = 0;

    const place = () => {
      element.style.transform = `translate3d(${bodyX - BODY_X}px, ${bodyY - BODY_Y}px, 0) rotate(${rotation}rad)`;
      position.current = { x: bodyX, y: bodyY };
    };

    const keepInView = () => {
      bodyX = clamp(bodyX, 70, Math.max(70, window.innerWidth - 70));
      bodyY = clamp(bodyY, 70, Math.max(70, window.innerHeight - 70));
      place();
    };

    const follow = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      cursorX = event.clientX;
      cursorY = event.clientY;
      hasCursor = true;
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || target.closest("[data-koi-trigger]")) return;
      if (noteIsOpen.current) {
        if (!note.current?.contains(target)) hideNote();
        return;
      }
      // The artwork never catches pointer events. Links and buttons beneath it
      // keep working, and only a painted fish pixel can open the note.
      if (target.closest("a, button, input, select, textarea, label, summary, [role='button'], [role='link'], [data-track-event]")) return;
      if (!artworkReady) return;
      const dx = event.clientX - bodyX;
      const dy = event.clientY - bodyY;
      const cosine = Math.cos(rotation);
      const sine = Math.sin(rotation);
      const localX = BODY_X + cosine * dx + sine * dy;
      const localY = BODY_Y - sine * dx + cosine * dy;
      const pixelX = Math.floor((localX / SIZE) * ART_SIZE);
      const pixelY = Math.floor((localY / SIZE) * ART_SIZE);
      if (pixelX < 0 || pixelX >= ART_SIZE || pixelY < 0 || pixelY >= ART_SIZE) return;
      if (context.getImageData(pixelX, pixelY, 1, 1).data[3] > 48) {
        openNote(event.clientX, event.clientY);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && noteIsOpen.current) hideNote();
    };

    const animate = (now: number) => {
      const seconds = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;

      if (noteIsOpen.current) {
        velocityX = 0;
        velocityY = 0;
      } else if (hasCursor) {
        const dx = cursorX - bodyX;
        const dy = cursorY - bodyY;
        const distance = Math.hypot(dx, dy);
        if (distance > 1) {
          const directionX = dx / distance;
          const directionY = dy / distance;
          const swimSpeed = clamp((distance - FOLLOW_DISTANCE) * 3, 0, 520);
          const desiredX = directionX * swimSpeed;
          const desiredY = directionY * swimSpeed;
          const response = 1 - Math.exp(-9 * seconds);
          velocityX += (desiredX - velocityX) * response;
          velocityY += (desiredY - velocityY) * response;

          const desiredRotation = Math.atan2(dy, dx);
          const turn = Math.atan2(
            Math.sin(desiredRotation - rotation),
            Math.cos(desiredRotation - rotation)
          );
          rotation += clamp(turn, -6.5 * seconds, 6.5 * seconds);
        }
      }

      bodyX += velocityX * seconds;
      bodyY += velocityY * seconds;
      keepInView();

      const speed = Math.hypot(velocityX, velocityY);
      const beatsPerSecond = 0.8 + 1.4 * Math.min(speed / 520, 1);
      swimPhase = (swimPhase + seconds * beatsPerSecond) % 1;
      draw(Math.floor(swimPhase * FRAME_COUNT));

      frameId = requestAnimationFrame(animate);
    };

    keepInView();
    window.addEventListener("resize", keepInView);
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);
    if (!reduceMotion) {
      window.addEventListener("pointermove", follow, { passive: true });
      frameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", keepInView);
      window.removeEventListener("pointermove", follow);
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
      artwork.onload = null;
      artwork.onerror = null;
    };
  }, [reduceMotion, openNote, hideNote]);

  return (
    <>
      <div
        ref={fish}
        className="pointer-events-none fixed left-0 top-0 z-20 w-52 opacity-0"
        style={{ transformOrigin: `${BODY_X}px ${BODY_Y}px` }}
      >
        <button
          type="button"
          data-koi-trigger
          aria-label="About the koi"
          aria-expanded={showNote}
          aria-controls="koi-note"
          onClick={() => openNote(position.current.x, position.current.y)}
          className="block h-full w-full rounded-full border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <canvas
            ref={canvas}
            width={ART_SIZE}
            height={ART_SIZE}
            aria-hidden="true"
            className="h-auto w-full"
            style={{ imageRendering: "pixelated" }}
          />
        </button>
      </div>
      {showNote && (
        <div
          ref={note}
          id="koi-note"
          role="dialog"
          aria-label="About the koi"
          className="fixed z-30 max-h-[calc(100vh-24px)] w-56 overflow-y-auto rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg"
          style={notePosition}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold">About the koi</p>
            <button
              ref={closeButton}
              type="button"
              aria-label="Close koi note"
              onClick={hideNote}
              className="-mr-1 -mt-1 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              ×
            </button>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Koi are tied to good luck and perseverance. I also thought it&apos;d be fun to have one swimming around here.
          </p>
          <p className="mt-2 border-t border-border pt-2 text-xs leading-relaxed text-muted-foreground">
            Art from{" "}
            <a
              href="https://github.com/yalongwastaken/git-koi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Git Koi
            </a>{" "}
            by Anthony Yalong. It turns GitHub activity into a pixel koi.
          </p>
        </div>
      )}
    </>
  );
}
