"use client";

import { useState, useEffect } from "react";
import { Download, Eye, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface SalarySlip {
  name: string;
  employee: string;
  employee_name: string;
  posting_date: string;
  start_date: string;
  end_date: string;
  gross_pay: number;
  total_deduction: number;
  net_pay: number;
  status: string;
}

export default function MyPayslipsPage() {
  const { user } = useAuth();
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  // First fetch the employee ID for the logged-in user
  useEffect(() => {
    const fetchEmployeeId = async () => {
      if (!user?.email) return;
      
      try {
        const response = await fetch(`/api/employees?user_id=${user.email}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setEmployeeId(data[0].name);
            console.log("Found Employee ID for payslips:", data[0].name);
          } else {
            setError("No employee record found for your account. Please contact HR.");
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Error fetching employee ID:", err);
        setError("Failed to load employee information");
        setIsLoading(false);
      }
    };

    fetchEmployeeId();
  }, [user?.email]);

  // Then fetch salary slips for that employee
  useEffect(() => {
    const fetchSalarySlips = async () => {
      if (!employeeId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/salary-slip?employee=${employeeId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch salary slips");
        }
        
        const data = await response.json();
        setSalarySlips(data || []);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching salary slips:", err);
        setError(err.message || "Failed to load salary slips");
      } finally {
        setIsLoading(false);
      }
    };

    if (employeeId) {
      fetchSalarySlips();
    }
  }, [employeeId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    return startDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-serif text-[#2C2C2C] mb-8">My Payslips</h1>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#F7D046] mx-auto mb-4" />
              <p className="text-gray-500">Loading your payslips...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-serif text-[#2C2C2C] mb-8">My Payslips</h1>
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-red-500" />
            </div>
            <p className="text-red-600 mb-4">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-[#2C2C2C] mb-2">My Payslips</h1>
          <p className="text-gray-500">View and download your salary slips</p>
        </div>

        {salarySlips.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">No Payslips Yet</h3>
            <p className="text-gray-500">Your salary slips will appear here once they are generated.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-black">{salarySlips.length}</span> payslip(s)
              </p>
            </div>

            {/* Table */}
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pay Period
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Pay
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {salarySlips.map((slip, index) => (
                  <tr 
                    key={slip.name} 
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FFF5E6] rounded-lg flex items-center justify-center">
                          <FileText size={20} className="text-[#F7D046]" />
                        </div>
                        <span className="font-semibold text-[#2C2C2C]">
                          {formatPeriod(slip.start_date, slip.end_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(slip.start_date)} - {formatDate(slip.end_date)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        slip.status === "Submitted" 
                          ? "bg-green-100 text-green-700" 
                          : slip.status === "Draft" 
                          ? "bg-yellow-100 text-yellow-700" 
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          slip.status === "Submitted" 
                            ? "bg-green-600" 
                            : slip.status === "Draft" 
                            ? "bg-yellow-600" 
                            : "bg-gray-500"
                        }`} />
                        {slip.status || "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-[#2C2C2C]">
                        {formatCurrency(slip.net_pay)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/salary-slip/${encodeURIComponent(slip.name)}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-[#2C2C2C] rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          <Eye size={14} />
                          View
                        </Link>
                        <Link
                          href={`/salary-slip/${encodeURIComponent(slip.name)}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7D046] text-[#2C2C2C] rounded-lg hover:bg-[#E5C03E] transition-colors text-sm font-medium"
                        >
                          <Download size={14} />
                          Download
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
