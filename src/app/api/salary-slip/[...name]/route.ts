import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string[] }> }
) {
  const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://167.71.197.132";
  const FRAPPE_API_KEY = process.env.FRAPPE_API_KEY;
  const FRAPPE_API_SECRET = process.env.FRAPPE_API_SECRET;

  if (!FRAPPE_API_KEY || !FRAPPE_API_SECRET) {
    return NextResponse.json(
      { error: "Frappe API credentials not configured" },
      { status: 500 }
    );
  }

  // Await params in Next.js 15
  const { name } = await params;
  // Join the array segments back into the slip name
  const slipName = name.join("/");

  try {
    const response = await fetch(
      `${FRAPPE_URL}/api/resource/Salary Slip/${slipName}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Frappe API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data.data);
  } catch (error: any) {
    console.error("Error fetching salary slip details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch salary slip details" },
      { status: 500 }
    );
  }
}
