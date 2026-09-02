import { profile } from "@/data/portfolio";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-center font-mono text-xs text-muted sm:text-left">
          <span className="text-accent-green">$</span> echo &quot;Built by{" "}
          {profile.name} · {year}&quot;
        </p>
        <p className="text-center font-mono text-xs text-muted/60 sm:text-right">
          © {year} {profile.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
