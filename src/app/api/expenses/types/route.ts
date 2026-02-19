import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET(request: NextRequest) {
  try {
    const endpoint = "/api/resource/Expense Claim Type?fields=[\"name\",\"description\"]";
    const data = await fetchFromFrappe(endpoint);
    return NextResponse.json(data.data || []);
  } catch (error: any) {
    console.error("EXPENSE_TYPES_GET_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
