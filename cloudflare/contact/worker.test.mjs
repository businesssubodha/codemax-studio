import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';
const origin = 'https://codemax-studio.vercel.app';
const env = { ALLOWED_ORIGINS: origin, TURNSTILE_SECRET_KEY: 'test', RESEND_API_KEY: 'test', CONTACT_TO: 'private@example.test', CONTACT_FROM: 'sender@example.test' };
const data = { name: 'Test', email: 'visitor@example.test', company: '', service: 'Something else', message: 'A test project enquiry.', token: 'test-token', website: '' };
const request = (body = data, source = origin) => new Request('https://worker.example/contact', { method: 'POST', headers: { Origin: source, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
test('reject untrusted origins and missing configuration', async () => {
 assert.equal((await worker.fetch(request(data, 'https://evil.example'), env)).status, 403);
 assert.equal((await worker.fetch(request(), { ALLOWED_ORIGINS: origin })).status, 503);
});
test('reject malformed fields and oversized requests before external calls', async () => {
 assert.equal((await worker.fetch(request({ ...data, email: 'invalid' }), env)).status, 400);
 assert.equal((await worker.fetch(request({ ...data, message: 'x'.repeat(17000) }), env)).status, 413);
 assert.equal((await worker.fetch(request({ ...data, website: 'bot' }), env)).status, 400);
});
test('verify security before sending; do not report success for failed delivery', async () => {
 const original = globalThis.fetch; let calls = 0; let verification = { success: false }; let deliveryOK = true;
 globalThis.fetch = async (url, options) => {
  calls++;
  if (url.includes('siteverify')) return Response.json(verification);
  const email = JSON.parse(options.body);
  assert.deepEqual(email.to, [env.CONTACT_TO]); assert.equal(email.reply_to, data.email);
  return Response.json(deliveryOK ? { id: 'mock-id' } : { message: 'private provider error' }, { status: deliveryOK ? 200 : 500 });
 };
 try {
  assert.equal((await worker.fetch(request(), env)).status, 400); assert.equal(calls, 1);
  verification = { success: true, action: 'contact', hostname: 'evil.example' };
  assert.equal((await worker.fetch(request(), env)).status, 400); assert.equal(calls, 2);
  verification.hostname = new URL(origin).hostname;
  const success = await worker.fetch(request(), env); assert.equal(success.status, 200);
  assert.ok(!(await success.text()).includes(env.CONTACT_TO));
  deliveryOK = false;
  const failure = await worker.fetch(request(), env); assert.equal(failure.status, 502);
  assert.ok(!(await failure.text()).includes('private provider error'));
 } finally { globalThis.fetch = original; }
});
