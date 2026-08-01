import { ArrowDown, Mail } from "lucide-react";
import { profile } from "@/data/portfolio";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "./SocialIcons";
import { Terminal } from "./Terminal";
// import { TaskbarHint } from "./TaskbarHint";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center px-6 pt-24 pb-16">
      <div className="mx-auto w-full max-w-5xl">
        <p className="mb-4 font-mono text-sm text-accent-green">
          {'// initializing portfolio.exe'}
        </p>

        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Hi, I&apos;m{" "}
          <span className="bg-gradient-to-r from-accent-cyan via-accent-green to-accent-purple bg-clip-text text-transparent">
            {profile.name}
          </span>
        </h1>

        <p className="mb-2 max-w-2xl text-xl text-muted sm:text-2xl">
          {profile.title}
        </p>
        <p className="mb-8 max-w-xl font-mono text-sm text-muted/80">
          {profile.tagline}
        </p>

        <div data-terminal-anchor className="mb-8 flex justify-start">
          <Terminal />
        </div>

        {/* <TaskbarHint visible={true} /> */}

        <div className="flex flex-wrap items-center gap-4">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-md bg-accent-cyan/10 px-5 py-2.5 text-sm font-medium text-accent-cyan ring-1 ring-accent-cyan/30 transition-all hover:bg-accent-cyan/20 hover:ring-accent-cyan/50"
            data-get-in-touch
          >
            <Mail size={16} />
            {"Let\'s connect!"}
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm text-muted ring-1 ring-border transition-all hover:text-foreground hover:ring-muted/50"
          >
            <GithubIcon size={16} />
            GitHub
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm text-muted ring-1 ring-border transition-all hover:text-foreground hover:ring-muted/50"
          >
            <LinkedinIcon size={16} />
            LinkedIn
          </a>
          <a
            href={profile.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm text-muted ring-1 ring-border transition-all hover:text-foreground hover:ring-muted/50"
          >
            <InstagramIcon size={16} />
            Instagram
          </a>
        </div>

        <a
          href="#about"
          aria-label="Scroll to about section"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted transition-colors hover:text-accent-cyan"
        >
          <ArrowDown size={20} className="animate-bounce" />
        </a>
      </div>
    </section>
  );
}
