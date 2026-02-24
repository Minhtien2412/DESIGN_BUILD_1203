#!/bin/bash
# ==========================================================
# Create Missing NestJS Backend Modules
# Run on server: bash /tmp/create-missing-modules.sh
# ==========================================================

set -e
BASE="/var/www/baotienweb-api/src"
cd "$BASE"

echo "=== Creating 24 missing backend modules ==="

# ──────────────────────────────────────────────
# HELPER: create module skeleton
# Usage: create_module <dir> <Name> <routePrefix>
# ──────────────────────────────────────────────
create_module() {
  local dir="$1" name="$2" route="$3"
  mkdir -p "$BASE/$dir"

  # module file
  cat > "$BASE/$dir/$dir.module.ts" <<MODEOF
import { Module } from '@nestjs/common';
import { ${name}Controller } from './$dir.controller';
import { ${name}Service } from './$dir.service';

@Module({
  controllers: [${name}Controller],
  providers: [${name}Service],
  exports: [${name}Service],
})
export class ${name}Module {}
MODEOF

  echo "  ✓ $dir module created"
}

# ──────────────────────────────────────────────
# 1. BUDGET MODULE
# Routes: /budgets, /expenses, /invoices, /payment-schedule
# ──────────────────────────────────────────────
mkdir -p budget
cat > budget/budget.module.ts <<'EOF'
import { Module } from '@nestjs/common';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';

