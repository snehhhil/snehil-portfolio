import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Taskbar from "@/components/Taskbar";
import { TerminalProvider } from "@/components/TerminalProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Snehil — Software Development Engineer",
  description:
    "Portfolio of Snehil — SDE at Servosys Solutions. Full-stack engineer specializing in FinTech, React, Java, and machine learning.",
  keywords: [
    "Snehil",
    "Software Engineer",
    "FinTech",
    "React",
    "Machine Learning",
    "Full Stack Developer",
  ],
  authors: [{ name: "Snehil" }],
  openGraph: {
    title: "Snehil — Software Development Engineer",
    description:
      "Full-stack engineer · FinTech · Machine Learning. Building enterprise platforms and ML experiments.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <TerminalProvider>
          {children}
          <Taskbar />
        </TerminalProvider>
      </body>
    </html>
  );
}
