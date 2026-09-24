"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BrainCircuit, Gamepad2, Home, Lightbulb, Mail, PanelBottom, Pin, Terminal as TerminalIcon, GraduationCap } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { navLinks } from "@/data/portfolio";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useTerminal } from "./TerminalProvider";
// import { TaskbarHint } from "./TaskbarHint";

export default function Taskbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isInitialized, isOpen, setIsOpen } = useTerminal();
  const activeSection = useActiveSection();
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isIntroVisible, setIsIntroVisible] = useState(false);
  const visible = isPinned || isHovered || isIntroVisible;
  const showHint = pathname === "/" && !visible && !isIntroVisible;

  useEffect(() => {
    if (isPinned || typeof window === "undefined") {
      return;
    }

    if (window.location.pathname !== "/" || window.scrollY > 120) {
      return;
    }

    const showTimer = window.setTimeout(() => setIsIntroVisible(true), 10);
    const hideTimer = window.setTimeout(() => setIsIntroVisible(false), 2600);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [isPinned]);

  if (!isInitialized) return null;

  const iconMap: Record<string, ReactNode> = {
    about: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-current">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    experience: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-current">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 3h-8v4h8V3z" />
      </svg>
    ),
    skills: (
      <Lightbulb size={18} className="text-current" />
    ),
    education: <GraduationCap size={18} className="text-current" />,
    games: <Gamepad2 size={18} className="text-current" />,
    bytewise: <BrainCircuit size={18} className="text-current" />,
    contact: <Mail size={18} className="text-current" />,
  };

  const renderButton = (label: string, icon: ReactNode, onClick: () => void, active = false) => (
    <button
      key={label}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={
        "h-9 w-9 shrink-0 flex items-center justify-center rounded-md ring-1 transition-all duration-200 md:h-10 md:w-10 " +
        (active
          ? "bg-accent-cyan/15 ring-accent-cyan/60 text-accent-cyan shadow-sm"
          : "bg-surface/90 ring-border text-muted hover:bg-surface hover:text-accent-cyan")
      }
    >
      {icon}
    </button>
  );

  return (
    <div
      className="fixed bottom-3 left-1/2 right-auto top-auto z-40 -translate-x-1/2 md:bottom-auto md:left-auto md:right-[10px] md:top-1/2 md:translate-x-0 md:-translate-y-1/2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full">
        {/* <TaskbarHint visible={showHint} /> */}

        <button
          type="button"
          aria-label="Show taskbar"
          title="Show taskbar"
          onClick={() => setIsPinned(true)}
          className={`absolute right-0 top-1/2 z-10 flex h-12 w-10 -translate-y-1/2 items-center justify-center rounded-l-md border border-r-0 border-accent-cyan/40 bg-surface/95 text-accent-cyan shadow-lg transition-all duration-300 ease-out md:h-16 md:w-3 ${
            visible
              ? "pointer-events-none translate-x-2 opacity-0"
              : "translate-x-0 opacity-100"
          }`}
        >
          <PanelBottom size={16} className="md:hidden" />
        </button>

        <div className="flex items-center h-full">
          <div
            className={`flex w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-row items-center gap-2 overflow-x-auto rounded-lg border border-border bg-surface/90 px-2 py-2 shadow-md transition-all duration-300 md:w-auto md:max-w-none md:flex-col md:gap-3 md:overflow-visible md:px-3 ${
              visible
                ? "opacity-100 translate-x-0 pointer-events-auto"
                : "opacity-0 -translate-x-2 pointer-events-none"
            }`}
          >
            <div className="flex flex-row items-center gap-2 md:flex-col md:gap-3">
              <button
                type="button"
                aria-label={isPinned ? "Unpin taskbar" : "Pin taskbar"}
                onClick={() => {
                  const nextPinned = !isPinned;
                  setIsPinned(nextPinned);
                  if (!nextPinned) {
                    setIsIntroVisible(false);
                    setIsHovered(false);
                  }
                }}
                className={
                  "h-8 w-8 shrink-0 rounded-md transition-all duration-200 flex items-center justify-center md:h-9 md:w-9 " +
                  (isPinned
                    ? "bg-red-500/10 text-red-300 hover:bg-red-500/15"
                    : "bg-surface/90 text-muted hover:text-accent-cyan")
                }
              >
                <Pin size={16} className={isPinned ? "-rotate-12" : "rotate-0"} />
              </button>

              {renderButton("Home", <Home size={18} className="text-current" />, () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }, activeSection === "home")}

              {!isOpen &&
                renderButton(
                  "Terminal",
                  <TerminalIcon size={18} className="text-current" />,
                  () => setIsOpen(true)
                )}

              {navLinks.map((link) =>
                renderButton(
                  link.label,
                  iconMap[link.label.toLowerCase()] ?? <span className="text-xs">{link.label[0]}</span>,
                  () => router.push(link.href),
                  activeSection === link.href.replace("#", "")
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
