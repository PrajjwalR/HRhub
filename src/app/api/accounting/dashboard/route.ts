import { NextResponse } from "next/server";

export const revalidate = 60; // Cache the dashboard response for 60 seconds

export async function GET() {
  try {
    const API_KEY = process.env.FRAPPE_API_KEY;
    const API_SECRET = process.env.FRAPPE_API_SECRET;
    const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL;

    if (!API_KEY || !API_SECRET || !FRAPPE_URL) {
      return NextResponse.json({ message: "Frappe API credentials are not set." }, { status: 500 });
    }

    const headers = {
      "Authorization": `token ${API_KEY}:${API_SECRET}`,
      "Content-Type": "application/json",
    };

    // Aggregate recent invoices to build a basic real-world snapshot for the dashboard
    const [salesRes, purchaseRes] = await Promise.all([
      fetch(`${FRAPPE_URL}/api/resource/Sales%20Invoice?fields=["grand_total","status"]&limit_page_length=1000`, { headers }),
      fetch(`${FRAPPE_URL}/api/resource/Purchase%20Invoice?fields=["grand_total","status"]&limit_page_length=1000`, { headers })
    ]);

    const salesData = salesRes.ok ? await salesRes.json() : { data: [] };
    const purchaseData = purchaseRes.ok ? await purchaseRes.json() : { data: [] };

    // Calculate dynamic totals.
    // In a full production scenario, we might use Frappe's SQL queries via a custom method or Frappe's report APIs,
    // but calculating from the fetched invoices gives us real live dynamic data based on current system state.
    const totalIncome = (salesData.data || []).reduce((sum: number, doc: any) => sum + (doc.grand_total || 0), 0);
    const totalExpenses = (purchaseData.data || []).reduce((sum: number, doc: any) => sum + (doc.grand_total || 0), 0);
    const netProfit = totalIncome - totalExpenses;

    return NextResponse.json({
      data: {
        totalIncome,
        totalExpenses,
        netProfit,
        cashOnHand: 0 // Cash balance requires querying Account balances
      }
    });

  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ message: "Failed to fetch stats", error: error.message }, { status: 500 });
  }
}
