import { FileText } from "lucide-react";

export function ResumeButton({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href="/resume/Snehil_CV.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-accent-green/40 bg-accent-green/10 font-mono text-xs uppercase tracking-wider text-accent-green transition hover:border-accent-cyan/60 hover:bg-accent-cyan/10 hover:text-accent-cyan ${compact ? "px-3 py-2" : "px-4 py-2.5"}`}
    >
      <FileText size={compact ? 15 : 16} />
      Resume
    </a>
  );
}
