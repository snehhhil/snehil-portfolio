"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "@/data/portfolio";
import { useTerminal } from "./TerminalProvider";

type LineType = "input" | "output" | "error" | "hint";

interface TerminalLine {
  type: LineType;
  text: string;
}

const INITIAL_LINES: TerminalLine[] = [
  {type : "input", text: "snhl initiate terminal"},
  { type: "output", text: "Snehil's terminal initialized" },
  // { type: "input", text: "whoami" },
  { type: "output", text: `${profile.name} — SDE @ Servosys` },
  // { type: "input", text: "cat interests.txt" },
  // {
  //   type: "output",
  //   text: "FinTech platforms · React & Java · ML & CV experiments",
  // },
  { type: "hint", text: "Type help for available commands" },
];

const COMMAND_ALIASES: Record<string, string[]> = {
  help: ["help", "?", "commands"],
  whoami: ["whoami", "who", "name"],
  instagram: ["instagram", "ig", "insta"],
  linkedin: ["linkedin", "li"],
  github: ["github", "gh", "git"],
  contact: [
    "contact",
    "email",
    "mail",
    "reach",
    "reach out",
    "get in touch",
    "how to reach",
    "how to contact",
    "connect",
    "talk",
    "message",
  ],
  skills: ["skills", "stack", "tech", "technologies", "tools"],
  experience: ["experience", "work", "job", "jobs", "career", "resume"],
  education: ["education", "school", "college", "degree", "study"],
  about: ["about", "bio", "summary", "intro"],
  location: ["location", "where", "city", "based"],
  interests: ["interests", "hobbies", "cat interests.txt", "interests.txt"],
  ask: ["ask"],
  status: ["status"],
  clear: ["clear", "cls"],
  ls: ["ls", "dir", "list"],
};

const PAGE_ANCHORS: Record<string, string> = {
  experience: "experience",
  experiences: "experience",
  contact: "contact",
  skills: "skills",
  skill: "skills",
  education: "education",
  about: "about",
  location: "contact",
};

const GAME_COMMANDS: Record<string, string> = {
  snake: "snake",
  tetris: "tetris",
  "2048": "2048",
  minesweeper: "minesweeper",
  sudoku: "sudoku",
  maze: "maze",
};

const GAME_LABELS: Record<string, string> = {
  snake: "Snake",
  tetris: "Tetris",
  "2048": "2048",
  minesweeper: "Minesweeper",
  sudoku: "Sudoku",
  maze: "Maze",
};

