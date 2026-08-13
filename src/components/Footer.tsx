import { profile } from "@/data/portfolio";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="font-mono text-xs text-muted">
          <span className="text-accent-green">$</span> echo &quot;Built by{" "}
          {profile.name} · {year}&quot;
        </p>
        <p className="font-mono text-xs text-muted/60">
          © {year} {profile.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
