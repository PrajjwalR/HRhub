import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://localhost:8000";

    // Get current logged-in user from Frappe
    const response = await fetch(`${FRAPPE_URL}/api/method/frappe.auth.get_logged_user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
      credentials: "include",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const data = await response.json();
    const email = data.message;

    if (!email || email === "Guest") {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user details
    const userResponse = await fetch(
      `${FRAPPE_URL}/api/resource/User/${email}?fields=["name","full_name","email","role_profile_name"]`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cookie": request.headers.get("cookie") || "",
        },
        credentials: "include",
      }
    );

    let role = "employee";
    let fullName = email.split("@")[0];

    if (userResponse.ok) {
      const userData = await userResponse.json();
      fullName = userData.data?.full_name || fullName;
      
      const roleProfile = userData.data?.role_profile_name || "";
      role = roleProfile.toLowerCase().includes("admin") || 
             roleProfile.toLowerCase().includes("hr manager") 
             ? "admin" 
             : "employee";
    }

    return NextResponse.json({
      user: {
        name: fullName,
        email: email,
        role: role,
      },
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    );
  }
}
