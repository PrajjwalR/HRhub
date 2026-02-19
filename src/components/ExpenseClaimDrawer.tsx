"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2, Calendar, Building2, User, Tag, FileText, CheckCircle2, IndianRupee } from "lucide-react";
import CustomSelect from "./CustomSelect";

interface ExpenseItem {
  expense_date: string;
  expense_type: string;
  description: string;
  amount: number;
}

interface ExpenseType {
  name: string;
  description: string;
}

interface FrappeUser {
  name: string;
  full_name: string;
  email: string;
}

interface ExpenseClaimDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'create' | 'view' | 'edit';
  initialData?: any;
}

export default function ExpenseClaimDrawer({ isOpen, onClose, onSuccess, mode = 'create', initialData }: ExpenseClaimDrawerProps) {
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [users, setUsers] = useState<FrappeUser[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    employee: "",
    expense_approver: "",
    company: "HR_Hub", // Default from our research
    posting_date: new Date().toISOString().split('T')[0],
    expenses: [] as ExpenseItem[]
  });

  useEffect(() => {
    if (isOpen) {
      fetchExpenseTypes();
      fetchUsers();
      
      if (initialData && (mode === 'view' || mode === 'edit')) {
         // Populate form with initialData
         // Note: We might need to fetch full details if initialData is summary
         // For now assuming initialData has what we need or we map it
         // Verification: We need to see structure of initialData vs formData
         // Let's assume we need to resets if create, or populate if view/edit
         setFormData({
            employee: initialData.employee || "",
            expense_approver: initialData.expense_approver || "", // We might need to fetch this if not in list
            company: "HR_Hub",
            posting_date: initialData.posting_date || new Date().toISOString().split('T')[0],
            expenses: initialData.expenses || [] 
         });
      } else {
          // Reset for create
          setFormData({
            employee: "",
            expense_approver: "",
            company: "HR_Hub",
            posting_date: new Date().toISOString().split('T')[0],
            expenses: [] 
          });
          addExpenseRow();
      }
    }
  }, [isOpen, mode, initialData]);

  const fetchExpenseTypes = async () => {
    try {
      const res = await fetch("/api/expenses/types");
      const data = await res.json();
      setExpenseTypes(data);
    } catch (error) {
      console.error("Failed to fetch expense types:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const addExpenseRow = () => {
    setFormData(prev => ({
      ...prev,
      expenses: [
        ...prev.expenses,
        { expense_date: prev.posting_date, expense_type: "", description: "", amount: 0 }
      ]
    }));
  };

  const removeExpenseRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.filter((_, i) => i !== index)
    }));
  };

  const updateExpenseRow = (index: number, field: keyof ExpenseItem, value: any) => {
    setFormData(prev => {
      const newExpenses = [...prev.expenses];
      newExpenses[index] = { ...newExpenses[index], [field]: value };
      return { ...prev, expenses: newExpenses };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      
      onSuccess();
      onClose();
    } catch (error: any) {
      alert("Failed to submit claim: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col p-8 overflow-hidden animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center mb-8 pb-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {mode === 'view' ? 'Expense Claim Details' : mode === 'edit' ? 'Edit Expense Claim' : 'New Expense Claim'}
            </h2>
            <p className="text-sm text-slate-500">
              {mode === 'view' ? 'View details of your expense claim' : 'Add details of your expenses for reimbursement'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employee ID</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      required
                      type="text"
                      placeholder="e.g. EMP-001"
                      value={formData.employee}
                      onChange={e => setFormData({ ...formData, employee: e.target.value })}
                      disabled={mode === 'view'}
                      className={`w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 ${mode === 'view' ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Approver Email</label>
                <div className="relative">
                  <CustomSelect
                    options={users.map(u => ({ label: `${u.full_name} (${u.email})`, value: u.name }))}
                    value={users.map(u => ({ label: `${u.full_name} (${u.email})`, value: u.name })).find(op => op.value === formData.expense_approver)}
                    onChange={(option: any) => setFormData({ ...formData, expense_approver: option?.value || "" })}
                    placeholder="Select Approver"
                    accentColor="#4F46E5" // Indigo-600
                    isDisabled={mode === 'view'}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Posting Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    required
                    type="date"
                    value={formData.posting_date}
                    onChange={e => setFormData({ ...formData, posting_date: e.target.value })}
                    disabled={mode === 'view'}
                    className={`w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 ${mode === 'view' ? 'opacity-70 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Company</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    disabled
                    type="text"
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                    value={formData.company}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Tag size={18} className="text-indigo-600" />
                  Expense Items
                </h3>
                {mode !== 'view' && (
                <button 
                  type="button"
                  onClick={addExpenseRow}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Row
                </button>
                )}
              </div>

              <div className="space-y-4">
                {formData.expenses.map((expense, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group">
                    {formData.expenses.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeExpenseRow(idx)}
                        className="absolute -right-2 -top-2 p-1.5 bg-white border border-rose-100 text-rose-500 rounded-lg shadow-sm hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date</label>
                        <input 
                          required
                          type="date"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 text-slate-900"
                          value={expense.expense_date}
                          onChange={e => updateExpenseRow(idx, "expense_date", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Type</label>
                        <CustomSelect
                          options={expenseTypes.map(t => ({ label: t.name, value: t.name }))}
                          value={expenseTypes.map(t => ({ label: t.name, value: t.name })).find(op => op.value === expense.expense_type)}
                          onChange={(option: any) => updateExpenseRow(idx, "expense_type", option?.value || "")}
                          placeholder="Select Type"
                          accentColor="#4F46E5"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                        <input 
                          required
                          type="text"
                          placeholder="What was this for?"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 text-slate-900"
                          value={expense.description}
                          onChange={e => updateExpenseRow(idx, "description", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Amount</label>
                        <input 
                          required
                          type="number"
                          placeholder="0.00"
                          className={`w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 text-slate-900 ${mode === 'view' ? 'opacity-70 cursor-not-allowed' : ''}`}
                          value={expense.amount}
                          onChange={e => updateExpenseRow(idx, "amount", parseFloat(e.target.value))}
                          disabled={mode === 'view'}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            {mode !== 'view' && (
            <button 
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FileText size={18} />
                  {mode === 'edit' ? 'Update Claim' : 'Submit Claim'}
                </>
              )}
            </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
