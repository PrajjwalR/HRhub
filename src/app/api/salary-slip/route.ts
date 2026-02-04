import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://167.71.197.132";
  const FRAPPE_API_KEY = process.env.FRAPPE_API_KEY;
  const FRAPPE_API_SECRET = process.env.FRAPPE_API_SECRET;

  if (!FRAPPE_API_KEY || !FRAPPE_API_SECRET) {
    return NextResponse.json(
      { error: "Frappe API credentials not configured" },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const employeeId = searchParams.get("employee");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  try {
    let filters = employeeId ? `[["employee","=","${employeeId}"]]` : "[]";
    
    if (startDate && endDate) {
      filters = `[["employee","=","${employeeId}"],["start_date",">=","${startDate}"],["end_date","<=","${endDate}"]]`;
    }

    const response = await fetch(
      `${FRAPPE_URL}/api/resource/Salary Slip?filters=${filters}&fields=["*"]&order_by=posting_date desc`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Frappe API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data.data || []);
  } catch (error: any) {
    console.error("Error fetching salary slips:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch salary slips" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://167.71.197.132";
  const FRAPPE_API_KEY = process.env.FRAPPE_API_KEY;
  const FRAPPE_API_SECRET = process.env.FRAPPE_API_SECRET;

  if (!FRAPPE_API_KEY || !FRAPPE_API_SECRET) {
    return NextResponse.json(
      { error: "Frappe API credentials not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { 
      employee, 
      posting_date, 
      start_date, 
      end_date,
      // Additional fields from wizard
      payment_days,
      total_working_hours,
      hour_rate,
      // Earnings components
      earnings = [],
      // Deduction components  
      deductions = [],
    } = body;

    if (!employee || !posting_date || !start_date || !end_date) {
      return NextResponse.json(
        { error: "Missing required fields: employee, posting_date, start_date, end_date" },
        { status: 400 }
      );
    }

    // Build salary slip data
    const salarySlipData: Record<string, any> = {
      employee,
      posting_date,
      start_date,
      end_date,
    };

    // Add optional fields if provided
    if (payment_days !== undefined) {
      salarySlipData.payment_days = payment_days;
    }

    // Add custom earnings if provided
    if (earnings.length > 0) {
      salarySlipData.earnings = earnings;
    }

    // Add custom deductions if provided
    if (deductions.length > 0) {
      salarySlipData.deductions = deductions;
    }

    // Create salary slip in Frappe
    const response = await fetch(`${FRAPPE_URL}/api/resource/Salary Slip`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`,
      },
      body: JSON.stringify(salarySlipData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Frappe salary slip creation error:", errorData);
      throw new Error(errorData.exception || errorData._server_messages || `Frappe API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data.data);
  } catch (error: any) {
    console.error("Error creating salary slip:", error);
    
    // Use 409 Conflict for "already created" errors
    const isDuplicate = error.message?.includes("already created for this period") || 
                        error.message?.includes("Salary Slip already exists");
    
    return NextResponse.json(
      { error: error.message || "Failed to create salary slip" },
      { status: isDuplicate ? 409 : 500 }
    );
  }
}
