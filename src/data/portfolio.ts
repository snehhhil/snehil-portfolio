export const profile = {
  name: "Snehil",
  title: "Software Development Engineer",
  tagline: "Full-stack engineer · FinTech · Machine Learning",
  location: "Ghaziabad, UP, India",
  email: "snehillsinghh@gmail.com",
  github: "https://github.com/snehhhil",
  linkedin: "https://linkedin.com/in/snehillsinghh",
  instagram: "https://instagram.com/snehillsinghh",
  summary:
    "Computer Science graduate and SDE-1 at Servosys Solutions, building enterprise FinTech platforms for loan origination and workflow automation. I bridge client needs with engineering — from JDK migrations and theme systems to ML-powered side projects in computer vision and healthcare.",
};

export type EducationItem = {
  school: string;
  location: string;
  degree: string;
  period: string;
  detail?: string;
};

export const experience = [
  {
    company: "Servosys Solutions",
    location: "Noida, Uttar Pradesh",
    roles: [
      {
        title: "SDE-1",
        period: "Jul 2026 – Present",
        highlights: [
          "Primary technical Point of Contact (POC) for Five-Star Business Finance",
          "Investigating and resolving critical product issues across the stack",
          "Bridging clients with engineering and QA teams",
        ],
      },
      {
        title: "SWE Intern",
        period: "Jan 2026 – Jul 2026",
        highlights: [
          "Built a dynamic Theme Manager for UI personalization",
          "Reduced code smells by 30% through quality improvements",
          "Migrated Servostreams 7.0 from JDK 8 to JDK 17",
        ],
      },
      {
        title: "QA Intern",
        period: "Jul 2025 – Jan 2026",
        highlights: [
          "Performed manual testing and VAPT assessments",
          "Optimized SQL queries for performance",
          "Worked with Loan Origination Systems (LOS) and Signavio workflow automation",
        ],
      },
    ],
  },
  {
    company: "HighRadius Corporation",
    location: "Bhubaneswar, Odisha",
    roles: [
      {
        title: "Fin-Tech Advisor Intern",
        period: "Apr 2025 – Jun 2025",
        highlights: [
          "Conducted market research for US and EMEA regions",
          "Executed outbound outreach for financial automation (O2C, Treasury, R2R)",
        ],
      },
    ],
  },
];

export const education: EducationItem[] = [
  {
    school: "Kalinga Institute of Industrial Technology",
    location: "Odisha, India",
    degree: "B.Tech — Computer Science",
    period: "Oct 2021 – Aug 2025",
    // detail: "GPA: 7.23",
  },
  {
    school: "Mayo International School",
    location: "New Delhi, India",
    degree: "HSC — PCM",
    period: "Apr 2020 – Mar 2021",
    // detail: "Score: 75%",
  },
];

export const skills = {
  languages: [
    "Python",
    "C++",
    "JavaScript",
    "Java",
    "SQL",
    "Bash",
    "HTML",
    "CSS",
  ],
  frameworks: [
    "React",
    "TailwindCSS",
    "Node.js",
    "Spring Boot",
    "FastAPI",
    "TensorFlow",
    "Scikit-learn",
    "Pandas",
  ],
  tools: [
    "Git",
    "PostgreSQL",
    "MySQL",
    "Jenkins",
    "JMeter",
    "Maven",
    "Postman",
    "REST APIs",
    "Oracle WebLogic 12c",
    "Swagger UI",
    "VS Code",
    "GitHub Copilot",
  ],
};

export const interests = [
  "FinTech & enterprise systems",
  "Machine learning & computer vision",
  "Full-stack web development",
  "Workflow automation",
];

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Education", href: "#education" },
  { label: "Games", href: "#games" },
  { label: "Contact", href: "#contact" },
];
