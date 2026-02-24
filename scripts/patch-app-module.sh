#!/bin/bash
# ==========================================================
# Patch app.module.ts to register 24 new modules
# Run after create-missing-modules.sh
# ==========================================================

set -e
FILE="/var/www/baotienweb-api/src/app.module.ts"

echo "=== Patching app.module.ts ==="

# Backup
cp "$FILE" "$FILE.bak"
echo "  ✓ Backup created: app.module.ts.bak"

# ── Add import statements ──
# Insert after the last existing import (ZaloModule line)
sed -i "/import { ZaloModule } from '.\/zalo\/zalo.module';/a\\
import { BudgetModule } from './budget/budget.module';\\
import { NewsModule } from './news/news.module';\\
import { ContactsModule } from './contacts/contacts.module';\\
import { AdminModule } from './admin/admin.module';\\
import { ConstructionProgressModule } from './construction-progress/construction-progress.module';\\
import { ProcurementModule } from './procurement/procurement.module';\\
import { ChangeOrdersModule } from './change-orders/change-orders.module';\\
import { ChangeManagementModule } from './change-management/change-management.module';\\
import { CommissioningModule } from './commissioning/commissioning.module';\\
import { PunchListModule } from './punch-list/punch-list.module';\\
import { RfiModule } from './rfi/rfi.module';\\
import { SubmittalModule } from './submittal/submittal.module';\\
import { WarrantyModule } from './warranty/warranty.module';\\
import { InspectionModule } from './inspection/inspection.module';\\
import { EquipmentModule } from './equipment/equipment.module';\\
import { DailyReportModule } from './daily-report/daily-report.module';\\
import { RiskModule } from './risk/risk.module';\\
import { ReportingModule } from './reporting/reporting.module';\\
import { ResourcePlanningModule } from './resource-planning/resource-planning.module';\\
import { QualityModule } from './quality/quality.module';\\
import { OmManualsModule } from './om-manuals/om-manuals.module';\\
import { ContractorsModule } from './contractors/contractors.module';\\
import { ScheduledTasksModule } from './scheduled-tasks/scheduled-tasks.module';\\
import { InventoryModule } from './inventory/inventory.module';" "$FILE"

echo "  ✓ Import statements added"

# ── Register modules in @Module imports array ──
# Insert after QuoteRequestsModule line
sed -i "/QuoteRequestsModule,/a\\
\\
    // Budget \& Finance\\
    BudgetModule,\\
\\
    // News \& CMS\\
    NewsModule,\\
\\
    // Admin Panel\\
    AdminModule,\\
\\
    // Contacts\\
    ContactsModule,\\
\\
    // Construction Workflow\\
    ConstructionProgressModule,\\
    ProcurementModule,\\
    ChangeOrdersModule,\\
    ChangeManagementModule,\\
    CommissioningModule,\\
    PunchListModule,\\
    InspectionModule,\\
    DailyReportModule,\\
    QualityModule,\\
\\
    // Document Workflow\\
    RfiModule,\\
    SubmittalModule,\\
    OmManualsModule,\\
\\
    // Resources \& Equipment\\
    EquipmentModule,\\
    ContractorsModule,\\
    ResourcePlanningModule,\\
    InventoryModule,\\
\\
    // Risk \& Reporting\\
    RiskModule,\\
    ReportingModule,\\
\\
    // Warranty \& Closeout\\
    WarrantyModule,\\
\\
    // Automation\\
    ScheduledTasksModule," "$FILE"

echo "  ✓ Module registrations added"
echo "=== app.module.ts patched successfully ==="
