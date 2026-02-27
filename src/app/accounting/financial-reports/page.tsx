import React from "react";
import { FileText, Download, Filter } from "lucide-react";

export default function FinancialReportsPage() {
  const reports = [
    { title: "General Ledger", category: "Ledgers", desc: "View all the transactions for your accounts in the trial balance." },
    { title: "Trial Balance", category: "Financial Statements", desc: "Summary of all accounts showing total debits and credits." },
    { title: "Profit & Loss", category: "Financial Statements", desc: "View income, expenses and profit for a specific period." },
    { title: "Balance Sheet", category: "Financial Statements", desc: "Snapshot of your assets, liabilities and equity." },
    { title: "Cash Flow", category: "Financial Statements", desc: "Track how much cash is flowing in and out of your business." },
    { title: "Accounts Receivable Summary", category: "Receivables", desc: "Amount owed by customers grouped by aging." },
    { title: "Accounts Payable Summary", category: "Payables", desc: "Amount owed to suppliers grouped by aging." }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Financial Reports</h2>
          <p className="text-sm text-gray-500 mt-1">Access and download your key financial statements.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-[#4A72FF] transition-colors group cursor-pointer flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-[#4A72FF] group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-full max-w-[120px] truncate">
                {report.category}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2 truncate" title={report.title}>{report.title}</h3>
            <p className="text-sm text-gray-500 mb-6 flex-grow">{report.desc}</p>
            <div className="mt-auto border-t border-gray-100 pt-4 flex justify-between items-center text-sm font-medium text-[#4A72FF]">
              <span className="group-hover:translate-x-1 transition-transform">View Report &rarr;</span>
              <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Download CSV">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
