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
    const designationName = data.designation;

    console.log(`[Job Offer] Processing for ${data.job_applicant} - ${designationName}`);

    // 1. Bootstrap Designation if it looks like it might be missing
    if (designationName) {
      try {
        // We use a broader search to avoid 404/Exc if direct access fails
        const checkRes = await fetchFromFrappe(`/api/resource/Designation?filters=[["name","=","${designationName}"]]`);
        const exists = checkRes.data && checkRes.data.length > 0;
        
        if (!exists) {
          console.log(`[Job Offer] Designation ${designationName} missing, bootstrapping...`);
          await fetchFromFrappe("/api/resource/Designation", {
            method: "POST",
            body: JSON.stringify({
              designation_name: designationName,
              appraisal_template: "General Performance Template"
            })
          });
          console.log(`[Job Offer] Successfully created designation: ${designationName}`);
        }
      } catch (err: any) {
        console.warn(`[Job Offer] Optional bootstrapping failed for ${designationName}:`, err.message);
        // Continue to main creation - it might still work if the check was wrong
      }
    }

    // 2. Create the Job Offer
    console.log(`[Job Offer] Creating record in Frappe...`);
    const result = await fetchFromFrappe("/api/resource/Job Offer", {
      method: "POST",
      body: JSON.stringify({
        job_applicant: data.job_applicant,
        applicant_name: data.applicant_name,
        offer_date: data.offer_date,
        designation: designationName,
        company: data.company || "Test-Prajjwal",
        status: "Accepted"
      })
    });

    console.log(`[Job Offer] Successfully created: ${result.data?.name}`);
    return NextResponse.json(result.data);

  } catch (error: any) {
    console.error("[Job Offer] Fatal Error:", error.message);
    
    // Attempt to extract Frappe error if it exists
    const frappeMsg = error.response?.data?._server_messages;
    const cleanMsg = frappeMsg ? JSON.parse(frappeMsg)[0].message : error.message;

    return NextResponse.json({ 
      error: cleanMsg || "Failed to create Job Offer",
      debug: error.message
    }, { status: 500 });
  }
}
