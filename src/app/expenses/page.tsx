"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  ArrowUpRight,
  Loader2,
  IndianRupee,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";

interface ExpenseItem {
  expense_date: string;
  expense_claim_type: string;
  description: string;
  amount: number;
}

interface ExpenseClaim {
  name: string;
  employee: string;
  posting_date: string;
  total_amount: number;
  approval_status: string;
  status: string;
  company: string;
}

import ExpenseClaimDrawer from "@/components/ExpenseClaimDrawer";

export default function ExpensesPage() {
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);
  const [drawerMode, setDrawerMode] = useState<'create' | 'view' | 'edit'>('create');
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setClaims(data);
    } catch (error) {
      console.error("Failed to fetch claims:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "rejected": return "bg-rose-100 text-rose-700 border-rose-200";
      case "paid": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleCreate = () => {
    setSelectedClaim(null);
    setDrawerMode('create');
    setIsDrawerOpen(true);
  };

  const handleView = (claim: ExpenseClaim) => {
    setSelectedClaim(claim);
    setDrawerMode('view');
    setIsDrawerOpen(true);
  };

  const handleEdit = (claim: ExpenseClaim) => {
    setSelectedClaim(claim);
    setDrawerMode('edit');
    setIsDrawerOpen(true);
  };

  const handleDelete = async (claim: ExpenseClaim) => {
    if (!confirm(`Are you sure you want to delete expense claim ${claim.name}?`)) return;
    // TODO: Implement API delete
    alert("Delete functionality coming soon via API");
  };

  const filteredClaims = claims.filter(claim => 
    claim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    claim.employee.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Total Pending", value: claims.filter(c => c.approval_status === "Draft").length, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Total Approved", value: claims.filter(c => c.approval_status === "Approved").length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Total Paid", value: claims.filter(c => c.status === "Paid").length, icon: IndianRupee, color: "text-blue-500", bg: "bg-blue-50" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          <p className="text-slate-500">Track and manage your reimbursement claims</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Claim
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by Claim ID or Employee..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-sm font-medium">Loading claims...</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="p-4 bg-slate-50 rounded-full">
              <FileText size={48} className="text-slate-300" />
            </div>
            <div className="text-center text-slate-500">
              <p className="font-semibold text-lg">No Expense Claims Found</p>
              <p className="text-sm mt-1 max-w-xs mx-auto text-slate-400">
                You haven't submitted any expense claims yet. Click the "New Claim" button to start.
              </p>
            </div>
            <button 
              onClick={handleCreate}
              className="mt-4 flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700"
            >
              <Plus size={18} />
              Submit your first claim
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Claim ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredClaims.map((claim) => (
                  <tr key={claim.name} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                          <FileText size={18} />
                        </div>
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{claim.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {claim.posting_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {claim.employee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-900">
                        ₹{claim.total_amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(claim.approval_status)}`}>
                        {claim.approval_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Menu>
                        <MenuButton className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                          <MoreVertical size={18} />
                        </MenuButton>
                        <MenuItems anchor="bottom end" className="w-48 origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                          <div className="px-1 py-1">
                            <MenuItem>
                              {({ focus }) => (
                                <button
                                  onClick={() => handleView(claim)}
                                  className={`${
                                    focus ? "bg-indigo-50 text-indigo-600" : "text-slate-700"
                                  } group flex w-full items-center rounded-lg px-2 py-2 text-sm`}
                                >
                                  <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                                  View Details
                                </button>
                              )}
                            </MenuItem>
                            {(claim.approval_status === "Draft" || claim.approval_status === "Rejected") && (
                              <MenuItem>
                                {({ focus }) => (
                                  <button
                                    onClick={() => handleEdit(claim)}
                                    className={`${
                                      focus ? "bg-indigo-50 text-indigo-600" : "text-slate-700"
                                    } group flex w-full items-center rounded-lg px-2 py-2 text-sm`}
                                  >
                                    <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Edit Claim
                                  </button>
                                )}
                              </MenuItem>
                            )}
                          </div>
                          {claim.approval_status === "Draft" && (
                            <div className="px-1 py-1">
                              <MenuItem>
                                {({ focus }) => (
                                  <button
                                    onClick={() => handleDelete(claim)}
                                    className={`${
                                      focus ? "bg-rose-50 text-rose-600" : "text-rose-600"
                                    } group flex w-full items-center rounded-lg px-2 py-2 text-sm`}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Delete
                                  </button>
                                )}
                              </MenuItem>
                            </div>
                          )}
                        </MenuItems>
                      </Menu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Claim Drawer */}
      <ExpenseClaimDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onSuccess={fetchClaims}
        mode={drawerMode}
        initialData={selectedClaim}
      />
    </div>
  );
}
