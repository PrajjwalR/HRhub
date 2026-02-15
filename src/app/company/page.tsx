"use client";

import { useState, useEffect } from "react";
import { 
  X,
  Check,
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Wallet, 
  Users, 
  Package, 
  TrendingUp,
  Loader2,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  ChevronRight,
  Briefcase
} from "lucide-react";

interface Company {
  name: string;
  abbr: string;
  company_name: string;
  country: string;
  default_currency: string;
  tax_id?: string;
  domain?: string;
  date_of_establishment?: string;
  date_of_incorporation?: string;
  phone_no?: string;
  email?: string;
  website?: string;
  company_description?: string;
  registration_details?: string;
  // Accounts
  default_bank_account?: string;
  default_cash_account?: string;
  default_receivable_account?: string;
  default_payable_account?: string;
  cost_center?: string;
  // HR & Payroll
  default_holiday_list?: string;
  default_payroll_payable_account?: string;
  default_expense_claim_payable_account?: string;
  default_employee_advance_account?: string;
  // Stock
  enable_perpetual_inventory?: number;
  default_warehouse?: string;
  stock_adjustment_account?: string;
  // Metadata for optimistic locking
  modified?: string;
}

export default function CompanyPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});

  const fetchCompanyData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First get the list of companies
      const listRes = await fetch("/api/company");
      const companies = await listRes.json();
      
      if (companies.error) throw new Error(companies.error);
      if (!companies.length) throw new Error("No companies found");

      // Get detailed info for the first company
      const detailRes = await fetch(`/api/company?name=${companies[0].name}`);
      const companyData = await detailRes.json();
      
      if (companyData.error) throw new Error(companyData.error);
      
      setCompany(companyData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const handleEditClick = () => {
    if (company) {
      setFormData({ ...company });
      setIsDrawerOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!company) return;
    try {
      setIsSaving(true);
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: company.name, 
          data: { 
            ...formData, 
            modified: company.modified // Include timestamp for optimistic locking
          } 
        })
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      
      setCompany({ ...company, ...formData, name: result.name || company.name });
      setIsDrawerOpen(false);
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const InfoRow = ({ label, value, icon: Icon }: { label: string; value?: string; icon?: any }) => (
    <div className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0">
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
          <Icon size={18} />
        </div>
      )}
      <div className="flex-1">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-[#2C2C2C]">{value || "Not set"}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="px-8 py-6 bg-[#FAFAFA] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-[#FF8C42] rounded-full animate-spin" />
            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#FF8C42] animate-pulse" size={20} />
          </div>
          <p className="text-gray-400 font-medium animate-pulse">Loading company information...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="px-8 py-6 bg-[#FAFAFA] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#2C2C2C] mb-2">Failed to Load Company</h2>
          <p className="text-gray-500">{error || "Unknown error"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-6 bg-[#FAFAFA] min-h-screen">
      <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-[25px] font-serif text-[#2C2C2C]">{company.company_name || company.name}</h1>
          <p className="text-gray-500 mt-1">Manage your company settings and information</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleEditClick}
            className="bg-[#2C2C2C] text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-[#404040] transition-all shadow-lg shadow-black/5 font-bold text-sm"
          >
            <Settings size={18} />
            Edit Settings
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 max-w-7xl mx-auto">
        {[
          { label: "Abbreviation", value: company.abbr, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Currency", value: company.default_currency, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Country", value: company.country, icon: Globe, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Domain", value: company.domain || "General", icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <h4 className="text-xl font-black text-[#2C2C2C] mt-0.5">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden max-w-7xl mx-auto">
        <div className="px-10 py-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 p-1 bg-gray-50/80 rounded-2xl border border-gray-100/50 w-fit">
            {[
              { id: "overview", label: "Overview", icon: Building2 },
              { id: "contact", label: "Contact", icon: Phone },
              { id: "accounts", label: "Accounts", icon: Wallet },
              { id: "hr", label: "HR & Payroll", icon: Users },
              { id: "stock", label: "Stock", icon: Package },
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
        </div>

        <div className="p-10">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-black text-[#2C2C2C] mb-4 flex items-center gap-2">
                    <Building2 size={18} className="text-[#FF8C42]" />
                    Company Information
                  </h3>
                  <div className="space-y-3">
                    <InfoRow label="Company Name" value={company.company_name || company.name} />
                    <InfoRow label="Abbreviation" value={company.abbr} />
                    <InfoRow label="Tax ID" value={company.tax_id} />
                    <InfoRow label="Domain" value={company.domain} />
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-black text-[#2C2C2C] mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-[#FF8C42]" />
                    Important Dates
                  </h3>
                  <div className="space-y-3">
                    <InfoRow label="Date of Establishment" value={company.date_of_establishment} />
                    <InfoRow label="Date of Incorporation" value={company.date_of_incorporation} />
                  </div>
                </div>
              </div>

              {company.company_description && (
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-black text-[#2C2C2C] mb-3">Company Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{company.company_description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-6">
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-black text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <Phone size={18} className="text-[#FF8C42]" />
                  Contact Details
                </h3>
                <div className="space-y-3">
                  <InfoRow label="Phone" value={company.phone_no} icon={Phone} />
                  <InfoRow label="Email" value={company.email} icon={Mail} />
                  <InfoRow label="Website" value={company.website} icon={Globe} />
                </div>
              </div>

              {company.registration_details && (
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-black text-[#2C2C2C] mb-3 flex items-center gap-2">
                    <MapPin size={18} className="text-[#FF8C42]" />
                    Registration Details
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{company.registration_details}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "accounts" && (
            <div className="space-y-6">
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-black text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <Wallet size={18} className="text-[#FF8C42]" />
                  Default Accounts
                </h3>
                <div className="space-y-3">
                  <InfoRow label="Bank Account" value={company.default_bank_account} />
                  <InfoRow label="Cash Account" value={company.default_cash_account} />
                  <InfoRow label="Receivable Account" value={company.default_receivable_account} />
                  <InfoRow label="Payable Account" value={company.default_payable_account} />
                  <InfoRow label="Cost Center" value={company.cost_center} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "hr" && (
            <div className="space-y-6">
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-black text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <Users size={18} className="text-[#FF8C42]" />
                  HR & Payroll Settings
                </h3>
                <div className="space-y-3">
                  <InfoRow label="Default Holiday List" value={company.default_holiday_list} />
                  <InfoRow label="Payroll Payable Account" value={company.default_payroll_payable_account} />
                  <InfoRow label="Expense Claim Payable Account" value={company.default_expense_claim_payable_account} />
                  <InfoRow label="Employee Advance Account" value={company.default_employee_advance_account} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "stock" && (
            <div className="space-y-6">
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-black text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <Package size={18} className="text-[#FF8C42]" />
                  Stock & Inventory Settings
                </h3>
                <div className="space-y-3">
                  <InfoRow label="Perpetual Inventory" value={company.enable_perpetual_inventory ? "Enabled" : "Disabled"} />
                  <InfoRow label="Default Warehouse" value={company.default_warehouse} />
                  <InfoRow label="Stock Adjustment Account" value={company.stock_adjustment_account} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Drawer */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer Wrapper */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-500 ease-out animate-in slide-in-from-right">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-[#2C2C2C]">Edit Company Settings</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{company.name}</p>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 custom-scrollbar">
              {/* Section: General */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF8C42]/10 flex items-center justify-center text-[#FF8C42]">
                    <Building2 size={16} />
                  </div>
                  <h3 className="text-sm font-black text-[#2C2C2C] uppercase tracking-widest">General Information</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Name</label>
                    <input 
                      name="company_name" 
                      value={formData.company_name || ""} 
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#2C2C2C] focus:ring-2 focus:ring-[#FF8C42]/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tax ID</label>
                    <input 
                      name="tax_id" 
                      value={formData.tax_id || ""} 
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#2C2C2C] focus:ring-2 focus:ring-[#FF8C42]/20 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Contact */}
              <div className="space-y-6 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF8C42]/10 flex items-center justify-center text-[#FF8C42]">
                    <Phone size={16} />
                  </div>
                  <h3 className="text-sm font-black text-[#2C2C2C] uppercase tracking-widest">Contact Details</h3>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email"
                      name="email" 
                      value={formData.email || ""} 
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#2C2C2C] focus:ring-2 focus:ring-[#FF8C42]/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      name="phone_no" 
                      value={formData.phone_no || ""} 
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#2C2C2C] focus:ring-2 focus:ring-[#FF8C42]/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Website</label>
                    <input 
                      name="website" 
                      value={formData.website || ""} 
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#2C2C2C] focus:ring-2 focus:ring-[#FF8C42]/20 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Description */}
              <div className="space-y-6 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF8C42]/10 flex items-center justify-center text-[#FF8C42]">
                    <FileText size={16} />
                  </div>
                  <h3 className="text-sm font-black text-[#2C2C2C] uppercase tracking-widest">Description</h3>
                </div>
                <div className="space-y-2">
                  <textarea 
                    name="company_description" 
                    value={formData.company_description || ""} 
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#2C2C2C] focus:ring-2 focus:ring-[#FF8C42]/20 transition-all outline-none resize-none"
                  />
                </div>
              </div>

              {/* Section: Financial & HR */}
              <div className="space-y-6 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF8C42]/10 flex items-center justify-center text-[#FF8C42]">
                    <Wallet size={16} />
                  </div>
                  <h3 className="text-sm font-black text-[#2C2C2C] uppercase tracking-widest">Financial Defaults</h3>
                </div>
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank Account</label>
                    <input 
                      name="default_bank_account" 
                      value={formData.default_bank_account || ""} 
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#2C2C2C] focus:ring-2 focus:ring-[#FF8C42]/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Holiday List</label>
                    <input 
                      name="default_holiday_list" 
                      value={formData.default_holiday_list || ""} 
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#2C2C2C] focus:ring-2 focus:ring-[#FF8C42]/20 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] bg-[#2C2C2C] text-white px-6 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#404040] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/5"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
