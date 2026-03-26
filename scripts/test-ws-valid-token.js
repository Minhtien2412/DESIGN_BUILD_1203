/**
 * Test WebSocket auth with valid JWT token
 * Run on production server: node test-ws-valid-token.js
 */
const { io } = require("socket.io-client");
const http = require("http");

const API_KEY =
  process.env.API_KEY || "dbuild_client_7d3a9f41c2b84e6d9a5f0e1c7b2a4d88";

function apiRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : "";
    const opts = {
      hostname: "localhost",
      port: 3000,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
      },
    };
    const req = http.request(opts, (res) => {
      let buf = "";
      res.on("data", (c) => (buf += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(buf));
        } catch (e) {
          reject(buf);
        }
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

function testNs(ns, token) {
  return new Promise((resolve) => {
    const socket = io("http://localhost:3000" + ns, {
      auth: { token },
      transports: ["websocket"],
      reconnection: false,
      timeout: 5000,
    });
    let result = "timeout";
    socket.on("connect", () => {
      result = "connected";
      console.log("[OK]      " + ns + " -> connected, id=" + socket.id);
    });
    socket.on("connected", (data) => {
      console.log("  [info]  " + ns + " -> server ack: userId=" + data.userId);
    });
    socket.on("error", (e) => {
      result = "error";
      console.log("[ERR]     " + ns + " -> " + JSON.stringify(e));
    });
    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        result = "kicked";
        console.log("[KICKED]  " + ns + " -> server forced disconnect");
      }
      resolve(result);
    });
    socket.on("connect_error", (e) => {
      result = "rejected";
      console.log("[FAIL]    " + ns + " -> " + e.message);
      resolve(result);
    });
    setTimeout(() => {
      socket.disconnect();
      resolve(result);
    }, 3000);
  });
}

async function main() {
  // Step 1: Get valid token via login
  console.log("=== Logging in to get valid JWT token ===");

  // Try register first, then login
  let token = null;
  try {
    const loginRes = await apiRequest("/api/v1/auth/login", "POST", {
      email: "admin@baotienweb.com",
      password: "Admin@123",
    });
    token =
      loginRes.accessToken ||
      loginRes.access_token ||
      (loginRes.data && loginRes.data.accessToken);
    if (!token) {
      // Try alternative
      const loginRes2 = await apiRequest("/api/v1/auth/login", "POST", {
        email: "admin@thietkeresort.com",
        password: "Admin@123",
      });
      token =
        loginRes2.accessToken ||
        loginRes2.access_token ||
        (loginRes2.data && loginRes2.data.accessToken);
    }
  } catch (e) {
    console.error("Login error:", e);
  }

  if (!token) {
    console.log("Could not get token. Trying signup...");
    try {
      const signupRes = await apiRequest("/api/v1/auth/register", "POST", {
        email: "wstest@test.com",
        password: "Test@12345",
        name: "WS Test User",
        phone: "0999999999",
      });
      token =
        signupRes.accessToken ||
        signupRes.access_token ||
        (signupRes.data && signupRes.data.accessToken);
    } catch (e) {
      console.error("Signup error:", e);
    }
  }

  if (!token) {
    console.log("FATAL: Cannot obtain JWT token. Skipping auth test.");
    process.exit(1);
  }

  console.log("Token: " + token.substring(0, 30) + "...\n");

  // Step 2: Test all namespaces with valid token
  console.log("=== Valid token test (should all connect) ===");
  const results = {};
  for (const ns of ["/notifications", "/chat", "/progress", "/call"]) {
    results[ns] = await testNs(ns, token);
  }

  // Step 3: Summary
  console.log("\n=== SUMMARY ===");
  for (const [ns, result] of Object.entries(results)) {
    const icon = result === "connected" ? "✅" : "❌";
    console.log(icon + " " + ns + ": " + result);
  }

  process.exit(0);
}

main().catch(console.error);
