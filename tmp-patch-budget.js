const fs = require("fs");
const file = "/app/dist/budget/budget.controller.js";
let code = fs.readFileSync(file, "utf8");
const old1 = "createBudget(d) { return this.svc.createBudget(d); }";
const new1 =
  "createBudget(d) { if (!d || typeof d.title !== 'string' || !d.title.trim()) { throw new common_1.BadRequestException('Budget title is required'); } return this.svc.createBudget(d); }";
if (code.includes(old1)) {
  code = code.replace(old1, new1);
  fs.writeFileSync(file, code, "utf8");
  console.log("Budget patched");
} else {
  console.log("Budget pattern not found");
}
