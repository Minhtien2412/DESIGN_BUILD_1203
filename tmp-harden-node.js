// Harden CRM scaffold controllers - add required field validation
const fs = require("fs");

const modules = [
  { dir: "contacts", field: "name", label: "Contact name" },
  { dir: "warranty", field: "title", label: "Warranty title" },
  { dir: "daily-report", field: "title", label: "Report title" },
  { dir: "budget", field: "title", label: "Budget title" },
  { dir: "change-orders", field: "title", label: "Change order title" },
  { dir: "construction-progress", field: "title", label: "Progress title" },
  { dir: "rfi", field: "title", label: "RFI title" },
  { dir: "submittal", field: "title", label: "Submittal title" },
  { dir: "punch-list", field: "title", label: "Punch list title" },
  { dir: "equipment", field: "name", label: "Equipment name" },
  { dir: "inspection", field: "title", label: "Inspection title" },
];

let patched = 0,
  skipped = 0,
  failed = 0;

for (const m of modules) {
  const file = `/app/dist/${m.dir}/${m.dir}.controller.js`;
  if (!fs.existsSync(file)) {
    console.log(`SKIP: ${m.dir} — not found`);
    skipped++;
    continue;
  }

  let code = fs.readFileSync(file, "utf8");

  if (code.includes("is required")) {
    console.log(`ALREADY: ${m.dir}`);
    skipped++;
    continue;
  }

  const oldCreate = "create(d) { return this.svc.create(d); }";
  if (!code.includes(oldCreate)) {
    console.log(`NO MATCH: ${m.dir} — create pattern not found`);
    failed++;
    continue;
  }

  const newCreate = `create(d) { if (!d || typeof d.${m.field} !== 'string' || !d.${m.field}.trim()) { throw new common_1.BadRequestException('${m.label} is required and must be a non-empty string'); } return this.svc.create(d); }`;
  code = code.replace(oldCreate, newCreate);
  fs.writeFileSync(file, code, "utf8");
  console.log(`PATCHED: ${m.dir} — requires '${m.field}'`);
  patched++;
}

console.log(`\nDone: ${patched} patched, ${skipped} skipped, ${failed} failed`);
