require('dotenv').config({ path: '.env.local' });

async function testPassword() {
  const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL;
  const API_KEY = process.env.FRAPPE_API_KEY;
  const API_SECRET = process.env.FRAPPE_API_SECRET;

  const res = await fetch(`${FRAPPE_URL}/api/resource/User/Administrator`, {
    method: 'GET',
    headers: {
      'Authorization': `token ${API_KEY}:${API_SECRET}`
    }
  });
  const data = await res.json();
  console.log(Object.keys(data.data || {}));
}
testPassword();
