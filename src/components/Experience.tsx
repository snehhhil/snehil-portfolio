import { experience } from "@/data/portfolio";
import { SectionHeading } from "./SectionHeading";

export function Experience() {
  return (
    <section className="border-t border-border/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          id="experience"
          number="02. experience"
          title="Where I've worked"
        />

        <div className="space-y-12">
          {experience.map((job) => (
            <div key={job.company}>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground">
                  {job.company}
                </h3>
                <p className="text-sm text-muted">{job.location}</p>
              </div>

              <div className="relative space-y-8 border-l border-border pl-6 sm:pl-8">
                {job.roles.map((role) => (
                  <div key={role.title + role.period} className="relative">
                    <span className="absolute -left-[calc(1.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-accent-cyan bg-background sm:-left-[calc(2rem+5px)]" />

                    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                      <h4 className="font-mono text-sm font-medium text-accent-green">
                        {role.title}
                      </h4>
                      <span className="font-mono text-xs text-muted">
                        {role.period}
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {role.highlights.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm leading-relaxed text-muted"
                        >
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
