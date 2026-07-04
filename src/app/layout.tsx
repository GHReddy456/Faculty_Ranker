"use client";

import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { AuthContextProvider } from "../context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <AuthContextProvider>{children}</AuthContextProvider>
        <Analytics />
      </body>
    </html>
  );
}
