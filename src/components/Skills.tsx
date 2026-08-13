import { skills } from "@/data/portfolio";
import { SectionHeading } from "./SectionHeading";

const categories = [
  { key: "languages" as const, label: "Languages", color: "text-accent-cyan", glow: "card-glow-cyan" },
  { key: "frameworks" as const, label: "Frameworks", color: "text-accent-green", glow: "card-glow-green" },
  { key: "tools" as const, label: "Tools", color: "text-accent-purple", glow: "card-glow-purple" },
];

export function Skills() {
  return (
    <section className="border-t border-border/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          id="skills"
          number="03. skills"
          title="Tech stack"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {categories.map(({ key, label, color, glow }) => (
            <div
              key={key}
              className={`card-glow ${glow} rounded-lg border border-border bg-surface p-6`}
            >
              <h3 className={`mb-4 font-mono text-xs uppercase tracking-wider ${color}`}>
                {label}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills[key].map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-background px-2.5 py-1 font-mono text-xs text-muted ring-1 ring-border transition-colors hover:text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
