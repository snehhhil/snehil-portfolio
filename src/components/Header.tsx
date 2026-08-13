"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navLinks, profile } from "@/data/portfolio";
import { useActiveSection } from "@/hooks/useActiveSection";
import { ResumeButton } from "./ResumeButton";
import { useTerminal } from "./TerminalProvider";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isInitialized } = useTerminal();

  const activeSection = useActiveSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  return isInitialized ? (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl" //border-b border-border 
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="font-mono text-base font-semibold text-accent-green transition-colors hover:text-accent-cyan"
        >
          <span className="text-muted">&gt;</span> {profile.name.toLowerCase()}
          <span className="cursor-blink text-accent-cyan">_</span>
        </a>

        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => {
            const active = activeSection === link.href.replace("#", "");
            return (
              <a
                key={link.href}
                href={link.href}
                className={`text-base transition-colors ${
                  active
                    ? "text-accent-cyan"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <ResumeButton compact />
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          className="text-muted transition-colors hover:text-foreground md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-border bg-background/95 px-6 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const active = activeSection === link.href.replace("#", "");
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors ${
                    active
                      ? "text-accent-cyan"
                      : "text-muted hover:text-foreground"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              );
            })}
            <ResumeButton />
          </div>
        </nav>
      )}
    </header>
  ) : null;
}
