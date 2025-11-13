// Lightweight API smoke test
// Usage: node scripts/smoke-api.js
// Optional env: EXPO_PUBLIC_API_BASE_URL, EXPO_PUBLIC_API_KEY

// Polyfill fetch for Node <18
if (typeof fetch === 'undefined') {
  global.fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
}

(async () => {
  const BASE = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.API_URL || 'https://api.thietkeresort.com.vn';
  const API_KEY = process.env.EXPO_PUBLIC_API_KEY || process.env.API_KEY || '';
  const headers = {};
  if (API_KEY) headers['X-API-Key'] = API_KEY;

  const tests = [
    { name: 'health', urls: [`${BASE}/health`, `${BASE}/api/health`] },
    { name: 'config', urls: [`${BASE}/config`, `${BASE}/api/config`] },
    { name: 'videos', urls: [`${BASE}/videos?limit=1`, `${BASE}/api/videos?limit=1`] },
  ];

  let failed = 0;
  for (const t of tests) {
    try {
      let ok = false; let data; let statusCode; let errorMsg;
      for (const url of t.urls) {
        try {
          const r = await fetch(url, { headers });
          statusCode = r.status;
          if (r.ok) { 
            data = await r.json().catch(() => ({})); 
            ok = true; 
            break; 
          } else {
            errorMsg = await r.text().catch(() => r.statusText);
          }
        } catch (e) {
          errorMsg = e.message;
        }
      }
      if (ok) {
        console.log(`[SMOKE] ${t.name} OK`, data && (data.status || data.success || data.database || '')); 
        // Warn if database disconnected
        if (data?.database === 'disconnected') {
          console.warn(`[SMOKE] ⚠️  ${t.name}: Database is DISCONNECTED`);
        }
      } else {
        throw new Error(`HTTP ${statusCode}: ${errorMsg || 'All candidates failed'}`);
      }
    } catch (e) {
      failed++;
      console.error(`[SMOKE] ${t.name} FAIL:`, e.message);
    }
  }

  if (failed > 0) {
    console.error(`[SMOKE] ${failed}/${tests.length} checks failed`);
    process.exit(1);
  } else {
    console.log('[SMOKE] All checks passed');
  }
})();
