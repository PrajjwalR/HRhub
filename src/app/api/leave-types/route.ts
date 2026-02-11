import { NextResponse } from "next/server";

const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://localhost:8000";
const FRAPPE_API_KEY = process.env.FRAPPE_API_KEY;
const FRAPPE_API_SECRET = process.env.FRAPPE_API_SECRET;

const headers = {
  "Content-Type": "application/json",
  "Authorization": `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`,
};

export async function GET() {
  try {
    const url = `${FRAPPE_URL}/api/resource/Leave Type?fields=["name"]`;
    
    console.log("Fetching leave types from:", url);
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch leave types: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data.data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