function getPageAnchor(raw: string): string | undefined {
  const anchor = raw.trim().toLowerCase().replace(/^#/, "");
  return PAGE_ANCHORS[anchor];
}

function resolveCommand(raw: string): string | null {
  const input = raw.trim().toLowerCase();
  if (!input) return null;

  for (const [command, aliases] of Object.entries(COMMAND_ALIASES)) {
    if (aliases.some((alias) => input === alias || input.includes(alias))) {
      return command;
    }
  }

  return input.split(/\s+/)[0];
}

function runCommand(command: string | null): TerminalLine[] {
  switch (command) {
    case "help":
      return [
        {
          type: "output",
          text: "Available commands:",
        },
        {
          type: "output",
          text: "  whoami          — who is Snehil?",
        },
        {
          type: "output",
          text: "  contact         — email & how to reach out",
        },
        {
          type: "output",
          text: "  instagram       — Instagram profile",
        },
        {
          type: "output",
          text: "  linkedin        — LinkedIn profile",
        },
        {
          type: "output",
          text: "  github          — GitHub profile",
        },
        {
          type: "output",
          text: "  skills          — tech stack",
        },
        {
          type: "output",
          text: "  experience      — work history",
        },
        {
          type: "output",
          text: "  education       — academic background",
        },
        {
          type: "output",
          text: "  about           — short bio",
        },
        {
          type: "output",
          text: "  location        — where I'm based",
        },
        {
          type: "output",
          text: "  interests       — what I'm into",
        },
        {
          type: "output",
          text: "  status          — current availability",
        },
        {
          type: "output",
          text: "  clear           — clear terminal",
        },
        {
          type: "output",
          text: "  ask           — ask anything",
        },
        {
          type: "output",
          text: "  games         — list available games",
        },
        {
          type: "output",
          text: "  play <game>   — launch a game",
        },
      ];

    case "whoami":
      return [
        {
          type: "output",
          text: `${profile.name} — ${profile.title} @ Servosys Solutions`,
        },
      ];

    case "instagram":
      return [
        { type: "output", text: "Instagram: @snehillsinghh" },
        { type: "output", text: profile.instagram },
      ];

    case "linkedin":
      return [
        { type: "output", text: "LinkedIn: @snehillsinghh" },
        { type: "output", text: profile.linkedin },
      ];

    case "github":
      return [
        { type: "output", text: "GitHub: @snehhhil" },
        { type: "output", text: profile.github },
      ];

    case "contact":
      return [
        { type: "output", text: "Want to reach out? Here's how:" },
        { type: "output", text: `  Email:     ${profile.email}` },
        { type: "output", text: "  LinkedIn:  linkedin.com/in/snehillsinghh" },
        { type: "output", text: "  Instagram: instagram.com/snehillsinghh" },
        { type: "output", text: "  GitHub:    github.com/snehhhil" },
        {
          type: "hint",
          text: "Best way: shoot me an email or connect on LinkedIn.",
        },
      ];

    case "skills":
      return [
        {
          type: "output",
          text: "Languages:  Python, C++, JavaScript, Java, SQL, Bash",
        },
        {
          type: "output",
          text: "Frameworks: React, Node.js, Spring Boot, FastAPI, TensorFlow",
        },
        {
          type: "output",
          text: "Tools:      Git, PostgreSQL, Jenkins, REST APIs, Postman",
        },
      ];

    case "experience":
      return [
        {
          type: "output",
          text: "Servosys Solutions — SDE-1 (Jul 2026 – Present)",
        },
        {
          type: "output",
          text: "HighRadius Corporation — Fin-Tech Advisor Intern (2025)",
        },
        { type: "hint", text: "Scroll to #experience for the full timeline." },
      ];

    case "education":
      return [
        {
          type: "output",
          text: "KIIT — B.Tech Computer Science (2021–2025)",
        },
        {
          type: "output",
          text: "Mayo International School — HSC PCM (2020–2021)",
        },
      ];

    case "about":
      return [{ type: "output", text: profile.summary }];

    case "location":
      return [{ type: "output", text: profile.location }];

    case "interests":
      return [
        {
          type: "output",
          text: "cars, chords and code",
        }
      ];

    case "status":
      return [
        {
          type: "output",
          text: "● online on social networks",
        },
      ];

    case "ls":
      return [
        { type: "output", text: "about.txt  contact.txt  interests.txt  resume.pdf" },
      ];

    case "clear":
      return [];

    default:
      return [
        {
          type: "error",
          text: `command not found: ${command ?? ""}. Type 'help' for available commands.`,
        },
      ];
  }
}

export function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>(INITIAL_LINES);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { isOpen, setIsOpen } = useTerminal();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    const content = contentRef.current;
    if (content) {
      content.scrollTo({ top: content.scrollHeight, behavior: "smooth" });
    }
  }, []);

  const firstRenderRef = useRef(true);
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    scrollToBottom();
  }, [lines, scrollToBottom]);

  useEffect(() => {
    if (!isOpen) return;

    const handleSpace = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.key !== " ") return;
      const active = document.activeElement;
      const isInput =
        active instanceof HTMLElement &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable);

      if (!isInput) {
        event.preventDefault();
        event.stopPropagation();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleSpace, { passive: false });
    return () => window.removeEventListener("keydown", handleSpace);
  }, [isOpen]);

  const handleSubmit = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const match = trimmed.match(/^snhl\b\s*(.*)/i);
    if (!match) {
      setLines((prev) => [
        ...prev,
        { type: "input", text: trimmed },
        { type: "error", text: "Commands must start with 'snhl'" },
      ]);
      return;
    }

    const cmdText = match[1] ? match[1].trim() : "";

    if (cmdText === "games" || cmdText === "list games") {
      setLines((prev) => [
        ...prev,
        { type: "input", text: trimmed },
        { type: "output", text: "Available games:" },
        { type: "output", text: "  • Snake" },
        { type: "output", text: "  • Tetris" },
        { type: "output", text: "  • 2048" },
        { type: "output", text: "  • Minesweeper" },
        { type: "output", text: "  • Sudoku" },
        { type: "output", text: "  • Maze" },
        { type: "hint", text: "Usage: snhl play snake" },
      ]);
      return;
    }

    const playMatch = cmdText.match(/^play\b\s*(.+)$/i);
    if (playMatch) {
      const gameName = playMatch[1]?.trim().replace(/^['"]|['"]$/g, "").toLowerCase();
      const normalizedGame = GAME_COMMANDS[gameName as keyof typeof GAME_COMMANDS];

      if (!normalizedGame) {
        setLines((prev) => [
          ...prev,
          { type: "input", text: trimmed },
          { type: "error", text: "Unknown game. Try: snhl games" },
        ]);
        return;
      }

      setLines((prev) => [
        ...prev,
        { type: "input", text: trimmed },
        { type: "output", text: `Launching ${GAME_LABELS[normalizedGame]}...` },
      ]);

      window.dispatchEvent(new CustomEvent("snhl-open-game", { detail: { gameId: normalizedGame } }));
      const element = document.getElementById("games");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    const pageAnchor = getPageAnchor(cmdText);
    if (pageAnchor) {
      setLines((prev) => [
        ...prev,
        { type: "input", text: trimmed },
        { type: "output", text: `Navigating to #${pageAnchor}...` },
      ]);

      const element = document.getElementById(pageAnchor);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        window.location.hash = `#${pageAnchor}`;
      } else {
        window.location.hash = `#${pageAnchor}`;
      }

      return;
    }

    const askMatch = cmdText.match(/^ask\b\s*(.*)/i);
    if (askMatch) {
      const searchQuery = askMatch[1]?.trim() || "";
      if (!searchQuery) {
        setLines((prev) => [
          ...prev,
          { type: "input", text: trimmed },
          { type: "error", text: "Usage: snhl ask \"question\"" },
        ]);
        return;
      }

      setLines((prev) => [
        ...prev,
        { type: "input", text: trimmed },
        { type: "output", text: "Searching..." },
      ]);

      try {
        const response = await fetch("/api/openrouter-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery }),
        });

        const data = await response.json();
        if (!response.ok) {
          setLines((prev) => [
            ...prev,
            { type: "error", text: data.error || "OpenRouter search failed." },
          ]);
          return;
        }

        setLines((prev) => [
          ...prev,
          { type: "output", text: data.result || "No results returned." },
        ]);
      } catch (error) {
        setLines((prev) => [
          ...prev,
          {
            type: "error",
            text: `OpenRouter search failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ]);
      }

      return;
    }

    const command = resolveCommand(cmdText || trimmed);
    if (command === "clear") {
      setLines(INITIAL_LINES);
      return;
    }

    const output = runCommand(command);
    setLines((prev) => [...prev, { type: "input", text: trimmed }, ...output]);

  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit(input);
      setInput("");
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      if (history.length === 0) return;
      const nextIndex =
        historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex]);
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    }
  };

  return (
    <div
      className={
        "w-full transition-all duration-300 ease-out " +
        (isOpen
          ? "opacity-100 translate-y-0"
          : "max-h-0 opacity-0 -translate-y-3") +
        (isMaximized && isOpen ? " fixed inset-0 z-50 h-screen w-screen" : "")
      }
      aria-hidden={!isOpen}
    >
      <div
        className={
          (isMaximized
            ? "h-full w-full max-w-none p-2 sm:p-4"
            : "mb-12 w-full max-w-[34rem]") +
          " flex flex-col cursor-text overflow-hidden rounded-lg border border-border bg-surface shadow-2xl transition-all duration-300 ease-out transform " +
          (isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")
        }
        onClick={() => inputRef.current?.focus()}
        role="presentation"
      >
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
        <button
          aria-label="Close terminal"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          className="h-3 w-3 rounded-full bg-[#ff5f57] hover:opacity-80"
        />
        <button
          aria-label="Minimize terminal"
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized((v) => !v);
            if (isMaximized) {
              setIsMaximized(false);
            }
          }}
          className="h-3 w-3 rounded-full bg-[#febc2e] hover:opacity-80"
        />
        <button
          aria-label="Toggle full screen"
          onClick={(e) => {
            e.stopPropagation();
            setIsMaximized((v) => !v);
            // when maximizing, ensure input gets focus
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="h-3 w-3 rounded-full bg-[#28c840] hover:opacity-80"
        />
        <span className="ml-0.5 font-mono text-xs text-muted">~/snehil — zsh</span>
      </div>

      <div
        ref={contentRef}
        className={
          (isMinimized
            ? "hidden"
            : isMaximized
            ? "min-h-0 flex-1 overflow-y-auto"
            : "max-h-72 overflow-y-auto") +
          " p-5 font-mono text-sm leading-relaxed"
        }
      >
        {lines.map((line, i) => (
          <div key={`${line.type}-${i}-${line.text.slice(0, 20)}`} className="mb-1">
            {line.type === "input" ? (
              <p>
                <span className="text-accent-green">$</span>{" "}
                <span className="text-accent-cyan">{line.text}</span>
              </p>
            ) : line.type === "error" ? (
              <p className="text-[#f85149]">{line.text}</p>
            ) : line.type === "hint" ? (
              <p className="text-accent-purple/80">{line.text}</p>
            ) : (
              <p className="text-foreground/90">{line.text}</p>
            )}
          </div>
        ))}

        <div className="flex items-center gap-2 pt-1">
          <span className="shrink-0 text-accent-green">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            aria-label="Terminal input"
            className="w-full bg-transparent text-accent-cyan outline-none placeholder:text-muted/40"
            placeholder="type a command..."
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  </div>
  );
}
