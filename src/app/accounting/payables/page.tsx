"use client";

import React, { useState, useEffect } from "react";
import { Plus, Filter, Search, FileSignature, ArrowUpRight } from "lucide-react";

export default function PayablesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch("/api/accounting/invoices?type=Purchase%20Invoice");
        if (res.ok) {
          const json = await res.json();
          setInvoices(json.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch purchase invoices", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  const overdueCount = invoices.filter(inv => inv.status === "Overdue").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Accounts Payable</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your purchase invoices, suppliers, and outgoing payments.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#4A72FF] text-white rounded-xl hover:bg-[#3B5BCC] text-sm font-medium transition-colors shadow-sm shadow-[#4A72FF]/20">
            <Plus className="w-4 h-4" />
            New Purchase Invoice
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-[#4A72FF] focus:border-[#4A72FF] w-64 bg-white"
            />
          </div>
          <div className="flex gap-2 text-sm">
            <span className={`px-3 py-1 rounded-full font-medium flex items-center gap-1 ${overdueCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${overdueCount > 0 ? 'bg-amber-500' : 'bg-gray-400'}`}></span>
              {overdueCount} Overdue
            </span>
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading purchase invoices from Frappe...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 border border-dashed border-gray-200">
              <FileSignature className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Purchase Invoices</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              You don't have any purchase invoices yet. Connect to the Frappe backend to sync data or create a new one.
            </p>
            <button className="text-[#4A72FF] font-medium text-sm hover:underline">
              Create your first invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50/50 uppercase border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Invoice No</th>
                  <th className="px-6 py-4 font-medium">Supplier</th>
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
                    <td className="px-6 py-4 text-gray-600 font-medium">{inv.supplier}</td>
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
