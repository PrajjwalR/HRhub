import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("manager_id"); // Employee ID of the manager
    
    if (!managerId) {
      return NextResponse.json({ error: "Manager Employee ID is required" }, { status: 400 });
    }

    // Fetch subordinates where reports_to matches managerId
    const endpoint = `/api/resource/Employee?filters=[["reports_to","=","${managerId}"]]&fields=["name","employee_name","designation","department"]`;
    
    const data = await fetchFromFrappe(endpoint);
    
    return NextResponse.json(data.data || []);
  } catch (error: any) {
    console.error("Error fetching team from Frappe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
