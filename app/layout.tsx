import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EdgeFinder | AI Sports Betting Research",
  description:
    "AI-powered sports betting research platform. Get sharp analysis, line movement tracking, and data-driven edges for NFL, NBA, MLB, and UFC.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
