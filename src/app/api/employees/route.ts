import { NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET() {
  try {
    // Fetching basic employee details
    // We can add filters or specific fields here
    const data = await fetchFromFrappe("/api/resource/Employee?fields=[\"name\",\"employee_name\",\"designation\",\"department\",\"status\",\"image\"]&limit_page_length=20");
    
    console.log("Frappe API Response:", JSON.stringify(data, null, 2));
    console.log("Number of employees:", data.data?.length || 0);
    
    return NextResponse.json(data.data || []);
  } catch (error: any) {
    console.error("Error fetching employees from Frappe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
