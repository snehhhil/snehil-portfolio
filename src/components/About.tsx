import { MapPin } from "lucide-react";
import { interests, profile } from "@/data/portfolio";
import { SectionHeading } from "./SectionHeading";
import { ResumeButton } from "./ResumeButton";

export function About() {
  return (
    <section className="border-t border-border/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          id="about"
          number="01. about"
          title="How I define myself"
        />

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <p className="mb-4 leading-relaxed text-muted">{profile.summary}</p>
            <p className="flex items-center gap-2 text-sm text-muted">
              <MapPin size={14} className="text-accent-cyan" />
              {profile.location}
            </p>
            <div>
              {/* <ResumeButton /> */}
            </div>
          </div>

          <div className="-translate-y-[50px] rounded-lg border border-border bg-surface p-6 lg:col-span-2">
            <h3 className="mb-4 font-mono text-xs uppercase tracking-wider text-accent-green">
              interests[]
            </h3>
            <ul className="space-y-3">
              {interests.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-muted"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-purple" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
