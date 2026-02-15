"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  FileText, 
  Calculator, 
  ClipboardList, 
  PlusCircle, 
  Search, 
  Filter, 
  Loader2,
  CalendarDays,
  ChevronRight,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

interface TaxSlab {
  name: string;
  effective_from: string;
  currency: string;
  allow_tax_exemption: number;
}

interface TaxDeclaration {
  name: string;
  employee: string;
  employee_name: string;
  payroll_period: string;
  company: string;
  total_exemption_amount: number;
}

interface TaxProof {
  name: string;
  employee: string;
  employee_name: string;
  payroll_period: string;
  company: string;
  total_actual_amount: number;
  status: string;
}

interface PayrollPeriod {
  name: string;
  start_date: string;
  end_date: string;
}

export default function TaxCompliancePage() {
  const [activeTab, setActiveTab] = useState("slabs");
  const [slabs, setSlabs] = useState<TaxSlab[]>([]);
  const [declarations, setDeclarations] = useState<TaxDeclaration[]>([]);
  const [proofs, setProofs] = useState<TaxProof[]>([]);
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [slabsRes, declsRes, proofsRes, periodsRes] = await Promise.all([
        fetch("/api/tax-compliance?type=slabs").then(res => res.json()),
        fetch("/api/tax-compliance?type=declarations").then(res => res.json()),
        fetch("/api/tax-compliance?type=proofs").then(res => res.json()),
        fetch("/api/tax-compliance?type=periods").then(res => res.json())
      ]);

      if (slabsRes.error || declsRes.error || proofsRes.error || periodsRes.error) {
        throw new Error("One or more requests failed");
      }

      setSlabs(slabsRes);
      setDeclarations(declsRes);
      setProofs(proofsRes);
      setPeriods(periodsRes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusStyle = (status: string) => {
    const s = status ? status.toLowerCase() : "";
    if (s.includes("approved") || s.includes("verified")) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (s.includes("pending") || s.includes("submitted")) return "bg-amber-50 text-amber-600 border-amber-100";
    if (s.includes("rejected")) return "bg-red-50 text-red-600 border-red-100";
    return "bg-gray-50 text-gray-600 border-gray-100";
  };

  return (
    <div className="px-8 py-6 bg-[#FAFAFA] min-h-screen">
      <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-[25px] font-serif text-[#2C2C2C]">Tax & Compliance</h1>
          <p className="text-gray-500 mt-1">Manage tax slabs, employee declarations, and proof submissions</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-[#2C2C2C] px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-gray-50 transition-all border border-gray-100 shadow-sm font-bold text-sm">
            <Download size={18} />
            Export Reports
          </button>
          <button className="bg-[#2C2C2C] text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-[#404040] transition-all shadow-lg shadow-black/5 font-bold text-sm">
            <PlusCircle size={18} />
            New Setup
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 max-w-7xl mx-auto">
        {[
          { label: "Active Slabs", value: slabs.length, icon: Calculator, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pending Declarations", value: declarations.length, icon: ClipboardList, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Verified Proofs", value: proofs.filter(p => p.status === "Approved").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Alerts", value: 0, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
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
              { id: "slabs", label: "Tax Slabs", icon: Calculator },
              { id: "declarations", label: "Declarations", icon: ClipboardList },
              { id: "proofs", label: "Proof Submissions", icon: FileText },
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
                placeholder="Search..." 
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
              <p className="text-gray-400 font-medium animate-pulse">Fetching tax data from Frappe...</p>
            </div>
          ) : activeTab === "slabs" ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/30">
                  <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Effective Date</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Currency</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Allow Exemption</th>
                  <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {slabs.length === 0 ? (
                  <tr><td colSpan={4} className="px-10 py-20 text-center text-gray-400">No tax slabs found.</td></tr>
                ) : slabs.map((slab) => (
                  <tr key={slab.name} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <CalendarDays size={18} />
                        </div>
                        <p className="text-sm font-bold text-[#2C2C2C]">{new Date(slab.effective_from).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm text-gray-500 font-medium">{slab.currency}</td>
                    <td className="px-6 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${slab.allow_tax_exemption ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-50 text-gray-600 border-gray-100"}`}>
                        {slab.allow_tax_exemption ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button className="text-sm font-bold text-[#FF8C42] hover:underline flex items-center gap-1 ml-auto">
                        View Details <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === "declarations" ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/30">
                  <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payroll Period</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total Declared</th>
                  <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {declarations.length === 0 ? (
                  <tr><td colSpan={4} className="px-10 py-20 text-center text-gray-400">No declarations found.</td></tr>
                ) : declarations.map((decl) => (
                  <tr key={decl.name} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-10 py-6 text-sm font-bold text-[#2C2C2C]">{decl.employee_name} ({decl.employee})</td>
                    <td className="px-6 py-6 text-sm text-gray-500 font-medium">{decl.payroll_period}</td>
                    <td className="px-6 py-6 text-sm font-black text-right text-[#2C2C2C]">{formatCurrency(decl.total_exemption_amount)}</td>
                    <td className="px-10 py-6 text-right">
                      <button className="text-sm font-bold text-[#FF8C42] hover:underline flex items-center gap-1 ml-auto">
                        Edit <ChevronRight size={14} />
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
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payroll Period</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actual Amount</th>
                  <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {proofs.length === 0 ? (
                  <tr><td colSpan={5} className="px-10 py-20 text-center text-gray-400">No proof submissions found.</td></tr>
                ) : proofs.map((proof) => (
                  <tr key={proof.name} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-10 py-6 text-sm font-bold text-[#2C2C2C]">{proof.employee_name}</td>
                    <td className="px-6 py-6 text-sm text-gray-500 font-medium">{proof.payroll_period}</td>
                    <td className="px-6 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(proof.status)}`}>
                        {proof.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-sm font-black text-right text-[#2C2C2C]">{formatCurrency(proof.total_actual_amount)}</td>
                    <td className="px-10 py-6 text-right">
                      <button className="bg-gray-50 hover:bg-[#2C2C2C] text-gray-400 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        Validate Proof
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
