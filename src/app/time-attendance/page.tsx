"use client";

import { useState } from "react";
import { Search, Calendar, FileText, FileCheck, Settings, SlidersHorizontal, MoreHorizontal, Check } from "lucide-react";
import Link from "next/link";

interface Employee {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  type: string;
  regular: number;
  overtime: number | null;
  sickLeave: number | null;
  pto: number | null;
  paidHoliday: number | null;
  totalHour: number;
  approvedBy?: string;
}

const employees: Employee[] = [
  { id: "1", name: "Ralph Edwards", role: "Product Designer", avatarColor: "bg-yellow-500", type: "Fulltime", regular: 172, overtime: 24, sickLeave: 48, pto: null, paidHoliday: 20, totalHour: 264, approvedBy: undefined },
  { id: "2", name: "Arlene McCoy", role: "UX Researcher", avatarColor: "bg-orange-500", type: "Fulltime", regular: 160, overtime: null, sickLeave: null, pto: 50, paidHoliday: null, totalHour: 210, approvedBy: undefined },
  { id: "3", name: "Wade Warren", role: "QA Engineer", avatarColor: "bg-amber-600", type: "Contractor", regular: 178, overtime: null, sickLeave: null, pto: 74, paidHoliday: null, totalHour: 252, approvedBy: undefined },
  { id: "4", name: "Jacob Jones", role: "Senior UI Designer", avatarColor: "bg-green-600", type: "Fulltime", regular: 156, overtime: 16, sickLeave: 24, pto: null, paidHoliday: 40, totalHour: 236, approvedBy: "Sonia W" },
  { id: "5", name: "Jenny Wilson", role: "Java Developer", avatarColor: "bg-blue-500", type: "Fulltime", regular: 174, overtime: null, sickLeave: null, pto: 64, paidHoliday: null, totalHour: 238, approvedBy: "Sonia W" },
  { id: "6", name: "Rudolp Wayne", role: "Visual Basic Programmer", avatarColor: "bg-red-500", type: "Contractor", regular: 163, overtime: 32, sickLeave: null, pto: 100, paidHoliday: null, totalHour: 295, approvedBy: "Sonia W" },
  { id: "7", name: "Jennifer Kwok", role: "Frontend Developer", avatarColor: "bg-orange-400", type: "Fulltime", regular: 162, overtime: null, sickLeave: null, pto: 50, paidHoliday: null, totalHour: 212, approvedBy: undefined },
];

const tabs = [
  { id: "timesheet", label: "Timesheet", icon: Calendar },
  { id: "time-off-request", label: "Time-off request", icon: FileText },
  { id: "time-off-policy", label: "time-off policy", icon: FileCheck },
];

