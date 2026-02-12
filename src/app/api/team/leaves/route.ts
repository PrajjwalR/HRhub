import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("manager_id");

    if (!managerId) {
      return NextResponse.json({ error: "Manager Employee ID is required" }, { status: 400 });
    }

    // Step 1: Get subordinates
    const subordinatesEndpoint = `/api/resource/Employee?filters=[["reports_to","=","${managerId}"]]&fields=["name"]`;
    const subordinatesData = await fetchFromFrappe(subordinatesEndpoint);
    const subordinateIds = subordinatesData.data?.map((s: any) => s.name) || [];

    if (subordinateIds.length === 0) {
      return NextResponse.json([]);
    }

    // Step 2: Get leave applications for these subordinates
    const fields = ["name", "employee", "employee_name", "leave_type", "from_date", "to_date", "total_leave_days", "status", "posting_date"];
    const filters = [["employee", "in", subordinateIds]];
    
    // We want to see Pending/Open leaves first
    const leavesEndpoint = `/api/resource/Leave Application?filters=${JSON.stringify(filters)}&fields=${JSON.stringify(fields)}&order_by=creation desc`;
    
    try {
      const leavesData = await fetchFromFrappe(leavesEndpoint);
      return NextResponse.json(leavesData.data || []);
    } catch (error: any) {
      console.warn("Retrying Team Leaves fetch with minimal fields...");
      const fallbackFields = ["name", "employee", "leave_type", "from_date", "to_date", "status", "posting_date"];
      const fallbackEndpoint = `/api/resource/Leave Application?filters=${JSON.stringify(filters)}&fields=${JSON.stringify(fallbackFields)}&order_by=creation desc`;
      const fallbackData = await fetchFromFrappe(fallbackEndpoint);
      return NextResponse.json(fallbackData.data || []);
    }
  } catch (error: any) {
    console.error("Error fetching team leaves:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
