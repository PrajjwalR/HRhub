"use client";

import { Mail, Phone, MapPin, Building, Hash, Calendar, CreditCard, Landmark, Edit2, Save, X, Loader2, Monitor, Lock, KeyRound, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  branch: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    ifscCode: "",
    branch: "",
  });
  const [editBankDetails, setEditBankDetails] = useState<BankDetails>(bankDetails);
  const [bankError, setBankError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [employeeData, setEmployeeData] = useState<{
    employee_name: string;
    designation: string;
    department: string;
    date_of_joining?: string;
    company?: string;
    cell_number?: string;
    personal_email?: string;
    uan?: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "assets" | "security">("profile");
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  
  // Password Reset State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileUser = {
    name: employeeData?.employee_name || user?.name || "Employee",
    role: employeeData?.designation || user?.role || "Employee",
    email: user?.email || "employee@company.com",
    phone: employeeData?.cell_number || "-",
    location: employeeData?.company || "-",
    department: employeeData?.department || "-",
    employeeId: employeeId || "-",
    uan: employeeData?.uan || "-",
    joinDate: employeeData?.date_of_joining ? new Date(employeeData.date_of_joining).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "-",
    avatarColor: "bg-[#4A72FF]",
    avatarText: (employeeData?.employee_name || user?.name || "E").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
  };

  // Fetch the actual Employee data from Frappe based on user email
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!user?.email) return;
      
      try {
        // Fetch employee by user_id (email)
        const response = await fetch(`/api/employees?user_id=${user.email}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const emp = data[0];
            setEmployeeId(emp.name); // Set the actual Frappe Employee ID
            setEmployeeData({
              employee_name: emp.employee_name,
              designation: emp.designation,
              department: emp.department,
              date_of_joining: emp.date_of_joining,
              company: emp.company,
              cell_number: emp.cell_number,
              personal_email: emp.personal_email,
              uan: emp.uan,
            });
            console.log("Found Employee:", emp.name, emp.employee_name);
          }
        }
      } catch (err) {
        console.error("Error fetching employee data:", err);
      }
    };

    fetchEmployeeData();
  }, [user?.email]);

  // Fetch bank details when employeeId is available
  useEffect(() => {
    const fetchBankDetails = async () => {
      if (!employeeId) return;
      
      try {
        const response = await fetch(`/api/bank-account?employee=${employeeId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.bankAccount) {
            setBankDetails({
              bankName: data.bankAccount.bank || "",
              accountNumber: data.bankAccount.bank_account_no || "",
              accountHolderName: data.bankAccount.account_name || "",
              ifscCode: data.bankAccount.branch_code || "",
              branch: data.bankAccount.branch || "",
            });
          }
        }
      } catch (err) {
        console.error("Error fetching bank details:", err);
      }
    };

    fetchBankDetails();
  }, [employeeId]);

  // Fetch assets when employeeId is available
  useEffect(() => {
    const fetchAssets = async () => {
      if (!employeeId) return;
      setIsLoadingAssets(true);
      try {
        const response = await fetch(`/api/assets?employee=${employeeId}`);
        if (response.ok) {
          const data = await response.json();
          setAssets(data || []);
        }
      } catch (err) {
        console.error("Error fetching assets:", err);
      } finally {
        setIsLoadingAssets(false);
      }
    };

    fetchAssets();
  }, [employeeId]);

  const handleEditBank = () => {
    setEditBankDetails(bankDetails);
    setIsEditingBank(true);
    setBankError(null);
  };

  const handleCancelEdit = () => {
    setIsEditingBank(false);
    setEditBankDetails(bankDetails);
    setBankError(null);
  };

  const handleSaveBank = async () => {
    if (!editBankDetails.bankName || !editBankDetails.accountNumber) {
      setBankError("Bank name and account number are required");
      return;
    }

    if (!employeeId) {
      setBankError("Employee ID not found. Please ensure your account is linked to an employee record in the system.");
      return;
    }

    setIsSavingBank(true);
    setBankError(null);

    try {
      const response = await fetch("/api/bank-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employeeId, // Use the actual Frappe Employee ID
          bankName: editBankDetails.bankName,
          accountNumber: editBankDetails.accountNumber,
          accountHolderName: editBankDetails.accountHolderName,
          ifscCode: editBankDetails.ifscCode,
          branch: editBankDetails.branch,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save bank details");
      }

      setBankDetails(editBankDetails);
      setIsEditingBank(false);
    } catch (err: any) {
      console.error("Error saving bank details:", err);
      setBankError(err.message || "Failed to save bank details");
    } finally {
      setIsSavingBank(false);
    }
  };

  const maskAccountNumber = (number: string): string => {
    if (!number || number.length < 4) return number;
    return "****" + number.slice(-4);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Client-side validation
    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      if (!user?.email) {
        throw new Error("Unable to determine user email");
      }

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setPasswordSuccess("Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password. Please check your current password and try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    personal_email: "",
    cell_number: "",
    company: "",
    department: "",
    date_of_joining: "",
    uan: ""
  });
  const [profileError, setProfileError] = useState<string | null>(null);

  const handleEditProfile = () => {
    setEditProfileData({
      personal_email: employeeData?.personal_email || "",
      cell_number: employeeData?.cell_number || "",
      company: employeeData?.company || "",
      department: employeeData?.department || "",
      date_of_joining: employeeData?.date_of_joining || "",
      uan: employeeData?.uan || ""
    });
    setIsEditingProfile(true);
    setProfileError(null);
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setProfileError(null);
  };

  const handleSaveProfile = async () => {
    if (!employeeId) {
      setProfileError("Employee ID not found.");
      return;
    }

    setIsSavingProfile(true);
    setProfileError(null);

    try {
      const response = await fetch("/api/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employeeId,
          ...editProfileData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      // Update local state immediately
      setEmployeeData((prev) => prev ? { ...prev, ...editProfileData } : null);
      setIsEditingProfile(false);
    } catch (err: any) {
      console.error("Error saving profile details:", err);
      setProfileError(err.message || "Failed to save profile details");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-[#2C2C2C]">My Profile</h1>
        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${activeTab === "profile" ? "bg-[#4A72FF] text-white shadow-md shadow-blue-100" : "text-gray-400 hover:text-gray-600"}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab("assets")}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${activeTab === "assets" ? "bg-[#4A72FF] text-white shadow-md shadow-blue-100" : "text-gray-400 hover:text-gray-600"}`}
          >
            My Assets
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${activeTab === "security" ? "bg-[#4A72FF] text-white shadow-md shadow-blue-100" : "text-gray-400 hover:text-gray-600"}`}
          >
            Security
          </button>
        </div>
      </div>

      {activeTab === "profile" && (
        <>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-6">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-blue-100 to-[#E5EDFF]"></div>
        
        <div className="px-8 pt-20 pb-8 relative">
          {/* Avatar */}
          <div className="absolute -top-12 left-8">
            <div className={`w-24 h-24 rounded-2xl ${profileUser.avatarColor} border-4 border-white flex items-center justify-center text-white text-3xl font-bold font-serif shadow-sm`}>
              {profileUser.avatarText}
            </div>
          </div>

          {/* Header Info */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-[#2C2C2C] font-serif">{profileUser.name}</h2>
              <p className="text-gray-500 font-medium">{profileUser.role}</p>
            </div>
            {!isEditingProfile && (
              <button 
                onClick={handleEditProfile}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2C2C2C] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Only specific details can be edited."
              >
                <Edit2 size={14} />
                Edit Profile
              </button>
            )}
          </div>

          {profileError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm">
              <X size={18} className="mt-0.5 flex-shrink-0" />
              <p>{profileError}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Contact Information</h3>
              
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#4A72FF]">
                  <Mail size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Email Address</p>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      value={editProfileData.personal_email}
                      onChange={(e) => setEditProfileData({ ...editProfileData, personal_email: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#4A72FF]"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#2C2C2C]">{profileUser.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <Phone size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Phone Number</p>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      value={editProfileData.cell_number}
                      onChange={(e) => setEditProfileData({ ...editProfileData, cell_number: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#4A72FF]"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#2C2C2C]">{profileUser.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                  <MapPin size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Company / Location</p>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={editProfileData.company}
                      onChange={(e) => setEditProfileData({ ...editProfileData, company: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#4A72FF]"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#2C2C2C]">{profileUser.location}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Employment Details</h3>
              
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <Building size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Department</p>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={editProfileData.department}
                      onChange={(e) => setEditProfileData({ ...editProfileData, department: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#4A72FF]"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#2C2C2C]">{profileUser.department}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <Hash size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Employee ID</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{profileUser.employeeId}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
                  <Calendar size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Date Joined</p>
                  {isEditingProfile ? (
                    <input
                      type="date"
                      value={editProfileData.date_of_joining}
                      onChange={(e) => setEditProfileData({ ...editProfileData, date_of_joining: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#4A72FF]"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#2C2C2C]">{profileUser.joinDate}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Hash size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">UAN Number</p>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      maxLength={12}
                      value={editProfileData.uan}
                      onChange={(e) => setEditProfileData({ ...editProfileData, uan: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#4A72FF]"
                    />
                  ) : (
                    <p className="text-sm font-medium text-[#2C2C2C]">{profileUser.uan}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isEditingProfile && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button 
                onClick={handleCancelEditProfile}
                disabled={isSavingProfile}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#4A72FF] rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-200"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bank Details Section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Landmark size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2C2C2C]">Bank Details</h3>
                <p className="text-xs text-gray-400">Your bank account information for salary payments</p>
              </div>
            </div>
            {!isEditingBank && (
              <button 
                onClick={handleEditBank}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2C2C2C] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 size={14} />
                {bankDetails.bankName ? "Edit" : "Add Details"}
              </button>
            )}
          </div>

          {bankError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {bankError}
            </div>
          )}

          {isEditingBank ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    value={editBankDetails.bankName}
                    onChange={(e) => setEditBankDetails({...editBankDetails, bankName: e.target.value})}
                    placeholder="e.g., HDFC Bank"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#F7D046]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Account Number *</label>
                  <input
                    type="text"
                    value={editBankDetails.accountNumber}
                    onChange={(e) => setEditBankDetails({...editBankDetails, accountNumber: e.target.value})}
                    placeholder="e.g., 1234567890123"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#F7D046]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={editBankDetails.accountHolderName}
                    onChange={(e) => setEditBankDetails({...editBankDetails, accountHolderName: e.target.value})}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#F7D046]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={editBankDetails.ifscCode}
                    onChange={(e) => setEditBankDetails({...editBankDetails, ifscCode: e.target.value.toUpperCase()})}
                    placeholder="e.g., HDFC0001234"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#F7D046]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Branch Name</label>
                  <input
                    type="text"
                    value={editBankDetails.branch}
                    onChange={(e) => setEditBankDetails({...editBankDetails, branch: e.target.value})}
                    placeholder="e.g., Mumbai Main Branch"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#F7D046]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  onClick={handleCancelEdit}
                  disabled={isSavingBank}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X size={14} />
                  Cancel
                </button>
                <button 
                  onClick={handleSaveBank}
                  disabled={isSavingBank}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2C2C2C] bg-[#F7D046] rounded-lg hover:bg-[#E5C03E] transition-colors"
                >
                  {isSavingBank ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Details
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : bankDetails.bankName ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 border border-gray-100">
                  <Landmark size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Bank Name</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{bankDetails.bankName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 border border-gray-100">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Account Number</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{maskAccountNumber(bankDetails.accountNumber)}</p>
                </div>
              </div>

              {bankDetails.accountHolderName && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-purple-600 border border-gray-100">
                    <Hash size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Account Holder</p>
                    <p className="text-sm font-medium text-[#2C2C2C]">{bankDetails.accountHolderName}</p>
                  </div>
                </div>
              )}

              {bankDetails.ifscCode && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-500 border border-gray-100">
                    <Hash size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">IFSC Code</p>
                    <p className="text-sm font-medium text-[#2C2C2C]">{bankDetails.ifscCode}</p>
                  </div>
                </div>
              )}

              {bankDetails.branch && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 md:col-span-2">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 border border-gray-100">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Branch</p>
                    <p className="text-sm font-medium text-[#2C2C2C]">{bankDetails.branch}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Landmark size={24} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-4">No bank details added yet</p>
              <button 
                onClick={handleEditBank}
                className="px-4 py-2 text-sm font-medium text-[#2C2C2C] bg-[#F7D046] rounded-lg hover:bg-[#E5C03E] transition-colors"
              >
                Add Bank Details
              </button>
            </div>
          )}
        </div>
      </div>
      </>
      )}
      
      {activeTab === "assets" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-[#2C2C2C] mb-6 flex items-center gap-2">
              <Building size={20} className="text-[#4A72FF]" />
              Assigned Company Assets
            </h3>
            
            {isLoadingAssets ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-[#4A72FF]" size={40} />
                <p className="text-gray-400 font-serif italic text-sm">Auditing your inventory...</p>
              </div>
            ) : assets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assets.map(asset => (
                  <div key={asset.name} className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 hover:border-[#4A72FF]/20 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-[#4A72FF]/5 transition-colors">
                        <Monitor size={20} className="text-gray-400 group-hover:text-[#4A72FF]" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                        {asset.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#2C2C2C] text-sm mb-1">{asset.asset_name}</h4>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-4">{asset.name}</p>
                    <div className="pt-4 border-t border-gray-100/50 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>Purchased: {asset.purchase_date}</span>
                      <span className="text-[#2C2C2C]">${asset.gross_purchase_amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Building size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-serif italic">No assets currently assigned to you.</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Check with your HR administrator for hardware allocation.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-8">
            <h3 className="text-lg font-bold text-[#2C2C2C] mb-6 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#4A72FF]" />
              Security Settings
            </h3>
            
            <div className="max-w-md">
              <p className="text-gray-500 text-sm mb-8">
                Update your password to keep your account secure. We recommend using a strong password that you haven't used elsewhere.
              </p>

              {passwordError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm">
                  <X size={18} className="mt-0.5 flex-shrink-0" />
                  <p>{passwordError}</p>
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 text-green-700 text-sm">
                  <ShieldCheck size={18} className="mt-0.5 flex-shrink-0" />
                  <p>{passwordSuccess}</p>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A72FF]/20 focus:border-[#4A72FF] transition-all pl-10 text-[#2C2C2C]"
                      placeholder="Enter current password"
                    />
                    <KeyRound size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A72FF]/20 focus:border-[#4A72FF] transition-all pl-10 text-[#2C2C2C]"
                      placeholder="Enter new password"
                    />
                    <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A72FF]/20 focus:border-[#4A72FF] transition-all pl-10 text-[#2C2C2C]"
                      placeholder="Confirm new password"
                    />
                    <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex items-center gap-2 px-6 py-3 bg-[#2C2C2C] text-white rounded-xl font-bold text-sm tracking-wide hover:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
