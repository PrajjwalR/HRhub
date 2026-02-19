import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Fetch specific claim details
      const endpoint = `/api/resource/Expense Claim/${id}`;
      const data = await fetchFromFrappe(endpoint);
      return NextResponse.json(data.data || {});
    }

    // Fetch list of claims
    // Note: In a real app, we'd filter by current user's employee ID
    const endpoint = "/api/resource/Expense Claim?fields=[\"name\",\"employee\",\"posting_date\",\"total_claimed_amount\",\"approval_status\",\"status\",\"company\"]&order_by=creation desc";
    const data = await fetchFromFrappe(endpoint);
    
    // Map total_claimed_amount to total_amount for frontend compatibility
    const formattedData = (data.data || []).map((claim: any) => ({
      ...claim,
      total_amount: claim.total_claimed_amount
    }));

    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error("EXPENSES_GET_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create new Expense Claim in Frappe
    const endpoint = "/api/resource/Expense Claim";
    const result = await fetchFromFrappe(endpoint, {
      method: "POST",
      body: JSON.stringify(body)
    });

    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error("EXPENSES_POST_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
