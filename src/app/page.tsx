"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Settings, FileSpreadsheet, Calendar } from "lucide-react";
import EmployeeTable from "@/components/EmployeeTable";

export default function Home() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getEmployees() {
      try {
        console.log("Fetching employees from API...");
        const response = await fetch("/api/employees");
        const data = await response.json();
        console.log("API Response:", data);
        console.log("Is array?", Array.isArray(data));
        console.log("Length:", data?.length);
        
        if (data.error) {
          console.error("API Error:", data.error);
        } else {
          setEmployees(data);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }

    getEmployees();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-serif text-[#2C2C2C] mb-6">Salary Payout</h1>
        
        {/* Navigation Tabs */}
        <div className="flex gap-8 border-b border-gray-100 pb-2">
          <button className="flex items-center gap-2 text-[#2C2C2C] border-b-2 border-[#F7D046] pb-2 px-1 font-medium text-sm">
            <FileSpreadsheet size={16} className="text-[#F7D046]" />
            Timesheet
          </button>
          <button className="flex items-center gap-2 text-gray-400 pb-2 px-1 text-sm hover:text-gray-600 transition-colors font-sans">
            <Calendar size={16} />
            Time-off request
          </button>
          <button className="flex items-center gap-2 text-gray-400 pb-2 px-1 text-sm hover:text-gray-600 transition-colors font-sans">
            <FileSpreadsheet size={16} />
            time-off policy
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-[#2C2C2C] font-sans">Timesheet</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg">
                <p className="text-xs text-gray-400 font-sans">Time period:</p>
                <p className="text-xs font-bold text-[#2C2C2C] font-sans">1st Jun - 31st Jul 2022</p>
                <Calendar size={14} className="text-gray-400 ml-1" />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 text-gray-600 text-sm font-bold hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors border border-dashed border-gray-300 font-sans">
              <FileSpreadsheet size={16} />
              Creat Report
            </button>
            <button className="flex items-center gap-2 text-gray-600 text-sm font-bold hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors font-sans">
              <Settings size={16} />
              Setting
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search employee" 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-100 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#F7D046]/20 focus:border-[#F7D046] text-sm font-sans"
            />
          </div>
          <button className="p-2.5 border border-gray-100 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={20} />
          </button>

          <div className="flex-1" />

          <div className="flex gap-3 font-sans">
            <button className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-[#2C2C2C] hover:bg-gray-50 transition-colors shadow-sm">
              Remind Approvers
            </button>
            <button className="px-6 py-2.5 bg-[#F7D046] text-[#2C2C2C] font-bold rounded-xl text-sm hover:bg-[#eac542] transition-colors shadow-md">
              Send To Payroll
            </button>
          </div>
        </div>

        {/* Employee Table */}
        <EmployeeTable employees={employees} loading={loading} />
      </section>
    </div>
  );
}
