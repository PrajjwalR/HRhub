"use client";

import { Calculator, BarChart3, FileText, ArrowDownLeft, ArrowUpRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const accountingTabs = [
  { name: "Dashboard", href: "/accounting/dashboard", icon: BarChart3 },
  { name: "Financial Reports", href: "/accounting/financial-reports", icon: FileText },
  { name: "Payables", href: "/accounting/payables", icon: ArrowDownLeft },
  { name: "Receivables", href: "/accounting/receivables", icon: ArrowUpRight },
  { name: "Journal Entries", href: "/accounting/journal-entries", icon: BookOpen },
];

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 bg-pattern-light">
      {/* Header section with gradient */}
      <div className="bg-white border-b border-gray-100 shadow-sm relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#4A72FF]/5 to-[#FF8C42]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#FF8C42]/5 to-[#4A72FF]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A72FF] to-[#3B5BCC] flex items-center justify-center shadow-lg shadow-[#4A72FF]/20 transform transition-transform hover:scale-105 shrink-0">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 font-serif">
                Accounting
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-1">
                Manage financial reports, payables, receivables, and journal entries
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="bg-white border-b border-gray-200 shrink-0 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto no-scrollbar">
            {accountingTabs.map((tab) => {
              const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`group flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive 
                      ? "border-[#4A72FF] text-[#4A72FF]" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${isActive ? "text-[#4A72FF]" : "text-gray-400 group-hover:text-gray-500"}`} />
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content area */}
      {/* We need flex-1 and min-h-0 so the main content can scroll if necessary without pushing the whole layout down */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
        {children}
      </main>
    </div>
  );
}
