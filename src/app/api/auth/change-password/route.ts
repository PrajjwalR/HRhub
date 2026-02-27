import { NextRequest, NextResponse } from "next/server";

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

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://167.71.197.132";
    const API_KEY = process.env.FRAPPE_API_KEY || "0af0bd0489bee94";
    const API_SECRET = process.env.FRAPPE_API_SECRET || "2b67ba6b66aadb7";

    // Step 1: Verify the current password by attempting to log in
    try {
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
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 401 }
        );
      }
    } catch (loginError: any) {
      console.error("Login verification error:", loginError);
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Step 2: Use Admin API to update the password via the User resource
    try {
      const updateResponse = await fetch(`${FRAPPE_URL}/api/resource/User/${encodeURIComponent(email)}`, {
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

      const responseText = await updateResponse.text();

      if (!updateResponse.ok) {
        console.error("Frappe password update failed:", responseText);

        // Try to parse for a user-friendly error
        try {
          const errorData = JSON.parse(responseText);
          // Extract the message from Frappe's _server_messages or exception
          if (errorData._server_messages) {
            const messages = JSON.parse(errorData._server_messages);
            if (messages.length > 0) {
              const msg = JSON.parse(messages[0]);
              // Strip HTML tags from the message
              const cleanMsg = msg.message?.replace(/<[^>]*>/g, "").trim();
              return NextResponse.json(
                { error: cleanMsg || "Password does not meet requirements" },
                { status: 400 }
              );
            }
          }
          if (errorData.exception) {
            // Extract just the readable part
            const match = errorData.exception.match(/ValidationError:\s*(.*)/);
            if (match) {
              const cleanMsg = match[1].replace(/<[^>]*>/g, "").trim();
              return NextResponse.json(
                { error: cleanMsg || "Password does not meet Frappe requirements" },
                { status: 400 }
              );
            }
          }
        } catch (parseErr) {
          // couldn't parse, use generic error
        }

        return NextResponse.json(
          { error: "Failed to update password. Please try a stronger password." },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, message: "Password updated successfully" });
    } catch (updateError: any) {
      console.error("Password update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update password. Please try again." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Change Password Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
