import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://localhost:8000";

    // Call Frappe logout API
    const response = await fetch(`${FRAPPE_URL}/api/method/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
      credentials: "include",
    });

    // Clear session cookie
    const nextResponse = NextResponse.json({ success: true });
    nextResponse.cookies.delete("sid");
    nextResponse.cookies.delete("system_user");
    nextResponse.cookies.delete("user_id");
    nextResponse.cookies.delete("user_role");
    nextResponse.cookies.delete("full_name");

    return nextResponse;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
