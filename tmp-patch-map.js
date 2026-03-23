const fs = require("fs");

const file = "/tmp/ws.js";
let code = fs.readFileSync(file, "utf8");

// Fix CATEGORY_WORKER_MAP to only include valid DB enum values
const oldMap = `construction: ['tho_xay', 'tho_sat', 'tho_coffa', 'ep_coc', 'dao_dat', 'be_tong', 'nhan_cong']`;
const newMap = `construction: ['tho_xay', 'tho_sat']`;
code = code.replace(oldMap, newMap);

const oldFinish = `finishing: ['tho_son', 'tho_op_lat', 'tho_tran_thach_cao', 'tho_gach', 'tho_moc', 'tho_da', 'tho_lam_cua', 'tho_lan_can', 'tho_cong', 'tho_cua']`;
const newFinish = `finishing: ['tho_son', 'tho_op_lat', 'tho_tran_thach_cao', 'tho_moc', 'tho_da']`;
code = code.replace(oldFinish, newFinish);

const oldElec = `electrical: ['tho_dien', 'tho_may_lanh', 'tho_camera']`;
const newElec = `electrical: ['tho_dien', 'tho_may_lanh']`;
code = code.replace(oldElec, newElec);

const oldPlumb = `plumbing: ['tho_nuoc', 'tho_dien_nuoc']`;
const newPlumb = `plumbing: ['tho_nuoc']`;
code = code.replace(oldPlumb, newPlumb);

const oldAlum = `aluminum: ['tho_nhom_kinh', 'tho_alu', 'tho_nhom']`;
const newAlum = `aluminum: ['tho_nhom', 'tho_alu']`;
code = code.replace(oldAlum, newAlum);

fs.writeFileSync(file, code, "utf8");
console.log("Patched CATEGORY_WORKER_MAP");

// Verify
const match = code.match(/CATEGORY_WORKER_MAP = \{[\s\S]*?\};/);
if (match) console.log(match[0]);
