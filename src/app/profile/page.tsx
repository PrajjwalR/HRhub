"use client";

import { Mail, Phone, MapPin, Building, Hash, Calendar, CreditCard, Landmark, Edit2, Save, X, Loader2 } from "lucide-react";
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
  } | null>(null);

  const profileUser = {
    name: employeeData?.employee_name || user?.name || "Employee",
    role: employeeData?.designation || user?.role || "Employee",
    email: user?.email || "employee@company.com",
    phone: employeeData?.cell_number || "-",
    location: employeeData?.company || "-",
    department: employeeData?.department || "-",
    employeeId: employeeId || "-",
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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif text-[#2C2C2C] mb-8">My Profile</h1>

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
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#2C2C2C] font-serif">{profileUser.name}</h2>
            <p className="text-gray-500 font-medium">{profileUser.role}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Contact Information</h3>
              
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#4A72FF]">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email Address</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{profileUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone Number</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{profileUser.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{profileUser.location}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Employment Details</h3>
              
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <Building size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Department</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{profileUser.department}</p>
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
                <div>
                  <p className="text-xs text-gray-400">Date Joined</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{profileUser.joinDate}</p>
                </div>
              </div>
            </div>
          </div>
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
    </div>
  );
}
