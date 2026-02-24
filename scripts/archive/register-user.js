/*
  Usage (PowerShell):
    node scripts/register-user.js --name "Full Name" --email "user@example.com" --phone "09xxxxxxxx" --password "Your@Pass#123"

  Env override:
    $env:EXPO_PUBLIC_API_BASE_URL="https://your.api"; node scripts/register-user.js ...
*/

const API = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.thietkeresort.com.vn';

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
      out[key] = val;
    }
  }
  return out;
}

async function postJson(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) {
    const msg = (data && (data.message || data.error?.message)) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function red(s) { return `\u001b[31m${s}\u001b[0m`; }
function green(s) { return `\u001b[32m${s}\u001b[0m`; }

function extractToken(raw) {
  if (!raw) return undefined;
  const d = raw.data && typeof raw.data === 'object' ? raw.data : raw;
  const nested = d.data && typeof d.data === 'object' ? d.data : {};
  return (
    d.access_token || d.token || d.jwt ||
    nested.access_token || nested.token || nested.jwt ||
    d.user?.access_token
  );
}

async function registerUser({ name, email, phone, password }) {
  const body = Object.fromEntries(Object.entries({
    account: email || phone,
    email,
    phone: phone ? String(phone).replace(/[^0-9+]/g, '') : undefined,
    full_name: name,
    name,
    password,
    password_confirmation: password,
  }).filter(([, v]) => v !== undefined && v !== ''));

  return postJson('/api/auth/register', body);
}

async function loginUser({ email, account, phone, password }) {
  let lastErr;
  // 1) Try with explicit email if provided (per backend error message)
  if (email) {
    try { return await postJson('/api/auth/login', { email, password }); } catch (e) { lastErr = e; }
  }
  // 2) Try with account (generic)
  try { return await postJson('/api/auth/login', { account: email || account || phone, password }); } catch (e) { lastErr = e; }
  // 3) Try with phone explicitly
  if (phone) {
    try { return await postJson('/api/auth/login', { phone, password }); } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Login failed');
}

(async () => {
  try {
    const args = parseArgs(process.argv);
    const name = args.name || args.username || '';
    const email = args.email || '';
    const phone = args.phone || '';
    const password = args.password;

    if (!password || (!email && !phone)) {
      console.log(red('Missing required arguments.'));
      console.log('Usage: node scripts/register-user.js --name "Full Name" --email "user@example.com" --phone "09xxxxxxxx" --password "Your@Pass#123"');
      process.exit(2);
    }

    console.log(`API: ${API}`);
    console.log('→ Registering user...');
    let res = await registerUser({ name, email, phone, password });
    let token = extractToken(res);
    if (!token) {
      // Some backends return { success, data: { token } }
      token = extractToken(res?.data) || extractToken({ data: res?.data });
    }
    if (token) {
      const shown = token.length > 16 ? `${token.slice(0, 12)}…` : token;
      console.log(green(`✔ Registered successfully. Token: ${shown}`));
      process.exit(0);
    }

    console.log('↳ No token in register response. Trying to login...');
  const loginRes = await loginUser({ email, account: email || phone, phone, password });
    const loginToken = extractToken(loginRes) || extractToken(loginRes?.data);
    if (loginToken) {
      const shown = loginToken.length > 16 ? `${loginToken.slice(0, 12)}…` : loginToken;
      console.log(green(`✔ Login successful. Token: ${shown}`));
      process.exit(0);
    }
    console.log(red('Register/Login completed but no token returned. Check server responses.'));
    console.log('Response:', JSON.stringify({ register: res }, null, 2));
    process.exit(1);
  } catch (e) {
    console.error(red(`✖ Error: ${e.message || e}`));
    if (e.data) {
      try { console.error('Details:', JSON.stringify(e.data, null, 2)); } catch {}
    }
    process.exit(1);
  }
})();
