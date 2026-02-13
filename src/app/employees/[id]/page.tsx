"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Hash, 
  ArrowLeft, 
  Monitor, 
  Loader2,
  Package,
  User,
  CreditCard,
  Landmark
} from "lucide-react";

interface EmployeeData {
  name: string;
  employee_name: string;
  designation: string;
  department: string;
  status: string;
  image?: string;
  user_id?: string;
  date_of_joining?: string;
  company?: string;
  cell_number?: string;
  personal_email?: string;
}

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "assets" | "bank">("overview");

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setIsLoading(true);
        // Fetch specific employee
        const empRes = await fetch(`/api/employees`); // Need to check if /api/employees supports name filter
        const emps = await empRes.json();
        const found = emps.find((e: any) => e.name === id);
        
        if (found) {
          setEmployee(found);
          
          // Fetch Assets and Bank Details
          const [assetsRes, bankRes] = await Promise.all([
            fetch(`/api/assets?employee=${id}`),
            fetch(`/api/bank-account?employee=${id}`)
          ]);
          
          if (assetsRes.ok) setAssets(await assetsRes.json());
          if (bankRes.ok) {
            const bData = await bankRes.json();
            setBankDetails(bData.bankAccount);
          }
        }
      } catch (error) {
        console.error("Error fetching employee details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchEmployeeData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FCFCFC]">
        <Loader2 className="animate-spin text-[#FF8C42]" size={40} />
        <p className="text-gray-400 font-serif italic">Loading dossier...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#FCFCFC]">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <User size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#2C2C2C] mb-2">Employee Not Found</h2>
        <button onClick={() => router.back()} className="text-[#FF8C42] font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFC] p-8 pb-20">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-[#FF8C42] font-bold text-xs uppercase tracking-widest transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to List
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="h-40 bg-gradient-to-r from-orange-50 to-emerald-50 relative">
            <div className="absolute -bottom-12 left-12">
              <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl">
                <div className="w-full h-full rounded-2xl bg-[#FF8C42] flex items-center justify-center text-white text-4xl font-serif font-black">
                  {employee.image ? (
                    <img src={employee.image} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    employee.employee_name.charAt(0)
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-16 pb-8 px-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-serif font-black text-[#2C2C2C] mb-1">{employee.employee_name}</h1>
              <div className="flex items-center gap-3 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                <span className="flex items-center gap-1"><Building size={12} /> {employee.department}</span>
                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                <span className="flex items-center gap-1">{employee.designation}</span>
              </div>
            </div>
            
            <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 shadow-inner">
              {[
                { id: "overview", label: "Overview", icon: User },
                { id: "assets", label: "Assets", icon: Package },
                { id: "bank", label: "Finance", icon: CreditCard }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[10px] transition-all uppercase tracking-widest ${
                    activeTab === tab.id 
                      ? "bg-white text-[#FF8C42] shadow-sm ring-1 ring-gray-100" 
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <tab.icon size={12} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-8">
              <h3 className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest border-b border-gray-50 pb-4">Personal Information</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Work Email</p>
                    <p className="text-sm font-bold text-[#2C2C2C]">{employee.user_id || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Contact Number</p>
                    <p className="text-sm font-bold text-[#2C2C2C]">{employee.cell_number || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-8">
              <h3 className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest border-b border-gray-50 pb-4">Employment Record</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Hash size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Employee ID</p>
                    <p className="text-sm font-bold text-[#2C2C2C]">{employee.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Date Joined</p>
                    <p className="text-sm font-bold text-[#2C2C2C]">{employee.date_of_joining || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "assets" && (
          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#2C2C2C] mb-8 flex items-center gap-3">
              <Package size={24} className="text-[#FF8C42]" />
              Assigned Inventory
            </h3>
            
            {assets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assets.map(asset => (
                  <div key={asset.name} className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 hover:border-blue-100 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm">
                        <Monitor size={20} className="text-gray-400" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        {asset.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#2C2C2C] text-sm mb-1">{asset.asset_name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{asset.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                <Package className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-400 font-serif italic italic">No company property assigned to this employee.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "bank" && (
          <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#2C2C2C] mb-8 flex items-center gap-3">
              <Landmark size={24} className="text-[#FF8C42]" />
              Financial Details
            </h3>
            
            {bankDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bank Name</p>
                  <p className="text-lg font-bold text-[#2C2C2C]">{bankDetails.bank}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Number</p>
                  <p className="text-lg font-bold text-[#2C2C2C]">****{bankDetails.bank_account_no?.slice(-4)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">IFSC / Branch Code</p>
                  <p className="text-lg font-bold text-[#2C2C2C]">{bankDetails.branch_code}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Branch</p>
                  <p className="text-lg font-bold text-[#2C2C2C]">{bankDetails.branch}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                <CreditCard className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-400 font-serif italic">No banking records found for this employee.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
