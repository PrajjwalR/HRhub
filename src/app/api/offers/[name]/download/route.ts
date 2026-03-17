import { NextRequest, NextResponse } from "next/server";

const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://localhost:8000";
const FRAPPE_API_KEY = process.env.FRAPPE_API_KEY;
const FRAPPE_API_SECRET = process.env.FRAPPE_API_SECRET;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  if (!name) {
    return NextResponse.json({ error: "Offer name is required" }, { status: 400 });
  }

  if (!FRAPPE_API_KEY || !FRAPPE_API_SECRET) {
    return NextResponse.json({ error: "Server misconfiguration: missing Frappe credentials" }, { status: 500 });
  }

  const authHeader = `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`;

  // Fetch the Job Offer document from Frappe
  const offerRes = await fetch(
    `${FRAPPE_URL}/api/resource/Job%20Offer/${encodeURIComponent(name)}`,
    { headers: { Authorization: authHeader } }
  );

  if (!offerRes.ok) {
    const errText = await offerRes.text();
    console.error(`[Offer Print] Frappe error fetching offer ${name}:`, errText);
    return NextResponse.json({ error: "Failed to fetch offer details from Frappe" }, { status: 500 });
  }

  const offerJson = await offerRes.json();
  const offer = offerJson.data;

  // Fetch company details for the letterhead
  let companyAddress = "";
  let companyEmail = "";
  try {
    const companyRes = await fetch(
      `${FRAPPE_URL}/api/resource/Company/${encodeURIComponent(offer.company || "")}`,
      { headers: { Authorization: authHeader } }
    );
    if (companyRes.ok) {
      const companyJson = await companyRes.json();
      companyAddress = companyJson.data?.address || "";
      companyEmail = companyJson.data?.email || "";
    }
  } catch {
    // non-fatal, continue without company details
  }

  const formattedDate = offer.offer_date
    ? new Date(offer.offer_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Offer Letter – ${offer.applicant_name || name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', sans-serif;
      background: #f0ece8;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      padding: 40px 20px;
      color: #1a1a1a;
    }

    .page {
      background: #ffffff;
      width: 794px;
      min-height: 1123px;
      padding: 64px 72px;
      box-shadow: 0 4px 40px rgba(0,0,0,0.12);
      position: relative;
      border-top: 6px solid #c8a96e;
    }

    .print-bar {
      position: fixed;
      bottom: 32px;
      right: 32px;
      display: flex;
      gap: 12px;
      z-index: 100;
    }
    .print-bar button {
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      letter-spacing: 0.5px;
      transition: opacity 0.2s;
    }
    .print-bar button:hover { opacity: 0.85; }
    .btn-print  { background: #c8a96e; color: #fff; }
    .btn-close  { background: #1a1a1a; color: #fff; }

    /* Header */
    .letterhead {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 48px;
      padding-bottom: 28px;
      border-bottom: 1px solid #e5ddd2;
    }
    .company-name {
      font-family: 'EB Garamond', serif;
      font-size: 28px;
      font-weight: 600;
      color: #1a1a1a;
      letter-spacing: -0.5px;
    }
    .company-meta {
      font-size: 11.5px;
      color: #7a6f63;
      margin-top: 4px;
      line-height: 1.7;
    }
    .ref-block {
      text-align: right;
      font-size: 11.5px;
      color: #7a6f63;
      line-height: 1.8;
    }
    .ref-block .ref-id {
      font-family: 'EB Garamond', serif;
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
      display: block;
    }

    /* Title */
    .offer-title {
      font-family: 'EB Garamond', serif;
      font-size: 34px;
      font-weight: 400;
      color: #1a1a1a;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
    }
    .offer-subtitle {
      font-size: 12px;
      color: #c8a96e;
      font-weight: 600;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      margin-bottom: 36px;
    }

    /* Salutation */
    .salutation {
      font-size: 14.5px;
      color: #3a3530;
      line-height: 1.8;
      margin-bottom: 20px;
    }

    /* Details card */
    .details-card {
      background: #faf8f5;
      border: 1px solid #e8e0d4;
      border-radius: 8px;
      padding: 28px 32px;
      margin: 32px 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px 40px;
    }
    .detail-item label {
      display: block;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #b0a090;
      margin-bottom: 4px;
    }
    .detail-item span {
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
    }
    .detail-item.full-width {
      grid-column: 1 / -1;
    }

    /* Status badge */
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .status-accepted  { background: #d1fae5; color: #065f46; }
    .status-awaiting  { background: #fef3c7; color: #92400e; }
    .status-rejected  { background: #fee2e2; color: #991b1b; }

    /* Body paragraphs */
    .body-text {
      font-size: 14px;
      color: #3a3530;
      line-height: 1.85;
      margin-bottom: 16px;
    }

    /* Signature block */
    .signature-block {
      margin-top: 56px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .sig-side {
      width: 45%;
    }
    .sig-line {
      border-bottom: 1.5px solid #1a1a1a;
      margin-bottom: 8px;
      height: 48px;
    }
    .sig-label {
      font-size: 11.5px;
      color: #7a6f63;
      font-weight: 500;
    }
    .sig-name {
      font-family: 'EB Garamond', serif;
      font-size: 15px;
      font-weight: 500;
      color: #1a1a1a;
    }

    /* Footer */
    .footer {
      margin-top: 64px;
      padding-top: 20px;
      border-top: 1px solid #e5ddd2;
      font-size: 10.5px;
      color: #b0a090;
      text-align: center;
      line-height: 1.7;
    }

    @page {
      size: A4;
      margin: 0;
    }

    @media print {
      body { background: #fff; padding: 0; }
      .page {
        box-shadow: none;
        width: 100%;
        min-height: 100vh;
        border-top: 6px solid #c8a96e;
        padding: 64px 72px;
      }
      .print-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- Letterhead -->
    <div class="letterhead">
      <div>
        <div class="company-name">${offer.company || "Company"}</div>
        <div class="company-meta">${companyAddress || ""}${companyEmail ? `<br/>${companyEmail}` : ""}</div>
      </div>
      <div class="ref-block">
        <span class="ref-id">${offer.name}</span>
        Date: ${formattedDate}
      </div>
    </div>

    <!-- Title -->
    <div class="offer-title">Letter of Offer</div>
    <div class="offer-subtitle">Confidential &nbsp;·&nbsp; Employment Offer</div>

    <!-- Salutation -->
    <p class="salutation">
      Dear <strong>${offer.applicant_name || "Candidate"}</strong>,
    </p>
    <p class="body-text">
      We are delighted to extend this offer of employment to you at <strong>${offer.company || "our organisation"}</strong>.
      After careful consideration, we are pleased to offer you the position outlined below. This letter sets out
      the key terms of your employment with us.
    </p>

    <!-- Details card -->
    <div class="details-card">
      <div class="detail-item">
        <label>Applicant Name</label>
        <span>${offer.applicant_name || "—"}</span>
      </div>
      <div class="detail-item">
        <label>Designation / Role</label>
        <span>${offer.designation || "—"}</span>
      </div>
      <div class="detail-item">
        <label>Offer Date</label>
        <span>${formattedDate}</span>
      </div>
      <div class="detail-item">
        <label>Company</label>
        <span>${offer.company || "—"}</span>
      </div>
      <div class="detail-item">
        <label>Offer Status</label>
        <span>
          <span class="status-badge ${
            (offer.status || "").toLowerCase().includes("accept") ? "status-accepted"
            : (offer.status || "").toLowerCase().includes("reject") ? "status-rejected"
            : "status-awaiting"
          }">${offer.status || "Issued"}</span>
        </span>
      </div>
      <div class="detail-item">
        <label>Reference ID</label>
        <span>${offer.name}</span>
      </div>
    </div>

    <p class="body-text">
      We trust that you will find this opportunity both professionally rewarding and personally fulfilling.
      Please review the terms carefully and sign below to indicate your acceptance of this offer.
      Should you have any questions, do not hesitate to reach out to the HR team.
    </p>
    <p class="body-text">
      We look forward to welcoming you as a valued member of our team and are excited about
      the contributions you will bring to <strong>${offer.company || "our organisation"}</strong>.
    </p>

    <!-- Signature block -->
    <div class="signature-block">
      <div class="sig-side">
        <div class="sig-line"></div>
        <div class="sig-label">Authorised Signatory</div>
        <div class="sig-name">${offer.company || "Organisation"}</div>
      </div>
      <div class="sig-side" style="text-align:right;">
        <div class="sig-line"></div>
        <div class="sig-label">Candidate Acceptance</div>
        <div class="sig-name">${offer.applicant_name || "Candidate"}</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      This letter is issued in confidence and is intended solely for the named candidate.<br/>
      ${offer.company || ""} &nbsp;·&nbsp; Ref: ${offer.name}
    </div>
  </div>

  <!-- Print/Close bar -->
  <div class="print-bar">
    <button class="btn-print" onclick="window.print()">Save as PDF / Print</button>
    <button class="btn-close" onclick="window.close()">Close</button>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
