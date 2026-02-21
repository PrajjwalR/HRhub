"use server";

export async function generatePFReportData(payrollEntryId: string, month: string, year: string) {
  const frappeUrl = process.env.FRAPPE_URL || process.env.NEXT_PUBLIC_FRAPPE_URL;
  const apiKey = process.env.FRAPPE_API_KEY || process.env.NEXT_PUBLIC_FRAPPE_API_KEY;
  const apiSecret = process.env.FRAPPE_API_SECRET || process.env.NEXT_PUBLIC_FRAPPE_API_SECRET;

  if (!frappeUrl || !apiKey || !apiSecret) {
    throw new Error("Frappe API credentials are not fully configured on the server.");
  }

  const authToken = `token ${apiKey}:${apiSecret}`;

  try {
    // 1. Fetch Salary Slips linked to the Payroll Entry
    const slipRes = await fetch(
      `${frappeUrl}/api/resource/Salary Slip?filters=[["payroll_entry","=","${payrollEntryId}"]]&fields=["name","employee"]`,
      {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
        cache: "no-store"
      }
    );

    if (!slipRes.ok) {
      const errorText = await slipRes.text();
      throw new Error(`Failed to fetch salary slips. Status: ${slipRes.status}. Details: ${errorText}`);
    }
    
    const slipData = await slipRes.json();
    const slips = slipData.data || [];

    if (slips.length === 0) {
      throw new Error(`No salary slips found for Payroll Entry: ${payrollEntryId}`);
    }

    // 2. Fetch details for each salary slip concurrently
    const slipPromises = slips.map(async (slip: any) => {
      try {
        // Fetch full salary slip details
        const slipDetailRes = await fetch(`${frappeUrl}/api/resource/Salary Slip/${slip.name}`, {
          headers: { Authorization: authToken },
          cache: "no-store"
        });
        const slipDetailData = await slipDetailRes.json();
        const slipDetails = slipDetailData.data;

        // Fetch Employee details for UAN
        const empRes = await fetch(`${frappeUrl}/api/resource/Employee/${slip.employee}`, {
          headers: { Authorization: authToken },
          cache: "no-store"
        });
        const empData = await empRes.json();
        const uanNumber = empData.data?.uan_number || "N/A";

        // Extract Employee PF (from deductions table)
        let employeePF = 0;
        if (slipDetails.deductions && Array.isArray(slipDetails.deductions)) {
          const pfDeduction = slipDetails.deductions.find(
            (d: any) => d.salary_component === "Provident Fund"
          );
          if (pfDeduction) {
            employeePF = pfDeduction.amount || 0;
          }
        }

        // Extract Employer PF
        const employerPF = slipDetails.employer_pf || 0;

        return {
          "UAN Number": uanNumber,
          "Employee PF Contribution": employeePF,
          "Employer PF Contribution": employerPF,
        };
      } catch (err) {
        console.error(`Error processing slip ${slip.name}:`, err);
        return null; // Skip failed slips
      }
    });

    // Wait for all requests to finish
    const rawReportData = await Promise.all(slipPromises);
    
    // Filter out any nulls from failed requests
    const pfReportData = rawReportData.filter((data) => data !== null);

    if (pfReportData.length === 0) {
      throw new Error("No PF data could be extracted from these salary slips.");
    }

    return pfReportData;

  } catch (error: any) {
    console.error("Server Action Error:", error);
    throw new Error(error.message || "Failed to generate PF report data on the server.");
  }
}
