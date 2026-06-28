import type { Metadata } from "next";
import { AppTopNav } from "@/components/AppTopNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nationwide Bridge Risk Explorer",
  description: "A data-first nationwide bridge risk exploration workspace.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="flex h-screen min-h-0 flex-col overflow-hidden"
        suppressHydrationWarning
      >
        <AppTopNav />
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </body>
    </html>
  );
}
