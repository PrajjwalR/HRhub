import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      purpose, // "Issue", "Receipt", "Transfer"
      company,
      transaction_date,
      assets // Array of { asset, source_location, target_location, from_employee, to_employee }
    } = body;

    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return NextResponse.json({ error: "At least one asset is required for movement." }, { status: 400 });
    }

    const endpoint = "/api/resource/Asset Movement";
    const result = await fetchFromFrappe(endpoint, {
      method: "POST",
      body: JSON.stringify({
        purpose,
        company: company || "Test-Prajjwal",
        transaction_date: transaction_date || new Date().toISOString().split('T')[0],
        assets: assets.map(a => ({
          asset: a.asset,
          source_location: a.source_location,
          target_location: a.target_location,
          from_employee: a.from_employee,
          to_employee: a.to_employee
        }))
      })
    });

    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error("ASSET_MOVEMENT_POST_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
