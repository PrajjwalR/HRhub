"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { generatePFReportData } from "@/app/actions/payroll.actions";

interface PFReportDownloaderProps {
  payrollEntryId: string;
  month: string;
  year: string;
}

export default function PFReportDownloader({
  payrollEntryId,
  month,
  year,
}: PFReportDownloaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch data securely via Next.js Server Action (Bypasses CORS!)
      const pfReportData = await generatePFReportData(payrollEntryId, month, year);

      if (!pfReportData || pfReportData.length === 0) {
        throw new Error("No PF data could be extracted from these salary slips.");
      }

      // 2. Generate Excel file using xlsx
      const worksheet = XLSX.utils.json_to_sheet(pfReportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "PF_Report");

      // 3. Download file
      const fileName = `PF_Report_${month}_${year}.xlsx`;
      XLSX.writeFile(workbook, fileName);

    } catch (err: any) {
      console.error("PF Report Error:", err);
      // Clean up server error messages for the UI
      const match = err.message.match(/Error: (.*)/);
      const cleanError = match ? match[1] : err.message;
      setError(cleanError || "An unknown error occurred while downloading the report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-sm max-w-sm">
      <h3 className="text-lg font-semibold mb-2">PF Contribution Report</h3>
      <p className="text-sm text-gray-500 mb-4">
        Generate the PF report for {month} {year}
      </p>

      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

      <button
        onClick={fetchAndDownload}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition disabled:opacity-50"
      >
        {loading ? "Generating Report..." : "Download PF Report (Excel)"}
      </button>
    </div>
  );
}