@Module({
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}
EOF

cat > budget/budget.service.ts <<'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class BudgetService {
  private budgets = new Map<number, any>();
  private budgetLines = new Map<number, any[]>();
  private expenses = new Map<number, any>();
  private invoices = new Map<number, any>();
  private paymentSchedules = new Map<number, any>();
  private idCounter = { budget: 1, line: 1, expense: 1, invoice: 1, schedule: 1 };

  constructor() { this.seed(); }

  private seed() {
    const now = new Date().toISOString();
    this.budgets.set(1, { id: 1, projectId: 1, name: 'Villa Construction Budget', totalBudget: 5000000000, spent: 1200000000, remaining: 3800000000, currency: 'VND', status: 'active', categories: [], createdAt: now, updatedAt: now });
    this.budgets.set(2, { id: 2, projectId: 2, name: 'Office Renovation Budget', totalBudget: 2000000000, spent: 800000000, remaining: 1200000000, currency: 'VND', status: 'active', categories: [], createdAt: now, updatedAt: now });
    this.budgetLines.set(1, [
      { id: 1, budgetId: 1, category: 'materials', description: 'Vật liệu xây dựng', amount: 2000000000, spent: 500000000 },
      { id: 2, budgetId: 1, category: 'labor', description: 'Nhân công', amount: 1500000000, spent: 400000000 },
    ]);
    this.expenses.set(1, { id: 1, budgetId: 1, projectId: 1, description: 'Xi măng PCB40', amount: 150000000, category: 'materials', status: 'approved', vendor: 'VLXD Minh Tâm', date: now, createdAt: now });
    this.invoices.set(1, { id: 1, budgetId: 1, projectId: 1, invoiceNumber: 'INV-2026-001', amount: 500000000, status: 'sent', dueDate: '2026-03-01', client: 'Nguyễn Văn A', items: [], createdAt: now });
    this.idCounter = { budget: 3, line: 3, expense: 2, invoice: 2, schedule: 1 };
  }

  // Budgets CRUD
  findAllBudgets(filters?: any) {
    let items = [...this.budgets.values()];
    if (filters?.projectId) items = items.filter(b => b.projectId == filters.projectId);
    if (filters?.status) items = items.filter(b => b.status === filters.status);
    return { data: items, total: items.length, page: 1, limit: 20 };
  }
  findBudget(id: number) { const b = this.budgets.get(id); if (!b) throw new NotFoundException(`Budget ${id} not found`); return { data: b }; }
  getProjectBudget(projectId: number) { const b = [...this.budgets.values()].find(x => x.projectId == projectId); return { data: b || null }; }
  createBudget(data: any) { const id = this.idCounter.budget++; const b = { id, ...data, spent: 0, remaining: data.totalBudget || 0, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; this.budgets.set(id, b); return { data: b }; }
  updateBudget(id: number, data: any) { const b = this.budgets.get(id); if (!b) throw new NotFoundException(); Object.assign(b, data, { updatedAt: new Date().toISOString() }); return { data: b }; }
  deleteBudget(id: number) { this.budgets.delete(id); return { success: true }; }

  // Budget Lines
  getBudgetLines(budgetId: number) { return { data: this.budgetLines.get(budgetId) || [] }; }
  createBudgetLine(budgetId: number, data: any) { const id = this.idCounter.line++; const line = { id, budgetId, ...data }; const lines = this.budgetLines.get(budgetId) || []; lines.push(line); this.budgetLines.set(budgetId, lines); return { data: line }; }
  updateBudgetLine(budgetId: number, lineId: number, data: any) { const lines = this.budgetLines.get(budgetId) || []; const idx = lines.findIndex(l => l.id === lineId); if (idx === -1) throw new NotFoundException(); Object.assign(lines[idx], data); return { data: lines[idx] }; }
  deleteBudgetLine(budgetId: number, lineId: number) { const lines = this.budgetLines.get(budgetId) || []; this.budgetLines.set(budgetId, lines.filter(l => l.id !== lineId)); return { success: true }; }

  // Expenses CRUD
  findAllExpenses(filters?: any) { let items = [...this.expenses.values()]; if (filters?.budgetId) items = items.filter(e => e.budgetId == filters.budgetId); if (filters?.projectId) items = items.filter(e => e.projectId == filters.projectId); return { data: items, total: items.length }; }
  findExpense(id: number) { const e = this.expenses.get(id); if (!e) throw new NotFoundException(); return { data: e }; }
  createExpense(data: any) { const id = this.idCounter.expense++; const e = { id, ...data, status: 'pending', createdAt: new Date().toISOString() }; this.expenses.set(id, e); return { data: e }; }
  updateExpense(id: number, data: any) { const e = this.expenses.get(id); if (!e) throw new NotFoundException(); Object.assign(e, data); return { data: e }; }
  deleteExpense(id: number) { this.expenses.delete(id); return { success: true }; }
  approveExpense(id: number) { const e = this.expenses.get(id); if (!e) throw new NotFoundException(); e.status = 'approved'; return { data: e }; }
  rejectExpense(id: number, reason: string) { const e = this.expenses.get(id); if (!e) throw new NotFoundException(); e.status = 'rejected'; e.rejectionReason = reason; return { data: e }; }
  markExpensePaid(id: number, data: any) { const e = this.expenses.get(id); if (!e) throw new NotFoundException(); e.status = 'paid'; Object.assign(e, data); return { data: e }; }

  // Invoices CRUD
  findAllInvoices(filters?: any) { let items = [...this.invoices.values()]; if (filters?.budgetId) items = items.filter(i => i.budgetId == filters.budgetId); return { data: items, total: items.length }; }
  findInvoice(id: number) { const i = this.invoices.get(id); if (!i) throw new NotFoundException(); return { data: i }; }
  createInvoice(data: any) { const id = this.idCounter.invoice++; const inv = { id, ...data, status: 'draft', createdAt: new Date().toISOString() }; this.invoices.set(id, inv); return { data: inv }; }
  updateInvoice(id: number, data: any) { const i = this.invoices.get(id); if (!i) throw new NotFoundException(); Object.assign(i, data); return { data: i }; }
  deleteInvoice(id: number) { this.invoices.delete(id); return { success: true }; }
  sendInvoice(id: number, email?: string) { const i = this.invoices.get(id); if (!i) throw new NotFoundException(); i.status = 'sent'; return { data: i }; }
  recordPayment(id: number, data: any) { const i = this.invoices.get(id); if (!i) throw new NotFoundException(); i.paidAmount = (i.paidAmount || 0) + data.amount; if (i.paidAmount >= i.amount) i.status = 'paid'; else i.status = 'partial'; return { data: i }; }

  // Payment Schedule
  getPaymentSchedule(projectId: number) { return { data: [...this.paymentSchedules.values()].filter(s => s.projectId == projectId) }; }
  createPaymentMilestone(data: any) { const id = this.idCounter.schedule++; const s = { id, ...data, status: 'pending' }; this.paymentSchedules.set(id, s); return { data: s }; }
  updatePaymentMilestone(id: number, data: any) { const s = this.paymentSchedules.get(id); if (!s) throw new NotFoundException(); Object.assign(s, data); return { data: s }; }

  // Analytics
  getVarianceAnalysis(budgetId: number) { return { data: [] }; }
  getBudgetForecast(budgetId: number) { return { data: { budgetId, projectedTotal: 0, projectedOverrun: 0, confidence: 0.85 } }; }
  getExpenseSummary(budgetId: number) { return { data: {} }; }
  getCashflowProjection(projectId: number, months: number) { return { data: [] }; }
  exportBudgetReport(budgetId: number, format: string) { return { message: 'Export not implemented yet' }; }
}
EOF

cat > budget/budget.controller.ts <<'EOF'
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BudgetService } from './budget.service';

@ApiTags('Budget')
@Controller()
export class BudgetController {
  constructor(private readonly svc: BudgetService) {}

  // ── Budgets ──
  @Get('budgets') @ApiOperation({ summary: 'List budgets' })
  findAllBudgets(@Query() q: any) { return this.svc.findAllBudgets(q); }
  @Get('budgets/:id') getBudget(@Param('id', ParseIntPipe) id: number) { return this.svc.findBudget(id); }
  @Get('projects/:projectId/budget') getProjectBudget(@Param('projectId', ParseIntPipe) pid: number) { return this.svc.getProjectBudget(pid); }
  @Post('budgets') createBudget(@Body() d: any) { return this.svc.createBudget(d); }
  @Put('budgets/:id') updateBudget(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.updateBudget(id, d); }
  @Delete('budgets/:id') deleteBudget(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteBudget(id); }

