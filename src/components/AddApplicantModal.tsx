import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import RightSidebar from "./RightSidebar";

interface AddApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefilledJobTitle?: string;
}

export default function AddApplicantModal({ isOpen, onClose, onSuccess, prefilledJobTitle }: AddApplicantModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    applicant_name: "",
    email_id: "",
    job_title: prefilledJobTitle || ""
  });

  // Update form when prefilledJobTitle changes
  React.useEffect(() => {
    if (prefilledJobTitle) {
      setForm(prev => ({ ...prev, job_title: prefilledJobTitle }));
    }
  }, [prefilledJobTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/applicants/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicant_name: form.applicant_name,
          email_id: form.email_id,
          job_title: form.job_title
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create applicant");
      }

      onSuccess();
      onClose();
      setForm({ applicant_name: "", email_id: "", job_title: prefilledJobTitle || "" });
    } catch (error) {
      console.error("Error creating applicant:", error);
      alert("Failed to create applicant. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RightSidebar 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add New Applicant"
      description="Enter the details below to add a new candidate to the selection process."
    >
      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
            <input 
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="e.g. Jane Doe"
              value={form.applicant_name}
              onChange={e => setForm({...form, applicant_name: e.target.value})}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email ID</label>
            <input 
              required
              type="email"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="jane@example.com"
              value={form.email_id}
              onChange={e => setForm({...form, email_id: e.target.value})}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Applying For (Job Title)</label>
            <input 
              required
              disabled={!!prefilledJobTitle}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C] disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="e.g. Senior Designer"
              value={form.job_title}
              onChange={e => setForm({...form, job_title: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-50 flex gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 bg-white border border-gray-200 text-gray-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-[2] bg-[#FF8C42] hover:bg-[#F07B30] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={16} />}
            Add Applicant
          </button>
        </div>
      </form>
    </RightSidebar>
  );
}
