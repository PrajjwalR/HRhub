"use client";

import React, { useState, useEffect } from "react";
import { Plus, Filter, Search, Receipt, ArrowUpRight } from "lucide-react";

export default function ReceivablesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch("/api/accounting/invoices?type=Sales%20Invoice");
        if (res.ok) {
          const json = await res.json();
          setInvoices(json.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch sales invoices", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  const totalOwed = invoices
    .filter(inv => inv.status !== "Paid" && inv.status !== "Return")
    .reduce((sum, inv) => sum + (inv.grand_total || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Accounts Receivable</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your sales invoices, customers, and incoming payments.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#FF8C42] text-white rounded-xl hover:bg-[#E67E3B] text-sm font-medium transition-colors shadow-sm shadow-[#FF8C42]/20">
            <Plus className="w-4 h-4" />
            New Sales Invoice
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search sales invoices..." 
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-[#FF8C42] focus:border-[#FF8C42] w-64 bg-white"
            />
          </div>
          <div className="flex gap-2 text-sm">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {totalOwed > 0 ? `₹${totalOwed.toLocaleString(undefined, { minimumFractionDigits: 2 })} to collect` : "All cleared"}
            </span>
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading sales invoices from Frappe...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 border border-dashed border-gray-200">
              <Receipt className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Sales Invoices</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              You don't have any sales invoices yet. Ensure they are created in Frappe.
            </p>
            <button className="text-[#FF8C42] font-medium text-sm hover:underline">
              Create your first sale
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50/50 uppercase border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Invoice No</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv.name} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900">{inv.name}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{inv.customer}</td>
                    <td className="px-6 py-4 text-gray-500">{inv.posting_date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        inv.status === "Paid" ? "bg-emerald-50 text-emerald-600" :
                        inv.status === "Unpaid" ? "bg-rose-50 text-rose-600" :
                        inv.status === "Overdue" ? "bg-amber-50 text-amber-600" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ₹{inv.grand_total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 group-hover:text-[#4A72FF] transition-colors p-1 hover:bg-[#4A72FF]/10 rounded">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
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
