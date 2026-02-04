import { NextRequest, NextResponse } from "next/server";

const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://167.71.197.132";

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const apiKey = process.env.FRAPPE_API_KEY || process.env.NEXT_PUBLIC_FRAPPE_API_KEY;
  const apiSecret = process.env.FRAPPE_API_SECRET || process.env.NEXT_PUBLIC_FRAPPE_API_SECRET;

  if (apiKey && apiSecret) {
    headers["Authorization"] = `token ${apiKey}:${apiSecret}`;
  }

  return headers;
};

// GET - Fetch bank account for an employee
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employee");

  if (!employeeId) {
    return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
  }

  try {
    // Fetch bank account linked to the employee
    const response = await fetch(
      `${FRAPPE_URL}/api/resource/Bank Account?filters=[["party_type","=","Employee"],["party","=","${employeeId}"]]&fields=["*"]`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Frappe API error:", errorText);
      return NextResponse.json({ error: "Failed to fetch bank account" }, { status: response.status });
    }

    const data = await response.json();
    const bankAccounts = data.data || [];

    if (bankAccounts.length === 0) {
      return NextResponse.json({ bankAccount: null });
    }

    return NextResponse.json({ bankAccount: bankAccounts[0] });
  } catch (error: any) {
    console.error("Error fetching bank account:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create or update bank account for an employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, bankName, accountNumber, accountHolderName, ifscCode, branch } = body;

    console.log("Bank account save request:", { employeeId, bankName, accountNumber });

    if (!employeeId || !bankName || !accountNumber) {
      return NextResponse.json(
        { error: "Employee ID, bank name, and account number are required" },
        { status: 400 }
      );
    }

    // First, check if the Bank exists in Frappe, if not create it
    const bankCheckResponse = await fetch(
      `${FRAPPE_URL}/api/resource/Bank?filters=[["bank_name","=","${bankName}"]]&fields=["name"]`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (bankCheckResponse.ok) {
      const bankCheckData = await bankCheckResponse.json();
      if (!bankCheckData.data || bankCheckData.data.length === 0) {
        // Create the Bank first
        console.log("Creating new Bank:", bankName);
        const createBankResponse = await fetch(
          `${FRAPPE_URL}/api/resource/Bank`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              doctype: "Bank",
              bank_name: bankName,
            }),
          }
        );
        
        if (!createBankResponse.ok) {
          const bankErrorText = await createBankResponse.text();
          console.error("Failed to create Bank:", bankErrorText);
          // Continue anyway, maybe the bank already exists with a different name
        }
      }
    }

    // Check if a bank account already exists for this employee
    const checkResponse = await fetch(
      `${FRAPPE_URL}/api/resource/Bank Account?filters=[["party_type","=","Employee"],["party","=","${employeeId}"]]&fields=["name"]`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!checkResponse.ok) {
      const checkErrorText = await checkResponse.text();
      console.error("Failed to check existing bank account:", checkErrorText);
      throw new Error("Failed to check existing bank account");
    }

    const checkData = await checkResponse.json();
    const existingAccounts = checkData.data || [];

    if (existingAccounts.length > 0) {
      // Update existing bank account
      const accountName = existingAccounts[0].name;
      console.log("Updating existing bank account:", accountName);
      
      const updateResponse = await fetch(
        `${FRAPPE_URL}/api/resource/Bank Account/${encodeURIComponent(accountName)}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            bank: bankName,
            bank_account_no: accountNumber,
            account_name: accountHolderName || "",
            branch_code: ifscCode || "",
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error("Failed to update bank account:", errorText);
        return NextResponse.json({ error: `Failed to update bank account: ${errorText}` }, { status: 500 });
      }

      const updatedData = await updateResponse.json();
      return NextResponse.json({ success: true, bankAccount: updatedData.data, updated: true });
    } else {
      // Create new bank account
      console.log("Creating new bank account for employee:", employeeId);
      
      const createPayload = {
        doctype: "Bank Account",
        account_name: `${accountHolderName || employeeId} - ${bankName}`,
        party_type: "Employee",
        party: employeeId,
        bank: bankName,
        bank_account_no: accountNumber,
        branch_code: ifscCode || "",
        is_default: 1,
      };
      
      console.log("Create payload:", createPayload);
      
      const createResponse = await fetch(
        `${FRAPPE_URL}/api/resource/Bank Account`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(createPayload),
        }
      );

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error("Failed to create bank account:", errorText);
        return NextResponse.json({ error: `Failed to create bank account: ${errorText}` }, { status: 500 });
      }

      const createdData = await createResponse.json();
      return NextResponse.json({ success: true, bankAccount: createdData.data, created: true });
    }
  } catch (error: any) {
    console.error("Error managing bank account:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
