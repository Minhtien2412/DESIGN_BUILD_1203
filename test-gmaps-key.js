/**
 * Google Maps API Key — Node.js tester (no CORS issues)
 * Chạy: node test-gmaps-key.js
 * Không cần cài thêm package — dùng https built-in của Node.
 */

const https = require("https");

const KEY = "AIzaSyDW2sqiom4_xtyj3jMfUA5kuT4NR7ZGyss";
const LAT = 10.7769;
const LNG = 106.7009;

// ─── Màu terminal ─────────────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  bold:  "\x1b[1m",
  green: "\x1b[32m",
  red:   "\x1b[31m",
  yellow:"\x1b[33m",
  cyan:  "\x1b[36m",
  gray:  "\x1b[90m",
  white: "\x1b[37m",
};

const ok   = `${C.green}${C.bold}  ✅  PASS${C.reset}`;
const fail = `${C.red}${C.bold}  ❌  FAIL${C.reset}`;
const warn = `${C.yellow}${C.bold}  ⚠️   WARN${C.reset}`;

// ─── HTTP helper ──────────────────────────────────────────────────────────────
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error("JSON parse error: " + data.slice(0, 200))); }
      });
    }).on("error", reject);
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────
const TESTS = [
  {
    name: "Geocoding API",
    desc: "Địa chỉ ↔ tọa độ",
    endpoint: "Geocoding API",
    url: () =>
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${LAT},${LNG}&key=${KEY}`,
    check(j) {
      if (j.status === "OK")
        return { pass: true, msg: j.results?.[0]?.formatted_address || "OK" };
      return { pass: false, msg: `${j.status} — ${j.error_message || ""}` };
    },
  },
  {
    name: "Places API — Text Search",
    desc: "Tìm địa điểm theo tên/từ khóa",
    endpoint: "Places API",
    url: () =>
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=Bitexco+Ho+Chi+Minh&key=${KEY}`,
    check(j) {
      if (j.status === "OK" || j.status === "ZERO_RESULTS")
        return { pass: true, msg: `${j.results?.length ?? 0} kết quả — ${j.results?.[0]?.name || "OK"}` };
      return { pass: false, msg: `${j.status} — ${j.error_message || ""}` };
    },
  },
  {
    name: "Places API — Autocomplete",
    desc: "Gợi ý địa chỉ khi gõ",
    endpoint: "Places API",
    url: () =>
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Nguyen+Hue&location=${LAT},${LNG}&radius=5000&key=${KEY}`,
    check(j) {
      if (j.status === "OK" || j.status === "ZERO_RESULTS")
        return { pass: true, msg: `${j.predictions?.length ?? 0} gợi ý — ${j.predictions?.[0]?.description || "OK"}` };
      return { pass: false, msg: `${j.status} — ${j.error_message || ""}` };
    },
  },
  {
    name: "Directions API",
    desc: "Tính tuyến đường A → B",
    endpoint: "Directions API",
    url: () =>
      `https://maps.googleapis.com/maps/api/directions/json?origin=${LAT},${LNG}&destination=10.8231,106.6297&mode=driving&key=${KEY}`,
    check(j) {
      if (j.status === "OK") {
        const leg = j.routes?.[0]?.legs?.[0];
        return { pass: true, msg: `${leg?.distance?.text}  —  ${leg?.duration?.text}` };
      }
      return { pass: false, msg: `${j.status} — ${j.error_message || ""}` };
    },
  },
  {
    name: "Distance Matrix API",
    desc: "Khoảng cách nhiều điểm",
    endpoint: "Distance Matrix API",
    url: () =>
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${LAT},${LNG}&destinations=10.8231,106.6297&key=${KEY}`,
    check(j) {
      if (j.status === "OK") {
        const el = j.rows?.[0]?.elements?.[0];
        return { pass: true, msg: `${el?.distance?.text}  —  ${el?.duration?.text}` };
      }
      return { pass: false, msg: `${j.status} — ${j.error_message || ""}` };
    },
  },
  {
    name: "Elevation API",
    desc: "Độ cao tọa độ",
    endpoint: "Elevation API",
    url: () =>
      `https://maps.googleapis.com/maps/api/elevation/json?locations=${LAT},${LNG}&key=${KEY}`,
    check(j) {
      if (j.status === "OK")
        return { pass: true, msg: `Độ cao: ${j.results?.[0]?.elevation?.toFixed(2)} m` };
      return { pass: false, msg: `${j.status} — ${j.error_message || ""}` };
    },
  },
  {
    name: "Maps Static API",
    desc: "Ảnh bản đồ tĩnh PNG",
    endpoint: "Maps Static API",
    url: () =>
      `https://maps.googleapis.com/maps/api/staticmap?center=${LAT},${LNG}&zoom=13&size=300x150&key=${KEY}`,
    // Static Map trả về PNG, không phải JSON — dùng HTTP HEAD check
    rawCheck: true,
  },
  {
    name: "Time Zone API",
    desc: "Múi giờ theo tọa độ",
    endpoint: "Time Zone API",
    url: () =>
      `https://maps.googleapis.com/maps/api/timezone/json?location=${LAT},${LNG}&timestamp=${Math.floor(Date.now() / 1000)}&key=${KEY}`,
    check(j) {
      if (j.status === "OK")
        return { pass: true, msg: `${j.timeZoneId}  (rawOffset ${j.rawOffset / 3600}h)` };
      return { pass: false, msg: `${j.status} — ${j.error_message || ""}` };
    },
  },
];