  // ── Budget Lines ──
  @Get('budgets/:budgetId/lines') getBudgetLines(@Param('budgetId', ParseIntPipe) bid: number) { return this.svc.getBudgetLines(bid); }
  @Post('budgets/:budgetId/lines') createBudgetLine(@Param('budgetId', ParseIntPipe) bid: number, @Body() d: any) { return this.svc.createBudgetLine(bid, d); }
  @Put('budgets/:budgetId/lines/:lineId') updateBudgetLine(@Param('budgetId', ParseIntPipe) bid: number, @Param('lineId', ParseIntPipe) lid: number, @Body() d: any) { return this.svc.updateBudgetLine(bid, lid, d); }
  @Delete('budgets/:budgetId/lines/:lineId') deleteBudgetLine(@Param('budgetId', ParseIntPipe) bid: number, @Param('lineId', ParseIntPipe) lid: number) { return this.svc.deleteBudgetLine(bid, lid); }

  // ── Expenses ──
  @Get('expenses') findAllExpenses(@Query() q: any) { return this.svc.findAllExpenses(q); }
  @Get('expenses/:id') getExpense(@Param('id', ParseIntPipe) id: number) { return this.svc.findExpense(id); }
  @Post('expenses') createExpense(@Body() d: any) { return this.svc.createExpense(d); }
  @Put('expenses/:id') updateExpense(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.updateExpense(id, d); }
  @Delete('expenses/:id') deleteExpense(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteExpense(id); }
  @Post('expenses/:id/approve') approveExpense(@Param('id', ParseIntPipe) id: number) { return this.svc.approveExpense(id); }
  @Post('expenses/:id/reject') rejectExpense(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.rejectExpense(id, d.reason); }
  @Post('expenses/:id/pay') markExpensePaid(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.markExpensePaid(id, d); }

  // ── Invoices ──
  @Get('invoices') findAllInvoices(@Query() q: any) { return this.svc.findAllInvoices(q); }
  @Get('invoices/:id') getInvoice(@Param('id', ParseIntPipe) id: number) { return this.svc.findInvoice(id); }
  @Post('invoices') createInvoice(@Body() d: any) { return this.svc.createInvoice(d); }
  @Put('invoices/:id') updateInvoice(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.updateInvoice(id, d); }
  @Delete('invoices/:id') deleteInvoice(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteInvoice(id); }
  @Post('invoices/:id/send') sendInvoice(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.sendInvoice(id, d?.email); }
  @Post('invoices/:id/payments') recordPayment(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.recordPayment(id, d); }

  // ── Payment Schedule ──
  @Get('projects/:projectId/payment-schedule') getPaymentSchedule(@Param('projectId', ParseIntPipe) pid: number) { return this.svc.getPaymentSchedule(pid); }
  @Post('payment-schedule') createPaymentMilestone(@Body() d: any) { return this.svc.createPaymentMilestone(d); }
  @Put('payment-schedule/:id') updatePaymentMilestone(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.updatePaymentMilestone(id, d); }

  // ── Analytics ──
  @Get('budgets/:id/variance-analysis') getVarianceAnalysis(@Param('id', ParseIntPipe) id: number) { return this.svc.getVarianceAnalysis(id); }
  @Get('budgets/:id/forecast') getBudgetForecast(@Param('id', ParseIntPipe) id: number) { return this.svc.getBudgetForecast(id); }
  @Get('budgets/:id/expense-summary') getExpenseSummary(@Param('id', ParseIntPipe) id: number) { return this.svc.getExpenseSummary(id); }
  @Get('projects/:projectId/cashflow') getCashflowProjection(@Param('projectId', ParseIntPipe) pid: number, @Query('months') m: number) { return this.svc.getCashflowProjection(pid, m); }
  @Get('budgets/:id/export') exportBudgetReport(@Param('id', ParseIntPipe) id: number, @Query('format') f: string) { return this.svc.exportBudgetReport(id, f); }
}
EOF

echo "✓ 1/24 budget module"

# ──────────────────────────────────────────────
# GENERIC MODULE CREATOR - for modules with standard CRUD + workflow actions
# ──────────────────────────────────────────────
create_crud_module() {
  local dir="$1" className="$2" route="$3" entityName="$4" sampleData="$5"

  mkdir -p "$dir"

  # MODULE
  cat > "$dir/$dir.module.ts" <<MEOF
import { Module } from '@nestjs/common';
import { ${className}Controller } from './$dir.controller';
import { ${className}Service } from './$dir.service';

@Module({
  controllers: [${className}Controller],
  providers: [${className}Service],
  exports: [${className}Service],
})
export class ${className}Module {}
MEOF

  echo "  ✓ $dir module file"
}

# ──────────────────────────────────────────────
# 2. NEWS MODULE
# ──────────────────────────────────────────────
mkdir -p news
cat > news/news.module.ts <<'EOF'
import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
@Module({ controllers: [NewsController], providers: [NewsService], exports: [NewsService] })
export class NewsModule {}
EOF

