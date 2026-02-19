
import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET(request: NextRequest) {
  try {
    const endpoint = "/api/resource/User?fields=[\"name\",\"full_name\",\"email\"]&filters=[[\"enabled\",\"=\",1]]&limit_page_length=0";
    const data = await fetchFromFrappe(endpoint);
    return NextResponse.json(data.data || []);
  } catch (error: any) {
    console.error("USERS_GET_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
