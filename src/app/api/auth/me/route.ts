import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://localhost:8000";

    // Use NextRequest built-in cookies API for reliability
    const allCookies = request.cookies.getAll();
    console.log("=== /api/auth/me ===");
    console.log("Cookies received:", allCookies);

    const email = request.cookies.get("user_id")?.value;

    if (!email || email === "Guest") {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Read our fast local role cookie set during login
    let role = request.cookies.get("user_role")?.value || "employee";
    
    // Fallback if cookie somehow got cleared but session is still active
    if (!request.cookies.has("user_role") && (email === "hr@hr.com" || email.includes("admin"))) {
        role = "admin";
    }

    const fullName = request.cookies.get("full_name")?.value || email.split("@")[0];

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
