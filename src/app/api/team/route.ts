import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("manager_id"); // Employee ID of the manager
    
    if (!managerId) {
      return NextResponse.json({ error: "Manager Employee ID is required" }, { status: 400 });
    }

    // Parse role cookie to see if they're super admin
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map(v => v.split(/=(.*)/).map(decodeURIComponent))
    );
    const isSuperAdmin = cookies.user_role === "admin";

    // Fetch manager's company to scoped queries
    let managerCompany = "";
    if (isSuperAdmin && managerId) {
      try {
        const managerRes = await fetchFromFrappe(`/api/resource/Employee/${managerId}`);
        if (managerRes.data && managerRes.data.company) {
            managerCompany = managerRes.data.company;
        }
      } catch (e) {
          console.error("Could not fetch manager company", e);
      }
    }

    // If super admin, fetch all active employees in their company. Else, fetch specific direct reports.
    let endpoint = `/api/resource/Employee?filters=[["reports_to","=","${managerId}"]]&fields=["name","employee_name","designation","department"]&limit_page_length=100`;
    if (isSuperAdmin) {
      if (managerCompany) {
        endpoint = `/api/resource/Employee?filters=[["status","=","Active"],["company","=","${managerCompany}"]]&fields=["name","employee_name","designation","department"]&limit_page_length=100`;
      } else {
        endpoint = `/api/resource/Employee?filters=[["status","=","Active"]]&fields=["name","employee_name","designation","department"]&limit_page_length=100`;
      }
    }
    
    const data = await fetchFromFrappe(endpoint);
    
    return NextResponse.json(data.data || []);
  } catch (error: any) {
    console.error("Error fetching team from Frappe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
