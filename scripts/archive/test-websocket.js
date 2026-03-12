/**
 * WebSocket Connection Test Script
 * Chạy: node test-websocket.js
 */

const WebSocket = require("ws");

const WS_URLS = [
  "wss://baotienweb.cloud/chat",
  "wss://baotienweb.cloud/call",
  "wss://baotienweb.cloud/progress",
];

console.log("========================================");
console.log("   WebSocket Connection Test");
console.log("   Time:", new Date().toISOString());
console.log("========================================\n");

let completedTests = 0;

WS_URLS.forEach((url, index) => {
  console.log(`[${index + 1}] Testing: ${url}`);

  const ws = new WebSocket(url);
  const startTime = Date.now();

  ws.on("open", () => {
    const elapsed = Date.now() - startTime;
    console.log(`   ✅ CONNECTED (${elapsed}ms)`);
    ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
  });

  ws.on("message", (data) => {
    console.log(`   📩 Response: ${data.toString().substring(0, 100)}`);
  });

  ws.on("error", (err) => {
    console.log(`   ❌ ERROR: ${err.message}`);
  });

  ws.on("close", (code, reason) => {
    console.log(`   🔌 Closed (code: ${code})\n`);
    completedTests++;
    if (completedTests === WS_URLS.length) {
      console.log("========================================");
      console.log("   All tests completed!");
      console.log("========================================");
      process.exit(0);
    }
  });

  // Close after 3 seconds
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  }, 3000);
});

// Force exit after 10 seconds
setTimeout(() => {
  console.log("\n⏱️ Test timeout - exiting");
  process.exit(0);
}, 10000);
