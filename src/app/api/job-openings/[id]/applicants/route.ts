import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobOpeningId } = await context.params;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const fields = JSON.stringify(["name", "applicant_name", "email_id", "status", "job_title", "creation"]);
    const filters = JSON.stringify([["job_title", "=", jobOpeningId]]);
    const endpoint = `/api/resource/Job Applicant?fields=${encodeURIComponent(fields)}&filters=${encodeURIComponent(filters)}&limit_page_length=999`;

    // Fetch all applicants for this job opening
    const applicantsData = await fetchFromFrappe(endpoint);

    let applicants = applicantsData.data || [];

    // Filter by search if provided
    if (search) {
      applicants = applicants.filter((applicant: any) =>
        applicant.applicant_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // For each applicant, fetch their journey stages
    const applicantsWithJourney = await Promise.all(
      applicants.map(async (applicant: any) => {
        try {
          // Fetch job offer status if exists
          const offerData = await fetchFromFrappe(
            `/api/resource/Job Offer?fields=["name","status","offer_date"]&filters=[["job_applicant","=","${applicant.name}"]]&limit_page_length=1`
          );

          const offer = offerData.data?.[0] || null;

          // Build journey stages based on status
          const journey = buildJourneyStages(applicant.status, offer);

          return {
            ...applicant,
            offer,
            journey,
          };
        } catch (error) {
          console.error(`Error fetching journey for ${applicant.name}:`, error);
          return {
            ...applicant,
            offer: null,
            journey: buildJourneyStages(applicant.status, null),
          };
        }
      })
    );

    return NextResponse.json(applicantsWithJourney);
  } catch (error: any) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}

// Helper function to build journey stages
function buildJourneyStages(status: string, offer: any) {
  const stages: { name: string; status: "completed" | "current" | "pending" | "rejected"; date: string | null }[] = [
    { name: "Applied", status: "completed", date: null },
    { name: "Shortlisted", status: "pending", date: null },
    { name: "Screening Round", status: "pending", date: null },
    { name: "Technical Interview", status: "pending", date: null },
    { name: "HR Interview", status: "pending", date: null },
    { name: "Offer Letter", status: "pending", date: null },
    { name: "Hired", status: "pending", date: null },
  ];

  // Update stages based on applicant status
  const statusMap: { [key: string]: number } = {
    Open: 0,
    Replied: 1,
    "Hold": 2, // Map hold to shortlisted/screening
    "Shortlisted": 1,
    "Screening": 2,
    "Interview": 3,
    Accepted: 5,
    Rejected: -1,
  };

  if (status === "Rejected") {
    // If rejected, mark pending stages as rejected
    stages.forEach(s => {
      if (s.status === "pending") s.status = "rejected";
    });
    return stages;
  }

  const currentStageIndex = statusMap[status] ?? 0;

  if (currentStageIndex >= 0) {
    for (let i = 0; i <= currentStageIndex && i < stages.length; i++) {
      stages[i].status = "completed";
    }
    if (currentStageIndex + 1 < stages.length) {
      stages[currentStageIndex + 1].status = "current";
    }
  }

  // If offer exists, update offer stage
  if (offer) {
    stages[5].status = "completed";
    stages[5].date = offer.offer_date;
    
    if (offer.status === "Accepted") {
      stages[6].status = "completed";
    } else if (offer.status === "Awaiting Response") {
      stages[6].status = "current";
    }
  }

  return stages;
}