cat > news/news.service.ts <<'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class NewsService {
  private articles = new Map<number, any>();
  private idCounter = 1;

  constructor() { this.seed(); }

  private seed() {
    const now = new Date().toISOString();
    const items = [
      { title: 'Xu hướng thiết kế nội thất 2026', category: 'design', summary: 'Những xu hướng thiết kế mới nhất trong năm 2026', content: 'Năm 2026 chứng kiến sự trỗi dậy của phong cách minimalist kết hợp với vật liệu tự nhiên...', imageUrl: 'https://picsum.photos/800/400?random=1', author: 'ThietKeResort', views: 1250 },
      { title: 'Giá vật liệu xây dựng tháng 2/2026', category: 'construction', summary: 'Cập nhật giá thép, xi măng, cát đá mới nhất', content: 'Giá thép duy trì ổn định trong khi xi măng tăng nhẹ 2%...', imageUrl: 'https://picsum.photos/800/400?random=2', author: 'ThietKeResort', views: 890 },
      { title: 'Quy định mới về xây dựng nhà ở 2026', category: 'legal', summary: 'Những thay đổi quan trọng về luật xây dựng', content: 'Bộ Xây dựng vừa ban hành thông tư mới về tiêu chuẩn xây dựng nhà ở...', imageUrl: 'https://picsum.photos/800/400?random=3', author: 'ThietKeResort', views: 2100 },
      { title: 'Top 10 biệt thự đẹp nhất Việt Nam', category: 'design', summary: 'Điểm danh những công trình kiến trúc nổi bật', content: 'Kiến trúc Việt Nam ngày càng phát triển với nhiều công trình đẳng cấp...', imageUrl: 'https://picsum.photos/800/400?random=4', author: 'ThietKeResort', views: 3500 },
      { title: 'Công nghệ BIM trong xây dựng', category: 'technology', summary: 'Ứng dụng BIM để tối ưu hóa thiết kế và thi công', content: 'Building Information Modeling đang cách mạng hóa ngành xây dựng...', imageUrl: 'https://picsum.photos/800/400?random=5', author: 'ThietKeResort', views: 670 },
    ];
    items.forEach(item => { const id = this.idCounter++; this.articles.set(id, { id, ...item, publishedAt: now, createdAt: now }); });
  }

  findAll(filters?: any) {
    let items = [...this.articles.values()];
    if (filters?.category) items = items.filter(a => a.category === filters.category);
    if (filters?.search) { const s = filters.search.toLowerCase(); items = items.filter(a => a.title.toLowerCase().includes(s) || a.summary.toLowerCase().includes(s)); }
    items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    const page = parseInt(filters?.page) || 1; const limit = parseInt(filters?.limit) || 10;
    const start = (page - 1) * limit;
    return { data: items.slice(start, start + limit), total: items.length, page, limit };
  }
  findOne(id: number) { const a = this.articles.get(id); if (!a) throw new NotFoundException(`Article ${id} not found`); return { data: a }; }
  recordView(id: number) { const a = this.articles.get(id); if (a) a.views = (a.views || 0) + 1; return { success: true }; }
}
EOF

cat > news/news.controller.ts <<'EOF'
import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NewsService } from './news.service';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly svc: NewsService) {}

  @Get() @ApiOperation({ summary: 'List news articles' })
  findAll(@Query() q: any) { return this.svc.findAll(q); }

  @Get(':id') @ApiOperation({ summary: 'Get article by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }

  @Post(':id/view') @ApiOperation({ summary: 'Record article view' })
  recordView(@Param('id', ParseIntPipe) id: number) { return this.svc.recordView(id); }
}
EOF

echo "✓ 2/24 news module"

# ──────────────────────────────────────────────
# 3. CONTACTS MODULE
# ──────────────────────────────────────────────
mkdir -p contacts
cat > contacts/contacts.module.ts <<'EOF'
import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
@Module({ controllers: [ContactsController], providers: [ContactsService], exports: [ContactsService] })
export class ContactsModule {}
EOF

cat > contacts/contacts.service.ts <<'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ContactsService {
  private contacts = new Map<number, any>();
  private idCounter = 1;

  constructor() { this.seed(); }
  private seed() {
    const items = [
      { name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0901234567', company: 'XD Minh Tâm', role: 'Giám đốc', status: 'active' },
      { name: 'Trần Thị B', email: 'tranthib@example.com', phone: '0912345678', company: 'Kiến trúc ABC', role: 'Kiến trúc sư', status: 'active' },
      { name: 'Lê Văn C', email: 'levanc@example.com', phone: '0923456789', company: 'VLXD Phú Thịnh', role: 'Trưởng phòng', status: 'active' },
    ];
    items.forEach(i => { const id = this.idCounter++; this.contacts.set(id, { id, ...i, createdAt: new Date().toISOString() }); });
  }

  findAll(filters?: any) {
    let items = [...this.contacts.values()];
    if (filters?.status) items = items.filter(c => c.status === filters.status);
    if (filters?.search) { const s = filters.search.toLowerCase(); items = items.filter(c => c.name.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s)); }
    const page = parseInt(filters?.page) || 1; const limit = parseInt(filters?.limit) || 20;
    return { data: items.slice((page-1)*limit, page*limit), total: items.length, page, limit };
  }
  findOne(id: number) { const c = this.contacts.get(id); if (!c) throw new NotFoundException(); return { data: c }; }
  create(data: any) { const id = this.idCounter++; const c = { id, ...data, status: 'active', createdAt: new Date().toISOString() }; this.contacts.set(id, c); return { data: c }; }
  update(id: number, data: any) { const c = this.contacts.get(id); if (!c) throw new NotFoundException(); Object.assign(c, data); return { data: c }; }
  remove(id: number) { this.contacts.delete(id); return { success: true }; }
}
EOF

