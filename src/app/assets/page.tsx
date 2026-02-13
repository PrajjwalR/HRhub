"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  Monitor, 
  Tag, 
  ArrowLeftRight,
  User,
  MapPin,
  Calendar,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Package
} from "lucide-react";
import RightSidebar from "@/components/RightSidebar";
import CustomSelect from "@/components/CustomSelect";

interface Asset {
  name: string;
  item_code: string;
  asset_name: string;
  asset_category: string;
  status: string;
  custodian?: string;
  department?: string;
  location?: string;
  purchase_date: string;
  gross_purchase_amount: number;
}

interface AssetCategory {
  name: string;
  asset_category_name: string;
}

interface AssetMovement {
  name: string;
  transaction_date: string;
  purpose: string;
  company: string;
}

interface Employee {
  name: string;
  employee_name: string;
  designation: string;
}

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<"assets" | "categories" | "movements">("assets");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [movements, setMovements] = useState<AssetMovement[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal States
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  
  // Form States
  const [movementForm, setMovementForm] = useState({
    purpose: "Issue",
    asset: "",
    to_employee: "",
    target_location: "",
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const [assetForm, setAssetForm] = useState({
    asset_name: "",
    item_code: "",
    asset_category: "",
    purchase_date: new Date().toISOString().split('T')[0],
    gross_purchase_amount: 0,
    company: "Test-Prajjwal"
  });

  const [categoryForm, setCategoryForm] = useState({
    asset_category_name: ""
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [assetsRes, categoriesRes, movementsRes, employeesRes] = await Promise.all([
        fetch("/api/assets"),
        fetch("/api/assets?type=categories"),
        fetch("/api/assets?type=movements"),
        fetch("/api/employees")
      ]);

      const [assetsData, categoriesData, movementsData, employeesData] = await Promise.all([
        assetsRes.json(),
        categoriesRes.json(),
        movementsRes.json(),
        employeesRes.json()
      ]);

      setAssets(assetsData);
      setCategories(categoriesData);
      setMovements(movementsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error fetching asset data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/assets/movement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: movementForm.purpose,
          transaction_date: movementForm.transaction_date,
          assets: [{
            asset: movementForm.asset,
            target_location: movementForm.target_location,
            to_employee: movementForm.purpose !== 'Receipt' ? movementForm.to_employee : undefined,
            from_employee: movementForm.purpose === 'Receipt' ? movementForm.to_employee : undefined,
          }]
        })
      });

      if (!res.ok) throw new Error("Failed to process movement");
      
      setIsMovementModalOpen(false);
      fetchData();
      alert(`Asset successfully ${movementForm.purpose === 'Issue' ? 'allocated' : 'returned'}!`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "asset",
          data: assetForm
        })
      });

      if (!res.ok) throw new Error("Failed to create asset");
      
      setIsAddAssetModalOpen(false);
      setAssetForm({
        asset_name: "",
        item_code: "",
        asset_category: "",
        purchase_date: new Date().toISOString().split('T')[0],
        gross_purchase_amount: 0,
        company: "Test-Prajjwal"
      });
      fetchData();
      alert("Asset successfully created!");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "category",
          data: categoryForm
        })
      });

      if (!res.ok) throw new Error("Failed to create category");
      
      setIsAddCategoryModalOpen(false);
      setCategoryForm({ asset_category_name: "" });
      fetchData();
      alert("Category successfully created!");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Scrapped": return "bg-red-50 text-red-600 border-red-100";
      case "Draft": return "bg-amber-50 text-amber-600 border-amber-100";
      default: return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const filteredAssets = assets.filter(asset => 
    asset.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.custodian?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FCFCFC] p-8 pb-20">
      {/* Header Area */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#FF8C42]/10 rounded-xl">
                <Package className="text-[#FF8C42]" size={24} />
              </div>
              <h1 className="text-3xl font-serif text-[#2C2C2C] tracking-tight">Company Assets</h1>
            </div>
            <p className="text-gray-400 font-medium text-sm">Manage company property, allocations, and asset lifecycle.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMovementModalOpen(true)}
              className="bg-white border border-gray-100 hover:border-[#FF8C42]/30 text-[#2C2C2C] px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm transition-all flex items-center gap-2"
            >
              <ArrowLeftRight size={16} className="text-[#FF8C42]" />
              New Movement
            </button>
            <button 
              onClick={() => setIsAddAssetModalOpen(true)}
              className="bg-[#FF8C42] hover:bg-[#F07B30] text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-100 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              Add Asset
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Tabs & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit">
            {[
              { id: "assets", label: "Inventory", icon: Monitor },
              { id: "categories", label: "Categories", icon: Tag },
              { id: "movements", label: "History", icon: ArrowLeftRight }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all uppercase tracking-widest ${
                  activeTab === tab.id 
                    ? "bg-[#FF8C42] text-white shadow-md shadow-orange-100" 
                    : "text-gray-400 hover:text-[#2C2C2C] hover:bg-gray-50"
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#FF8C42] transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by name, ID, or custodian..."
              className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/10 focus:border-[#FF8C42]/20 transition-all text-sm font-medium shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="bg-white rounded-[2.5rem] p-20 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#FF8C42]" size={40} />
            <p className="text-gray-400 font-serif italic">Accessing asset vaults...</p>
          </div>
        ) : activeTab === "assets" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map(asset => (
              <div 
                key={asset.name}
                onClick={() => setSelectedAsset(asset)}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#FF8C42]/10 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-[#FF8C42]/5 transition-colors">
                    <Monitor className="text-gray-400 group-hover:text-[#FF8C42]" size={24} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(asset.status)}`}>
                    {asset.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-[#2C2C2C] mb-1 truncate">{asset.asset_name}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">{asset.name}</p>
                
                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                      <User size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Custodian</p>
                      <p className="text-xs font-bold text-[#2C2C2C]">{asset.custodian || "Not Assigned"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                      <MapPin size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Location</p>
                      <p className="text-xs font-bold text-[#2C2C2C]">{asset.location || "Central Store"}</p>
                    </div>
                  </div>

                  {asset.purchase_date && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                        <Calendar size={14} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Purchased On</p>
                        <p className="text-xs font-bold text-[#2C2C2C]">{new Date(asset.purchase_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "categories" ? (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-gray-400 p-1 uppercase tracking-widest flex items-center gap-2">
                <Tag size={14} className="text-[#FF8C42]" />
                Asset Categories
              </h3>
              <button 
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-50 hover:bg-[#FF8C42]/10 text-[#FF8C42] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-dashed border-[#FF8C42]/30"
              >
                <Plus size={14} />
                New Category
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(cat => (
                <div key={cat.name} className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 hover:shadow-md transition-all text-center group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#FF8C42]/5 transition-colors shadow-sm">
                    <Tag className="text-gray-400 group-hover:text-[#FF8C42]" size={32} />
                  </div>
                  <h3 className="text-base font-bold text-[#2C2C2C]">{cat.asset_category_name}</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{cat.name}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Referenece</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Purpose</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {movements.map(mov => (
                  <tr key={mov.name} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-gray-300" />
                        <span className="text-sm font-bold text-[#2C2C2C]">{mov.transaction_date}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-lg">{mov.name}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        mov.purpose === 'Issue' 
                          ? 'bg-blue-50 text-blue-600 border-blue-100' 
                          : mov.purpose === 'Receipt' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {mov.purpose}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-gray-300 hover:text-gray-600 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Asset Detail Sidebar */}
      <RightSidebar
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        title={selectedAsset?.asset_name || "Asset Details"}
        description={`Asset ID: ${selectedAsset?.name}`}
      >
        {selectedAsset && (
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusColor(selectedAsset.status)}`}>
                  {selectedAsset.status}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Category</p>
                <p className="text-xs font-bold text-[#2C2C2C] truncate">{selectedAsset.asset_category}</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-black text-[#2C2C2C] uppercase tracking-widest flex items-center gap-2">
                <User size={16} className="text-[#FF8C42]" />
                Current Assignment
              </h3>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Custodian</p>
                  <p className="text-sm font-bold text-[#2C2C2C]">{selectedAsset.custodian || "Unallocated"}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Department</p>
                  <p className="text-sm font-bold text-[#2C2C2C]">{selectedAsset.department || "N/A"}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Location</p>
                  <div className="flex items-center gap-2 text-[#FF8C42]">
                    <MapPin size={14} />
                    <p className="text-sm font-bold">{selectedAsset.location || "Store"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-black text-[#2C2C2C] uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={16} className="text-[#FF8C42]" />
                Purchase Information
              </h3>
              <div className="bg-gray-50/50 rounded-3xl p-6 border border-dashed border-gray-200 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Purchase Date</p>
                  <p className="text-sm font-bold text-[#2C2C2C]">{selectedAsset.purchase_date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Price</p>
                  <p className="text-sm font-bold text-[#2C2C2C]">${selectedAsset.gross_purchase_amount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-gray-50 flex gap-4">
              <button 
                onClick={() => {
                  setMovementForm({
                    ...movementForm,
                    purpose: "Receipt",
                    asset: selectedAsset.name,
                    to_employee: selectedAsset.custodian || ""
                  });
                  setIsMovementModalOpen(true);
                }}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-600 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border border-gray-100 flex items-center justify-center gap-2"
              >
                Return Asset
              </button>
              <button 
                onClick={() => {
                  setMovementForm({
                    ...movementForm,
                    purpose: "Issue",
                    asset: selectedAsset.name,
                  });
                  setIsMovementModalOpen(true);
                }}
                className="flex-1 bg-[#FF8C42] hover:bg-[#F07B30] text-white px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                Reallocate
              </button>
            </div>
          </div>
        )}
      </RightSidebar>

      {/* Movement Modal */}
      <RightSidebar
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        title="Asset Movement"
        description="Allocate or return assets to/from employees."
      >
        <form onSubmit={handleMovementSubmit} className="space-y-6">
          <div className="space-y-1.5 transition-transform duration-300">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Purpose</label>
            <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
              {['Issue', 'Receipt', 'Transfer'].map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setMovementForm({...movementForm, purpose: p})}
                  className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                    movementForm.purpose === p 
                      ? 'bg-white text-[#FF8C42] shadow-sm ring-1 ring-gray-100' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {p === 'Issue' ? 'Allocate' : p === 'Receipt' ? 'Return' : 'Transfer'}
                </button>
              ))}
            </div>
          </div>

          <CustomSelect
            label="Select Asset"
            placeholder="Search assets..."
            options={assets.map(a => ({ value: a.name, label: `${a.asset_name} (${a.name})` }))}
            value={movementForm.asset ? { value: movementForm.asset, label: assets.find(a => a.name === movementForm.asset)?.asset_name || movementForm.asset } : null}
            onChange={(selected: any) => setMovementForm({...movementForm, asset: selected?.value || ""})}
          />

          <CustomSelect
            label={movementForm.purpose === 'Receipt' ? "Received From (Employee)" : "Assign To (Employee)"}
            placeholder="Search employee..."
            options={employees.map(e => ({ value: e.name, label: `${e.employee_name} (${e.name})` }))}
            value={movementForm.to_employee ? { value: movementForm.to_employee, label: employees.find(e => e.name === movementForm.to_employee)?.employee_name || movementForm.to_employee } : null}
            onChange={(selected: any) => setMovementForm({...movementForm, to_employee: selected?.value || ""})}
          />

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Target Location</label>
            <input 
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="e.g. Pune Office"
              value={movementForm.target_location}
              onChange={e => setMovementForm({...movementForm, target_location: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#FF8C42] hover:bg-[#F07B30] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={16} />}
            Confirm Movement
          </button>
        </form>
      </RightSidebar>

      {/* Add Asset Modal */}
      <RightSidebar
        isOpen={isAddAssetModalOpen}
        onClose={() => setIsAddAssetModalOpen(false)}
        title="Register New Asset"
        description="Add a new company asset to the inventory."
      >
        <form onSubmit={handleAddAssetSubmit} className="space-y-6">
          <div className="space-y-1.5 transition-transform duration-300">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Asset Name</label>
            <input 
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="e.g. MacBook Pro M3"
              value={assetForm.asset_name}
              onChange={e => setAssetForm({...assetForm, asset_name: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Item Code</label>
            <input 
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="e.g. LAP-001"
              value={assetForm.item_code}
              onChange={e => setAssetForm({...assetForm, item_code: e.target.value})}
            />
          </div>

          <CustomSelect
            label="Asset Category"
            placeholder="Select category..."
            options={categories.map(c => ({ value: c.name, label: c.asset_category_name }))}
            value={assetForm.asset_category ? { value: assetForm.asset_category, label: categories.find(c => c.name === assetForm.asset_category)?.asset_category_name || assetForm.asset_category } : null}
            onChange={(selected: any) => setAssetForm({...assetForm, asset_category: selected?.value || ""})}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Purchase Date</label>
              <input 
                type="date"
                required
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
                value={assetForm.purchase_date}
                onChange={e => setAssetForm({...assetForm, purchase_date: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Purchase Amount</label>
              <input 
                type="number"
                required
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
                placeholder="0.00"
                value={assetForm.gross_purchase_amount}
                onChange={e => setAssetForm({...assetForm, gross_purchase_amount: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#FF8C42] hover:bg-[#F07B30] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={16} />}
            Create Asset
          </button>
        </form>
      </RightSidebar>

      {/* Add Category Modal */}
      <RightSidebar
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        title="Create Category"
        description="Define a new classification for company assets."
      >
        <form onSubmit={handleAddCategorySubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Category Name</label>
            <input 
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/20 focus:bg-white transition-all text-sm font-bold text-[#2C2C2C]"
              placeholder="e.g. Laptops, Office Furniture"
              value={categoryForm.asset_category_name}
              onChange={e => setCategoryForm({ asset_category_name: e.target.value })}
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#FF8C42] hover:bg-[#F07B30] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={16} />}
            Create Category
          </button>
        </form>
      </RightSidebar>
    </div>
  );
}
