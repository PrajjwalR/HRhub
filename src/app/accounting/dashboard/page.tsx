"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText,
  CreditCard,
  Building2,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function AccountingDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    cashOnHand: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/accounting/dashboard");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setDashboardData(json.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    { name: "Total Income", value: `₹${dashboardData.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", trend: "Sales Invs" },
    { name: "Total Expenses", value: `₹${dashboardData.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: ArrowDownLeft, color: "text-rose-500", bg: "bg-rose-50", trend: "Purchase Invs" },
    { name: "Net Profit", value: `₹${dashboardData.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Wallet, color: "text-blue-500", bg: "bg-blue-50", trend: "Overall" },
    { name: "Cash on Hand", value: `₹${dashboardData.cashOnHand.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: CreditCard, color: "text-amber-500", bg: "bg-amber-50", trend: "Bank" },
  ];

  const shortcuts = [
    { name: "Chart of Accounts", href: "#", icon: Building2 },
    { name: "Sales Invoice", href: "/accounting/receivables", icon: ArrowUpRight },
    { name: "Purchase Invoice", href: "/accounting/payables", icon: ArrowDownLeft },
    { name: "Journal Entry", href: "/accounting/journal-entries", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className={`text-sm font-medium ${stat.trend.startsWith("+") ? "text-emerald-500" : stat.trend.startsWith("-") ? "text-rose-500" : "text-gray-500"}`}>
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Profit and Loss</h2>
              <select className="text-sm border-gray-200 rounded-lg text-gray-500 focus:ring-[#4A72FF] focus:border-[#4A72FF]">
                <option>This Year</option>
                <option>Last Year</option>
                <option>This Month</option>
              </select>
            </div>
            
            {/* Placeholder for actual chart */}
            <div className="h-72 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">P&L Chart Visualization Here</p>
                <p className="text-xs text-gray-400 mt-1">Connect to Frappe backend to render data</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Bank Balance</h2>
              <button className="text-sm text-[#4A72FF] hover:text-[#3B5BCC] font-medium">View All</button>
            </div>
            
            {/* Placeholder for actual chart */}
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <div className="text-center">
                <Wallet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Bank Balance Chart Here</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shortcuts & Alerts Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Shortcuts</h2>
            <div className="grid grid-cols-2 gap-3">
              {shortcuts.map((item, i) => (
                <Link 
                  key={i} 
                  href={item.href}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-[#4A72FF] hover:bg-[#4A72FF]/5 transition-colors group text-center"
                >
                  <item.icon className="w-6 h-6 text-gray-400 group-hover:text-[#4A72FF] mb-2" />
                  <span className="text-xs font-medium text-gray-600 group-hover:text-[#4A72FF]">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Alerts</h2>
              <AlertCircle className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                <div>
                  <p className="text-gray-500 font-medium">No active alerts currently</p>
                  <p className="text-gray-400 text-xs mt-0.5">Your accounting system is up to date.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
