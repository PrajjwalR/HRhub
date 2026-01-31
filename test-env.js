// Test script to verify environment variables are loaded
console.log("Environment Variables Check:");
console.log("FRAPPE_API_KEY:", process.env.FRAPPE_API_KEY ? "✓ Set" : "✗ Not set");
console.log("FRAPPE_API_SECRET:", process.env.FRAPPE_API_SECRET ? "✓ Set" : "✗ Not set");
console.log("NEXT_PUBLIC_FRAPPE_URL:", process.env.NEXT_PUBLIC_FRAPPE_URL);

// If you see "Not set", your .env.local file might have issues or you need to restart the dev server
