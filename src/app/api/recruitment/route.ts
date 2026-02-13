import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "openings" or "applicants"

    if (type === "openings") {
      const endpoint = "/api/resource/Job Opening?fields=[\"name\",\"job_title\",\"status\",\"department\",\"designation\",\"posted_on\"]&limit_page_length=20";
      const data = await fetchFromFrappe(endpoint);
      return NextResponse.json(data.data || []);
    } else if (type === "applicants") {
      const endpoint = "/api/resource/Job Applicant?fields=[\"name\",\"applicant_name\",\"status\",\"job_title\",\"email_id\",\"phone_number\",\"creation\"]&order_by=creation desc&limit_page_length=20";
      const data = await fetchFromFrappe(endpoint);
      return NextResponse.json(data.data || []);
    }

    // Default: fetch both if no type specified
    const [openings, applicants] = await Promise.all([
      fetchFromFrappe("/api/resource/Job Opening?fields=[\"name\",\"job_title\",\"status\",\"department\",\"designation\",\"posted_on\"]&limit_page_length=999"),
      fetchFromFrappe("/api/resource/Job Applicant?fields=[\"name\",\"applicant_name\",\"status\",\"job_title\",\"creation\"]&order_by=creation desc&limit_page_length=999")
    ]);

    return NextResponse.json({
      openings: openings.data || [],
      applicants: applicants.data || []
    });
  } catch (error: any) {
    console.error("Error fetching recruitment data from Frappe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === "opening") {
      const endpoint = "/api/resource/Job Opening";
      const result = await fetchFromFrappe(endpoint, {
        method: "POST",
        body: JSON.stringify({
          job_title: data.job_title,
          designation: data.designation,
          company: data.company || "Test-Prajjwal",
          status: "Open"
        })
      });
      return NextResponse.json(result.data);
    } else if (type === "applicant") {
      const endpoint = "/api/resource/Job Applicant";
      const result = await fetchFromFrappe(endpoint, {
        method: "POST",
        body: JSON.stringify({
          applicant_name: data.applicant_name,
          email_id: data.email_id,
          status: "Open",
          job_title: data.job_title
        })
      });
      return NextResponse.json(result.data);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("REC_POST_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, data } = body;

    if (type === "applicant") {
      const endpoint = `/api/resource/Job Applicant/${name}`;
      const result = await fetchFromFrappe(endpoint, {
        method: "PUT",
        body: JSON.stringify(data)
      });
      return NextResponse.json(result.data);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("REC_PUT_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, oldName, newName } = body;

    if (type === "applicant") {
      // Use the whitelisted frappe.client.rename_doc method
      const endpoint = "/api/method/frappe.client.rename_doc";
      const result = await fetchFromFrappe(endpoint, {
        method: "POST",
        body: JSON.stringify({
          doctype: "Job Applicant",
          old_name: oldName,
          new_name: newName,
          merge: 0
        })
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("REC_PATCH_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
