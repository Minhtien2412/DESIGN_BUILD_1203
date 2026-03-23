#!/usr/bin/env node
const http = require("http");

const BASE = "http://localhost:3002";
const PREFIX = "/api/v1";
const KEY = "thietke-resort-api-key-2024";

function get(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(PREFIX + path, BASE);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { "X-API-Key": KEY },
    };
    http
      .get(opts, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, data: body });
          }
        });
      })
      .on("error", reject);
  });
}

async function main() {
  // Test 1: Basic list
  console.log("=== TEST 1: GET /workers?limit=5 ===");
  const r1 = await get("/workers?limit=5");
  console.log(
    "Status:",
    r1.status,
    "| Total:",
    r1.data.meta?.total,
    "| Page count:",
    r1.data.data?.length,
  );
  if (r1.data.data) {
    r1.data.data.forEach((w) =>
      console.log(
        `  ${w.id} ${w.name} | ${w.workerType} | exp=${w.experience} | rating=${w.rating} | skills=${(w.skills || []).join(",")}`,
      ),
    );
  }

  // Test 2: Category filters
  for (const cat of [
    "construction",
    "finishing",
    "electrical",
    "plumbing",
    "aluminum",
    "design",
  ]) {
    console.log(`\n=== TEST 2: GET /workers?category=${cat} ===`);
    const r = await get(`/workers?category=${cat}&limit=50`);
    console.log(
      `Status: ${r.status} | Total: ${r.data.meta?.total} | Count: ${r.data.data?.length}`,
    );
    if (r.data.data && r.data.data.length > 0) {
      const types = [...new Set(r.data.data.map((w) => w.workerType))];
      console.log(`  Types: ${types.join(", ")}`);
      console.log(`  Names: ${r.data.data.map((w) => w.name).join(", ")}`);
    }
  }

  // Test 3: Worker type filter
  console.log("\n=== TEST 3: GET /workers?workerType=THO_DIEN ===");
  const r3 = await get("/workers?workerType=THO_DIEN&limit=10");
  console.log("Status:", r3.status, "| Total:", r3.data.meta?.total);
  if (r3.data.data)
    r3.data.data.forEach((w) => console.log(`  ${w.name} | ${w.workerType}`));

  // Test 4: Types endpoint
  console.log("\n=== TEST 4: GET /workers/types ===");
  const r4 = await get("/workers/types");
  console.log(
    "Status:",
    r4.status,
    "| Response:",
    JSON.stringify(r4.data).substring(0, 200),
  );

  // Test 5: Single worker detail
  console.log("\n=== TEST 5: GET /workers/13 (first seeded) ===");
  const r5 = await get("/workers/13");
  console.log("Status:", r5.status);
  if (r5.data) {
    const w = r5.data.data || r5.data;
    console.log(
      `  name=${w.name} type=${w.workerType} exp=${w.experience} rating=${w.rating}`,
    );
    console.log(`  skills=${JSON.stringify(w.skills)}`);
    console.log(`  bio=${(w.bio || "").substring(0, 80)}`);
    console.log(
      `  availability=${w.availability} verified=${w.verified} featured=${w.featured}`,
    );
  }
}

main().catch((e) => console.error(e));
