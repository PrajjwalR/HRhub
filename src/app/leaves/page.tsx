"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Calendar, FileText, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import LeaveCalendar from "@/components/LeaveCalendar";

interface Leave {
  name: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_leave_days: number;
  status: string;
  posting_date: string;
  reason: string;
  docstatus: number;
}

interface LeaveBalance {
  leave_type: string;
  total_leaves_allocated: number;
  unused_leaves: number;
}

export default function LeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [weeklyOff, setWeeklyOff] = useState("Sunday");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLeave, setExpandedLeave] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const empRes = await fetch(`/api/employees?user_id=${user.email}`);
        if (!empRes.ok) throw new Error("Failed to fetch employee profile");
        const empData = await empRes.json();
        
        if (!empData || empData.length === 0) {
          throw new Error("No employee profile found for this user in Frappe.");
        }
        
        const employeeId = empData[0].name;

        const [leavesRes, balancesRes, holidaysRes] = await Promise.all([
          fetch(`/api/leaves?employee=${employeeId}`),
          fetch(`/api/leave-allocation?employee=${employeeId}`),
          fetch(`/api/holidays?employee=${employeeId}`)
        ]);

        if (!leavesRes.ok || !balancesRes.ok) {
          throw new Error("Failed to fetch leave data");
        }

        const leavesData = await leavesRes.json();
        const balancesData = await balancesRes.json();
        
        setLeaves(Array.isArray(leavesData) ? leavesData : []);
        setBalances(Array.isArray(balancesData) ? balancesData : []);

        if (holidaysRes.ok) {
          const holidayData = await holidaysRes.json();
          setHolidays(holidayData.holidays || []);
          setWeeklyOff(holidayData.weekly_off || "Sunday");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel/delete this leave application?")) return;
    
    try {
      const res = await fetch(`/api/leaves?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel leave");
      }
      // Refresh data
      setLeaves(leaves.filter(l => l.name !== id));
      setExpandedLeave(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "pending": 
      case "open": return "bg-amber-50 text-amber-600 border-amber-100";
      case "rejected": return "bg-red-50 text-red-600 border-red-100";
      case "cancelled": return "bg-gray-50 text-gray-600 border-gray-100";
      default: return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return <CheckCircle size={14} />;
      case "pending":
      case "open": return <Clock size={14} />;
      case "rejected": return <XCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  // Helper to safely format dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="px-8 py-6 bg-[#FAFAFA] min-h-screen">
      <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-[25px] font-serif text-[#2C2C2C]">Leaves</h1>
          <p className="text-gray-500 mt-1">Manage your time off and leave balances</p>
        </div>
        <Link
          href="/leaves/new"
          className="flex items-center gap-2 px-6 py-3 bg-[#FF8C42] text-white font-bold rounded-xl shadow-lg hover:bg-[#e47d3a] transition-all transform hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Apply for Leave
        </Link>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
          {/* Left Column: Balances & Stats */}
          <div className="xl:col-span-1 flex flex-col gap-6">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse"></div>
              ))
            ) : balances.length > 0 ? (
              balances.map((balance, index) => {
                const taken = leaves
                  .filter(l => l.leave_type === balance.leave_type && l.status.toLowerCase() === 'approved')
                  .reduce((acc, curr) => acc + curr.total_leave_days, 0);
                const remaining = balance.total_leaves_allocated - taken;
                
                return (
                  <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
                    <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider flex justify-between">
                      {balance.leave_type}
                      {balance.leave_type === "Sick Leave" && (
                        <span className="text-[10px] normal-case bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                          1.5 days/mo
                        </span>
                      )}
                    </p>
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="text-3xl font-bold text-[#2C2C2C]">{remaining}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {balance.leave_type === "Sick Leave" 
                            ? `days available (${balance.total_leaves_allocated} accrued)` 
                            : "days remaining"}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[#FFF4EE] rounded-xl flex items-center justify-center text-[#FF8C42]">
                        <Calendar size={24} />
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden relative">
                      <div 
                        className="bg-[#FF8C42] h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(remaining / (balance.leave_type === "Sick Leave" ? 18 : balance.total_leaves_allocated)) * 100}%` }}
                      ></div>
                    </div>

                    {/* Accrual Info for Sick Leave */}
                    {balance.leave_type === "Sick Leave" && (
                      <div className="mt-2 text-[10px] text-gray-400 flex justify-between">
                         <span>Running Total: {balance.total_leaves_allocated} / 18</span>
                         <span>Next accrual: 1st of next month</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white p-8 border border-dashed border-gray-200 rounded-2xl text-center text-gray-500">
                No leave allocations found.
              </div>
            )}
          </div>

          {/* Right Column: Calendar View */}
          <div className="xl:col-span-2">
            <LeaveCalendar 
              leaves={leaves} 
              holidays={holidays}
              weeklyOff={weeklyOff}
            />
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#2C2C2C]">Recent Applications</h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 transition-all w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/4">Leave Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/4">Duration</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-12 text-center">Days</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-32 text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Applied On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  [1, 2, 3, 4].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4"><div className="h-8 bg-gray-50 rounded"></div></td>
                    </tr>
                  ))
                ) : leaves.length > 0 ? (
                  leaves.map((leave) => (
                    <React.Fragment key={leave.name}>
                      <tr 
                        className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${expandedLeave === leave.name ? 'bg-[#FF8C42]/5' : ''}`}
                        onClick={() => setExpandedLeave(expandedLeave === leave.name ? null : leave.name)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                              <FileText size={16} />
                            </div>
                            <span className="text-sm font-bold text-[#2C2C2C]">{leave.leave_type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 font-medium">
                            {formatDate(leave.from_date)} - {formatDate(leave.to_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-sm text-[#2C2C2C] text-center">{leave.total_leave_days}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getStatusStyle(leave.status)}`}>
                            {getStatusIcon(leave.status)}
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 text-right font-medium">
                          {formatDate(leave.posting_date)}
                        </td>
                      </tr>
                      {expandedLeave === leave.name && (
                        <tr className="bg-gray-50/30">
                          <td colSpan={5} className="px-8 py-6 border-l-4 border-[#FF8C42]">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                              <div className="flex-1">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Reason for Leave</h4>
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative italic text-gray-600 text-sm leading-relaxed">
                                  {leave.reason || "No reason specified for this application."}
                                </div>
                              </div>
                              
                              {(leave.status.toLowerCase() === "pending" || leave.status.toLowerCase() === "open") && (
                                <div className="flex items-center gap-3 self-end md:self-start">
                                  <Link
                                    href={`/leaves/edit/${leave.name}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-5 py-2.5 bg-white border border-gray-200 text-[#2C2C2C] text-xs font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm border-b-2 active:translate-y-0.5"
                                  >
                                    Edit Application
                                  </Link>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancel(leave.name);
                                    }}
                                    className="px-5 py-2.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-all border border-red-100 shadow-sm border-b-2 border-b-red-200 active:translate-y-0.5"
                                  >
                                    Cancel & Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                      No leave applications found. Apply for one to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
