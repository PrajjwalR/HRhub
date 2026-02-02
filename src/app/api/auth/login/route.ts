import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://localhost:8000";
    
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Email:", email);
    console.log("Frappe URL:", FRAPPE_URL);

    // Call Frappe login API
    const loginUrl = `${FRAPPE_URL}/api/method/login`;
    console.log("Calling:", loginUrl);
    
    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usr: email,
        pwd: password,
      }),
      credentials: "include",
    });

    console.log("Frappe response status:", response.status);
    console.log("Frappe response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Frappe login failed:", errorText);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const data = await response.json();
    console.log("Frappe login success:", data);

    // Get user details including role
    const userResponse = await fetch(`${FRAPPE_URL}/api/method/frappe.auth.get_logged_user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": response.headers.get("set-cookie") || "",
      },
      credentials: "include",
    });

    if (!userResponse.ok) {
      console.error("Failed to get user details");
      return NextResponse.json(
        { error: "Failed to fetch user details" },
        { status: 500 }
      );
    }

    const userData = await userResponse.json();
    console.log("User data:", userData);

    // Get user role from Frappe
    const roleResponse = await fetch(
      `${FRAPPE_URL}/api/resource/User/${email}?fields=["name","full_name","email","role_profile_name"]`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cookie": response.headers.get("set-cookie") || "",
        },
        credentials: "include",
      }
    );

    let role = "employee"; // default
    let fullName = email.split("@")[0];

    if (roleResponse.ok) {
      const roleData = await roleResponse.json();
      console.log("Role data:", roleData);
      fullName = roleData.data?.full_name || fullName;
      
      // Determine role based on Frappe role profile
      const roleProfile = roleData.data?.role_profile_name || "";
      role = roleProfile.toLowerCase().includes("admin") || 
             roleProfile.toLowerCase().includes("hr manager") 
             ? "admin" 
             : "employee";
    }

    // Create response with user data
    const user = {
      name: fullName,
      email: email,
      role: role,
    };

    console.log("Final user object:", user);

    // Set session cookie
    const sessionCookie = response.headers.get("set-cookie");
    const nextResponse = NextResponse.json({ 
      success: true, 
      user 
    });

    if (sessionCookie) {
      nextResponse.headers.set("Set-Cookie", sessionCookie);
    }

    return nextResponse;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed", details: error.message },
      { status: 500 }
    );
  }
}
