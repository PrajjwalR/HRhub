import { NextResponse } from "next/server";

const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://localhost:8000";
const FRAPPE_API_KEY = process.env.FRAPPE_API_KEY;
const FRAPPE_API_SECRET = process.env.FRAPPE_API_SECRET;

const headers = {
  "Content-Type": "application/json",
  "Authorization": `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employee = searchParams.get("employee");
    
    if (!employee) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Step 1: Get Employee's Holiday List and Company
    const empUrl = `${FRAPPE_URL}/api/resource/Employee/${employee}?fields=["holiday_list","company"]`;
    const empRes = await fetch(empUrl, { headers });
    if (!empRes.ok) throw new Error("Failed to fetch employee details");
    const empData = await empRes.json();
    
    let holidayListName = empData.data.holiday_list;
    const company = empData.data.company;

    // Step 2: If Employee has no holiday list, get Company's default
    if (!holidayListName && company) {
      const compUrl = `${FRAPPE_URL}/api/resource/Company/${company}?fields=["default_holiday_list"]`;
      const compRes = await fetch(compUrl, { headers });
      if (compRes.ok) {
        const compData = await compRes.json();
        holidayListName = compData.data.default_holiday_list;
      }
    }

    if (!holidayListName) {
      return NextResponse.json({ holidays: [], weekly_off: "Sunday" });
    }

    // Step 3: Fetch the Holiday List details
    const hlUrl = `${FRAPPE_URL}/api/resource/Holiday List/${encodeURIComponent(holidayListName)}`;
    const hlRes = await fetch(hlUrl, { headers });
    if (!hlRes.ok) throw new Error("Failed to fetch holiday list details");
    const hlData = await hlRes.json();

    return NextResponse.json({
      holidays: hlData.data.holidays || [],
      weekly_off: hlData.data.weekly_off || "Sunday",
      name: holidayListName
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
