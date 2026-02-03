"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Download, Eye, Search, Filter, Calendar } from "lucide-react";
import Link from "next/link";

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
  docstatus: number;
}

export default function SalarySlipsPage() {
  const [slips, setSlips] = useState<SalarySlip[]>([]);
  const [filteredSlips, setFilteredSlips] = useState<SalarySlip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  useEffect(() => {
    fetchAllSalarySlips();
  }, []);

  useEffect(() => {
    filterSlips();
  }, [slips, searchQuery, statusFilter, monthFilter]);

  const fetchAllSalarySlips = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/salary-slip");
      
      if (!response.ok) {
        throw new Error("Failed to fetch salary slips");
      }

      const data = await response.json();
      setSlips(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load salary slips");
    } finally {
      setIsLoading(false);
    }
  };

  const filterSlips = () => {
    let filtered = [...slips];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(slip =>
        slip.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slip.employee.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(slip => {
        if (statusFilter === "draft") return slip.docstatus === 0;
        if (statusFilter === "submitted") return slip.docstatus === 1;
        if (statusFilter === "cancelled") return slip.docstatus === 2;
        return true;
      });
    }

    // Month filter
    if (monthFilter !== "all") {
      filtered = filtered.filter(slip => {
        const slipMonth = new Date(slip.start_date).toISOString().slice(0, 7);
        return slipMonth === monthFilter;
      });
    }

    setFilteredSlips(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (docstatus: number) => {
    switch (docstatus) {
      case 0:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
            Draft
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
            Submitted
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Get unique months from slips
  const availableMonths = Array.from(
    new Set(slips.map(slip => new Date(slip.start_date).toISOString().slice(0, 7)))
  ).sort().reverse();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7D046] mb-4"></div>
            <p className="text-gray-500">Loading salary slips...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600 mb-4">⚠️ {error}</p>
            <button
              onClick={fetchAllSalarySlips}
              className="px-6 py-2 bg-[#F7D046] text-[#2C2C2C] font-medium rounded-lg hover:bg-[#E5C03E]"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/payroll"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Salary Slips</h1>
        </div>
        <Link
          href="/payroll/run"
          className="px-4 py-2 bg-[#F7D046] text-[#2C2C2C] font-medium rounded-lg hover:bg-[#E5C03E] transition-colors"
        >
          Generate New Slips
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F7D046] text-[#2C2C2C]"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F7D046] text-[#2C2C2C] appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Month Filter */}
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F7D046] text-[#2C2C2C] appearance-none bg-white"
            >
              <option value="all">All Months</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {new Date(month + "-01").toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Slips</p>
          <p className="text-2xl font-bold text-[#2C2C2C]">{filteredSlips.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Draft</p>
          <p className="text-2xl font-bold text-gray-600">
            {filteredSlips.filter(s => s.docstatus === 0).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Submitted</p>
          <p className="text-2xl font-bold text-green-600">
            {filteredSlips.filter(s => s.docstatus === 1).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-[#2C2C2C]">
            {formatCurrency(filteredSlips.reduce((sum, slip) => sum + slip.net_pay, 0))}
          </p>
        </div>
      </div>

      {/* Table */}
      {filteredSlips.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-4">No salary slips found</p>
          <Link
            href="/payroll/run"
            className="inline-block px-6 py-2 bg-[#F7D046] text-[#2C2C2C] font-medium rounded-lg hover:bg-[#E5C03E]"
          >
            Generate Salary Slips
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Pay
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Pay
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSlips.map((slip, index) => (
                <tr
                  key={slip.name}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-black">{slip.employee_name}</p>
                      <p className="text-xs text-gray-500">{slip.employee}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-[#2C2C2C]">
                        {formatDate(slip.start_date)} - {formatDate(slip.end_date)}
                      </p>
                      <p className="text-xs text-gray-500">Posted: {formatDate(slip.posting_date)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-[#2C2C2C]">
                      {formatCurrency(slip.gross_pay)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-red-600">
                      {formatCurrency(slip.total_deduction)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(slip.net_pay)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(slip.docstatus)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/salary-slip/${slip.name}`}
                        className="p-2 text-gray-600 hover:text-[#F7D046] hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Slip"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => window.open(`/salary-slip/${slip.name}`, '_blank')}
                        className="p-2 text-gray-600 hover:text-[#F7D046] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
