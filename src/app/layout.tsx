import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Embassy Connect — Kenya consular-service prototype",
  description: "A prototype digital consular companion for Kenyan citizens travelling or living abroad, with Ministry-linked mission information.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
