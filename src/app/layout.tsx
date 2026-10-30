"use client";

import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import { AuthContextProvider } from "../context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2290689416341134"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <AuthContextProvider>{children}</AuthContextProvider>
        <Analytics />
      </body>
    </html>
  );
}
