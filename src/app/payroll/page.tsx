"use client";

import { useState } from "react";
import PayrollBanner from "@/components/payroll/PayrollBanner";
import PayrollTable from "@/components/payroll/PayrollTable";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState("Payroll list");

  const tabs = [
    { id: "Payroll list", label: "Payroll list" },
    { id: "Archived", label: "Archived" },
    { id: "Payroll setting", label: "Payroll setting" },
    { id: "Pay contractor", label: "Pay contractor" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-serif text-[#2C2C2C]">Payroll</h1>
        <Link
          href="/payroll/slips"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[#2C2C2C] font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FileText size={18} />
          View All Salary Slips
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm font-medium pb-3 border-b-2 transition-colors px-2 ${
              activeTab === tab.id
                ? "text-[#2C2C2C] border-[#F7D046]"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "Payroll list" && (
        <>
          <PayrollBanner />
          <PayrollTable />
        </>
      )}

      {activeTab !== "Payroll list" && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 mb-4">This section is coming soon</p>
          <button className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#F7D046] hover:text-[#2C2C2C] transition-colors">
            <Plus size={16} />
            Add New
          </button>
        </div>
      )}
    </div>
  );
}
