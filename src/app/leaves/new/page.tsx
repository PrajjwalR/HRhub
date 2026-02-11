"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Calendar, Info, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface LeaveType {
  name: string;
  is_lwp: number;
}

export default function NewLeavePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [weeklyOff, setWeeklyOff] = useState("Sunday");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    leave_type: "",
    from_date: "",
    to_date: "",
    reason: "",
    half_day: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        // Step 1: Get Employee ID
        const empRes = await fetch(`/api/employees?user_id=${user.email}`);
        if (!empRes.ok) throw new Error("Failed to fetch employee profile");
        const empData = await empRes.json();
        if (!empData || empData.length === 0) return;
        const employeeId = empData[0].name;

        // Step 2: Fetch Leave Types and Holidays
        const [typesRes, holidaysRes] = await Promise.all([
          fetch("/api/leave-types"),
          fetch(`/api/holidays?employee=${employeeId}`)
        ]);

        if (!typesRes.ok) throw new Error("Failed to fetch leave types");
        const typesData = await typesRes.json();
        setLeaveTypes(typesData);

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

  const calculateDuration = () => {
    if (!formData.from_date || !formData.to_date) return 0;
    
    const [startY, startM, startD] = formData.from_date.split('-').map(Number);
    const [endY, endM, endD] = formData.to_date.split('-').map(Number);
    
    const start = new Date(startY, startM - 1, startD);
    const end = new Date(endY, endM - 1, endD);
    
    if (end < start) return 0;

    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      
      const dayName = current.toLocaleDateString('en-US', { weekday: 'long' });
      
      const isHoliday = holidays.some(h => h.holiday_date === dateStr);
      const isWeeklyOff = dayName === weeklyOff;

      if (!isHoliday && !isWeeklyOff) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return formData.half_day ? count * 0.5 : count;
  };

  const isHoliday = (dateStr: string) => {
    if (!dateStr) return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    return holidays.some(h => h.holiday_date === dateStr) || dayName === weeklyOff;
  };

  const duration = calculateDuration();
  const fromIsHoliday = isHoliday(formData.from_date);
  const toIsHoliday = isHoliday(formData.to_date);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (duration <= 0) {
      setError("Total leave duration cannot be 0 days. Please select valid working days.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Step 1: Fetch the Employee ID based on the logged-in user's email
      const empRes = await fetch(`/api/employees?user_id=${user.email}`);
      if (!empRes.ok) throw new Error("Failed to verify employee profile");
      const empData = await empRes.json();
      
      if (!empData || empData.length === 0) {
        throw new Error("No employee profile found for this user. Cannot submit leave.");
      }
      
      const employeeId = empData[0].name;

      // Step 2: Submit the leave application
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          employee: employeeId,
          half_day: formData.half_day ? 1 : 0,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit leave application");
      }

      router.push("/leaves");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-8 py-6 bg-[#FAFAFA] min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/leaves" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#2C2C2C] mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back to Leaves
        </Link>

        <h1 className="text-3xl font-serif text-[#2C2C2C] mb-2">New Leave Application</h1>
        <p className="text-gray-500 mb-8">Fill in the details below to request time off.</p>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3">
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            {/* Leave Type */}
            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-2 uppercase tracking-wider">Leave Type</label>
              <select
                required
                value={formData.leave_type}
                onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 transition-all text-[#2C2C2C]"
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((type) => (
                  <option key={type.name} value={type.name}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              <div>
                <label className="block text-sm font-bold text-[#2C2C2C] mb-2 uppercase tracking-wider">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    required
                    value={formData.from_date}
                    onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-[#2C2C2C] ${
                      fromIsHoliday ? 'border-amber-200 focus:ring-amber-200' : 'border-gray-100 focus:ring-[#FF8C42]/20'
                    }`}
                  />
                </div>
                {fromIsHoliday && (
                  <p className="mt-2 text-[11px] text-amber-600 font-bold flex items-center gap-1 uppercase tracking-wider">
                    <AlertTriangle size={12} /> This date is a holiday/weekly off
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-[#2C2C2C] mb-2 uppercase tracking-wider">To Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    required
                    value={formData.to_date}
                    onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-[#2C2C2C] ${
                      toIsHoliday ? 'border-amber-200 focus:ring-amber-200' : 'border-gray-100 focus:ring-[#FF8C42]/20'
                    }`}
                  />
                </div>
                {toIsHoliday && (
                  <p className="mt-2 text-[11px] text-amber-600 font-bold flex items-center gap-1 uppercase tracking-wider">
                    <AlertTriangle size={12} /> This date is a holiday/weekly off
                  </p>
                )}
              </div>
            </div>

            {formData.from_date && formData.to_date && (
              <div className={`p-4 rounded-xl flex items-center justify-between border ${
                duration === 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Leave Duration</span>
                  <span className={`text-xl font-bold ${duration === 0 ? 'text-red-600' : 'text-[#2C2C2C]'}`}>
                    {duration} {duration === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-medium">Auto-skipping {weeklyOff}s and Holidays</p>
                  {duration === 0 && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter mt-1">Invalid Selection</p>
                  )}
                </div>
              </div>
            )}

            {/* Half Day & Reason */}
            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="half_day"
                checked={formData.half_day}
                onChange={(e) => setFormData({ ...formData, half_day: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-[#FF8C42] focus:ring-[#FF8C42]"
              />
              <label htmlFor="half_day" className="text-sm font-medium text-[#2C2C2C]">This is a half-day leave</label>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2C2C2C] mb-2 uppercase tracking-wider">Reason</label>
              <textarea
                rows={4}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Briefly explain the reason for your time off..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 transition-all text-[#2C2C2C] placeholder:text-gray-400"
              ></textarea>
            </div>
          </div>

          <div className="bg-[#FFF4EE] p-6 rounded-2xl border border-[#FF8C42]/10 flex items-start gap-4">
            <div className="w-10 h-10 bg-[#FF8C42] rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <Info size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#2C2C2C] mb-1">Before you submit</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ensure you have enough leave balance for the requested period. Applications are sent to your manager for approval and will be reflected once approved.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pb-12">
            <Link
              href="/leaves"
              className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-10 py-3 bg-[#FF8C42] text-white font-bold rounded-xl shadow-lg hover:bg-[#e47d3a] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save size={18} />
              )}
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
