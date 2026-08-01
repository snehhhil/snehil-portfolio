"use client";

import { useEffect, useState } from "react";
import { navLinks } from "@/data/portfolio";

export function useActiveSection() {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sectionIds = navLinks.map((link) => link.href.replace("#", ""));

    const updateActive = () => {
      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean) as HTMLElement[];

      if (!sections.length || window.scrollY < 120) {
        setActiveSection("home");
        return;
      }

      const marker = Math.min(200, window.innerHeight * 0.22);
      const sectionsWithBounds = sections.map((section) => {
        const rect = section.getBoundingClientRect();
        return {
          id: section.id,
          top: rect.top,
          bottom: rect.bottom,
        };
      });

      const sectionAtMarker = sectionsWithBounds.find(
        (section) => section.top <= marker && section.bottom > marker
      );

      if (sectionAtMarker) {
        setActiveSection(sectionAtMarker.id);
        return;
      }

      const closestSection = sectionsWithBounds.reduce(
        (closest, section) => {
          const distance = Math.min(
            Math.abs(section.top - marker),
            Math.abs(section.bottom - marker)
          );
          return distance < closest.distance
            ? { id: section.id, distance }
            : closest;
        },
        { id: sectionsWithBounds[0].id, distance: Infinity }
      );

      setActiveSection(closestSection.id);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, []);

  return activeSection;
}
