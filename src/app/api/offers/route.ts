import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET() {
  try {
    const endpoint = "/api/resource/Job Offer?fields=[\"name\",\"job_applicant\",\"applicant_name\",\"offer_date\",\"designation\",\"status\",\"company\"]&order_by=creation desc";
    const data = await fetchFromFrappe(endpoint);
    return NextResponse.json(data.data || []);
  } catch (error: any) {
    console.error("OFFER_GET_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    const endpoint = "/api/resource/Job Offer";
    const result = await fetchFromFrappe(endpoint, {
      method: "POST",
      body: JSON.stringify({
        job_applicant: data.job_applicant,
        applicant_name: data.applicant_name,
        offer_date: data.offer_date,
        designation: data.designation,
        company: data.company || "Test-Prajjwal",
        status: "Accepted" // Setting default status for simplicity in this flow
      })
    });
    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error("OFFER_POST_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
