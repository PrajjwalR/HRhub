"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock, FileText, LayoutList, Check, X, Edit2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface TimeEntry {
  id: string;
  dayOfWeek: string;
  date: string;
  checkin: string;
  checkout: string;
  mealBreak: { hours: number; time: string };
  workHours: number;
  overtime: number | null;
  double: string;
  note: string;
  status: "approved" | "pending" | "rejected" | "timeoff";
  timeoffInfo?: { approvedBy: string; type: string; approvedOn: string; duration: number };
}

interface EmployeeData {
  id: string;
  name: string;
  role: string;
  type: string;
  avatar: string;
  avatarColor: string;
  totalHours: number;
  regular: number | null;
  overtime: number | null;
  pto: number | null;
  holiday: number | null;
  approved: number;
  rejected: number;
  pending: number;
}

const timeEntries: TimeEntry[] = [
  { id: "1", dayOfWeek: "Mon", date: "1st Jun 2022", checkin: "09:00 AM", checkout: "09:00 PM", mealBreak: { hours: 1, time: "12:00 PM - 01:00 PM" }, workHours: 8, overtime: 4, double: "N/A", note: "", status: "pending" },
  { id: "2", dayOfWeek: "Tue", date: "2nd Jun 2022", checkin: "08:01 AM", checkout: "07:02 PM", mealBreak: { hours: 1, time: "12:00 PM - 01:00 PM" }, workHours: 8, overtime: 3, double: "N/A", note: "", status: "pending" },
  { id: "3", dayOfWeek: "Wed", date: "3rd Jun 2022", checkin: "08:00 AM", checkout: "04:00 PM", mealBreak: { hours: 1, time: "12:00 PM - 01:00 PM" }, workHours: 8, overtime: 0, double: "N/A", note: "", status: "pending" },
  { id: "4", dayOfWeek: "Thu", date: "5th Jun 2022", checkin: "", checkout: "", mealBreak: { hours: 0, time: "" }, workHours: 0, overtime: null, double: "", note: "", status: "timeoff", timeoffInfo: { approvedBy: "Rockie west", type: "Sick leave", approvedOn: "7th Jun 2022", duration: 24 } },
  { id: "5", dayOfWeek: "Fri", date: "6th Jun 2022", checkin: "", checkout: "", mealBreak: { hours: 0, time: "" }, workHours: 0, overtime: null, double: "", note: "", status: "timeoff" },
  { id: "6", dayOfWeek: "Mon", date: "1st Jun 2022", checkin: "09:00 AM", checkout: "07:01 PM", mealBreak: { hours: 1, time: "12:00 PM - 01:00 PM" }, workHours: 8, overtime: 2, double: "N/A", note: "", status: "approved" },
  { id: "7", dayOfWeek: "Tue", date: "2nd Jun 2022", checkin: "09:04 AM", checkout: "09:12 PM", mealBreak: { hours: 1, time: "12:00 PM - 01:00 PM" }, workHours: 8, overtime: 4, double: "N/A", note: "", status: "approved" },
  { id: "8", dayOfWeek: "Wed", date: "3rd Jun 2022", checkin: "09:00 AM", checkout: "05:00 PM", mealBreak: { hours: 1, time: "" }, workHours: 8, overtime: null, double: "N/A", note: "", status: "approved" },
];

