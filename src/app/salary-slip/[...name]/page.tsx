"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Printer } from "lucide-react";
import Link from "next/link";
import { fetchSalarySlipDetails, SalarySlip, SalaryDetail } from "@/lib/frappePayroll";

export default function SalarySlipPage() {
  const params = useParams();
  const router = useRouter();
  // Join the array segments back into the slip name
  const slipName = Array.isArray(params.name) ? params.name.join("/") : params.name as string;

  const [salarySlip, setSalarySlip] = useState<SalarySlip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlip = async () => {
      try {
        setIsLoading(true);
        const slip = await fetchSalarySlipDetails(slipName);
        setSalarySlip(slip);
      } catch (err: any) {
        setError(err.message || "Failed to load salary slip");
      } finally {
        setIsLoading(false);
      }
    };

    if (slipName) {
      fetchSlip();
    }
  }, [slipName]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a printable version and trigger download
    const printContent = document.getElementById("salary-slip-content");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Salary Slip - ${salarySlip?.employee_name}</title>
          <style>
            ${getSlipStyles()}
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7D046] mb-4"></div>
          <p className="text-gray-500">Loading salary slip...</p>
        </div>
      </div>
    );
  }

  if (error || !salarySlip) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">⚠️ {error || "Salary slip not found"}</p>
          <Link
            href="/payroll"
            className="px-6 py-2 bg-[#F7D046] text-[#2C2C2C] font-medium rounded-lg hover:bg-[#E5C03E]"
          >
            Back to Payroll
          </Link>
        </div>
      </div>
    );
  }

  const maxRows = Math.max(salarySlip.earnings.length, salarySlip.deductions.length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden on print */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/payroll"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-serif text-[#2C2C2C]">Salary Slip</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-[#2C2C2C] font-medium rounded-lg hover:bg-gray-50"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-[#F7D046] text-[#2C2C2C] font-medium rounded-lg hover:bg-[#E5C03E]"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Salary Slip Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <div className="bg-white shadow-sm print:shadow-none" id="salary-slip-content">
          <style dangerouslySetInnerHTML={{ __html: getSlipStyles() }} />

          {/* Header */}
          <div className="header-box">
            <div className="company-name">{salarySlip.company}</div>
            <div className="title">
              Payslip for the month of {formatDate(salarySlip.start_date)} to{" "}
              {formatDate(salarySlip.end_date)}
            </div>
          </div>

          {/* Employee Info Table */}
          <table>
            <tbody>
              <tr>
                <td className="info-label">Name:</td>
                <td style={{ width: "25%", color: "#000", fontWeight: "600" }}>{salarySlip.employee_name}</td>
                <td className="info-label">Employee No:</td>
                <td style={{ width: "25%", color: "#000" }}>{salarySlip.employee}</td>
              </tr>
              <tr>
                <td className="info-label">Joining Date:</td>
                <td style={{ color: "#000" }}>{salarySlip.date_of_joining ? formatDate(salarySlip.date_of_joining) : "-"}</td>
                <td className="info-label">Bank Name:</td>
                <td style={{ color: "#000" }}>{salarySlip.bank_name || "-"}</td>
              </tr>
              <tr>
                <td className="info-label">Designation:</td>
                <td style={{ color: "#000" }}>{salarySlip.designation || "-"}</td>
                <td className="info-label">Bank Account No:</td>
                <td style={{ color: "#000" }}>{salarySlip.bank_account_no || "-"}</td>
              </tr>
              <tr>
                <td className="info-label">Location:</td>
                <td style={{ color: "#000" }}>{salarySlip.branch || "-"}</td>
                <td className="info-label">PAN Number:</td>
                <td style={{ color: "#000" }}>{salarySlip.pan_number || "-"}</td>
              </tr>
              <tr>
                <td className="info-label">Effective Work Days:</td>
                <td style={{ color: "#000" }}>{salarySlip.payment_days}</td>
                <td className="info-label">PF UAN:</td>
                <td style={{ color: "#000" }}>{salarySlip.uan || "-"}</td>
              </tr>
            </tbody>
          </table>

          <br />

          {/* Earnings and Deductions Table */}
          <table>
            <thead>
              <tr>
                <th colSpan={2} style={{ fontSize: "12px", textAlign: "center", fontWeight: 600 }}>
                  EARNINGS
                </th>
                <th colSpan={2} style={{ fontSize: "12px", textAlign: "center", fontWeight: 600 }}>
                  DEDUCTIONS
                </th>
              </tr>
              <tr>
                <th>Description</th>
                <th className="right">Amount</th>
                <th>Description</th>
                <th className="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxRows }).map((_, i) => (
                <tr key={i}>
                  {i < salarySlip.earnings.length ? (
                    <>
                      <td>{salarySlip.earnings[i].salary_component}</td>
                      <td className="right">{formatCurrency(salarySlip.earnings[i].amount)}</td>
                    </>
                  ) : (
                    <>
                      <td></td>
                      <td></td>
                    </>
                  )}
                  {i < salarySlip.deductions.length ? (
                    <>
                      <td>{salarySlip.deductions[i].salary_component}</td>
                      <td className="right">{formatCurrency(salarySlip.deductions[i].amount)}</td>
                    </>
                  ) : (
                    <>
                      <td></td>
                      <td></td>
                    </>
                  )}
                </tr>
              ))}
              <tr style={{ fontWeight: 500, backgroundColor: "#f2f2f2" }}>
                <td>TOTAL EARNINGS</td>
                <td className="right">{formatCurrency(salarySlip.gross_pay)}</td>
                <td>TOTAL DEDUCTIONS</td>
                <td className="right">{formatCurrency(salarySlip.total_deduction)}</td>
              </tr>
            </tbody>
          </table>

          <br />

          {/* Net Pay Summary */}
          <table style={{ border: "2px solid #000" }}>
            <tbody>
              <tr style={{ fontSize: "13px", fontWeight: 500, backgroundColor: "#e8e8e8" }}>
                <td>Net Pay for the Month</td>
                <td className="right" style={{ width: "150px" }}>
                  {formatCurrency(salarySlip.net_pay)}
                </td>
              </tr>
              {salarySlip.total_in_words && (
                <tr>
                  <td colSpan={2}>
                    <i>(Rupees {salarySlip.total_in_words} Only)</i>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={{ textAlign: "center", fontSize: "10px", marginTop: "20px" }}>
            This is a system generated payslip and does not require signature.
          </div>
        </div>
      </div>
    </div>
  );
}

function getSlipStyles() {
  return `
    @media print {
      body { margin: 0; padding: 20px; }
      .print\\:hidden { display: none !important; }
      .print\\:p-0 { padding: 0 !important; }
      .print\\:shadow-none { box-shadow: none !important; }
    }
    
    body { font-family: Arial, sans-serif; font-size: 11px; color: #000; }
    table { width: 100%; border-collapse: collapse; margin-top: 5px; }
    td, th { border: 1px solid #000; padding: 5px; vertical-align: top; color: #000; }
    
    th { 
      background-color: #f2f2f2; 
      font-weight: 700;
      font-size: 12px; 
      text-align: left;
      color: #000;
    }
    .company-name { 
      font-size: 18px;
      font-weight: 700;
      text-transform: uppercase; 
      margin-bottom: 2px;
      color: #000 !important;
    }
    .header-box {
      text-align: center;
      padding: 10px;
      margin-bottom: 10px;
      color: #000;
    }
    .title {
      font-size: 13px;
      font-weight: 600;
      margin: 5px 0;
      color: #000;
    }
    .info-label { 
      font-weight: 700;
      background-color: #f9f9f9; 
      width: 25%; 
      color: #000;
    }
    .right { text-align: right; }
  `;
}
