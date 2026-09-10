"use client";

import { Dock, DockIcon } from "@/components/magicui/dock";
import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Trees, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { FloatingForest } from "./floating-forest";

export default function Navbar() {
  const [isForestActive, setIsForestActive] = useState(false);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto mb-4 flex origin-bottom h-full max-h-14">
      <div className="fixed bottom-0 inset-x-0 h-16 w-full bg-background to-transparent backdrop-blur-lg [-webkit-mask-image:linear-gradient(to_top,black,transparent)] dark:bg-background"></div>
      <Dock className="z-50 pointer-events-auto relative mx-auto flex min-h-full h-full items-center px-1 bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] transform-gpu dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] ">
        {DATA.navbar.map((item) => (
          <DockIcon key={item.href}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  data-track-event="homepage_click" data-track-section="dock" data-track-element={item.label.toLowerCase()} data-track-action="navigate"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-12"
                  )}
                >
                  <item.icon className="size-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        ))}
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={DATA.resumeUrl}
                target="_blank" rel="noopener noreferrer"
                aria-label="View résumé (opens in a new tab)"
                data-track-event="homepage_click" data-track-section="dock" data-track-element="resume" data-track-action="open"
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-10 sm:size-12")}
              >
                <FileText aria-hidden="true" className="size-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent><p>Résumé</p></TooltipContent>
          </Tooltip>
        </DockIcon>
        <Separator orientation="vertical" className="h-full" />
        {Object.entries(DATA.contact.social)
          .filter(([_, social]) => social.navbar)
          .map(([name, social]) => (
            <DockIcon key={name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={social.url}
                    aria-label={name}
                    data-track-event={name === "LinkedIn" || name === "email" ? "contact_click" : "homepage_click"}
                    data-track-section="dock" data-track-element={name.toLowerCase()} data-track-action="open"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-12"
                    )}
                  >
                    <social.icon className="size-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}
        <Separator orientation="vertical" className="h-full py-2" />
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsForestActive(!isForestActive)}
                aria-label={isForestActive ? "Hide forest" : "Show forest"} aria-pressed={isForestActive}
                data-track-event="homepage_click" data-track-section="dock" data-track-element="forest" data-track-action={isForestActive ? "hide" : "show"}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "size-12",
                  isForestActive && "bg-green-100 dark:bg-green-900"
                )}
              >
                <Trees className="size-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isForestActive ? "Hide Forest" : "Show Forest"}</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <ModeToggle />
            </TooltipTrigger>
            <TooltipContent>
              <p>Theme</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
      </Dock>
      
      {/* Floating Forest Creatures */}
      <FloatingForest isActive={isForestActive} />
    </div>
  );
}
