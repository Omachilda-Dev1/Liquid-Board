import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LIQUID BOARD — Decentralized Trading Terminal",
  description: "Real-time crypto & stock trading simulator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
