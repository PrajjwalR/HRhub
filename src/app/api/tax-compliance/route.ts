import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "slabs") {
      const endpoint = "/api/resource/Income Tax Slab?fields=[\"name\",\"effective_from\",\"currency\",\"allow_tax_exemption\"]&order_by=effective_from desc";
      const data = await fetchFromFrappe(endpoint);
      return NextResponse.json(data.data || []);
    } else if (type === "declarations") {
      const endpoint = "/api/resource/Employee Tax Exemption Declaration?fields=[\"name\",\"employee\",\"employee_name\",\"payroll_period\",\"company\",\"total_exemption_amount\"]&order_by=creation desc";
      const data = await fetchFromFrappe(endpoint);
      return NextResponse.json(data.data || []);
    } else if (type === "proofs") {
      const endpoint = "/api/resource/Employee Tax Exemption Proof Submission?fields=[\"name\",\"employee\",\"employee_name\",\"payroll_period\",\"company\",\"total_actual_amount\"]&order_by=creation desc";
      const data = await fetchFromFrappe(endpoint);
      return NextResponse.json(data.data || []);
    } else if (type === "periods") {
      const endpoint = "/api/resource/Payroll Period?fields=[\"name\",\"start_date\",\"end_date\"]&order_by=start_date desc";
      const data = await fetchFromFrappe(endpoint);
      return NextResponse.json(data.data || []);
    }

    // Default: return overall stats or error
    return NextResponse.json({ error: "Missing type parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("TAX_GET_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === "declaration") {
      const endpoint = "/api/resource/Employee Tax Exemption Declaration";
      const result = await fetchFromFrappe(endpoint, {
        method: "POST",
        body: JSON.stringify(data)
      });
      return NextResponse.json(result.data);
    } else if (type === "proof") {
      const endpoint = "/api/resource/Employee Tax Exemption Proof Submission";
      const result = await fetchFromFrappe(endpoint, {
        method: "POST",
        body: JSON.stringify(data)
      });
      return NextResponse.json(result.data);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("TAX_POST_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
