import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    
    let endpoint = "/api/resource/Employee?fields=[\"name\",\"employee_name\",\"designation\",\"department\",\"status\",\"image\",\"user_id\"]&limit_page_length=20";
    
    // If user_id is provided, filter by it (this links User to Employee)
    if (userId) {
      endpoint = `/api/resource/Employee?filters=[["user_id","=","${userId}"]]&fields=["name","employee_name","designation","department","status","image","user_id"]&limit_page_length=1`;
    }
    
    const data = await fetchFromFrappe(endpoint);
    
    console.log("Frappe API Response:", JSON.stringify(data, null, 2));
    console.log("Number of employees:", data.data?.length || 0);
    
    return NextResponse.json(data.data || []);
  } catch (error: any) {
    console.error("Error fetching employees from Frappe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
