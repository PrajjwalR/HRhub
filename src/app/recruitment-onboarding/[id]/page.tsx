"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, Users, Loader2, Plus } from "lucide-react";
import { Combobox } from "@headlessui/react";
import ApplicantJourneyTracker from "@/components/ApplicantJourneyTracker";
import AddApplicantModal from "@/components/AddApplicantModal";
import RightSidebar from "@/components/RightSidebar";

interface JourneyStage {
  name: string;
  status: "completed" | "current" | "pending";
  date?: string | null;
}

interface Applicant {
  name: string;
  applicant_name: string;
  email_id: string;
  status: string;
  job_title: string;
  creation: string;
  journey: JourneyStage[];
  offer?: any;
}

export default function JobOpeningApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const jobOpeningId = params.id as string;

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  useEffect(() => {
    fetchApplicants();
  }, [jobOpeningId]);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredApplicants(applicants);
    } else {
      const filtered = applicants.filter((applicant) =>
        applicant.applicant_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredApplicants(filtered);
    }
  }, [searchQuery, applicants]);

  const fetchApplicants = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/job-openings/${jobOpeningId}/applicants`);
      if (!response.ok) throw new Error("Failed to fetch applicants");
      const data = await response.json();
      setApplicants(data);
      setFilteredApplicants(data);
      
      // Update selected applicant if it exists (for refresh)
      if (selectedApplicant) {
        const updated = data.find((a: Applicant) => a.name === selectedApplicant.name);
        if (updated) setSelectedApplicant(updated);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "open":
      case "replied":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "hold":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "rejected":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const handleReject = async (applicant: Applicant) => {
    if (confirm(`Are you sure you want to reject ${applicant.applicant_name}?`)) {
      try {
        const res = await fetch("/api/recruitment", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "applicant",
            name: applicant.name,
            data: { status: "Rejected" }
          })
        });
        if (!res.ok) throw new Error("Failed to reject applicant");
        fetchApplicants();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="px-8 py-6 bg-[#FAFAFA] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white rounded-xl transition-colors border border-gray-100"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-[25px] font-serif text-[#2C2C2C]">
            {decodeURIComponent(jobOpeningId)} Applicants
          </h1>
          <p className="text-gray-500 mt-1">
            {applicants.length} {applicants.length === 1 ? "applicant" : "applicants"} found
          </p>
        </div>
        <div className="ml-auto">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#FF8C42] hover:bg-[#F07B30] text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-200 transition-all"
          >
            <Plus size={16} />
            Add Applicant
          </button>
        </div>
      </div>

      {/* Search Bar with Headless UI Combobox */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <Combobox value={searchQuery} onChange={(value) => setSearchQuery(value || "")}>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Combobox.Input
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] text-sm"
                placeholder="Search applicants by name (e.g., type 'a' to filter)..."
                onChange={(event) => setSearchQuery(event.target.value)}
                displayValue={() => searchQuery}
              />
            </div>

            {searchQuery && filteredApplicants.length > 0 && (
              <Combobox.Options className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                {filteredApplicants.map((applicant) => (
                  <Combobox.Option
                    key={applicant.name}
                    value={applicant.applicant_name}
                    className={({ active }) =>
                      `px-4 py-3 cursor-pointer transition-colors ${
                        active ? "bg-orange-50 text-[#FF8C42]" : "text-gray-900"
                      }`
                    }
                  >
                    {applicant.applicant_name}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            )}
          </div>
        </Combobox>
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2C2C2C] flex items-center gap-2">
            <Users size={20} className="text-[#FF8C42]" />
            Applicants ({filteredApplicants.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#FF8C42]" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Error: {error}
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="p-12 text-center text-gray-400 italic">
            {searchQuery ? `No applicants found matching "${searchQuery}"` : "No applicants yet"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Applicant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Email
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Applied Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApplicants.map((applicant) => (
                  <tr 
                    key={applicant.name}
                    onClick={() => setSelectedApplicant(applicant)}
                    className="hover:bg-gray-50/50 transition-all cursor-pointer group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
                          {applicant.applicant_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#2C2C2C] text-sm group-hover:text-[#FF8C42] transition-colors">
                            {applicant.applicant_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600 font-medium font-mono">
                      {applicant.email_id}
                    </td>
                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-[0.1em] ${getStatusStyle(
                          applicant.status
                        )}`}
                      >
                        {applicant.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right text-sm text-gray-400 font-medium">
                      {new Date(applicant.creation).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Applicant Detail Sidebar */}
      <RightSidebar
        isOpen={!!selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
        title={selectedApplicant?.applicant_name || "Applicant Details"}
        description={selectedApplicant ? `Reviewing journey for ${selectedApplicant.applicant_name}` : ""}
      >
        {selectedApplicant && (
          <div className="space-y-10">
            {/* Quick Stats/Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusStyle(selectedApplicant.status)}`}>
                  {selectedApplicant.status}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                <p className="text-xs font-bold text-[#2C2C2C] truncate">{selectedApplicant.email_id}</p>
              </div>
            </div>

            {/* Journey Tracker */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-[#2C2C2C] uppercase tracking-widest flex items-center gap-2">
                <Users size={16} className="text-[#FF8C42]" />
                Application Journey
              </h3>
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <ApplicantJourneyTracker journey={selectedApplicant.journey} />
              </div>
            </div>

            {/* Actions Section */}
            <div className="pt-8 border-t border-gray-50">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Administrative Actions</p>
                {selectedApplicant.status !== "Rejected" && (
                  <button
                    onClick={() => handleReject(selectedApplicant)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border border-red-100 flex items-center justify-center gap-2"
                  >
                    Reject Applicant
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </RightSidebar>

      <AddApplicantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchApplicants();
          setIsAddModalOpen(false);
        }}
        prefilledJobTitle={decodeURIComponent(jobOpeningId)}
      />
    </div>
  );
}
