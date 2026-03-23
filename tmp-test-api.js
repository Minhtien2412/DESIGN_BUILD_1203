const http = require("http");

const opts = {
  hostname: "127.0.0.1",
  port: 3000,
  path: "/api/v1/workers?limit=2",
  method: "GET",
  headers: { "X-API-Key": "thietke-resort-api-key-2024" },
};

const req = http.request(opts, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    const j = JSON.parse(data);
    console.log("STATUS:", res.statusCode);
    console.log("TOTAL:", j.meta?.total);
    console.log("DATA_COUNT:", j.data?.length);
    if (j.data && j.data[0]) {
      console.log("FIRST:", JSON.stringify(j.data[0], null, 2));
    }
  });
});
req.on("error", (e) => console.error("ERROR:", e.message));
req.end();