cat > contacts/contacts.controller.ts <<'EOF'
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly svc: ContactsService) {}

  @Get() findAll(@Query() q: any) { return this.svc.findAll(q); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Post() create(@Body() d: any) { return this.svc.create(d); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.update(id, d); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
EOF

echo "✓ 3/24 contacts module"

# ──────────────────────────────────────────────
# 4. ADMIN MODULE
# ──────────────────────────────────────────────
mkdir -p admin
cat > admin/admin.module.ts <<'EOF'
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
@Module({ controllers: [AdminController], providers: [AdminService], exports: [AdminService] })
export class AdminModule {}
EOF

cat > admin/admin.service.ts <<'EOF'
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getDashboard() {
    return { data: { totalUsers: 156, totalProjects: 23, activeProjects: 12, totalRevenue: 15000000000, monthlyRevenue: 2500000000, pendingOrders: 8, totalProducts: 450, totalContractors: 34 } };
  }
  getDashboardOverview() { return this.getDashboard(); }
  getRevenue(months: number = 6) {
    const data = []; const now = new Date();
    for (let i = months - 1; i >= 0; i--) { const d = new Date(now); d.setMonth(d.getMonth() - i); data.push({ month: d.toISOString().slice(0, 7), revenue: Math.floor(Math.random() * 3000000000) + 1000000000, expenses: Math.floor(Math.random() * 2000000000) + 500000000 }); }
    return { data };
  }
  getProjectsStatus() { return { data: { active: 12, completed: 8, planning: 3, paused: 2, total: 25 } }; }
  getTopPerformers() { return { data: [{ id: 1, name: 'Nguyễn Văn A', role: 'Kỹ sư', completedTasks: 45, rating: 4.8 }, { id: 2, name: 'Trần Thị B', role: 'Kiến trúc sư', completedTasks: 38, rating: 4.9 }] }; }
  getActivities() { return { data: [{ id: 1, type: 'project_update', message: 'Dự án Villa Đà Lạt cập nhật tiến độ 75%', timestamp: new Date().toISOString() }, { id: 2, type: 'new_order', message: 'Đơn hàng mới #1234 từ Nguyễn Văn A', timestamp: new Date().toISOString() }] }; }
  getStats() { return this.getDashboard(); }
  getUserStats() { return { data: { total: 156, active: 120, newThisMonth: 12, byRole: { admin: 3, manager: 8, staff: 45, client: 100 } } }; }
  getProjectStats() { return this.getProjectsStatus(); }
  getFinanceStats() { return { data: { totalRevenue: 15000000000, totalExpenses: 9000000000, profit: 6000000000, pendingPayments: 3000000000, overduePayments: 500000000 } }; }
}
EOF

cat > admin/admin.controller.ts <<'EOF'
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  @Get('dashboard') @ApiOperation({ summary: 'Admin dashboard' }) getDashboard() { return this.svc.getDashboard(); }
  @Get('dashboard/overview') getDashboardOverview() { return this.svc.getDashboardOverview(); }
  @Get('dashboard/revenue') getRevenue(@Query('months') m: number) { return this.svc.getRevenue(m); }
  @Get('dashboard/projects-status') getProjectsStatus() { return this.svc.getProjectsStatus(); }
  @Get('dashboard/top-performers') getTopPerformers() { return this.svc.getTopPerformers(); }
  @Get('dashboard/activities') getActivities() { return this.svc.getActivities(); }
  @Get('stats') getStats() { return this.svc.getStats(); }
  @Get('stats/users') getUserStats() { return this.svc.getUserStats(); }
  @Get('stats/projects') getProjectStats() { return this.svc.getProjectStats(); }
  @Get('stats/finance') getFinanceStats() { return this.svc.getFinanceStats(); }
}
EOF

echo "✓ 4/24 admin module"

# ──────────────────────────────────────────────
# 5-24: REMAINING MODULES (compact CRUD pattern)
# Each: service with Map storage + sample data, controller with routes, module
# ──────────────────────────────────────────────

