import type { Metadata } from "next";
import { Playfair_Display, Host_Grotesk } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const hostGrotesk = Host_Grotesk({
  variable: "--font-host-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HRhub - Time & Attendance",
  description: "Modern HR Management System",
};

import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${hostGrotesk.variable} antialiased bg-[#FDFDFD] text-[#171717] font-sans`}
      >
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-20 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
