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
  Loader2,
  FileText
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

interface JobOffer {
  name: string;
  applicant_name: string;
  offer_date: string;
  designation: string;
  status: string;
  job_applicant: string;
}

export default function RecruitmentOnboardingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"recruitment" | "onboarding" | "offers">("recruitment");
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingProcess[]>([]);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editApplicantName, setEditApplicantName] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newId, setNewId] = useState("");

  // Form States
  const [openingForm, setOpeningForm] = useState({ job_title: "", designation: "Engineer", company: "Test-Prajjwal" });
  const [applicantForm, setApplicantForm] = useState({ applicant_name: "", email_id: "", job_title: "" });
  const [onboardingForm, setOnboardingForm] = useState({ job_applicant: "", employee_name: "", date_of_joining: "", company: "Test-Prajjwal", job_offer: "" });
  const [offerForm, setOfferForm] = useState({ job_applicant: "", applicant_name: "", offer_date: "", designation: "Engineer", company: "Test-Prajjwal" });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [recruitmentRes, onboardingRes, offersRes] = await Promise.all([
        fetch("/api/recruitment"),
        fetch("/api/onboarding"),
        fetch("/api/offers")
      ]);

      if (!recruitmentRes.ok) console.error("Recruitment fetch failed");
      if (!onboardingRes.ok) console.error("Onboarding fetch failed");

      const recruitmentData = await recruitmentRes.json();
      const onboardingData = await onboardingRes.json();
      const offersData = await offersRes.json();

      setOpenings(recruitmentData.openings || []);
      setApplicants(recruitmentData.applicants || []);
      setOnboarding(onboardingData || []);
      setOffers(offersData || []);
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
      const method = editApplicantName ? "PUT" : "POST";
      const body = editApplicantName 
        ? { type: "applicant", name: editApplicantName, data: applicantForm }
        : { type: "applicant", data: applicantForm };

      const res = await fetch("/api/recruitment", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Failed to ${editApplicantName ? 'update' : 'add'} applicant`);
      setIsApplicantModalOpen(false);
      setEditApplicantName(null);
      setApplicantForm({ applicant_name: "", email_id: "", job_title: "" });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditApplicantClick = (app: JobApplicant) => {
    setEditApplicantName(app.name);
    setNewId(app.name);
    setApplicantForm({
      applicant_name: app.applicant_name,
      email_id: app.email_id,
      job_title: app.job_title
    });
    setIsApplicantModalOpen(true);
    setIsRenaming(false);
  };

  const handleRenameApplicant = async () => {
    if (!editApplicantName || !newId || editApplicantName === newId) return;
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/recruitment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "applicant", 
          oldName: editApplicantName, 
          newName: newId 
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to rename applicant ID");
      }
      setEditApplicantName(newId);
      setIsRenaming(false);
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

  const handleIssueOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: offerForm })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to issue offer");
      }
      setIsOfferModalOpen(false);
      setOfferForm({ job_applicant: "", applicant_name: "", offer_date: "", designation: "Engineer", company: "Test-Prajjwal" });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status ? status.toLowerCase() : "";
    if (s.includes("open") || s.includes("active") || s.includes("hired") || s.includes("accepted")) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (s.includes("pending") || s.includes("on hold") || s.includes("applied") || s.includes("issued")) return "bg-amber-50 text-amber-600 border-amber-100";
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
            onClick={() => {
              if (activeTab === "recruitment") setIsOpeningModalOpen(true);
              else if (activeTab === "onboarding") setIsOnboardingModalOpen(true);
              else setIsOfferModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#FF8C42] hover:bg-[#F07B30] text-white px-5 py-3 rounded-xl font-bold shadow-md transition-all text-sm uppercase tracking-wider"
          >
            <Plus size={18} />
            {activeTab === "recruitment" ? "Post New Opening" : activeTab === "onboarding" ? "Initiate Onboarding" : "Issue Offer Letter"}
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
          <button
            onClick={() => setActiveTab("offers")}
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === "offers" 
              ? "border-[#FF8C42] text-[#FF8C42]" 
              : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Offer Letters
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
                          <button 
                            onClick={() => handleEditApplicantClick(app)}
                            className="text-[#2C2C2C] group-hover:text-[#FF8C42] transition-colors text-left block w-full hover:underline"
                          >
                            {app.applicant_name}
                          </button>
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
        ) : activeTab === "onboarding" ? (
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
        ) : (
          /* Offer Letter Content */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-sm uppercase tracking-wider font-bold">
             <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-lg text-[#2C2C2C]">Job Offers Issued</h2>
                <div className="flex gap-4">
                   <button onClick={() => setIsOfferModalOpen(true)} className="flex items-center gap-2 text-[10px] bg-amber-50 text-amber-600 hover:bg-amber-100 px-3 py-2 rounded-lg transition-all border border-amber-100">
                      <FileText size={14} /> Issue New Offer
                   </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Applicant</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Designation</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Offer Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {isLoading ? (
                       [1, 2, 3].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-6 py-8"><div className="h-10 bg-gray-50 rounded-xl"></div></td>
                        </tr>
                      ))
                    ) : offers.length > 0 ? (
                      offers.map(offer => (
                        <tr key={offer.name} className="hover:bg-gray-50/50 transition-colors group">
                           <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center font-black text-sm border border-amber-100 uppercase shadow-sm">
                                {offer.applicant_name ? offer.applicant_name.charAt(0) : "A"}
                              </div>
                              <div>
                                <p className="text-[#2C2C2C] group-hover:text-[#FF8C42] transition-colors">{offer.applicant_name}</p>
                                <p className="text-[9px] text-gray-400 font-medium tracking-normal">ID: {offer.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center text-[11px] text-gray-500">
                             {offer.designation}
                          </td>
                          <td className="px-6 py-5 text-center text-[11px] text-[#2C2C2C]">
                             {offer.offer_date}
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] border ${getStatusStyle(offer.status)}`}>
                              {offer.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                             <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight size={18} /></button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic lowercase font-medium tracking-normal">No job offers found.</td>
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

      {/* Add/Edit Applicant Modal */}
      <Modal 
        isOpen={isApplicantModalOpen} 
        onClose={() => {
          setIsApplicantModalOpen(false);
          setEditApplicantName(null);
          setApplicantForm({ applicant_name: "", email_id: "", job_title: "" });
        }} 
        title={editApplicantName ? "Edit Applicant" : "Add New Applicant"}
      >
        <form onSubmit={handleAddApplicant} className="space-y-6">
          {editApplicantName && (
            <div className="space-y-1.5 transition-all">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Internal Applicant ID</label>
                {!isRenaming ? (
                  <button 
                    type="button"
                    onClick={() => setIsRenaming(true)}
                    className="text-[9px] font-black text-[#FF8C42] uppercase tracking-wider hover:underline"
                  >
                    Change ID
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setIsRenaming(false)}
                    className="text-[9px] font-black text-gray-400 uppercase tracking-wider hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
              
              {!isRenaming ? (
                <div className="w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3.5 text-[11px] font-mono text-gray-500 select-all truncate">
                  {editApplicantName}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-white border-2 border-[#FF8C42] rounded-2xl px-4 py-2 text-[11px] font-mono text-[#2C2C2C] focus:outline-none shadow-sm"
                    value={newId}
                    onChange={e => setNewId(e.target.value)}
                    placeholder="Enter new internal ID (e.g. email)"
                  />
                  <button 
                    type="button"
                    onClick={handleRenameApplicant}
                    disabled={isSubmitting || !newId || newId === editApplicantName}
                    className="bg-[#2C2C2C] text-white px-4 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    Rename
                  </button>
                </div>
              )}
              {isRenaming && (
                <p className="text-[9px] text-amber-600 mt-1 pl-1 italic font-medium">Warning: Changing the ID will update all linked records (offers, etc.) in Frappe.</p>
              )}
            </div>
          )}
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
            {editApplicantName ? "Update Applicant" : "Save Applicant"}
          </button>
        </form>
      </Modal>

      {/* Issue Offer Modal */}
      <Modal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} title="Issue Job Offer Letter">
        <form onSubmit={handleIssueOffer} className="space-y-6">
          <div className="space-y-1.5 transition-transform duration-300">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Select Job Applicant</label>
            <div className="relative group">
              <select 
                required
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C] appearance-none cursor-pointer group-hover:bg-white"
                value={offerForm.job_applicant}
                onChange={e => {
                  const selectedApp = applicants.find(a => a.name === e.target.value);
                  setOfferForm({
                    ...offerForm, 
                    job_applicant: e.target.value,
                    applicant_name: selectedApp?.applicant_name || "",
                    designation: selectedApp?.job_title || "Engineer"
                  });
                }}
              >
                <option value="" disabled className="text-gray-400">Choose an applicant...</option>
                {applicants.map(app => (
                  <option key={app.name} value={app.name} className="py-2">
                    {app.applicant_name} ({app.name})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#FF8C42] transition-colors">
                <ChevronRight size={16} className="rotate-90" />
              </div>
            </div>
            <p className="text-[9px] text-gray-400 mt-1 pl-1 italic font-medium">Selecting an applicant will auto-fill their details below.</p>
          </div>
          <div className="space-y-1.5 transition-transform duration-300">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Applicant Name</label>
            <input 
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="e.g. John Smith"
              value={offerForm.applicant_name}
              onChange={e => setOfferForm({...offerForm, applicant_name: e.target.value})}
            />
          </div>
          <div className="space-y-1.5 transition-transform duration-300">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Designation</label>
            <input 
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="e.g. Engineer"
              value={offerForm.designation}
              onChange={e => setOfferForm({...offerForm, designation: e.target.value})}
            />
          </div>
          <div className="space-y-1.5 transition-transform duration-300">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Offer Date</label>
            <input 
              required
              type="date"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              value={offerForm.offer_date}
              onChange={e => setOfferForm({...offerForm, offer_date: e.target.value})}
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#FF8C42] hover:bg-[#F07B30] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={16} />}
            Issue Offer Letter
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
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Select Job Applicant</label>
            <div className="relative group">
              <select 
                required
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C] appearance-none cursor-pointer group-hover:bg-white"
                value={onboardingForm.job_applicant}
                onChange={e => {
                  const selectedApp = applicants.find(a => a.name === e.target.value);
                  setOnboardingForm({
                    ...onboardingForm, 
                    job_applicant: e.target.value,
                    employee_name: selectedApp?.applicant_name || "",
                    job_offer: "" // Reset offer when applicant changes
                  });
                }}
              >
                <option value="" disabled className="text-gray-400">Choose an applicant...</option>
                {applicants.map(app => (
                  <option key={app.name} value={app.name}>
                    {app.applicant_name} ({app.name})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-emerald-500 transition-colors">
                <ChevronRight size={16} className="rotate-90" />
              </div>
            </div>
          </div>
          <div className="space-y-1.5 transition-transform duration-300">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Select Job Offer (Mandatory)</label>
            <div className="relative group">
              <select 
                required
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C] appearance-none cursor-pointer group-hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                value={onboardingForm.job_offer}
                onChange={e => setOnboardingForm({...onboardingForm, job_offer: e.target.value})}
                disabled={!onboardingForm.job_applicant}
              >
                <option value="" disabled className="text-gray-400">
                  {!onboardingForm.job_applicant ? "Select applicant first..." : "Select an active offer..."}
                </option>
                {offers
                  .filter(offer => offer.job_applicant === onboardingForm.job_applicant)
                  .map(offer => (
                    <option key={offer.name} value={offer.name}>
                      {offer.name} ({offer.designation} - {offer.status})
                    </option>
                  ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-emerald-500 transition-colors">
                <ChevronRight size={16} className="rotate-90" />
              </div>
            </div>
            {onboardingForm.job_applicant && offers.filter(offer => offer.job_applicant === onboardingForm.job_applicant).length === 0 && (
              <p className="text-[9px] text-red-500 mt-1 pl-1 font-bold">No active offers found for this applicant. Issue one first!</p>
            )}
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
