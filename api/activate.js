export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed.' });
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return res.status(503).json({ success: false, message: 'Verification service is not configured yet.' });
  const key = typeof req.body?.key === 'string' ? req.body.key.trim() : '';
  if (!key) return res.status(400).json({ success: false, message: 'Enter an access key.' });
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/activate_access_key`, {
      method: 'POST',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_key: key })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(400).json({ success: false, message: typeof data.message === 'string' ? data.message : 'Key verification failed.' });
    const result = Array.isArray(data) ? data[0] : data;
    return res.status(result?.success === false ? 400 : 200).json(result && typeof result === 'object' ? result : { success: true, message: 'Access key verified.' });
  } catch { return res.status(502).json({ success: false, message: 'Could not reach the verification service.' }); }
                                    }
