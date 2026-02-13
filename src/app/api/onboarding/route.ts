import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "processes" or "templates"

    if (type === "processes") {
      const endpoint = "/api/resource/Employee Onboarding?fields=[\"name\",\"job_applicant\",\"employee_name\",\"boarding_status\",\"department\",\"designation\",\"date_of_joining\",\"creation\"]&limit_page_length=20";
      const data = await fetchFromFrappe(endpoint);
      return NextResponse.json(data.data || []);
    } else if (type === "templates") {
      const endpoint = "/api/resource/Employee Onboarding Template?fields=[\"name\",\"department\",\"designation\",\"creation\"]&limit_page_length=20";
      const data = await fetchFromFrappe(endpoint);
      return NextResponse.json(data.data || []);
    }

    // Default: fetch active processes
    const endpoint = "/api/resource/Employee Onboarding?fields=[\"name\",\"employee_name\",\"boarding_status\",\"date_of_joining\",\"creation\"]&limit_page_length=10";
    const data = await fetchFromFrappe(endpoint);
    return NextResponse.json(data.data || []);
  } catch (error: any) {
    console.error("Error fetching onboarding data from Frappe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    const endpoint = "/api/resource/Employee Onboarding";
    const payload = {
      job_applicant: data.job_applicant,
      job_offer: data.job_offer,
      company: data.company || "Test-Prajjwal",
      employee_name: data.employee_name,
      date_of_joining: data.date_of_joining,
      boarding_begins_on: data.onboarding_start_date || data.date_of_joining
    };

    console.log("ONB_POST_PAYLOAD:", JSON.stringify(payload, null, 2));

    const result = await fetchFromFrappe(endpoint, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error("ONB_POST_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
