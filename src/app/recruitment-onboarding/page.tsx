"use client";

import React, { useState, useEffect } from "react";
import { 
  UserPlus, 
  Briefcase, 
  Users, 
  Clock, 
  CheckCircle, 
  Search, 
  ChevronRight,
  ClipboardList,
  Calendar,
  Filter,
  Plus,
  X as CloseIcon,
  Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-xl font-serif text-[#2C2C2C]">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <CloseIcon size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

interface JobOpening {
  name: string;
  job_title: string;
  status: string;
  department: string;
  designation: string;
  posting_date: string;
}

interface JobApplicant {
  name: string;
  applicant_name: string;
  status: string;
  job_title: string;
  email_id: string;
}

interface OnboardingProcess {
  name: string;
  employee_name: string;
  status: string;
  boarding_status: string;
  date_of_joining: string;
}

export default function RecruitmentOnboardingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"recruitment" | "onboarding">("recruitment");
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingProcess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Form States
  const [openingForm, setOpeningForm] = useState({ job_title: "", designation: "Engineer", company: "Test-Prajjwal" });
  const [applicantForm, setApplicantForm] = useState({ applicant_name: "", email_id: "", job_title: "" });
  const [onboardingForm, setOnboardingForm] = useState({ job_applicant: "", employee_name: "", date_of_joining: "", company: "Test-Prajjwal", job_offer: "" });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [recruitmentRes, onboardingRes] = await Promise.all([
        fetch("/api/recruitment"),
        fetch("/api/onboarding")
      ]);

      if (!recruitmentRes.ok) console.error("Recruitment fetch failed");
      if (!onboardingRes.ok) console.error("Onboarding fetch failed");

      const recruitmentData = await recruitmentRes.json();
      const onboardingData = await onboardingRes.json();

      setOpenings(recruitmentData.openings || []);
      setApplicants(recruitmentData.applicants || []);
      setOnboarding(onboardingData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOpening = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "opening", data: openingForm })
      });
      if (!res.ok) throw new Error("Failed to create opening");
      setIsOpeningModalOpen(false);
      setOpeningForm({ job_title: "", designation: "", company: "" });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "applicant", data: applicantForm })
      });
      if (!res.ok) throw new Error("Failed to add applicant");
      setIsApplicantModalOpen(false);
      setApplicantForm({ applicant_name: "", email_id: "", job_title: "" });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: onboardingForm })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to start onboarding");
      }
      setIsOnboardingModalOpen(false);
      setOnboardingForm({ job_applicant: "", employee_name: "", date_of_joining: "", company: "Test-Prajjwal", job_offer: "" });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status ? status.toLowerCase() : "";
    if (s.includes("open") || s.includes("active") || s.includes("hired")) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (s.includes("pending") || s.includes("on hold") || s.includes("applied")) return "bg-amber-50 text-amber-600 border-amber-100";
    if (s.includes("rejected") || s.includes("closed")) return "bg-red-50 text-red-600 border-red-100";
    return "bg-gray-50 text-gray-600 border-gray-100";
  };

  return (
    <div className="px-8 py-6 bg-[#FAFAFA] min-h-screen">
      <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Recruitment & Onboarding</h1>
          <p className="text-gray-500 mt-1">Manage hiring pipelines and new employee transitions</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => activeTab === "recruitment" ? setIsOpeningModalOpen(true) : setIsOnboardingModalOpen(true)}
            className="flex items-center gap-2 bg-[#FF8C42] hover:bg-[#F07B30] text-white px-5 py-3 rounded-xl font-bold shadow-md transition-all text-sm uppercase tracking-wider"
          >
            <Plus size={18} />
            {activeTab === "recruitment" ? "Post New Opening" : "Initiate Onboarding"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Briefcase size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Job Openings</p>
                <h3 className="text-2xl font-bold text-[#2C2C2C]">{openings.length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Applicants</p>
                <h3 className="text-2xl font-bold text-[#2C2C2C]">{applicants.length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <UserPlus size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Onboarding</p>
                <h3 className="text-2xl font-bold text-[#2C2C2C]">{onboarding.filter(o => o.boarding_status !== "Completed").length}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("recruitment")}
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === "recruitment" 
              ? "border-[#FF8C42] text-[#FF8C42]" 
              : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Recruitment Hiring
          </button>
          <button
            onClick={() => setActiveTab("onboarding")}
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === "onboarding" 
              ? "border-[#FF8C42] text-[#FF8C42]" 
              : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Employee Onboarding
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm italic">
            Error: {error}
          </div>
        )}

        {/* Content Area */}
        {activeTab === "recruitment" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Job Openings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-sm uppercase tracking-wider font-bold">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-lg text-[#2C2C2C]">Job Openings</h2>
                <button onClick={() => setIsOpeningModalOpen(true)} className="flex items-center gap-1 text-[#FF8C42] hover:bg-orange-50 px-2 py-1 rounded-md transition-colors text-[10px]">
                  <Plus size={12} /> Add
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {isLoading ? (
                  [1, 2, 3].map(i => <div key={i} className="p-6 animate-pulse bg-gray-50/50 h-20"></div>)
                ) : openings.length > 0 ? (
                  openings.map(job => (
                    <div key={job.name} className="p-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between group cursor-pointer">
                      <div>
                        <p className="text-[#2C2C2C] group-hover:text-[#FF8C42] transition-colors">{job.job_title}</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium">{job.department} • {job.designation}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] border ${getStatusStyle(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-gray-400 italic">No active openings.</div>
                )}
              </div>
            </div>

            {/* Recent Applicants */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-sm uppercase tracking-wider font-bold">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-lg text-[#2C2C2C]">Recent Applicants</h2>
                <button onClick={() => setIsApplicantModalOpen(true)} className="flex items-center gap-1 text-[#FF8C42] hover:bg-orange-50 px-2 py-1 rounded-md transition-colors text-[10px]">
                   <Plus size={12} /> Add Applicant
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {isLoading ? (
                  [1, 2, 3].map(i => <div key={i} className="p-6 animate-pulse bg-gray-50/50 h-20"></div>)
                ) : applicants.length > 0 ? (
                  applicants.map(app => (
                    <div key={app.name} className="p-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 border border-gray-200 uppercase font-black text-xs shadow-sm">
                          {app.applicant_name ? app.applicant_name.charAt(0) : "A"}
                        </div>
                        <div>
                          <p className="text-[#2C2C2C] group-hover:text-[#FF8C42] transition-colors">{app.applicant_name}</p>
                          <p className="text-[10px] text-gray-400 mt-1 font-medium">{app.job_title}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] border ${getStatusStyle(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-gray-400 italic">No recent applicants.</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Onboarding Content */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-sm uppercase tracking-wider font-bold">
             <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-lg text-[#2C2C2C]">Employee Onboarding Status</h2>
                <div className="flex gap-4">
                   <button onClick={() => setIsOnboardingModalOpen(true)} className="flex items-center gap-2 text-[10px] bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-all border border-emerald-100">
                      <UserPlus size={14} /> Start Onboarding
                   </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">New Joiner</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">DOJ</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Boarding Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {isLoading ? (
                       [1, 2, 3].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="px-6 py-8"><div className="h-10 bg-gray-50 rounded-xl"></div></td>
                        </tr>
                      ))
                    ) : onboarding.length > 0 ? (
                      onboarding.map(proc => (
                        <tr key={proc.name} className="hover:bg-gray-50/50 transition-colors group">
                           <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center font-black text-sm border border-blue-100 uppercase shadow-sm">
                                {proc.employee_name ? proc.employee_name.charAt(0) : "E"}
                              </div>
                              <div>
                                <p className="text-[#2C2C2C] group-hover:text-[#FF8C42] transition-colors">{proc.employee_name || "New Hire"}</p>
                                <p className="text-[9px] text-gray-400 font-medium tracking-normal">ID: {proc.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center text-[11px] text-[#2C2C2C]">
                             {proc.date_of_joining || "TBD"}
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] border ${getStatusStyle(proc.boarding_status || proc.status)}`}>
                              {proc.boarding_status || proc.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                             <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight size={18} /></button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic lowercase font-medium tracking-normal">No active onboarding processes found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
          </div>
        )}
      </div>

      {/* --- Modals --- */}
      
      {/* Create Opening Modal */}
      <Modal isOpen={isOpeningModalOpen} onClose={() => setIsOpeningModalOpen(false)} title="Create New Job Opening">
        <form onSubmit={handleCreateOpening} className="space-y-6">
          <div className="space-y-1.5 transition-transform duration-300">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Job Title</label>
            <input 
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="e.g. Senior Product Designer"
              value={openingForm.job_title}
              onChange={e => setOpeningForm({...openingForm, job_title: e.target.value})}
            />
          </div>
          <div className="space-y-1.5 transition-transform duration-300">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Designation</label>
            <input 
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="e.g. Engineer, Designer, Manager"
              value={openingForm.designation}
              onChange={e => setOpeningForm({...openingForm, designation: e.target.value})}
            />
          </div>
          <div className="space-y-1.5 transition-transform duration-300">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Company</label>
            <input 
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="e.g. Test-Prajjwal"
              value={openingForm.company}
              onChange={e => setOpeningForm({...openingForm, company: e.target.value})}
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#FF8C42] hover:bg-[#F07B30] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={16} />}
            Post Job Opening
          </button>
        </form>
      </Modal>

      {/* Add Applicant Modal */}
      <Modal isOpen={isApplicantModalOpen} onClose={() => setIsApplicantModalOpen(false)} title="Add New Applicant">
        <form onSubmit={handleAddApplicant} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
            <input 
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="e.g. Jane Doe"
              value={applicantForm.applicant_name}
              onChange={e => setApplicantForm({...applicantForm, applicant_name: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email ID</label>
            <input 
              required
              type="email"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="jane@example.com"
              value={applicantForm.email_id}
              onChange={e => setApplicantForm({...applicantForm, email_id: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Applying For (Job Title)</label>
            <input 
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="e.g. Senior Designer"
              value={applicantForm.job_title}
              onChange={e => setApplicantForm({...applicantForm, job_title: e.target.value})}
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#FF8C42] hover:bg-[#F07B30] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={16} />}
            Save Applicant
          </button>
        </form>
      </Modal>

      {/* Start Onboarding Modal */}
      <Modal isOpen={isOnboardingModalOpen} onClose={() => setIsOnboardingModalOpen(false)} title="Start Employee Onboarding">
        <form onSubmit={handleStartOnboarding} className="space-y-6">
          <div className="space-y-1.5 transition-transform duration-300">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Employee Full Name</label>
            <input 
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="e.g. John Smith"
              value={onboardingForm.employee_name}
              onChange={e => setOnboardingForm({...onboardingForm, employee_name: e.target.value})}
            />
          </div>
          <div className="space-y-1.5 transition-transform duration-300">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Job Applicant ID</label>
            <input 
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="e.g. HR-APP-2026-00001"
              value={onboardingForm.job_applicant}
              onChange={e => setOnboardingForm({...onboardingForm, job_applicant: e.target.value})}
            />
          </div>
          <div className="space-y-1.5 transition-transform duration-300">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Job Offer ID (Mandatory)</label>
            <input 
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="e.g. JO-OFF-2026-00001"
              value={onboardingForm.job_offer}
              onChange={e => setOnboardingForm({...onboardingForm, job_offer: e.target.value})}
            />
          </div>
          <div className="space-y-1.5 transition-transform duration-300">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Date of Joining</label>
            <input 
              required
              type="date"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              value={onboardingForm.date_of_joining}
              onChange={e => setOnboardingForm({...onboardingForm, date_of_joining: e.target.value})}
            />
          </div>
          <p className="text-[10px] text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 italic">
            Note: Frappe requires a 'Job Offer' to be created and linked before starting onboarding. Ensure the applicant has an active Job Offer.
          </p>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={16} />}
            Initiate Onboarding Workflow
          </button>
        </form>
      </Modal>
    </div>
  );
}
