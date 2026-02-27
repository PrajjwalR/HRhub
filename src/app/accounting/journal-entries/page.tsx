"use client";

import React, { useState, useEffect } from "react";
import { Plus, Filter, Search, Book, ArrowUpRight } from "lucide-react";

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await fetch("/api/accounting/journal-entries");
        if (res.ok) {
          const json = await res.json();
          setEntries(json.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch journal entries", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Journal Entries</h2>
          <p className="text-sm text-gray-500 mt-1">Manual accounting entries, adjustments, and transfers.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2C2C2C] text-white rounded-xl hover:bg-black text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search entries..." 
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-[#2C2C2C] focus:border-[#2C2C2C] w-64 bg-white"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading journal entries from Frappe...</div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 border border-dashed border-gray-200">
              <Book className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Journal Entries</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Record manual entries like depreciation, correcting entries, or fund transfers here.
            </p>
            <button className="text-[#2C2C2C] font-medium text-sm hover:underline">
              Record an entry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 bg-gray-50/50 uppercase border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Entry No</th>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((entry) => (
                  <tr key={entry.name} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900">{entry.name}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{entry.title || entry.user_remark || "Journal Entry"}</td>
                    <td className="px-6 py-4 text-gray-500">{entry.posting_date}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                        {entry.voucher_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ₹{entry.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 group-hover:text-[#2C2C2C] transition-colors p-1 hover:bg-[#2C2C2C]/10 rounded">
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
