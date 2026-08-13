"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { profile } from "@/data/portfolio";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "./SocialIcons";
import { Terminal } from "./Terminal";
// import { TaskbarHint } from "./TaskbarHint";
import { ResumeButton } from "./ResumeButton";
import { useTerminal } from "./TerminalProvider";

const BOOT_MESSAGES = [
  "$ compiling portfolio.config.ts and preparing the application runtime environment",
  "> loading environment variables and validating the local development configuration",
  "> resolving the component graph across the portfolio application workspace",
  "$ npm ci --prefer-offline && checking runtime dependencies and package versions",
  "> reading user preferences and restoring the configured interface experience",
  "> opening the source workspace and preparing the project file system",
  "> indexing component registry entries for fast interactive rendering",
  "$ npm run test -- --runInBand :: executing portfolio unit test suite",
  "  PASS  components/Terminal.test.tsx ................. 12 tests passed",
  "  PASS  components/Games.test.tsx ................... 18 tests passed",
  "> loading navigation routes and mapping section destinations successfully",
  "$ npm run lint :: scanning source files for code quality issues",
  "  PASS  eslint --max-warnings=0 :: no blocking issues found",
  "$ npx tsc --noEmit :: validating type definitions and component contracts",
  "  PASS  TypeScript compiler :: 0 type errors detected",
  "> linking shared utilities, icons, data objects, and layout primitives",
  "> preparing the animation pipeline for the responsive interface sequence",
  "> initializing keyboard and touch listeners for interactive controls",
  "$ npm run build :: creating optimized production bundle",
  "  PASS  static generation, asset optimization, and route compilation",
  "> checking the accessibility tree and confirming interactive labels are ready",
  "> registering game modules, score systems, and local interaction state",
  "> synchronizing the taskbar, header, social links, and final interface state",
  "[ ok ] initializing portfolio.exe and loading the completed application shell",
  "[ ok ] starting up portfolio.exe",
] as const;

