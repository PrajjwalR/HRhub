import { NextResponse } from "next/server";

export async function GET() {
  try {
    const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://localhost:8000";
    const FRAPPE_API_KEY = process.env.FRAPPE_API_KEY;
    const FRAPPE_API_SECRET = process.env.FRAPPE_API_SECRET;

    if (!FRAPPE_API_KEY || !FRAPPE_API_SECRET) {
      console.error("Missing Frappe API credentials in environment variables");
      return NextResponse.json(
        { error: "Server configuration error", details: "Missing API credentials" },
        { status: 500 }
      );
    }

    // Fetch all employees from Frappe with authentication
    const employeeResponse = await fetch(
      `${FRAPPE_URL}/api/resource/Employee?fields=["name","employee_name","designation","department","employment_type","status"]&limit_page_length=999`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`,
        },
      }
    );

    if (!employeeResponse.ok) {
      throw new Error("Failed to fetch employees from Frappe");
    }

    const employeeData = await employeeResponse.json();
    const employees = employeeData.data || [];

    // Generate avatar colors based on name hash
    const getAvatarColor = (name: string) => {
      const colors = [
        "bg-yellow-500", "bg-orange-500", "bg-amber-600", 
        "bg-green-600", "bg-blue-500", "bg-red-500", 
        "bg-purple-500", "bg-pink-500", "bg-indigo-500"
      ];
      const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };

    // Transform Frappe employee data to match our Employee interface
    const formattedEmployees = employees.map((emp: any, index: number) => ({
      id: emp.name || `emp-${index}`,
      name: emp.employee_name || emp.name || "Unknown Employee",
      role: emp.designation || "Employee",
      avatarColor: getAvatarColor(emp.employee_name || emp.name || ""),
      type: emp.employment_type || "Fulltime",
      // For now, set attendance data to null - can be enhanced later
      regular: null,
      overtime: null,
      sickLeave: null,
      pto: null,
      paidHoliday: null,
      totalHour: 0,
      approvedBy: undefined,
    }));

    console.log(`Fetched ${formattedEmployees.length} employees from Frappe`);

    return NextResponse.json(formattedEmployees);
  } catch (error: any) {
    console.error("Error fetching attendance data:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance data", details: error.message },
      { status: 500 }
    );
  }
}
