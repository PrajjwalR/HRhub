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
  let companyPhone = "";
  const companyName = offer.company || "";

  try {
    const companyRes = await fetch(
      `${FRAPPE_URL}/api/resource/Company/${encodeURIComponent(companyName)}`,
      { headers: { Authorization: authHeader } }
    );
    if (companyRes.ok) {
      const companyJson = await companyRes.json();
      const company = companyJson.data;

      companyEmail = company?.email || company?.company_email || "";
      companyPhone = company?.phone_no || company?.phone || "";

      // Fetch addresses linked to this Company via Dynamic Link (Company has no default_address in JSON)
      const addrFilters = encodeURIComponent(
        JSON.stringify([
          ["Dynamic Link", "link_doctype", "=", "Company"],
          ["Dynamic Link", "link_name", "=", companyName],
        ])
      );
      const addrFields = encodeURIComponent(
        JSON.stringify(["name", "address_line1", "address_line2", "city", "state", "pincode", "country", "is_primary_address"])
      );
      const addrRes = await fetch(
        `${FRAPPE_URL}/api/resource/Address?filters=${addrFilters}&fields=${addrFields}&limit_page_length=10`,
        { headers: { Authorization: authHeader } }
      );

      if (addrRes.ok) {
        const addrData = await addrRes.json();
        const addresses = addrData.data || [];
        // Prefer primary (billing) address, else use first
        const addr = addresses.find((a: { is_primary_address?: number }) => a.is_primary_address === 1)
          || addresses[0];
        if (addr) {
          const parts = [
            addr.address_line1,
            addr.address_line2,
            [addr.city, addr.state].filter(Boolean).join(", "),
            [addr.pincode, addr.country].filter(Boolean).join(" "),
          ]
            .filter(Boolean)
            .join("\n");
          companyAddress = parts;
        }
      }

      if (!companyAddress) {
        companyAddress = company?.address || company?.registered_address || "";
      }
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

  const normalizedPhone = (() => {
    const raw = (companyPhone || "").trim();
    if (!raw) return "";
    if (raw.startsWith("+")) return raw;
    const digits = raw.replace(/[^\d]/g, "");
    // If it's a 10-digit Indian number, prefix +91 for nicer display
    if (digits.length === 10) return `+91 ${digits}`;
    return raw;
  })();

  const companyMetaText = [companyAddress].filter(Boolean).join("\n");
  const companyContactLine = [companyEmail ? `<a href="mailto:${companyEmail}">${companyEmail}</a>` : "", normalizedPhone]
    .filter(Boolean)
    .join(" | ");

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
      align-items: center;
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
      line-height: 1.45;
      white-space: pre-line;
    }
    .company-contact {
      margin-top: 2px;
      font-size: 11.5px;
      color: #7a6f63;
      line-height: 1.35;
    }
    .company-contact a {
      color: inherit;
      text-decoration: none;
      border-bottom: 1px solid rgba(122, 111, 99, 0.35);
    }
    .ref-block {
      text-align: right;
      font-size: 12px;
      color: #7a6f63;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      min-width: 180px;
    }
    .ref-block .date-label {
      font-weight: 600;
      color: #3a3530;
      margin-right: 8px;
      letter-spacing: 0.2px;
    }
    .ref-block .date-value {
      font-weight: 600;
      color: #1a1a1a;
      letter-spacing: 0.2px;
    }

    /* Title */
    .offer-title {
      font-family: 'EB Garamond', serif;
      font-size: 36px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .divider {
      height: 1px;
      background: #eee6db;
      margin: 18px 0 22px;
    }

    .section-title {
      font-size: 15px;
      font-weight: 800;
      color: #1a1a1a;
      margin: 22px 0 10px;
    }
    .kv {
      margin: 10px 0 16px;
      padding: 0;
      list-style: none;
    }
    .kv li {
      margin: 6px 0;
      font-size: 14px;
      line-height: 1.8;
      color: #3a3530;
    }
    .bullets {
      margin: 10px 0 16px 18px;
      padding: 0;
    }
    .bullets li {
      margin: 6px 0;
      font-size: 14px;
      line-height: 1.8;
      color: #3a3530;
    }

    .closing {
      margin-top: 18px;
    }
    .closing strong {
      display: block;
      margin-top: 6px;
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
    
    /* Simple details list (replaces details card) */
    .details-list {
      margin: 22px 0 26px;
      padding: 14px 0;
      border-top: 1px solid #f0ebe4;
      border-bottom: 1px solid #f0ebe4;
    }
    .details-row {
      display: flex;
      gap: 10px;
      align-items: baseline;
      padding: 6px 0;
      font-size: 14px;
      line-height: 1.6;
      color: #3a3530;
    }
    .details-key {
      font-weight: 700;
      min-width: 160px;
      color: #1a1a1a;
    }
    .details-val {
      font-weight: 500;
      color: #3a3530;
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
      justify-content: center;
      align-items: flex-end;
    }
    .sig-side {
      width: 55%;
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
      margin-top: 34px;
      padding-top: 16px;
      border-top: 1px solid #e5ddd2;
      font-size: 10.5px;
      color: #b0a090;
      text-align: left;
      line-height: 1.7;
    }
    .footer .company-right {
      float: right;
      font-weight: 700;
      color: #b0a090;
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
        <div class="company-meta">${companyMetaText}</div>
        ${companyContactLine ? `<div class="company-contact">${companyContactLine}</div>` : ""}
      </div>
      <div class="ref-block">
        <span class="date-label">Date</span>
        <span class="date-value">${formattedDate}</span>
      </div>
    </div>

    <!-- Title -->
    <div class="offer-title">LETTER OF OFFER</div>
    <div class="offer-subtitle">Confidential &nbsp;·&nbsp; Employment Offer</div>

    <!-- Salutation -->
    <p class="salutation">
      Dear <strong>${offer.applicant_name || "Candidate"}</strong>,
    </p>
    <p class="body-text">
      This has reference to your application and subsequent interview process with us. We are pleased to offer you the position of
      <strong>${offer.designation || "—"}</strong> at <strong>${offer.company || "Cortexus.ai"}</strong>.
    </p>
    <p class="body-text">
      We are excited about the potential you bring and look forward to having you as part of our team. We hope that your journey with us will be both professionally rewarding and a great learning experience.
    </p>

    <div class="divider"></div>

    <div class="section-title">Position Details</div>
    <ul class="kv">
      <li><strong>Applicant Name:</strong> ${offer.applicant_name || "—"}</li>
      <li><strong>Designation / Role:</strong> ${offer.designation || "—"}</li>
      <li><strong>Offer Date:</strong> ${formattedDate}</li>
    </ul>

    <div class="divider"></div>

    <div class="section-title">Joining Details</div>
    <p class="body-text">
      The proposed start date of your internship will be communicated and mutually agreed upon.
    </p>
    <p class="body-text">
      Please confirm your acceptance of this offer along with your joining date. In case you do not confirm or report on the agreed date, it will be deemed that you have declined this offer.
    </p>

    <div class="section-title">Internship Terms</div>
    <p class="body-text">
      Your internship with ${offer.company || "Cortexus.ai"} is intended to evaluate your skills, performance, and alignment with the organization. Based on your performance during this period, you may be considered for future opportunities with the company.
    </p>
    <p class="body-text">
      Either party may choose to discontinue the engagement during the internship period with prior notice, as mutually discussed.
    </p>

    <div class="section-title">Confidentiality</div>
    <p class="body-text">
      During your association with ${offer.company || "Cortexus.ai"}, you may have access to confidential information, including but not limited to technical data, business strategies, and internal processes. You are expected to maintain strict confidentiality and not disclose any such information to external parties during or after your tenure.
    </p>

    <div class="section-title">Documentation</div>
    <p class="body-text">At the time of joining, you may be required to submit the following documents:</p>
    <ul class="bullets">
      <li>Academic qualification documents and certificates</li>
      <li>Government-issued ID proof (Aadhar, PAN, etc.)</li>
      <li>Any other relevant documents as requested by HR</li>
    </ul>

    <p class="body-text">
      We are confident that your skills and enthusiasm will be a valuable addition to our team. We look forward to working together and building great things.
    </p>
    <p class="body-text">
      Please feel free to reach out to us at <strong><a href="mailto:hr@cortexus.ai">hr@cortexus.ai</a></strong> for any clarification.
    </p>

    <div class="closing">
      <strong>Thanking you,</strong>
      <strong>Team ${offer.company || "Cortexus.ai"}</strong>
    </div>

    <!-- Footer -->
    <div class="footer">
      <span><i>This letter is issued in confidence and is intended solely for the named candidate.</i></span>
      <span class="company-right">${offer.company || ""}</span>
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
