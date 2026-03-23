#!/bin/bash
set -e

FILE="/app/dist/workers/workers.service.db.js"
cp "$FILE" /tmp/workers.service.db.js.bak2

# Fix CATEGORY_WORKER_MAP — only valid DB enum values
sed -i "s/construction: \['tho_xay', 'tho_sat', 'tho_coffa', 'ep_coc', 'dao_dat', 'be_tong', 'nhan_cong'\]/construction: ['tho_xay', 'tho_sat']/" "$FILE"
sed -i "s/finishing: \['tho_son', 'tho_op_lat', 'tho_tran_thach_cao', 'tho_gach', 'tho_moc', 'tho_da', 'tho_lam_cua', 'tho_lan_can', 'tho_cong', 'tho_cua'\]/finishing: ['tho_son', 'tho_op_lat', 'tho_tran_thach_cao', 'tho_moc', 'tho_da']/" "$FILE"
sed -i "s/electrical: \['tho_dien', 'tho_may_lanh', 'tho_camera'\]/electrical: ['tho_dien', 'tho_may_lanh']/" "$FILE"
sed -i "s/plumbing: \['tho_nuoc', 'tho_dien_nuoc'\]/plumbing: ['tho_nuoc']/" "$FILE"
sed -i "s/aluminum: \['tho_nhom_kinh', 'tho_alu', 'tho_nhom'\]/aluminum: ['tho_nhom', 'tho_alu']/" "$FILE"

echo "=== VERIFY CATEGORY MAP ==="
grep -A 7 'CATEGORY_WORKER_MAP' "$FILE" | head -10
echo "DONE"
