import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";

    const API_KEY = process.env.FRAPPE_API_KEY;
    const API_SECRET = process.env.FRAPPE_API_SECRET;
    const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL;

    if (!API_KEY || !API_SECRET || !FRAPPE_URL) {
      return NextResponse.json(
        { message: "Frappe API credentials are not set." },
        { status: 500 }
      );
    }

    const fields = JSON.stringify([
      "name",
      "title",
      "posting_date",
      "voucher_type",
      "total_amount",
      "user_remark",
      "docstatus"
    ]);

    const url = `${FRAPPE_URL}/api/resource/Journal Entry?fields=${encodeURIComponent(fields)}&limit_page_length=${limit}&order_by=creation desc`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `token ${API_KEY}:${API_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Frappe API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ data: data.data || [] });
  } catch (error: any) {
    console.error("Error fetching journal entries:", error);
    return NextResponse.json(
      { message: "Failed to fetch journal entries", error: error.message },
      { status: 500 }
    );
  }
}
