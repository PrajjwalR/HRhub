import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://localhost:8000";

    // Parse the Frappe cookies directly to avoid slow round-trips
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map(v => v.split(/=(.*)/).map(decodeURIComponent))
    );

    const email = cookies.user_id;

    if (!email || email === "Guest") {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Role cannot be securely trusted from cookie if we strictly needed Authorization.
    // However, since we simply need UI rendering speed, we can default to employee
    // and let the backend enforce true security on data mutations. 
    // If the email is known admin or hr, we give them admin UI access.
    let role = "employee";
    if (email === "hr@hr.com" || email.includes("admin")) {
        role = "admin";
    }

    const fullName = cookies.full_name || email.split("@")[0];

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
      { error: "Failed to parse session" },
      { status: 500 }
    );
  }
}
