import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "assets", "categories", "movements"
    const employee = searchParams.get("employee");

    if (type === "categories") {
      const endpoint = "/api/resource/Asset Category?fields=[\"name\",\"asset_category_name\"]&limit_page_length=999";
      const data = await fetchFromFrappe(endpoint);
      return NextResponse.json(data.data || []);
    }

    if (type === "movements") {
      let endpoint = "/api/resource/Asset Movement?fields=[\"name\",\"transaction_date\",\"purpose\",\"company\"]&order_by=transaction_date desc&limit_page_length=50";
      if (employee) {
        // This is a simplified filter, actual movement might need joining with Asset Movement Item
        // For now, return recent movements
      }
      const data = await fetchFromFrappe(endpoint);
      return NextResponse.json(data.data || []);
    }

    // Default: Assets
    let assetFields = ["name", "item_code", "asset_name", "asset_category", "status", "custodian", "department", "location", "purchase_date", "gross_purchase_amount"];
    let endpoint = `/api/resource/Asset?fields=${JSON.stringify(assetFields)}&order_by=creation desc&limit_page_length=100`;
    
    if (employee) {
      endpoint += `&filters=[["custodian","=","${employee}"]]`;
    }

    const data = await fetchFromFrappe(endpoint);
    return NextResponse.json(data.data || []);
  } catch (error: any) {
    console.error("Error fetching assets from Frappe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === "asset") {
      // Check if Item exists, if not create it
      try {
        await fetchFromFrappe(`/api/resource/Item/${encodeURIComponent(data.item_code)}`);
      } catch (e: any) {
        if (e.message.includes("404")) {
          // Create a minimal Fixed Asset Item
          await fetchFromFrappe("/api/resource/Item", {
            method: "POST",
            body: JSON.stringify({
              item_code: data.item_code,
              item_name: data.asset_name,
              item_group: "Consumable",
              stock_uom: "Unit",
              is_fixed_asset: 1,
              is_stock_item: 0,
              asset_category: data.asset_category
            })
          });
        }
      }

      const endpoint = "/api/resource/Asset";
      const result = await fetchFromFrappe(endpoint, {
        method: "POST",
        body: JSON.stringify({
          ...data,
          location: data.location || "Main Office",
          company: data.company || "Test-Prajjwal"
        })
      });
      return NextResponse.json(result.data);
    }

    if (type === "category") {
      const endpoint = "/api/resource/Asset Category";
      const payload = {
        ...data,
        accounts: [{
          company_name: "Test-Prajjwal",
          fixed_asset_account: "Electronic Equipments - P-T"
        }]
      };
      const result = await fetchFromFrappe(endpoint, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      return NextResponse.json(result.data);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("ASSET_POST_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
