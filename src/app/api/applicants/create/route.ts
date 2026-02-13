import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicant_name, email_id, job_title } = body;

    if (!applicant_name || !email_id || !job_title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await fetchFromFrappe("/api/resource/Job Applicant", {
      method: "POST",
      body: JSON.stringify({
        applicant_name,
        email_id,
        job_title,
        source: "Website Listing",
        status: "Open"
      })
    });

    console.log("Frappe Response:", response); // Log success response
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error creating applicant:", error);
    // Log the error message which often contains the Frappe response text
    console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error))); 
    return NextResponse.json(
      { error: error.message || "Failed to create applicant" },
      { status: 500 }
    );
  }
}
