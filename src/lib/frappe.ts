const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || "http://localhost:8000";
const FRAPPE_API_KEY = process.env.FRAPPE_API_KEY;
const FRAPPE_API_SECRET = process.env.FRAPPE_API_SECRET;

export async function fetchFromFrappe(endpoint: string, options: RequestInit = {}) {
  const url = `${FRAPPE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add existing headers from options
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }

  // Add authentication if API key and secret are available
  if (FRAPPE_API_KEY && FRAPPE_API_SECRET) {
    headers["Authorization"] = `token ${FRAPPE_API_KEY}:${FRAPPE_API_SECRET}`;
    console.log("✓ Authentication headers added");
  } else {
    console.warn("✗ No API credentials found! Check your .env.local file");
    console.warn("FRAPPE_API_KEY exists:", !!FRAPPE_API_KEY);
    console.warn("FRAPPE_API_SECRET exists:", !!FRAPPE_API_SECRET);
  }
  
  console.log("Fetching from:", url);
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Frappe API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}
