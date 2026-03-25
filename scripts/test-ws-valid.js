// Test valid JWT token against all WebSocket gateways
// Uses jsonwebtoken (via @nestjs/jwt dependency) and socket.io (server-side)
const jwt = require("jsonwebtoken");
const http = require("http");
const { io } = require("socket.io-client");

const SECRET = "supersecret";

// Sign a valid token with sub=1 (admin user)
const token = jwt.sign({ sub: 1, email: "admin@baotienweb.com" }, SECRET, {
  expiresIn: "1h",
});
console.log("Generated JWT: " + token.substring(0, 40) + "...\n");

function testNs(ns, tkn) {
  return new Promise((resolve) => {
    const socket = io("http://localhost:3000" + ns, {
      auth: { token: tkn },
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
      console.log(
        "  [info]  " + ns + " -> server ack: " + JSON.stringify(data),
      );
    });
    socket.on("error", (e) => {
      console.log(
        "[ERR]     " +
          ns +
          " -> " +
          (typeof e === "string" ? e : JSON.stringify(e)),
      );
    });
    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        result = "kicked";
        console.log("[KICKED]  " + ns + " -> server forced disconnect");
      }
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
  console.log("=== Valid token test (should all connect) ===");
  const results = {};
  for (const ns of ["/notifications", "/chat", "/progress", "/call"]) {
    results[ns] = await testNs(ns, token);
  }

  console.log("\n=== SUMMARY ===");
  let allPass = true;
  for (const [ns, result] of Object.entries(results)) {
    const ok = result === "connected";
    if (!ok) allPass = false;
    console.log((ok ? "PASS" : "FAIL") + " " + ns + ": " + result);
  }
  console.log("\nOverall: " + (allPass ? "ALL CONNECTED" : "SOME FAILED"));
  process.exit(allPass ? 0 : 1);
}

main().catch(console.error);
