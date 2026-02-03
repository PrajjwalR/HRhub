// Frappe Payroll API Utilities
// Direct API calls to Frappe for payroll operations

const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://167.71.197.132";

// Helper to get API credentials from environment
const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  // For client-side calls, we'll use the API key from public env vars
  // Note: This is less secure but simpler for direct API calls
  const apiKey = process.env.NEXT_PUBLIC_FRAPPE_API_KEY || process.env.FRAPPE_API_KEY;
  const apiSecret = process.env.NEXT_PUBLIC_FRAPPE_API_SECRET || process.env.FRAPPE_API_SECRET;
  
  if (apiKey && apiSecret) {
    headers["Authorization"] = `token ${apiKey}:${apiSecret}`;
  }
  
  return headers;
};

export interface SalaryStructure {
  name: string;
  company: string;
  payroll_frequency: string;
  is_active: string;
  earnings: SalaryDetail[];
  deductions: SalaryDetail[];
}

export interface SalaryDetail {
  salary_component: string;
  abbr: string;
  amount: number;
  formula?: string;
  depends_on_payment_days?: number;
}

export interface SalaryStructureAssignment {
  name: string;
  employee: string;
  employee_name: string;
  salary_structure: string;
  from_date: string;
  base: number;
  variable?: number;
  department?: string;
  designation?: string;
  docstatus: number;
}

export interface SalarySlip {
  name: string;
  employee: string;
  employee_name: string;
  posting_date: string;
  start_date: string;
  end_date: string;
  salary_structure: string;
  company?: string;
  designation?: string;
  department?: string;
  branch?: string;
  date_of_joining?: string;
  bank_name?: string;
  bank_account_no?: string;
  pan_number?: string;
  uan?: string;
  gross_pay: number;
  total_deduction: number;
  net_pay: number;
  payment_days: number;
  total_working_days: number;
  total_in_words?: string;
  status: string;
  earnings: SalaryDetail[];
  deductions: SalaryDetail[];
  docstatus: number;
}

/**
 * Fetch all active salary structures
 */
export async function fetchSalaryStructures(): Promise<SalaryStructure[]> {
  const response = await fetch(
    `${FRAPPE_URL}/api/resource/Salary Structure?filters=[["is_active","=","Yes"]]&fields=["*"]`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch salary structures: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Fetch salary structure assignment for an employee
 */
export async function fetchEmployeeSalaryAssignment(
  employeeId: string
): Promise<SalaryStructureAssignment | null> {
  // Use the Next.js API route to avoid CORS issues
  const response = await fetch(`/api/salary-assignment?employee=${employeeId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch salary assignment: ${response.statusText}`);
  }

  const data = await response.json();
  return data || null;
}

/**
 * Fetch salary slips for an employee
 */
export async function fetchEmployeeSalarySlips(
  employeeId: string,
  startDate?: string,
  endDate?: string
): Promise<SalarySlip[]> {
  let url = `/api/salary-slip?employee=${employeeId}`;
  
  if (startDate && endDate) {
    url += `&start_date=${startDate}&end_date=${endDate}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch salary slips: ${response.statusText}`);
  }

  const data = await response.json();
  return data || [];
}

/**
 * Create a new salary slip for an employee
 */
export async function createSalarySlip(data: {
  employee: string;
  posting_date: string;
  start_date: string;
  end_date: string;
}): Promise<SalarySlip> {
  const response = await fetch(`/api/salary-slip`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to create salary slip: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
}

/**
 * Get a specific salary slip with full details
 */
export async function fetchSalarySlipDetails(slipName: string): Promise<SalarySlip> {
  const response = await fetch(`/api/salary-slip/${slipName}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch salary slip details: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Submit a salary slip (change status from Draft to Submitted)
 */
export async function submitSalarySlip(slipName: string): Promise<void> {
  const response = await fetch(
    `${FRAPPE_URL}/api/resource/Salary Slip/${slipName}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        docstatus: 1, // 0 = Draft, 1 = Submitted, 2 = Cancelled
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to submit salary slip: ${response.statusText}`);
  }
}

/**
 * Download salary slip PDF
 */
export function getSalarySlipPDFUrl(slipName: string): string {
  return `${FRAPPE_URL}/api/method/frappe.utils.print_format.download_pdf?doctype=Salary Slip&name=${slipName}&format=Salary Slip Standard&no_letterhead=0`;
}
