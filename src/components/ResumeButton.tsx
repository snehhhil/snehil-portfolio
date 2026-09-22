"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, FileText } from "lucide-react";

const resumePath = "/resume/Snehil_CV.pdf";

export function ResumeButton({
  compact = false,
  onClose,
}: {
  compact?: boolean;
  onClose?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const closeResume = () => {
    setIsOpen(false);
    onClose?.();
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        onCloseRef.current?.();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center justify-center gap-2 rounded-md border border-accent-green/40 bg-accent-green/10 font-mono text-xs uppercase tracking-wider text-accent-green transition hover:border-accent-cyan/60 hover:bg-accent-cyan/10 hover:text-accent-cyan ${compact ? "px-3 py-2" : "w-full px-4 py-2.5"}`}
        aria-haspopup="dialog"
      >
        <FileText size={compact ? 15 : 16} />
        Resume
      </button>

      {isOpen && createPortal(
        <div
          className="resume-modal fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-background/80 p-2 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-modal-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeResume();
          }}
        >
          <div className="resume-modal-panel flex flex-col overflow-hidden rounded-lg border border-accent-cyan/30 bg-[#080d14] shadow-[0_0_80px_rgba(34,211,238,0.12)]">
            <div className="flex min-w-0 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-2 py-1 sm:px-3 sm:py-1.5">
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={closeResume}
                  aria-label="Close resume preview"
                  title="Close resume preview"
                  className="h-3 w-3 rounded-full bg-rose-400/80 transition hover:bg-rose-300"
                />
                {/* <span className="h-2 w-2 rounded-full bg-amber-300/80" />
                <span className="h-2 w-2 rounded-full bg-accent-green/80" /> */}
              </div>
              <div className="min-w-0 flex-1 border-l border-border pl-2">
                <h2 id="resume-modal-title" className="truncate font-mono text-[10px] text-muted sm:text-xs">
                  {/* <span className="text-accent-green">snhl@portfolio</span>
                  <span className="text-muted">:</span>
                  <span className="text-accent-cyan">~</span> */}
                  <span className="text-muted">$ view </span>
                  <span className="text-foreground">Snehil_CV</span>
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <a
                  href={resumePath}
                  download
                  title="Download resume"
                  className="inline-flex items-center gap-1.5 rounded-md border border-accent-green/30 bg-accent-green/5 px-2 py-1 font-mono text-[10px] text-accent-green transition hover:border-accent-green/70 hover:bg-accent-green/10"
                >
                  <Download size={12} />
                  <span className="hidden sm:inline">Download</span>
                </a>
                {/* <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close resume preview"
                  title="Close resume preview"
                  className="rounded-md border border-border p-1.5 text-muted transition hover:border-rose-400/60 hover:text-rose-300"
                >
                  <X size={14} />
                </button> */}
              </div>
            </div>
            <div className="flex min-w-0 shrink-0 items-center justify-between border-b border-accent-cyan/15 bg-accent-cyan/[0.03] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.16em] sm:px-3 sm:py-1.5 sm:text-[9px]">
              <span className="flex items-center gap-1.5 text-accent-green">
                <span className="h-1 w-1 rounded-full bg-accent-green shadow-[0_0_8px_rgba(63,185,80,0.9)]" />
                document loaded
              </span>
              <span className="text-muted">pdf / 01</span>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(88,166,255,0.08),transparent_40%),#070b11] p-1.5 sm:p-5">
              <div className="flex h-full w-full items-center justify-center border border-border/80 bg-[#111820] p-1 shadow-[0_0_35px_rgba(0,0,0,0.45)] sm:p-2">
                <Image
                  src="/resume/Snehil_CV.pdf.png"
                  alt="Snehil resume"
                  width={1696}
                  height={2400}
                  priority
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
