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
    console.log("Frappe login success");

    // We already have the email, so we don't need to call get_logged_user! 
    // We can just query the User document immediately to get their role profile.
    const roleResponse = await fetch(
      `${FRAPPE_URL}/api/resource/User/${email}`,
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
      fullName = roleData.data?.full_name || fullName;
      
      // Determine role based on Frappe roles array or role profile
      const roleProfile = (roleData.data?.role_profile_name || "").toLowerCase();
      const rolesArray = roleData.data?.roles || [];
      const hasAdminRole = rolesArray.some((r: any) => 
        r.role === "System Manager" || 
        r.role === "Administrator" || 
        r.role === "HR Manager"
      );

      role = hasAdminRole || roleProfile.includes("admin") || roleProfile.includes("hr manager") 
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
    const nextResponse = NextResponse.json({ 
      success: true, 
      user 
    });

    try {
      // getSetCookie() returns an array of raw Set-Cookie strings from Frappe
      const cookiesArray = response.headers.getSetCookie();
      
      for (let cookieStr of cookiesArray) {
        // Fix for localhost: Strip strict security flags so the browser accepts 
        // the cross-origin cookie on HTTP localhost
        if (process.env.NODE_ENV !== "production") {
            cookieStr = cookieStr.replace(/;\s*Secure/gi, "");
            cookieStr = cookieStr.replace(/;\s*SameSite=(Strict|None)/gi, "; SameSite=Lax");
            cookieStr = cookieStr.replace(/;\s*Domain=[^;]+/gi, "");
        }
        nextResponse.headers.append("Set-Cookie", cookieStr);
      }
    } catch (e) {
      console.error("Failed to parse cookies from Frappe:", e);
    }
    
    // Set our own session cookies since Frappe does NOT forward sid/user_id
    // when called from server-side Node.js fetch (only user_image is sent)
    nextResponse.cookies.set("user_id", email, { path: "/", maxAge: 612000, sameSite: "lax" });
    nextResponse.cookies.set("user_role", role, { path: "/", maxAge: 612000, sameSite: "lax" });
    nextResponse.cookies.set("full_name", fullName, { path: "/", maxAge: 612000, sameSite: "lax" });

    return nextResponse;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed", details: error.message },
      { status: 500 }
    );
  }
}
