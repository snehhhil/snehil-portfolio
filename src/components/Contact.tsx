import { Mail } from "lucide-react";
import { profile } from "@/data/portfolio";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "./SocialIcons";
import { SectionHeading } from "./SectionHeading";

const links = [
  {
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
    icon: Mail,
  },
  {
    label: "GitHub",
    value: "snehhhil",
    href: profile.github,
    icon: GithubIcon,
  },
  {
    label: "LinkedIn",
    value: "snehillsinghh",
    href: profile.linkedin,
    icon: LinkedinIcon,
  },
  {
    label: "Instagram",
    value: "snehillsinghh",
    href: profile.instagram,
    icon: InstagramIcon,
  },
];

export function Contact() {
  return (
    <section className="border-t border-border/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          id="contact"
          number="06. contact"
          title="Let's connect"
 />

        <div className="grid gap-4 grid-cols-1">
          {links.map(({ label, value, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="w-full max-w-xl group flex items-center gap-4 rounded-lg border border-border bg-surface p-5 transition-all hover:border-accent-cyan/40 hover:bg-accent-cyan/5"
            >
              <div className="rounded-md bg-accent-cyan/10 p-2.5 text-accent-cyan transition-colors group-hover:bg-accent-cyan/20">
                <Icon size={18} />
              </div>
              <div>
                <p className="font-mono text-xs text-muted">{label}</p>
                <p className="text-sm font-medium transition-colors group-hover:text-accent-cyan">
                  {value}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
