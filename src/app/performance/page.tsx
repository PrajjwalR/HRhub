"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  ChevronRight,
  Loader2,
  PlusCircle,
  BarChart3,
  CalendarDays,
  Target
} from "lucide-react";

interface AppraisalCycle {
  name: string;
  cycle_name: string;
  start_date: string;
  end_date: string;
  status?: string; // Optional since it's not returned by the API
}

interface Appraisal {
  name: string;
  employee: string;
  employee_name: string;
  appraisal_cycle: string;
  status?: string; // Optional since it's not returned by the API
  total_score: number;
}

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white">
          <h3 className="text-xl font-serif text-[#2C2C2C]">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <Plus className="rotate-45 text-gray-400" size={20} />
          </button>
        </div>
        <div className="p-8 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function PerformanceDashboard() {
  const [activeTab, setActiveTab] = useState("cycles");
  const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [cycleForm, setCycleForm] = useState({ cycle_name: "", start_date: "", end_date: "", company: "Test-Prajjwal" });
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/performance");
      if (!res.ok) throw new Error("Failed to fetch performance data");
      const data = await res.json();
      setCycles(data.cycles || []);
      setAppraisals(data.appraisals || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      // Ensure dates are in YYYY-MM-DD format for Frappe
      const formattedData = {
        ...cycleForm,
        start_date: cycleForm.start_date, // Already in YYYY-MM-DD from date input
        end_date: cycleForm.end_date
      };
      
      const res = await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "cycle", data: formattedData })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create appraisal cycle");
      }
      
      setIsCycleModalOpen(false);
      setCycleForm({ cycle_name: "", start_date: "", end_date: "", company: "Test-Prajjwal" });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitiateAppraisals = async () => {
    if (!cycles.length) {
      alert("Please create an appraisal cycle first.");
      return;
    }

    const cycleToUse = selectedCycle || cycles[0].name;
    
    if (!confirm(`Generate individual appraisal records for all employees using cycle "${cycleToUse}"?`)) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "initiate_appraisals", 
          data: { cycle_name: cycleToUse } 
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to initiate appraisals");
      }

      alert("Appraisal initiation triggered! This might take a few moments to process on the server.");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status ? status.toLowerCase() : "";
    if (s.includes("active") || s.includes("completed") || s.includes("published")) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (s.includes("draft") || s.includes("pending") || s.includes("inprogress")) return "bg-amber-50 text-amber-600 border-amber-100";
    return "bg-gray-50 text-gray-600 border-gray-100";
  };

  return (
    <div className="px-8 py-6 bg-[#FAFAFA] min-h-screen">
      <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-[25px] font-serif text-[#2C2C2C]">Performance Management</h1>
          <p className="text-gray-500 mt-1">Track employee growth and appraisal cycles</p>
        </div>
        <button 
          onClick={() => setIsCycleModalOpen(true)}
          className="bg-[#2C2C2C] text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-[#404040] transition-all shadow-lg shadow-black/5 font-bold text-sm"
        >
          <PlusCircle size={18} />
          New Appraisal Cycle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 max-w-7xl mx-auto">
        {[
          { label: "Active Cycles", value: cycles.filter(c => c.status === "Active").length, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Appraisals", value: appraisals.length, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Completion Rate", value: "0%", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending Goals", value: 0, icon: Target, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <h4 className="text-2xl font-black text-[#2C2C2C] mt-0.5">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden max-w-7xl mx-auto">
        <div className="px-10 py-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 p-1 bg-gray-50/80 rounded-2xl border border-gray-100/50 w-fit">
            {[
              { id: "cycles", label: "Appraisal Cycles", icon: Calendar },
              { id: "appraisals", label: "Employee Appraisals", icon: Users },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id 
                    ? "bg-white text-[#2C2C2C] shadow-sm ring-1 ring-black/5" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF8C42] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search records..." 
                className="pl-12 pr-6 py-3 bg-gray-50/80 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white focus:border-[#FF8C42]/20 transition-all text-sm w-full md:w-64 placeholder:text-gray-400 font-medium"
              />
            </div>
            <button className="p-3 bg-gray-50/80 hover:bg-white border border-transparent hover:border-gray-100 rounded-2xl transition-all text-gray-500 hover:text-[#2C2C2C]">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-100 border-t-[#FF8C42] rounded-full animate-spin" />
                <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#FF8C42] animate-pulse" size={20} />
              </div>
              <p className="text-gray-400 font-medium animate-pulse">Synchronizing performance data...</p>
            </div>
          ) : activeTab === "cycles" ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/30">
                  <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cycle Name</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Period</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cycles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300">
                          <BarChart3 size={32} />
                        </div>
                        <p className="text-gray-400 font-medium">No appraisal cycles found. Create one to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : cycles.map((cycle) => (
                  <tr key={cycle.name} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#2C2C2C]">{cycle.cycle_name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5 tracking-tight">{cycle.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm text-gray-500 font-medium tracking-tight">
                      {new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(cycle.status || "Not Started")}`}>
                        {cycle.status || "Not Started"}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button className="p-2 text-gray-400 hover:text-[#2C2C2C] hover:bg-gray-100 rounded-xl transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/30">
                  <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cycle</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Score</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appraisals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300">
                          <Users size={32} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-400 font-medium">No employee appraisals found.</p>
                          <p className="text-xs text-gray-400">Select a cycle and generate individual records for each employee.</p>
                        </div>
                        
                        {cycles.length > 0 ? (
                          <div className="flex flex-col items-center gap-4 mt-4">
                            <select 
                              value={selectedCycle || cycles[0].name}
                              onChange={(e) => setSelectedCycle(e.target.value)}
                              className="bg-white border-2 border-gray-100 rounded-2xl px-6 py-3 text-sm font-bold text-[#2C2C2C] focus:outline-none focus:border-[#FF8C42] transition-colors shadow-sm"
                            >
                              {cycles.map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.cycle_name}
                                </option>
                              ))}
                            </select>
                            
                            <button 
                              onClick={handleInitiateAppraisals}
                              disabled={isSubmitting}
                              className="bg-[#FF8C42] hover:bg-[#F27A2E] disabled:bg-gray-200 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#FF8C42]/20 hover:shadow-[#FF8C42]/40 transition-all flex items-center gap-3 active:scale-95"
                            >
                              {isSubmitting ? (
                                <Loader2 className="animate-spin" size={18} />
                              ) : (
                                <PlusCircle size={18} />
                              )}
                              Initiate {cycles.find(c => c.name === (selectedCycle || cycles[0].name))?.cycle_name || "Appraisals"} Now
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-amber-500 font-medium bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100 mt-4">
                            Please create an Appraisal Cycle first to begin.
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : appraisals.map((appraisal) => (
                  <tr key={appraisal.name} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs">
                          {appraisal.employee_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#2C2C2C]">{appraisal.employee_name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{appraisal.employee}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm text-gray-500 font-medium">
                      {appraisal.appraisal_cycle}
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-4 border-emerald-50 text-emerald-600 font-black text-xs">
                        {appraisal.total_score || 0}
                      </div>
                    </td>
                    <td className="px-6 py-6 font-bold">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(appraisal.status || "Draft")}`}>
                        {appraisal.status || "Draft"}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button className="bg-gray-50 hover:bg-[#2C2C2C] text-gray-400 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isCycleModalOpen} 
        onClose={() => setIsCycleModalOpen(false)} 
        title="Create Appraisal Cycle"
      >
        <form onSubmit={handleCreateCycle} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Cycle Title</label>
            <input 
              required
              type="text" 
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="e.g. Annual Appraisal 2026"
              value={cycleForm.cycle_name}
              onChange={e => setCycleForm({...cycleForm, cycle_name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Start Date</label>
              <input 
                required
                type="date"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
                value={cycleForm.start_date}
                onChange={e => setCycleForm({...cycleForm, start_date: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">End Date</label>
              <input 
                required
                type="date"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
                value={cycleForm.end_date}
                onChange={e => setCycleForm({...cycleForm, end_date: e.target.value})}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#FF8C42] hover:bg-[#F27A2E] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#FF8C42]/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={16} />}
            Create Cycle
          </button>
        </form>
      </Modal>
    </div>
  );
}