// ─── Static map raw HTTP check ─────────────────────────────────────────────────
function headCheck(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      req.destroy();
      const ct = res.headers["content-type"] || "";
      if (res.statusCode === 200 && ct.includes("image")) {
        resolve({ pass: true, msg: `HTTP ${res.statusCode}  content-type: ${ct}` });
      } else {
        resolve({ pass: false, msg: `HTTP ${res.statusCode}  content-type: ${ct}` });
      }
    });
    req.on("error", (e) => resolve({ pass: false, msg: e.message }));
  });
}

// ─── Run ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n" + C.bold + C.cyan +
    "═══════════════════════════════════════════════════" + C.reset);
  console.log(C.bold + C.white +
    "  🗺️  Google Maps API Key Tester (Node.js)" + C.reset);
  console.log(C.gray +
    "  Key: " + KEY + C.reset);
  console.log(C.cyan +
    "═══════════════════════════════════════════════════\n" + C.reset);

  const results = [];

  for (const t of TESTS) {
    process.stdout.write(
      C.gray + `  Testing  ${t.name.padEnd(30)}` + C.reset
    );

    try {
      let result;
      if (t.rawCheck) {
        result = await headCheck(t.url());
      } else {
        const j = await get(t.url());
        result = t.check(j);

        // If check failed, dump raw status for debugging
        if (!result.pass) {
          result.raw = { status: j.status, error_message: j.error_message };
        }
      }

      const icon = result.pass ? ok : fail;
      console.log(`\r${icon}  ${C.bold}${t.name}${C.reset}  ${C.gray}(${t.endpoint})${C.reset}`);
      console.log(`         ${C.gray}${t.desc}${C.reset}`);
      console.log(`         ${result.pass ? C.green : C.red}${result.msg}${C.reset}`);
      if (result.raw) {
        console.log(`         ${C.gray}raw: ${JSON.stringify(result.raw)}${C.reset}`);
      }
      console.log();

      results.push({ name: t.name, endpoint: t.endpoint, pass: result.pass, msg: result.msg });
    } catch (e) {
      console.log(`\r${fail}  ${C.bold}${t.name}${C.reset}`);
      console.log(`         ${C.red}${e.message}${C.reset}\n`);
      results.push({ name: t.name, endpoint: t.endpoint, pass: false, msg: e.message });
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const passed = results.filter((r) => r.pass);
  const failed = results.filter((r) => !r.pass);

  console.log(C.cyan + "═══════════════════════════════════════════════════" + C.reset);
  console.log(C.bold + "  📊 KẾT QUẢ TỔNG KẾT\n" + C.reset);

  console.log(
    `  ${C.green}${C.bold}✅  Hoạt động (${passed.length}):${C.reset}  ` +
    passed.map((r) => C.green + r.name + C.reset).join(", ")
  );
  if (failed.length) {
    console.log(
      `  ${C.red}${C.bold}❌  Chưa bật  (${failed.length}):${C.reset}  ` +
      failed.map((r) => C.red + r.name + C.reset).join(", ")
    );
  }

  console.log();
  if (failed.length === 0) {
    console.log(C.green + C.bold + "  🎉 Key đã bật đầy đủ tất cả API!\n" + C.reset);
  } else {
    console.log(
      C.yellow + C.bold +
      `  ⚠️  Cần bật thêm ${failed.length} API trong Google Cloud Console:\n` +
      C.reset
    );
    failed.forEach((r) => {
      console.log(
        `  ${C.red}•${C.reset} ${C.bold}${r.endpoint}${C.reset}  ${C.gray}→ https://console.cloud.google.com/apis/library${C.reset}`
      );
    });
    console.log();
    console.log(
      C.gray +
      "  Hướng dẫn bật API:\n" +
      "  1. Vào https://console.cloud.google.com\n" +
      "  2. Chọn project chứa key trên\n" +
      "  3. APIs & Services → Library\n" +
      "  4. Tìm từng API trong danh sách ❌ → Enable\n" +
      C.reset
    );
  }

  console.log(C.cyan + "═══════════════════════════════════════════════════\n" + C.reset);

  // ── Maps JavaScript API note ───────────────────────────────────────────────
  console.log(
    C.yellow + C.bold + "  ℹ️  Maps JavaScript API" + C.reset + C.gray +
    " (dùng trong scan-workers WebView)\n" +
    "     Không thể test bằng Node.js (chỉ chạy trong browser).\n" +
    "     Cách test: mở file  test-gmaps-key.html  và bỏ qua lỗi CORS.\n" +
    "     Nếu bản đồ hiện ra = API đã bật.\n" +
    "     Nếu vẫn lỗi: vào Cloud Console → bật 'Maps JavaScript API'\n" + C.reset
  );
}

main().catch(console.error);
