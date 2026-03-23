#!/usr/bin/env node
/**
 * E2E Simulation — Mirrors the exact AI tool chain flow:
 *   matchSkillToCategory(userText) → buildWorkerQuery(params) → getWorkers(API) → toWorkerCard(worker)
 */

const https = require("https");

const API_BASE = "https://baotienweb.cloud/api";
const API_KEY = "thietke-resort-api-key-2024";

// ── matchSkillToCategory (from services/workerCategories.ts) ──
function matchSkillToCategory(skill) {
  const q = skill.toLowerCase();
  const map = [
    [
      "construction",
      [
        "xây",
        "tường",
        "xi măng",
        "bê tông",
        "cốt thép",
        "coffa",
        "ép cọc",
        "đào đất",
        "móng",
        "nhân công",
      ],
    ],
    [
      "finishing",
      [
        "sơn",
        "son",
        "gạch",
        "lát",
        "ốp",
        "thạch cao",
        "trần",
        "mộc",
        "gỗ",
        "cửa",
        "lan can",
      ],
    ],
    ["design", ["kiến trúc", "thiết kế", "kỹ sư", "bản vẽ", "giám sát"]],
    [
      "electrical",
      [
        "điện",
        "dien",
        "ổ cắm",
        "công tắc",
        "tủ điện",
        "camera",
        "máy lạnh",
        "điều hòa",
      ],
    ],
    ["plumbing", ["nước", "ống nước", "bồn nước", "van", "thoát nước"]],
    ["aluminum", ["nhôm", "kính", "nhôm kính", "alu", "cửa kính"]],
  ];
  for (const [cat, keywords] of map) {
    if (keywords.some((k) => q.includes(k))) return cat;
  }
  return undefined;
}

// ── buildWorkerQuery (from features/ai-assistant/tools.ts) ──
function buildWorkerQuery(params) {
  const query = {
    limit: params.limit || 5,
    sortBy: "rating",
    sortOrder: "desc",
  };
  if (params.category) {
    query.category = params.category;
  } else if (params.workerType) {
    query.workerType = params.workerType;
  } else if (params.skill) {
    const cat = matchSkillToCategory(params.skill);
    if (cat) query.category = cat;
    else query.search = params.skill;
  }
  if (params.area) query.location = params.area;
  return query;
}

// ── toWorkerCard (from features/ai-assistant/tools.ts) ──
function toWorkerCard(w) {
  return {
    id: w.id,
    name: w.name,
    avatarUri: w.avatar,
    specialty: w.workerType,
    rating: w.rating,
    reviewCount: w.reviewCount,
    completedJobs: w.completedJobs,
    pricePerHour: w.dailyRate,
    distance: w.location,
    verified: w.verified,
    online: w.availability === "available",
    skills: w.skills,
    yearsExperience: w.experience,
  };
}

// ── getWorkers (HTTP call to production API) ──
function getWorkers(query) {
  return new Promise((resolve, reject) => {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, String(v));
    });
    const url = `${API_BASE}/workers?${qs}`;
    console.log(`  API URL: ${url}`);

    https
      .get(
        url,
        { headers: { "X-API-Key": API_KEY }, rejectUnauthorized: false },
        (res) => {
          let body = "";
          res.on("data", (c) => (body += c));
          res.on("end", () => {
            try {
              resolve(JSON.parse(body));
            } catch {
              reject(new Error(`Parse error: ${body.substring(0, 100)}`));
            }
          });
        },
      )
      .on("error", reject);
  });
}

// ── toolSearchWorkers (from features/ai-assistant/tools.ts) ──
async function toolSearchWorkers(params) {
  const query = buildWorkerQuery(params);
  console.log(`  Query params:`, JSON.stringify(query));
  const response = await getWorkers(query);
  const cards = (response.data || []).map(toWorkerCard);
  return cards;
}

// ═══ TEST SCENARIOS ═══
const SCENARIOS = [
  {
    label: 'User: "Tôi cần thợ điện ở Thủ Đức"',
    params: { skill: "thợ điện", area: "Thủ Đức", limit: 3 },
  },
  { label: 'User: "Tìm thợ sơn"', params: { skill: "thợ sơn", limit: 3 } },
  { label: 'User: "Tôi muốn xây nhà"', params: { skill: "xây nhà", limit: 3 } },
  {
    label: 'User: "Cần thợ nước sửa ống"',
    params: { skill: "thợ nước sửa ống", limit: 3 },
  },
  {
    label: 'User: "Tìm kiến trúc sư thiết kế nhà"',
    params: { skill: "kiến trúc sư thiết kế nhà", limit: 3 },
  },
  {
    label: 'User: "Lắp cửa nhôm kính"',
    params: { skill: "cửa nhôm kính", limit: 3 },
  },
  {
    label: "Direct: category=construction",
    params: { category: "construction", limit: 3 },
  },
];

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  AI Worker Tool — End-to-End Simulation         ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  for (const sc of SCENARIOS) {
    console.log(`━━━ ${sc.label} ━━━`);
    try {
      const cards = await toolSearchWorkers(sc.params);
      console.log(`  Results: ${cards.length} worker card(s)`);

      for (const c of cards) {
        const fields = [
          `id=${c.id}`,
          `name=${c.name}`,
          `specialty=${c.specialty}`,
          `rating=${c.rating}`,
          `reviews=${c.reviewCount}`,
          `jobs=${c.completedJobs}`,
          `price=${c.pricePerHour}`,
          `location=${c.distance}`,
          `verified=${c.verified}`,
          `online=${c.online}`,
          `avatar=${c.avatarUri ? "YES" : "NONE"}`,
          `skills=${(c.skills || []).slice(0, 2).join(",")}`,
          `exp=${c.yearsExperience}yr`,
        ];
        console.log(`    ✓ ${fields.join(" | ")}`);

        // Check for missing fields
        const missing = [];
        if (!c.name) missing.push("name");
        if (!c.specialty) missing.push("specialty");
        if (c.rating === undefined) missing.push("rating");
        if (!c.skills || c.skills.length === 0) missing.push("skills");
        if (!c.avatarUri) missing.push("avatar");
        if (c.yearsExperience === undefined || c.yearsExperience === 0)
          missing.push("experience");
        if (missing.length > 0)
          console.log(`    ⚠ Missing/empty: ${missing.join(", ")}`);
      }
    } catch (e) {
      console.log(`  ✗ ERROR: ${e.message}`);
    }
    console.log();
  }
}

main().catch((e) => console.error("Fatal:", e));
