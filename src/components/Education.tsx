import { GraduationCap } from "lucide-react";
import { education } from "@/data/portfolio";
import { SectionHeading } from "./SectionHeading";

export function Education() {
  return (
    <section className="border-t border-border/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          id="education"
          number="04. education"
          title="Education"
        />

        <div className="grid gap-6 grid-cols-1">
          {education.map((item) => (
            <div
              key={item.school}
              className="w-full max-w-xl card-glow card-glow-cyan group rounded-lg border border-border bg-surface p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-md bg-accent-green/10 p-2 text-accent-green">
                  <GraduationCap size={18} />
                </div>
                <span className="font-mono text-xs text-muted">{item.period}</span>
              </div>
              <h3 className="mb-1 font-semibold">{item.degree}</h3>
              <p className="mb-1 text-sm text-accent-cyan">{item.school}</p>
              <p className="text-sm text-muted">
                {item.location}
                {item.detail ? ` · ${item.detail}` : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
