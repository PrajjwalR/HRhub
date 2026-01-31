"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface OvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hours: number) => void;
  employeeName: string;
}

export default function OvertimeModal({ isOpen, onClose, onSave, employeeName }: OvertimeModalProps) {
  const [hours, setHours] = useState<string>("");

  if (!isOpen) return null;

  const handleSave = () => {
    const hoursNum = parseFloat(hours) || 0;
    onSave(hoursNum);
    setHours("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#2C2C2C]">Overtime</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Payment Type
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F7D046] focus:ring-1 focus:ring-[#F7D046]"
            />
            <div className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50">
              hrs
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-[#F7D046] text-[#2C2C2C] text-sm font-medium rounded-lg hover:bg-[#E5C03E] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
