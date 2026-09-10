"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { OrbitingCircles } from "@/components/magicui/orbiting-circles";
import { Mail, Linkedin, Github } from "lucide-react";
import { DATA } from "@/data/resume";
import Link from "next/link";

interface ContactOrbitingProps {
  delay?: number;
}

export const ContactOrbiting = ({ delay = 0 }: ContactOrbitingProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const orbitingVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        delay: delay + 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.section
      ref={ref}
      id="contact"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <div className="grid items-center justify-center gap-4 px-4 text-center md:px-6 w-full">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Get in Touch.
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Want to chat? Feel free to reach out via{" "}
            <Link
              href={DATA.contact.social.email.url}
              data-track-event="contact_click" data-track-section="contact" data-track-element="email" data-track-action="open" data-track-item="text"
              className="text-blue-500 hover:underline"
            >
              email
            </Link>{" "}
            or{" "}
            <Link
              href={DATA.contact.social.LinkedIn.url}
              data-track-event="contact_click" data-track-section="contact" data-track-element="linkedin" data-track-action="open" data-track-item="text"
              className="text-blue-500 hover:underline"
            >
              LinkedIn
            </Link>{" "}
            and I&apos;ll respond whenever I can.
          </p>
        </div>

        {/* Orbiting Circles */}
        <motion.div
          variants={orbitingVariants}
          className="relative overflow-hidden h-[500px] w-full flex items-center justify-center"
        >
          {/* Inner orbit - Email icons */}
          <OrbitingCircles radius={80} duration={15}>
            <Mail className="size-8 text-blue-600" />
            <Mail className="size-8 text-blue-600" />
            <Mail className="size-8 text-blue-600" />
          </OrbitingCircles>
          
          {/* Outer orbit - Social icons */}
          <OrbitingCircles radius={140} reverse duration={20}>
            <Linkedin className="size-8 text-blue-700" />
            <Github className="size-8 text-gray-700 dark:text-gray-300" />
          </OrbitingCircles>

          {/* Center content - clickable links */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-4">
              <Link
                href={DATA.contact.social.email.url}
              data-track-event="contact_click" data-track-section="contact" data-track-element="email" data-track-action="open" data-track-item="icon"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-background border shadow-lg hover:scale-110 transition-transform duration-200"
                title="Send Email"
              >
                <Mail className="size-6 text-foreground" />
              </Link>
              <Link
                href={DATA.contact.social.LinkedIn.url}
              data-track-event="contact_click" data-track-section="contact" data-track-element="linkedin" data-track-action="open" data-track-item="icon"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-background border shadow-lg hover:scale-110 transition-transform duration-200"
                title="Connect on LinkedIn"
              >
                <Linkedin className="size-6 text-foreground" />
              </Link>
              <Link
                href={DATA.contact.social.GitHub.url}
              data-track-event="homepage_click" data-track-section="contact" data-track-element="github" data-track-action="open" data-track-item="icon"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-background border shadow-lg hover:scale-110 transition-transform duration-200"
                title="View GitHub"
              >
                <Github className="size-6 text-foreground" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}; 