import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "openings" or "applicants"

    if (type === "openings") {
      const endpoint = "/api/resource/Job Opening?fields=[\"name\",\"job_title\",\"status\",\"department\",\"designation\",\"posting_date\"]&limit_page_length=20";
      const data = await fetchFromFrappe(endpoint);
      return NextResponse.json(data.data || []);
    } else if (type === "applicants") {
      const endpoint = "/api/resource/Job Applicant?fields=[\"name\",\"applicant_name\",\"status\",\"job_title\",\"email_id\",\"phone_number\"]&order_by=creation desc&limit_page_length=20";
      const data = await fetchFromFrappe(endpoint);
      return NextResponse.json(data.data || []);
    }

    // Default: fetch both if no type specified
    const [openings, applicants] = await Promise.all([
      fetchFromFrappe("/api/resource/Job Opening?fields=[\"name\",\"job_title\",\"status\",\"department\",\"designation\"]&limit_page_length=5"),
      fetchFromFrappe("/api/resource/Job Applicant?fields=[\"name\",\"applicant_name\",\"status\",\"job_title\"]&order_by=creation desc&limit_page_length=5")
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
