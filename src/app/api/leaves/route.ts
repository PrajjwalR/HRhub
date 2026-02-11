import { NextResponse } from "next/server";

const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://localhost:8000";
const FRAPPE_API_KEY = process.env.FRAPPE_API_KEY;
const FRAPPE_API_SECRET = process.env.FRAPPE_API_SECRET;

const headers = {
  "Content-Type": "application/json",
  "Authorization": `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employee = searchParams.get("employee");
    const id = searchParams.get("id");
    
    if (id) {
      const url = `${FRAPPE_URL}/api/resource/Leave Application/${id}`;
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error("Failed to fetch leave details");
      const data = await response.json();
      return NextResponse.json(data.data);
    }

    const params = new URLSearchParams();
    const fields = ["name", "employee", "leave_type", "from_date", "to_date", "total_leave_days", "status", "posting_date", "reason", "docstatus"];
    params.set("fields", JSON.stringify(fields));
    params.set("order_by", "posting_date desc");
    
    if (employee) {
      params.set("filters", JSON.stringify([["employee", "=", employee]]));
    }

    const url = `${FRAPPE_URL}/api/resource/Leave Application?${params.toString()}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Frappe Leaves Fetch Error:", errorText);
      // If full fields list fails, try a minimal set as fallback
      if (response.status === 417 || response.status === 500) {
        const fallbackParams = new URLSearchParams();
        fallbackParams.set("fields", JSON.stringify(["name", "leave_type", "from_date", "to_date", "status", "posting_date"]));
        if (employee) fallbackParams.set("filters", JSON.stringify([["employee", "=", employee]]));
        const fallbackUrl = `${FRAPPE_URL}/api/resource/Leave Application?${fallbackParams.toString()}`;
        const fallbackRes = await fetch(fallbackUrl, { headers });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          return NextResponse.json(fallbackData.data || []);
        }
      }
      throw new Error(`Failed to fetch leaves: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data.data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const payload = {
      employee: body.employee,
      leave_type: body.leave_type,
      from_date: body.from_date,
      to_date: body.to_date,
      half_day: body.half_day || 0,
      reason: body.reason || "",
      doctype: "Leave Application",
    };

    const response = await fetch(`${FRAPPE_URL}/api/resource/Leave Application`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const detailedError = errorData._server_messages 
        ? JSON.parse(errorData._server_messages).map((m: any) => JSON.parse(m).message).join(", ")
        : errorData.message || "Failed to create leave application";

      return NextResponse.json({ error: detailedError }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const response = await fetch(`${FRAPPE_URL}/api/resource/Leave Application/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message || "Failed to update leave" }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing leave ID" }, { status: 400 });

    // Try to cancel first (docstatus=2), then delete if it's already cancelled or in draft
    // In Frappe, we can often just call DELETE on the resource if permitted.
    const response = await fetch(`${FRAPPE_URL}/api/resource/Leave Application/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message || "Failed to delete leave" }, { status: response.status });
    }

    return NextResponse.json({ message: "Leave application deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
