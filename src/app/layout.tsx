import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = { title: "Playmaker — линия и лайв на виртуальные монеты", description: "A sportsbook-style game: football, hockey, basketball, parlays and live betting. Virtual coins only." };
export const viewport: Viewport = { themeColor: "#0b0b0e", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Shell>{children}</Shell></body></html>;
}
