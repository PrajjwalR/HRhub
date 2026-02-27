import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, currentPassword, newPassword } = body;

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Email, current password, and new password are required" },
        { status: 400 }
      );
    }

    const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://167.71.197.132";
    const API_KEY = process.env.FRAPPE_API_KEY || "0af0bd0489bee94";
    const API_SECRET = process.env.FRAPPE_API_SECRET || "2b67ba6b66aadb7";

    // 1. Verify the current password by attempting to log in the user
    const loginResponse = await fetch(`${FRAPPE_URL}/api/method/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        usr: email,
        pwd: currentPassword,
      }),
    });

    if (!loginResponse.ok) {
      // If login fails, the current password was incorrect
      return NextResponse.json(
        { error: "Incorrect current password" },
        { status: 401 }
      );
    }

    // 2. We verified the old password, so now we can use our Admin API Keys to force set the new password
    const updateResponse = await fetch(`${FRAPPE_URL}/api/resource/User/${email}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `token ${API_KEY}:${API_SECRET}`,
      },
      body: JSON.stringify({
        new_password: newPassword,
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error("Frappe Update Password Error:", errorData);
      throw new Error("Failed to update password in Frappe");
    }

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Change Password Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update password" },
      { status: 500 }
    );
  }
}
