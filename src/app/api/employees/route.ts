import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    
    let endpoint = "/api/resource/Employee?fields=[\"name\",\"employee_name\",\"designation\",\"department\",\"status\",\"image\",\"user_id\",\"date_of_joining\",\"company\",\"cell_number\",\"personal_email\",\"uan\"]&limit_page_length=100";
    
    // If user_id is provided, filter by it (this links User to Employee)
    if (userId) {
      endpoint = `/api/resource/Employee?filters=[["user_id","=","${userId}"]]&fields=["name","employee_name","designation","department","status","image","user_id","date_of_joining","company","cell_number","personal_email","uan"]&limit_page_length=1`;
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, ...fieldsToUpdate } = body;

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Only allow updating specific fields to prevent overriding sensitive data
    const allowedFields = [
      "personal_email",
      "cell_number",
      "company",
      "department",
      "date_of_joining",
      "uan"
    ];

    const updateData: any = {};
    for (const key of allowedFields) {
      if (fieldsToUpdate[key] !== undefined) {
        updateData[key] = fieldsToUpdate[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
    }

    const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://167.71.197.132";
    const API_KEY = process.env.FRAPPE_API_KEY || "0af0bd0489bee94";
    const API_SECRET = process.env.FRAPPE_API_SECRET || "2b67ba6b66aadb7";

    const response = await fetch(`${FRAPPE_URL}/api/resource/Employee/${employeeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `token ${API_KEY}:${API_SECRET}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Frappe Update Error:", errorData);
      throw new Error(errorData.exc_type || "Failed to update employee in Frappe");
    }

    const data = await response.json();
    return NextResponse.json(data.data);
  } catch (error: any) {
    console.error("Error updating employee in Frappe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
