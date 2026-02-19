"use client";

import React, { useState } from "react";
import { Settings as SettingsIcon, Users, CreditCard } from "lucide-react";
import SystemSettings from "@/components/settings/SystemSettings";
import HRSettings from "@/components/settings/HRSettings";
import PayrollSettings from "@/components/settings/PayrollSettings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"system" | "hr" | "payroll">("system");

  const tabs = [
    { id: "system", label: "System Settings", icon: SettingsIcon },
    { id: "hr", label: "HR Settings", icon: Users },
    { id: "payroll", label: "Payroll Settings", icon: CreditCard },
  ] as const;

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-white">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-[25px] font-serif text-[#2C2C2C] mb-2">Settings</h1>
        <p className="text-gray-500 text-sm">Manage system configurations and preferences</p>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-gray-100">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative ${
                isActive 
                  ? "text-indigo-600" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg"
              }`}
            >
              <Icon size={18} />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === "system" && <SystemSettings />}
        {activeTab === "hr" && <HRSettings />}
        {activeTab === "payroll" && <PayrollSettings />}
      </div>
    </div>
  );
}
