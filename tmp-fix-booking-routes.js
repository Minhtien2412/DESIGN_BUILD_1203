const fs = require("fs");
const path = "/app/dist/bookings/bookings.controller.js";
let code = fs.readFileSync(path, "utf8");

// The issue: findOne(id) is defined before getSummary and getMyBookings in the class
// NestJS registers routes in method definition order, so :id catches "summary" and "my"
// Fix: reorder methods so static routes come before param routes

// Current class body order:
// findAll(q) { ... }
// findOne(id) { ... }        <-- needs to move after getSummary and getMyBookings
// getMyBookings(req) { ... }
// getSummary(projectId) { ...}

// Replace the class body
const oldMethods = `    findAll(q) { return this.svc.findAll(q); }
    findOne(id) { return this.svc.findOne(id); }
    getMyBookings(req) { return this.svc.getMyBookings(req.user?.id || 0); }
    getSummary(projectId) { return this.svc.getSummary(projectId ? parseInt(projectId) : undefined); }`;

const newMethods = `    findAll(q) { return this.svc.findAll(q); }
    getSummary(projectId) { return this.svc.getSummary(projectId ? parseInt(projectId) : undefined); }
    getMyBookings(req) { return this.svc.getMyBookings(req.user?.id || 0); }
    findOne(id) { return this.svc.findOne(id); }`;

if (code.includes(oldMethods)) {
  code = code.replace(oldMethods, newMethods);
  fs.writeFileSync(path, code, "utf8");
  console.log("Reordered bookings controller methods: summary, my before :id");
} else {
  console.log("Pattern not found, trying line-by-line match");
  // Try with potential whitespace differences
  const lines = code.split("\n");
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    if (
      lines[i].includes("findAll(q)") &&
      i + 1 < lines.length &&
      lines[i + 1].includes("findOne(id)")
    ) {
      console.log(`Found findOne before getSummary at line ${i + 2}`);
      // Swap findOne with getSummary
      const findOneLine = lines[i + 1];
      const getMyLine = lines[i + 2];
      const getSummaryLine = lines[i + 3];
      lines[i + 1] = getSummaryLine;
      lines[i + 2] = getMyLine;
      lines[i + 3] = findOneLine;
      code = lines.join("\n");
      fs.writeFileSync(path, code, "utf8");
      console.log("Reordered via line swap");
      found = true;
      break;
    }
  }
  if (!found) {
    console.log("ERROR: Could not find method pattern to reorder");
    // Show context around findOne
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("findOne")) {
        console.log(`Line ${i + 1}: ${lines[i].trim()}`);
      }
    }
  }
}
