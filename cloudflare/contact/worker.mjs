const services = new Set(['Web design & development', 'Social media kit', 'Graphic design', 'Web marketing', 'Custom support', 'Web analysis', 'Something else']);
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim());
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin' };
    const reply = (status, message) => new Response(JSON.stringify({ ok: status === 200, message }), { status, headers });
    if (!origin || !allowed.includes(origin)) return reply(403, 'Origin not allowed.');
    headers['Access-Control-Allow-Origin'] = origin;
    if (new URL(request.url).pathname !== '/contact') return reply(404, 'Not found.');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
    if (request.method !== 'POST') return reply(405, 'Use POST.');
    if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) return reply(503, 'Online enquiries are temporarily unavailable. Please email or call CodeMax.');
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply(415, 'Use JSON.');
    let data;
    try {
      const reader = request.body?.getReader();
      if (!reader) return reply(400, 'Missing enquiry.');
      const chunks = []; let size = 0;
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        size += value.byteLength;
        if (size > 16384) { await reader.cancel(); return reply(413, 'Enquiry too large.'); }
        chunks.push(value);
      }
      data = JSON.parse(await new Blob(chunks).text());
    } catch { return reply(400, 'Invalid enquiry.'); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return reply(400, 'Invalid enquiry.');
    const valid = (key, min, max) => typeof data[key] === 'string' && data[key].trim().length >= min && data[key].length <= max;
    if (!valid('name', 1, 100) || !valid('email', 3, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !valid('company', 0, 120) || !services.has(data.service) || !valid('message', 10, 2000) || !valid('token', 1, 2048) || /[\r\n]/.test(data.name + data.email)) return reply(400, 'Please check your details and complete the security check.');
    if (data.website) return reply(400, 'Unable to submit this enquiry.');
    try {
      const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000),
        body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: data.token, remoteip: request.headers.get('CF-Connecting-IP') || undefined })
      });
      const verification = await check.json();
      if (!check.ok || !verification.success || verification.action !== 'contact' || verification.hostname !== new URL(origin).hostname) return reply(400, 'Security check expired or failed. Please try again.');
      const sent = await fetch('https://api.resend.com/emails', {
        method: 'POST', signal: AbortSignal.timeout(15000),
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: env.CONTACT_FROM, to: [env.CONTACT_TO], reply_to: data.email.trim(), subject: `CodeMax enquiry: ${data.service}`, text: `Name: ${data.name.trim()}\nEmail: ${data.email.trim()}\nBusiness: ${data.company.trim() || 'Not provided'}\nService: ${data.service}\n\n${data.message.trim()}` })
      });
      const result = await sent.json();
      if (!sent.ok || !result.id) return reply(502, 'We could not submit your enquiry. Please try again or email CodeMax.');
      return reply(200, 'Thank you! Your enquiry has been submitted. We’ll be in touch.');
    } catch { return reply(502, 'We could not confirm submission. Please email or call CodeMax if the problem continues.'); }
  }
};