# Helper to generate a standard workflow module
generate_workflow_module() {
  local dir="$1" Name="$2" route="$3" entity="$4" statuses="$5" sample_title="$6"

  mkdir -p "$dir"

  # Module
  cat > "$dir/$dir.module.ts" <<XEOF
import { Module } from '@nestjs/common';
import { ${Name}Controller } from './$dir.controller';
import { ${Name}Service } from './$dir.service';
@Module({ controllers: [${Name}Controller], providers: [${Name}Service], exports: [${Name}Service] })
export class ${Name}Module {}
XEOF

  # Service
  cat > "$dir/$dir.service.ts" <<XEOF
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ${Name}Service {
  private items = new Map<number, any>();
  private idCounter = 1;

  constructor() { this.seed(); }
  private seed() {
    const now = new Date().toISOString();
    [1,2,3].forEach(i => {
      const id = this.idCounter++;
      this.items.set(id, { id, projectId: 1, title: '${sample_title} #' + id, status: '${statuses%%,*}', priority: 'medium', createdBy: 'admin', createdAt: now, updatedAt: now });
    });
  }

  findAll(filters?: any) {
    let arr = [...this.items.values()];
    if (filters?.projectId) arr = arr.filter(x => x.projectId == filters.projectId);
    if (filters?.status) arr = arr.filter(x => x.status === filters.status);
    if (filters?.search) { const s = filters.search.toLowerCase(); arr = arr.filter(x => (x.title||'').toLowerCase().includes(s)); }
    const page = parseInt(filters?.page) || 1; const limit = parseInt(filters?.limit) || 20;
    return { data: arr.slice((page-1)*limit, page*limit), total: arr.length, page, limit };
  }
  findOne(id: number) { const x = this.items.get(id); if (!x) throw new NotFoundException('${entity} ' + id + ' not found'); return { data: x }; }
  create(data: any) { const id = this.idCounter++; const x = { id, ...data, status: '${statuses%%,*}', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; this.items.set(id, x); return { data: x }; }
  update(id: number, data: any) { const x = this.items.get(id); if (!x) throw new NotFoundException(); Object.assign(x, data, { updatedAt: new Date().toISOString() }); return { data: x }; }
  remove(id: number) { this.items.delete(id); return { success: true }; }
  changeStatus(id: number, status: string, extra?: any) { const x = this.items.get(id); if (!x) throw new NotFoundException(); x.status = status; if (extra) Object.assign(x, extra); x.updatedAt = new Date().toISOString(); return { data: x }; }
  getSummary(projectId?: number) { const arr = projectId ? [...this.items.values()].filter(x => x.projectId == projectId) : [...this.items.values()]; return { data: { total: arr.length, byStatus: {} } }; }
  getAnalytics(projectId?: number) { return { data: { total: this.items.size, trends: [] } }; }
}
XEOF

  # Controller
  cat > "$dir/$dir.controller.ts" <<XEOF
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ${Name}Service } from './$dir.service';

@ApiTags('${Name}')
@Controller('${route}')
export class ${Name}Controller {
  constructor(private readonly svc: ${Name}Service) {}

  @Get() findAll(@Query() q: any) { return this.svc.findAll(q); }
  @Get('summary') getSummary(@Query('projectId') pid: number) { return this.svc.getSummary(pid); }
  @Get('analytics') getAnalytics(@Query('projectId') pid: number) { return this.svc.getAnalytics(pid); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Post() create(@Body() d: any) { return this.svc.create(d); }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.update(id, d); }
  @Patch(':id') patch(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.update(id, d); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
  @Post(':id/submit') submit(@Param('id', ParseIntPipe) id: number) { return this.svc.changeStatus(id, 'submitted'); }
  @Post(':id/approve') approve(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.changeStatus(id, 'approved', d); }
  @Post(':id/reject') reject(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.changeStatus(id, 'rejected', d); }
  @Post(':id/cancel') cancel(@Param('id', ParseIntPipe) id: number) { return this.svc.changeStatus(id, 'cancelled'); }
  @Post(':id/complete') complete(@Param('id', ParseIntPipe) id: number) { return this.svc.changeStatus(id, 'completed'); }
  @Post(':id/review') review(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.changeStatus(id, 'reviewed', d); }
  @Post(':id/close') close(@Param('id', ParseIntPipe) id: number) { return this.svc.changeStatus(id, 'closed'); }
  @Post(':id/start') start(@Param('id', ParseIntPipe) id: number) { return this.svc.changeStatus(id, 'in_progress'); }
  @Post(':id/reopen') reopen(@Param('id', ParseIntPipe) id: number) { return this.svc.changeStatus(id, 'open'); }
}
XEOF

  echo "  ✓ $dir module created"
}

# 5. Construction Progress
generate_workflow_module "construction-progress" "ConstructionProgress" "construction-progress" "ConstructionProgress" "draft,active,completed" "Giai đoạn thi công"
# Add extra routes for construction-progress
cat >> construction-progress/construction-progress.controller.ts <<'CPEOF'

// Extra construction-progress routes
// @Get('projects/:projectId') handled by main findAll with query param
CPEOF
echo "✓ 5/24 construction-progress"

# 6. Procurement
generate_workflow_module "procurement" "Procurement" "procurement" "ProcurementRequest" "draft,submitted,approved,ordered" "Yêu cầu mua sắm"
echo "✓ 6/24 procurement"

# 7. Change Orders
generate_workflow_module "change-orders" "ChangeOrders" "change-orders" "ChangeOrder" "draft,submitted,approved,rejected" "Lệnh thay đổi"
echo "✓ 7/24 change-orders"

# 8. Change Management
generate_workflow_module "change-management" "ChangeManagement" "change-management" "ChangeRequest" "draft,submitted,assessed,approved" "Yêu cầu thay đổi"
echo "✓ 8/24 change-management"

# 9. Commissioning
generate_workflow_module "commissioning" "Commissioning" "commissioning" "CommissioningPlan" "draft,active,testing,completed" "Kế hoạch nghiệm thu"
echo "✓ 9/24 commissioning"

# 10. Punch List
generate_workflow_module "punch-list" "PunchList" "punch-lists" "PunchList" "draft,distributed,in_progress,completed" "Danh sách sửa chữa"
echo "✓ 10/24 punch-list"

# 11. RFI
generate_workflow_module "rfi" "Rfi" "rfis" "RFI" "draft,submitted,responded,closed" "Yêu cầu thông tin"
echo "✓ 11/24 rfi"

# 12. Submittal
generate_workflow_module "submittal" "Submittal" "submittals" "Submittal" "draft,submitted,reviewed,approved" "Hồ sơ trình duyệt"
echo "✓ 12/24 submittal"

# 13. Warranty
generate_workflow_module "warranty" "Warranty" "warranties" "Warranty" "active,expiring,expired,claimed" "Bảo hành"
echo "✓ 13/24 warranty"

# 14. Inspection
generate_workflow_module "inspection" "Inspection" "inspection" "Inspection" "scheduled,in_progress,passed,failed" "Kiểm tra chất lượng"
echo "✓ 14/24 inspection"

# 15. Equipment
generate_workflow_module "equipment" "Equipment" "equipment" "Equipment" "available,in_use,maintenance,retired" "Thiết bị"
echo "✓ 15/24 equipment"

# 16. Daily Report
generate_workflow_module "daily-report" "DailyReport" "daily-reports" "DailyReport" "draft,submitted,reviewed,approved" "Báo cáo hàng ngày"
echo "✓ 16/24 daily-report"

# 17. Risk
generate_workflow_module "risk" "Risk" "risks" "Risk" "identified,assessed,mitigating,resolved,closed" "Rủi ro"
echo "✓ 17/24 risk"

# 18. Reporting
generate_workflow_module "reporting" "Reporting" "reports" "Report" "draft,generated,published" "Báo cáo"
echo "✓ 18/24 reporting"

# 19. Resource Planning
generate_workflow_module "resource-planning" "ResourcePlanning" "resources" "Resource" "available,allocated,overloaded" "Nguồn lực"
echo "✓ 19/24 resource-planning"

# 20. Quality
generate_workflow_module "quality" "Quality" "quality" "QualityTest" "pending,in_progress,passed,failed" "Kiểm tra chất lượng"
echo "✓ 20/24 quality"

# 21. O&M Manuals
generate_workflow_module "om-manuals" "OmManuals" "om-manuals" "OmManualPackage" "draft,submitted,reviewed,approved" "Sổ tay vận hành"
echo "✓ 21/24 om-manuals"

# 22. Contractors
generate_workflow_module "contractors" "Contractors" "contractors" "Contractor" "active,verified,suspended" "Nhà thầu"
echo "✓ 22/24 contractors"

# 23. Scheduled Tasks
generate_workflow_module "scheduled-tasks" "ScheduledTasks" "scheduled-tasks" "ScheduledTask" "active,paused,completed" "Tác vụ tự động"
echo "✓ 23/24 scheduled-tasks"

# 24. Inventory (suppliers, material-orders, stock)
mkdir -p inventory
cat > inventory/inventory.module.ts <<'EOF'
import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
@Module({ controllers: [InventoryController], providers: [InventoryService], exports: [InventoryService] })
export class InventoryModule {}
EOF

cat > inventory/inventory.service.ts <<'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class InventoryService {
  private suppliers = new Map<number, any>();
  private materialOrders = new Map<number, any>();
  private stockTransactions = new Map<number, any>();
  private idCounter = { supplier: 1, order: 1, transaction: 1 };

  constructor() { this.seed(); }
  private seed() {
    const now = new Date().toISOString();
    this.suppliers.set(1, { id: 1, name: 'VLXD Minh Tâm', phone: '0901234567', email: 'minhtam@vlxd.vn', address: 'Q.Bình Thạnh, TP.HCM', rating: 4.5, status: 'active', createdAt: now });
    this.suppliers.set(2, { id: 2, name: 'Thép Việt Nhật', phone: '0912345678', email: 'info@thepvietnhat.vn', address: 'KCN Bình Dương', rating: 4.8, status: 'active', createdAt: now });
    this.idCounter.supplier = 3;
  }

  // Suppliers
  findAllSuppliers(q?: any) { let arr = [...this.suppliers.values()]; return { data: arr, total: arr.length }; }
  findSupplier(id: number) { const s = this.suppliers.get(id); if (!s) throw new NotFoundException(); return { data: s }; }
  createSupplier(d: any) { const id = this.idCounter.supplier++; const s = { id, ...d, status: 'active', createdAt: new Date().toISOString() }; this.suppliers.set(id, s); return { data: s }; }
  updateSupplier(id: number, d: any) { const s = this.suppliers.get(id); if (!s) throw new NotFoundException(); Object.assign(s, d); return { data: s }; }
  removeSupplier(id: number) { this.suppliers.delete(id); return { success: true }; }
  getSupplierMaterials(id: number) { return { data: [] }; }

  // Material Orders
  findAllOrders(q?: any) { return { data: [...this.materialOrders.values()], total: this.materialOrders.size }; }
  findOrder(id: number) { const o = this.materialOrders.get(id); if (!o) throw new NotFoundException(); return { data: o }; }
  createOrder(d: any) { const id = this.idCounter.order++; const o = { id, ...d, status: 'pending', createdAt: new Date().toISOString() }; this.materialOrders.set(id, o); return { data: o }; }
  updateOrder(id: number, d: any) { const o = this.materialOrders.get(id); if (!o) throw new NotFoundException(); Object.assign(o, d); return { data: o }; }
  removeOrder(id: number) { this.materialOrders.delete(id); return { success: true }; }
  approveOrder(id: number) { return this.changeOrderStatus(id, 'approved'); }
  receiveOrder(id: number, d?: any) { return this.changeOrderStatus(id, 'received'); }
  cancelOrder(id: number) { return this.changeOrderStatus(id, 'cancelled'); }
  private changeOrderStatus(id: number, status: string) { const o = this.materialOrders.get(id); if (!o) throw new NotFoundException(); o.status = status; return { data: o }; }

  // Stock
  findAllTransactions(q?: any) { return { data: [...this.stockTransactions.values()] }; }
  createTransaction(d: any) { const id = this.idCounter.transaction++; const t = { id, ...d, createdAt: new Date().toISOString() }; this.stockTransactions.set(id, t); return { data: t }; }
  adjustStock(materialId: number, d: any) { return { data: { materialId, ...d, adjusted: true } }; }
  transferStock(materialId: number, d: any) { return { data: { materialId, ...d, transferred: true } }; }
  getLowStock(projectId: number) { return { data: [] }; }
  getSummary(projectId?: number) { return { data: { totalSuppliers: this.suppliers.size, totalOrders: this.materialOrders.size, pendingOrders: 0 } }; }
  getStockAlerts(projectId?: number) { return { data: [] }; }
}
EOF

