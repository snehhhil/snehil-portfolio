"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Gamepad2, Home, Lightbulb, Mail, Pin, Terminal as TerminalIcon, GraduationCap } from "lucide-react";
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
    contact: <Mail size={18} className="text-current" />,
  };

  const renderButton = (label: string, icon: ReactNode, onClick: () => void, active = false) => (
    <button
      key={label}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={
        "h-10 w-10 flex items-center justify-center rounded-md ring-1 transition-all duration-200 " +
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
      className="fixed right-[10px] top-1/2 z-40 -translate-y-1/2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full">
        {/* <TaskbarHint visible={showHint} /> */}

        <div
          className={`absolute right-0 top-0 bottom-0 w-1 rounded-l-full bg-accent-cyan/30 shadow-lg transition-all duration-300 ease-out ${
            visible ? "-translate-x-[10px] opacity-0" : "translate-x-0 opacity-100"
          }`}
        />

        <div className="flex items-center h-full">
          <div
            className={`flex flex-col items-center gap-3 rounded-lg border border-border bg-surface/90 py-2 px-3 shadow-md transition-all duration-300 ${
              visible
                ? "opacity-100 translate-x-0 pointer-events-auto"
                : "opacity-0 -translate-x-2 pointer-events-none"
            }`}
          >
            <div className="flex flex-col items-center gap-3">
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
                  "h-9 w-9 rounded-md transition-all duration-200 flex items-center justify-center " +
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