export default function TimeAttendancePage() {
  const [activeTab, setActiveTab] = useState("timesheet");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Days for the calendar timeline
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentDay = 22;
  const latePaymentStart = 23;
  const latePaymentEnd = 28;

  return (
    <div className="px-8 py-6 bg-[#FAFAFA] min-h-screen">
      {/* Page Title */}
      <h1 className="text-3xl font-serif text-[#2C2C2C] mb-6">Time & Attendance</h1>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-200 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 text-sm font-medium pb-4 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "text-[#2C2C2C] border-[#F7D046]"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timesheet Header Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-[#2C2C2C]">Timesheet</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 shadow-sm">
            <span className="text-gray-400">Time period:</span>
            <span className="font-medium text-[#2C2C2C]">1st Jun - 31st Jul 2022</span>
            <Calendar size={14} className="text-gray-400 ml-2" />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm font-medium text-[#2C2C2C] hover:text-gray-600 transition-colors">
            <FileText size={16} />
            <span className="border-b border-black border-dashed pb-0.5">Creat Report</span>
          </button>
          <button className="flex items-center gap-2 text-sm font-medium text-[#2C2C2C] hover:text-gray-600 transition-colors">
            <Settings size={16} />
            <span className="border-b border-black border-dashed pb-0.5">Setting</span>
          </button>
        </div>
      </div>

      {/* Calendar Timeline Box */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">Start of pay: <span className="font-bold text-[#2C2C2C]">1st Jun</span></span>
          <span className="text-sm text-gray-500">End of pay: <span className="font-bold text-[#2C2C2C]">31st Jul</span></span>
        </div>

        {/* Timeline Bar */}
        <div className="flex items-center gap-[2px] mb-4">
          {days.map((day) => (
            <div
              key={day}
              className={`flex-1 h-8 flex items-center justify-center text-[10px] font-medium transition-colors ${
                day <= currentDay
                  ? "bg-[#6BCB77] text-white" 
                  : day >= latePaymentStart && day <= latePaymentEnd
                  ? "bg-red-50 text-red-400 border border-red-100" 
                  : "bg-gray-50 text-gray-400"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Timeline Labels */}
        <div className="flex items-center justify-end gap-6 relative">
          <div className="absolute right-[25%] top-[-10px]">
             <span className="px-3 py-1 bg-white border border-gray-200 text-xs text-gray-500 rounded shadow-sm">Late payment</span>
          </div>
          <div className="flex items-center gap-2 ml-auto border border-gray-200 rounded px-3 py-1 bg-white">
             <span className="text-xs text-gray-400">Automatic submit:</span>
             <span className="text-xs font-bold text-[#2C2C2C]">31st Jun</span>
          </div>
        </div>
      </div>

      {/* Search and Actions Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded text-sm w-64 focus:outline-none focus:border-[#F7D046]"
            />
          </div>
          <button className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-5 py-2 border border-[#2C2C2C] text-[#2C2C2C] text-sm font-bold rounded hover:bg-gray-50 transition-colors">
            Remind Approvers
          </button>
          <Link
            href="/payroll/run"
            className="px-5 py-2 bg-[#F7D046] text-[#2C2C2C] text-sm font-bold rounded hover:bg-[#E5C03E] transition-colors"
          >
            Send To Payroll
          </Link>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white border-t border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-4 text-xs font-medium text-gray-400">Name</th>
              <th className="text-left px-4 py-4 text-xs font-medium text-gray-400">Type</th>
              <th className="text-left px-4 py-4 text-xs font-medium text-gray-400">Regular</th>
              <th className="text-left px-4 py-4 text-xs font-medium text-gray-400">Overtime</th>
              <th className="text-left px-4 py-4 text-xs font-medium text-gray-400">Sick Leave</th>
              <th className="text-left px-4 py-4 text-xs font-medium text-gray-400">PTO</th>
              <th className="text-left px-4 py-4 text-xs font-medium text-gray-400">Paid Holiday</th>
              <th className="text-left px-4 py-4 text-xs font-medium text-gray-400">Total hour</th>
              <th className="text-left px-4 py-4 text-xs font-medium text-gray-400"></th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr 
                key={employee.id}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${employee.avatarColor} flex items-center justify-center text-white text-sm font-medium`}>
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <Link 
                        href={`/payroll/employee/${employee.id}`}
                        className="text-sm font-bold text-[#2C2C2C] hover:text-[#F7D046] transition-colors"
                      >
                        {employee.name}
                      </Link>
                      <p className="text-xs text-gray-400">{employee.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-[#2C2C2C]">{employee.type}</p>
                    <p className="text-xs text-gray-400">Salaried</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-medium text-[#2C2C2C]">{employee.regular} Hours</td>
                <td className="px-4 py-4 text-sm font-medium text-[#2C2C2C]">{employee.overtime ? `${employee.overtime} Hours` : "-"}</td>
                <td className="px-4 py-4 text-sm font-medium text-[#2C2C2C]">{employee.sickLeave ? `${employee.sickLeave} Hours` : "-"}</td>
                <td className="px-4 py-4 text-sm font-medium text-[#2C2C2C]">{employee.pto ? `${employee.pto} Hours` : "-"}</td>
                <td className="px-4 py-4 text-sm font-medium text-[#2C2C2C]">{employee.paidHoliday ? `${employee.paidHoliday} Hours` : "-"}</td>
                <td className="px-4 py-4 text-sm font-bold text-[#2C2C2C]">{employee.totalHour} Hours</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    {employee.approvedBy ? (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400">by {employee.approvedBy}</span>
                        <div className="w-5 h-5 rounded-full bg-[#6BCB77] flex items-center justify-center mt-0.5">
                          <Check size={12} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <button className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-400">
                        <span className="text-xs">-</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