cat > inventory/inventory.controller.ts <<'EOF'
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@Controller()
export class InventoryController {
  constructor(private readonly svc: InventoryService) {}

  // Suppliers
  @Get('suppliers') findAllSuppliers(@Query() q: any) { return this.svc.findAllSuppliers(q); }
  @Get('suppliers/:id') findSupplier(@Param('id', ParseIntPipe) id: number) { return this.svc.findSupplier(id); }
  @Post('suppliers') createSupplier(@Body() d: any) { return this.svc.createSupplier(d); }
  @Put('suppliers/:id') updateSupplier(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.updateSupplier(id, d); }
  @Delete('suppliers/:id') removeSupplier(@Param('id', ParseIntPipe) id: number) { return this.svc.removeSupplier(id); }
  @Get('suppliers/:id/materials') getSupplierMaterials(@Param('id', ParseIntPipe) id: number) { return this.svc.getSupplierMaterials(id); }

  // Material Orders
  @Get('material-orders') findAllOrders(@Query() q: any) { return this.svc.findAllOrders(q); }
  @Get('material-orders/:id') findOrder(@Param('id', ParseIntPipe) id: number) { return this.svc.findOrder(id); }
  @Post('material-orders') createOrder(@Body() d: any) { return this.svc.createOrder(d); }
  @Put('material-orders/:id') updateOrder(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.updateOrder(id, d); }
  @Delete('material-orders/:id') removeOrder(@Param('id', ParseIntPipe) id: number) { return this.svc.removeOrder(id); }
  @Post('material-orders/:id/approve') approveOrder(@Param('id', ParseIntPipe) id: number) { return this.svc.approveOrder(id); }
  @Post('material-orders/:id/receive') receiveOrder(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.receiveOrder(id, d); }
  @Post('material-orders/:id/cancel') cancelOrder(@Param('id', ParseIntPipe) id: number) { return this.svc.cancelOrder(id); }

  // Stock
  @Get('stock-transactions') findAllTransactions(@Query() q: any) { return this.svc.findAllTransactions(q); }
  @Post('stock-transactions') createTransaction(@Body() d: any) { return this.svc.createTransaction(d); }
  @Post('materials/:id/adjust-stock') adjustStock(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.adjustStock(id, d); }
  @Post('materials/:id/transfer-stock') transferStock(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.transferStock(id, d); }
  @Get('projects/:projectId/materials/low-stock') getLowStock(@Param('projectId', ParseIntPipe) pid: number) { return this.svc.getLowStock(pid); }
  @Get('inventory/summary') getSummary(@Query('projectId') pid: number) { return this.svc.getSummary(pid); }
  @Get('stock-alerts') getStockAlerts(@Query('projectId') pid: number) { return this.svc.getStockAlerts(pid); }
}
EOF

echo "✓ 24/24 inventory module"

echo ""
echo "=== All 24 modules created! ==="
echo "=== Now update app.module.ts ==="
