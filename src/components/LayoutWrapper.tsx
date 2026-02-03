"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide sidebar on wizard and login pages
  const hideSidebar = pathname?.startsWith("/payroll/wizard") || pathname === "/login";

  if (hideSidebar) {
    return (
      <main className="min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-20 min-h-screen">
        {children}
      </main>
    </div>
  );
}
