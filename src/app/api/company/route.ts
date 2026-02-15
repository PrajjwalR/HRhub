import { NextRequest, NextResponse } from "next/server";
import { fetchFromFrappe } from "@/lib/frappe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get("name");

    if (companyName) {
      // Fetch specific company with all details
      const endpoint = `/api/resource/Company/${companyName}`;
      const data = await fetchFromFrappe(endpoint);
      return NextResponse.json(data.data || {});
    }

    // Fetch all companies (list view)
    const endpoint = "/api/resource/Company?fields=[\"name\",\"abbr\",\"country\",\"default_currency\"]&order_by=creation desc";
    const data = await fetchFromFrappe(endpoint);
    return NextResponse.json(data.data || []);
  } catch (error: any) {
    console.error("COMPANY_GET_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, data } = body;

    if (!name) throw new Error("Company name is required");

    let currentName = name;

    // Check if company_name has changed - this requires a rename_doc operation in Frappe
    if (data.company_name && data.company_name !== name) {
      console.log(`Renaming company from ${name} to ${data.company_name}`);
      const renameEndpoint = "/api/method/frappe.client.rename_doc";
      
      try {
        await fetchFromFrappe(renameEndpoint, {
          method: "POST",
          body: JSON.stringify({
            doctype: "Company",
            old_name: name,
            new_name: data.company_name,
            merge: 0
          })
        });
        currentName = data.company_name;
      } catch (renameError: any) {
        // If the old_name is not found, it might already have been renamed
        if (renameError.message.includes("404") || renameError.message.includes("not found")) {
          console.warn("Old name not found, checking if already renamed...");
          try {
            const checkRes = await fetchFromFrappe(`/api/resource/Company/${data.company_name}`);
            if (checkRes.data) {
              console.log("Company already renamed.");
              currentName = data.company_name;
            } else {
              throw renameError;
            }
          } catch (checkError) {
            throw renameError;
          }
        } else {
          throw renameError;
        }
      }
      
      // After a rename, the 'modified' timestamp changes. 
      // We must fetch the latest data to avoid TimestampMismatchError in the next PUT.
      try {
        const latestData = await fetchFromFrappe(`/api/resource/Company/${currentName}`);
        if (latestData.data) {
          data.modified = latestData.data.modified;
        }
      } catch (e) {
        console.warn("Could not fetch latest modified timestamp, proceeding anyway...");
      }
    }

    // Update remaining company fields
    const endpoint = `/api/resource/Company/${currentName}`;
    const result = await fetchFromFrappe(endpoint, {
      method: "PUT",
      body: JSON.stringify(data)
    });

    // Return the updated data along with the potentially updated name
    return NextResponse.json({ 
      ...result.data, 
      name: currentName 
    });
  } catch (error: any) {
    console.error("COMPANY_PUT_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
