#!/usr/bin/env ts-node
/**
 * API Probe Script
 * Tries to discover which base paths & route prefixes are valid on the production API.
 * Usage: npx ts-node scripts/probe-api.ts (or compile then node dist)
 */
import fetch from 'node-fetch';

const BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.thietkeresort.com.vn';
const CANDIDATE_PREFIXES = ['', '/api', '/v1', '/api/v1'];
const ROUTES = [
  'projects',
  'auth/login',
  'auth/register',
  'firms',
  'bids',
  'contracts',
  'messages',
];

async function tryFetch(url: string) {
  const started = Date.now();
  try {
    const res = await fetch(url, { method: 'GET' });
    const ms = Date.now() - started;
    let body: any = null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { body = await res.json(); } catch { body = '<json-parse-failed>'; }
    } else {
      body = await res.text().catch(() => '<text-read-failed>');
    }
    return { ok: res.ok, status: res.status, body, ms };
  } catch (e:any) {
    return { ok: false, status: 0, body: e.message, ms: Date.now() - started };
  }
}

async function main() {
  console.log(`\n== API Probe ==`);
  console.log(`Base: ${BASE}`);
  const findings: any[] = [];
  for (const prefix of CANDIDATE_PREFIXES) {
    for (const route of ROUTES) {
      const url = `${BASE.replace(/\/$/, '')}${prefix}${prefix.endsWith('/') || route.startsWith('/') ? '' : '/'}${route}`;
      const r = await tryFetch(url);
      findings.push({ prefix, route, url, ...r });
      const statusLabel = r.status === 404 ? '404' : r.status === 0 ? 'ERR' : r.status;
      console.log(`${statusLabel.toString().padEnd(4)} ${r.ms.toString().padStart(4)}ms  ${url}`);
    }
  }
  const probablePrefix = inferPrefix(findings);
  console.log('\nProbable working prefix guess:', probablePrefix || '(none)');
  const summary = findings.filter(f => f.status !== 404 && f.status !== 0);
  console.log(`Non-404 hits: ${summary.length}`);
  if (summary.length) {
    for (const s of summary) {
      console.log(`  -> ${s.status} ${s.url}`);
    }
  }
  console.log('\nDone.');
}

function inferPrefix(rows: any[]) {
  // Heuristic: choose prefix with at least one 200 (or 4xx other than 404) on 'projects'
  const candidates = rows.filter(r => r.route === 'projects' && r.status !== 404 && r.status !== 0);
  if (candidates.length) return candidates[0].prefix || '';
  return '';
}

main().catch(e => { console.error(e); process.exit(1); });