export default function EmployeeDetailPage() {
  const params = useParams();
  const employeeId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<"timecard" | "timeline">("timecard");
  const [showOnlyUnapproved, setShowOnlyUnapproved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/attendance");
        
        if (!response.ok) {
          throw new Error("Failed to fetch employee data");
        }
        
        const employees = await response.json();
        const employee = employees.find((emp: any) => emp.id === employeeId);
        
        if (!employee) {
          throw new Error("Employee not found");
        }
        
        // Transform to EmployeeData format
        setEmployeeData({
          id: employee.id,
          name: employee.name,
          role: employee.role,
          type: employee.type,
          avatar: "",
          avatarColor: employee.avatarColor,
          totalHours: employee.totalHour || 0,
          regular: employee.regular,
          overtime: employee.overtime,
          pto: employee.pto,
          holiday: employee.paidHoliday,
          approved: 0,
          rejected: 0,
          pending: 0,
        });
        setError(null);
      } catch (err: any) {
        console.error("Error fetching employee:", err);
        setError(err.message || "Failed to load employee data");
      } finally {
        setIsLoading(false);
      }
    };

    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  const filteredEntries = showOnlyUnapproved 
    ? timeEntries.filter(e => e.status === "pending")
    : timeEntries;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7D046] mb-4"></div>
          <p className="text-gray-500">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (error || !employeeData) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">⚠️ {error || "Employee not found"}</p>
          <Link 
            href="/time-attendance"
            className="px-4 py-2 bg-[#F7D046] text-[#2C2C2C] rounded hover:bg-[#E5C03E] transition-colors inline-block"
          >
            Back to Time & Attendance
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/payroll/run"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-serif text-[#2C2C2C]">Time & Attendance</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar - Employee Info */}
        <div className="w-72 bg-white border-r border-gray-100 p-6 min-h-[calc(100vh-73px)]">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className={`w-20 h-20 rounded-full ${employeeData.avatarColor} flex items-center justify-center text-white text-2xl font-bold mb-2 relative`}>
              {employeeData.name.charAt(0)}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#F7D046] text-[#2C2C2C] text-xs font-medium rounded">
                {employeeData.type}
              </span>
            </div>
          </div>

          {/* Name */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-[#2C2C2C]">{employeeData.name}</h2>
            <p className="text-sm text-gray-500">{employeeData.role}</p>
          </div>

          {/* Hours Summary */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-gray-400" />
              <span className="text-2xl font-bold text-[#2C2C2C]">{employeeData.totalHours}</span>
              <span className="text-sm text-gray-500">Total hours</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-lg font-bold text-[#2C2C2C]">{employeeData.regular} hrs</p>
                <p className="text-xs text-gray-400">Regular</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#2C2C2C]">{employeeData.overtime} hrs</p>
                <p className="text-xs text-gray-400">Overtime</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#2C2C2C]">{employeeData.pto} hrs</p>
                <p className="text-xs text-gray-400">PTO</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#2C2C2C]">{employeeData.holiday} hrs</p>
                <p className="text-xs text-gray-400">Holiday</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {/* Time Period & Hour Breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            {/* Time Period Selector */}
            <div className="flex items-center justify-end mb-4">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm">
                <span>Time period:</span>
                <span className="font-medium">1st Jun - 31st Jul 2022</span>
                <Calendar size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Hour Breakdown */}
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-sm text-gray-500">Hour breakdown</span>
                <span className="text-2xl font-bold text-[#2C2C2C]">{employeeData.totalHours} hrs</span>
                
                <div className="ml-auto flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-sm" />
                    <span className="text-xs text-gray-500">Approved: {employeeData.approved} hrs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-sm" />
                    <span className="text-xs text-gray-500">Rejected: {employeeData.rejected} hrs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#F7D046] rounded-sm" />
                    <span className="text-xs text-gray-500">Pending: {employeeData.pending} hrs</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                <div 
                  className="bg-green-500 h-full" 
                  style={{ width: `${(employeeData.approved / employeeData.totalHours) * 100}%` }}
                />
                <div 
                  className="bg-red-500 h-full" 
                  style={{ width: `${(employeeData.rejected / employeeData.totalHours) * 100}%` }}
                />
                <div 
                  className="bg-[#F7D046] h-full" 
                  style={{ width: `${(employeeData.pending / employeeData.totalHours) * 100}%` }}
                />
              </div>
            </div>

            {/* Tabs & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab("timecard")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "timecard" ? "bg-gray-100 text-[#2C2C2C]" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FileText size={16} />
                  Timecard
                </button>
                <button 
                  onClick={() => setActiveTab("timeline")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "timeline" ? "bg-gray-100 text-[#2C2C2C]" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <LayoutList size={16} />
                  Timeline
                </button>

                <label className="flex items-center gap-2 ml-8 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showOnlyUnapproved}
                    onChange={() => setShowOnlyUnapproved(!showOnlyUnapproved)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">Show only unapproved days</span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Add Time off
                </button>
                <button className="px-4 py-2 border border-red-200 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">
                  Reject All
                </button>
                <button className="px-4 py-2 bg-[#F7D046] text-[#2C2C2C] text-sm font-medium rounded-lg hover:bg-[#E5C03E] transition-colors">
                  Approve All
                </button>
              </div>
            </div>
          </div>

          {/* Timecard Table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date ↑</th>
                  {editingId ? (
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-full">Timeline Editor</th>
                  ) : (
                    <>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Checkin</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Checkout</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Meal break</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Work hours</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Overtime</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Double</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  editingId === entry.id ? (
                    /* EDIT MODE ROW */
                    <tr key={entry.id} className="border-b border-gray-50">
                      <td className="px-4 py-4 align-top w-40 border-r border-gray-100">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-[#2C2C2C]">{entry.dayOfWeek}, {entry.date.split(' ')[0]} {entry.date.split(' ')[1]}</span>
                          <span className="text-xs text-gray-500">Work: {entry.workHours}hr • Meal break: {entry.mealBreak.hours}hr</span>
                        </div>
                      </td>
                      <td colSpan={8} className="px-0 py-0">
                        <div className="relative h-24 bg-white">
                          {/* Time Scale */}
                          <div className="flex border-b border-gray-100">
                            {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                              <div key={hour} className="flex-1 h-8 border-r border-gray-50 text-[10px] text-gray-400 p-1">
                                {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                              </div>
                            ))}
                          </div>

                          {/* Timeline Blocks */}
                          <div className="relative h-16 pt-3 px-2">
                             {/* Work Block (Start) */}
                             <div className="absolute top-3 left-[9%] w-[25%] h-10 bg-white border-l-4 border-[#F7D046] pl-2 flex flex-col justify-center z-10">
                                <span className="text-xs font-bold text-[#2C2C2C]">09:00 AM</span>
                                <span className="text-[10px] text-gray-400">.......</span>
                             </div>

                             {/* Work Block (End) */}
                             <div className="absolute top-3 right-[9%] w-[25%] h-10 bg-white border-r-4 border-[#2C2C2C] pr-2 flex flex-col items-end justify-center z-10 text-right">
                                <span className="text-xs font-bold text-[#2C2C2C]">09:00 PM</span>
                                <span className="text-[10px] text-gray-400">.......</span>
                             </div>

                             {/* Break Block */}
                             <div className="absolute top-2 left-[55%] w-[8%] h-12 bg-[url('https://ui-avatars.com/api/?name=X&background=F3F4F6&color=D1D5DB&length=1')] bg-repeat opacity-50 border border-gray-200 flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-600 bg-white px-1">Break</span>
                             </div>

                             {/* Overtime Badge */}
                             {entry.overtime && (
                                <div className="absolute top-4 right-4 bg-orange-50 text-orange-500 px-3 py-1 rounded-full text-xs font-medium border border-orange-100 flex items-center gap-1">
                                  <Clock size={12} />
                                  Overtime
                                </div>
                             )}

                             {/* Actions */}
                             <div className="absolute top-4 right-32 flex gap-2">
                                <button className="w-8 h-8 rounded-full border border-green-200 text-green-600 flex items-center justify-center hover:bg-green-50">
                                  <Check size={16} />
                                </button>
                                <button className="w-8 h-8 rounded-full border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50" onClick={() => setEditingId(null)}>
                                  <X size={16} />
                                </button>
                                <button className="w-8 h-8 rounded-full bg-[#2C2C2C] text-white flex items-center justify-center hover:bg-black">
                                  <Edit2 size={14} />
                                </button>
                             </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                  entry.status === "timeoff" && entry.timeoffInfo ? (
                    <tr key={entry.id} className="border-b border-gray-50 bg-orange-50/30">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">{entry.dayOfWeek}</span>
                          <span className="text-sm text-[#2C2C2C]">{entry.date}</span>
                        </div>
                      </td>
                      <td colSpan={7} className="px-4 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs font-medium">
                            R
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-orange-100 rounded text-xs font-medium text-orange-600">Timeoff</span>
                              <span className="text-sm text-gray-500">Approved by {entry.timeoffInfo.approvedBy}</span>
                            </div>
                          </div>
                          <div className="ml-8">
                            <p className="text-xs text-gray-400">Type</p>
                            <p className="text-sm text-[#2C2C2C]">{entry.timeoffInfo.type}</p>
                          </div>
                          <div className="ml-8">
                            <p className="text-xs text-gray-400">Approved on</p>
                            <p className="text-sm text-[#2C2C2C]">{entry.timeoffInfo.approvedOn}</p>
                          </div>
                          <div className="ml-8">
                            <p className="text-xs text-gray-400">Duration</p>
                            <p className="text-sm text-[#2C2C2C]">{entry.timeoffInfo.duration} hrs</p>
                          </div>
                          <button className="ml-auto text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2">
                            View Note
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                         {/* Empty for edit column consistency if needed */}
                      </td>
                    </tr>
                  ) : (
                    <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">{entry.dayOfWeek}</span>
                          <span className="text-sm text-[#2C2C2C]">{entry.date}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#2C2C2C]">{entry.checkin || "-"}</td>
                      <td className="px-4 py-4 text-sm text-gray-400">---- {entry.checkout || "-"}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-[#F7D046]">
                          <span className="text-sm font-medium">🍴 {entry.mealBreak.hours}.00 hrs</span>
                        </div>
                        <p className="text-xs text-gray-400">{entry.mealBreak.time}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#2C2C2C]">{entry.workHours}.00 hrs</td>
                      <td className="px-4 py-4 text-sm text-[#2C2C2C]">{entry.overtime !== null ? `${entry.overtime}.00 hrs` : "N/A"}</td>
                      <td className="px-4 py-4 text-sm text-[#2C2C2C]">{entry.double || "N/A"}</td>
                      <td className="px-4 py-4">
                        <Edit2 size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {entry.status === "pending" ? (
                            <>
                              <button className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition-colors">
                                <Check size={14} className="text-green-600" />
                              </button>
                              <button className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors">
                                <X size={14} className="text-red-500" />
                              </button>
                            </>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <Check size={12} />
                              Approved
                            </span>
                          )}
                          <button 
                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors ml-1"
                            onClick={() => setEditingId(entry.id)}
                          >
                            <Edit2 size={12} className="text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