export function Hero() {
  const greeting = "Hi, I'm";
  const fullGreeting = `${greeting} ${profile.name}`;
  const { setIsInitialized } = useTerminal();
  const [bootPhase, setBootPhase] = useState<"prompt" | "initializing" | "ready">("prompt");
  const [bootStep, setBootStep] = useState(0);
  const [typedCharacters, setTypedCharacters] = useState(0);

  useEffect(() => {
    if (bootPhase === "ready") return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const preventScroll = (event: KeyboardEvent) => {
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", preventScroll);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", preventScroll);
    };
  }, [bootPhase]);

  useEffect(() => {
    if (bootPhase !== "prompt") return;

    const startTerminal = () => setBootPhase("initializing");
    window.addEventListener("keydown", startTerminal, { once: true });
    window.addEventListener("pointerdown", startTerminal, { once: true });

    return () => {
      window.removeEventListener("keydown", startTerminal);
      window.removeEventListener("pointerdown", startTerminal);
    };
  }, [bootPhase]);

  useEffect(() => {
    if (bootPhase !== "initializing") return;

    let readyTimer: number | undefined;
    const timer = window.setInterval(() => {
      setBootStep((current) => {
        if (current >= BOOT_MESSAGES.length) {
          window.clearInterval(timer);
          readyTimer = window.setTimeout(() => {
            setBootPhase("ready");
            setIsInitialized(true);
          }, 1000);
          return current;
        }
        return current + 1;
      });
    }, 100);
    return () => {
      window.clearInterval(timer);
      if (readyTimer) window.clearTimeout(readyTimer);
    };
  }, [bootPhase, setIsInitialized]);

  useEffect(() => {
    if (bootPhase !== "ready" || typedCharacters >= fullGreeting.length) return;

    const timer = window.setTimeout(() => {
      setTypedCharacters((current) => current + 1);
    }, 90);

    return () => window.clearTimeout(timer);
  }, [bootPhase, fullGreeting, typedCharacters]);

  const typedGreeting = fullGreeting.slice(0, Math.min(typedCharacters, greeting.length));
  const typedName = typedCharacters > greeting.length
    ? fullGreeting.slice(greeting.length + 1, typedCharacters)
    : "";

  if (bootPhase !== "ready") {
    return (
      <section
        className="relative flex h-screen w-full cursor-pointer items-center justify-start overflow-hidden bg-black px-6 py-16 text-zinc-300"
        aria-live="polite"
        onClick={() => bootPhase === "prompt" && setBootPhase("initializing")}
      >
        <div className="w-full max-w-4xl max-h-full overflow-hidden px-5 text-left font-mono text-xs leading-7 sm:px-8 sm:text-sm">
          {bootPhase === "prompt" ? (
            <p className="text-green-400">
              <span className="text-cyan-400">$</span> initialise terminal
              <span className="ml-2 text-zinc-500">(press any key or touch the screen)</span>
              <span className="cursor-blink ml-1 text-cyan-400">▋</span>
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-green-400"><span className="text-cyan-400">$</span> initialise terminal</p>
              {BOOT_MESSAGES.slice(0, bootStep).map((message, index) => (
                <p
                  key={message}
                  className={`animate-[fade-in_200ms_ease-out_both] ${
                    index === BOOT_MESSAGES.length - 1
                      ? "text-cyan-400"
                      : message.startsWith("  PASS")
                        ? "text-green-400"
                        : message.startsWith("$")
                          ? "text-amber-300"
                          : message.startsWith("[ ok ]")
                            ? "text-cyan-400"
                            : "text-zinc-400"
                  }`}
                >
                  {message}
                  {index === BOOT_MESSAGES.length - 1 && <span className="cursor-blink ml-1">▋</span>}
                </p>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-screen items-center px-6 pt-24 pb-16">
      <div className="mx-auto w-full max-w-5xl">
        <p className="animate-[fade-in_400ms_ease-out_both] mb-4 font-mono text-sm text-accent-green">
          {"// portfolio.exe initialized "}
        </p>

        <div className="animate-[fade-in_700ms_ease-out_both]">
        <h1 aria-label={fullGreeting} className="animate-[fade-in_500ms_250ms_ease-out_both] mb-4 opacity-0 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          {typedGreeting}
          {typedCharacters > greeting.length && " "}
          <span className="bg-gradient-to-r from-accent-cyan via-accent-green to-accent-purple bg-clip-text text-transparent">
            {typedName}
          </span>
          <span aria-hidden="true" className="cursor-blink ml-1 text-accent-cyan">▋</span>
        </h1>

        <p className="animate-[fade-in_500ms_500ms_ease-out_both] mb-2 max-w-2xl opacity-0 text-xl text-muted sm:text-2xl">
          {profile.title}
        </p>
        <p className="animate-[fade-in_500ms_700ms_ease-out_both] mb-8 max-w-xl opacity-0 font-mono text-sm text-muted/80">
          {profile.tagline}
        </p>

        <div data-terminal-anchor className="animate-[fade-in_500ms_900ms_ease-out_both] mb-8 flex opacity-0 justify-start">
          <Terminal />
          
        </div>

        {/* <TaskbarHint visible={true} /> */}

        <div className="animate-[fade-in_500ms_1100ms_ease-out_both] flex flex-wrap items-center gap-4 opacity-0">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-mono text-sm text-muted ring-1 ring-border transition-all hover:text-foreground hover:ring-accent-cyan/60"
            data-get-in-touch
          >
            <Mail size={16} />
            {"Mail"}
          </a>
          {/* <ResumeButton /> */}
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-mono text-sm text-muted ring-1 ring-border transition-all hover:text-foreground hover:ring-accent-cyan/60"
          >
            <GithubIcon size={16} />
            GitHub
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-mono text-sm text-muted ring-1 ring-border transition-all hover:text-foreground hover:ring-accent-cyan/60"
          >
            <LinkedinIcon size={16} />
            LinkedIn
          </a>
          <a
            href={profile.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-mono text-sm text-muted ring-1 ring-border transition-all hover:text-foreground hover:ring-accent-cyan/60"
          >
            <InstagramIcon size={16} />
            Instagram
          </a>
        </div>

        </div>
      </div>
    </section>
  );
}
