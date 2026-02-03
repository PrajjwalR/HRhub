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

  if (!employeeId) {
    return NextResponse.json(
      { error: "Employee ID is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch salary structure assignment for the employee
    const response = await fetch(
      `${FRAPPE_URL}/api/resource/Salary Structure Assignment?filters=[["employee","=","${employeeId}"],["docstatus","=",1]]&fields=["*"]&order_by=from_date desc&limit=1`,
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
    
    // Return the first assignment or null
    const assignment = data.data && data.data.length > 0 ? data.data[0] : null;
    
    return NextResponse.json(assignment);
  } catch (error: any) {
    console.error("Error fetching salary assignment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch salary assignment" },
      { status: 500 }
    );
  }
}
