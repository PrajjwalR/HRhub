"use client";

import React, { useState, useEffect } from "react";
import { Users, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Search, FileText, Check, X, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LeaveCalendar from "@/components/LeaveCalendar";

interface TeamMember {
  name: string;
  employee_name: string;
  designation: string;
  department: string;
  status: string;
  image: string;
}

interface LeaveApplication {
  name: string;
  employee: string;
  employee_name: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_leave_days: number;
  status: string;
  posting_date: string;
  reason: string;
}

export default function TeamPage() {
  const { user } = useAuth();
  const [manager, setManager] = useState<any>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [weeklyOff, setWeeklyOff] = useState("Sunday");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("Open");
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        // Step 1: Get Manager Employee ID
        const empRes = await fetch(`/api/employees?user_id=${user.email}`);
        if (!empRes.ok) throw new Error("Failed to fetch employee profile");
        const empData = await empRes.json();
        
        if (!empData || empData.length === 0) {
          throw new Error("No employee profile found. Only employees can manage teams.");
        }
        
        const managerProfile = empData[0];
        setManager(managerProfile);

        // Step 2: Fetch Team, Team Leaves, and Holidays
        const [teamRes, teamLeavesRes, holidaysRes] = await Promise.all([
          fetch(`/api/team?manager_id=${managerProfile.name}`),
          fetch(`/api/team/leaves?manager_id=${managerProfile.name}`),
          fetch(`/api/holidays?employee=${managerProfile.name}`)
        ]);

        if (!teamRes.ok || !teamLeavesRes.ok) {
          throw new Error("Failed to fetch team data");
        }

        const teamData = await teamRes.json();
        const teamLeavesData = await teamLeavesRes.json();
        
        if (holidaysRes.ok) {
          const holidayData = await holidaysRes.json();
          setHolidays(holidayData.holidays || []);
          setWeeklyOff(holidayData.weekly_off || "Sunday");
        }

        setTeam(Array.isArray(teamData) ? teamData : []);
        setLeaves(Array.isArray(teamLeavesData) ? teamLeavesData : []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, [user]);

  const handleAction = async (leaveId: string, action: 'Approved' | 'Rejected') => {
    try {
      setProcessedIds(prev => new Set(prev).add(leaveId));
      
      const response = await fetch("/api/leaves", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leaveId,
          status: action
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action.toLowerCase()} leave`);
      }

      // Update local state
      setLeaves(leaves.map(l => l.name === leaveId ? { ...l, status: action } : l));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessedIds(prev => {
        const next = new Set(prev);
        next.delete(leaveId);
        return next;
      });
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "pending": 
      case "open": return "bg-amber-50 text-amber-600 border-amber-100";
      case "rejected": return "bg-red-50 text-red-600 border-red-100";
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const pendingLeaves = leaves.filter(l => l.status === "Open" || l.status === "Pending");
  const filteredLeaves = filterStatus === "All" ? leaves : leaves.filter(l => l.status === filterStatus);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#2C2C2C] mb-2">Access Restricted</h2>
        <p className="text-gray-500 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-6 bg-[#FAFAFA] min-h-screen">
      <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-[25px] font-serif text-[#2C2C2C]">Team Management</h1>
          <p className="text-gray-500 mt-1">Review and manage leave requests from your team</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                <h3 className="text-2xl font-bold text-[#2C2C2C]">{pendingLeaves.length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Team Size</p>
                <h3 className="text-2xl font-bold text-[#2C2C2C]">{team.length} Members</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">On Leave Today</p>
                <h3 className="text-2xl font-bold text-[#2C2C2C]">
                  {leaves.filter(l => {
                    const today = new Date().toISOString().split('T')[0];
                    return l.status === "Approved" && today >= l.from_date && today <= l.to_date;
                  }).length}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table & Calendar Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold text-[#2C2C2C]">Leave Applications</h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
                    {["Open", "Approved", "Rejected", "All"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                          filterStatus === status 
                          ? "bg-white text-[#FF8C42] shadow-sm" 
                          : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Applied On</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium text-sm">
                    {isLoading ? (
                      [1, 2, 3].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="px-6 py-8"><div className="h-10 bg-gray-50 rounded-xl"></div></td>
                        </tr>
                      ))
                    ) : filteredLeaves.length > 0 ? (
                      filteredLeaves.map((leave) => (
                        <tr key={leave.name} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border border-gray-200 uppercase font-bold text-[10px]">
                                {leave.employee_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-[#2C2C2C] text-xs">{leave.employee_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-gray-600">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#2C2C2C] text-xs">{leave.leave_type}</span>
                              <span className="text-[10px] text-gray-400">{formatDate(leave.from_date)} - {formatDate(leave.to_date)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center text-[11px] text-[#2C2C2C]">
                             {formatDate(leave.posting_date)}
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-widest ${getStatusStyle(leave.status)}`}>
                              {leave.status}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2">
                              {leave.status === "Open" || leave.status === "Pending" ? (
                                <>
                                  <button
                                    onClick={() => handleAction(leave.name, 'Approved')}
                                    disabled={processedIds.has(leave.name)}
                                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleAction(leave.name, 'Rejected')}
                                    disabled={processedIds.has(leave.name)}
                                    className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              ) : (
                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">Fixed</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                          No {filterStatus.toLowerCase()} applications.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
             <div className="sticky top-6 space-y-8">
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                 <h3 className="text-lg font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
                   <Calendar size={20} className="text-[#FF8C42]" />
                   Team Calendar
                 </h3>
                 <div className="scale-90 origin-top">
                   <LeaveCalendar 
                     leaves={leaves.filter(l => l.status === "Approved" || l.status === "Open")} 
                     holidays={holidays}
                     weeklyOff={weeklyOff}
                   />
                 </div>
                 <div className="mt-4 pt-4 border-t border-gray-50">
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#FF8C42]"></div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Leave</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Holiday</span>
                      </div>
                    </div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Team Members List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-xl font-bold text-[#2C2C2C]">Your Team ({team.length})</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse"></div>
              ))
            ) : team.length > 0 ? (
              team.map((member) => (
                <div key={member.name} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-[#FF8C42]/30 transition-all group">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 uppercase font-bold text-sm shadow-sm">
                    {member.image ? <img src={member.image} alt="" className="w-full h-full object-cover rounded-xl" /> : member.employee_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#2C2C2C] truncate group-hover:text-[#FF8C42] transition-colors">{member.employee_name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{member.designation || member.department || "No Designation"}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-gray-400 italic">
                You don't have any direct reports assigned in Frappe yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
