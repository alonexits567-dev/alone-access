export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed.' });
  const adminSecret = process.env.ALONE_ADMIN_SECRET;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!adminSecret || !url || !serviceKey) return res.status(503).json({ success: false, message: 'Admin endpoint is not configured.' });
  if (req.headers['x-admin-secret'] !== adminSecret) return res.status(401).json({ success: false, message: 'Unauthorized.' });
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/generate_access_key`, { method: 'POST', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }, body: '{}' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(400).json({ success: false, message: 'Could not generate key.' });
    return res.status(200).json({ success: true, key: data });
  } catch { return res.status(502).json({ success: false, message: 'Could not reach the database.' }); }
}
