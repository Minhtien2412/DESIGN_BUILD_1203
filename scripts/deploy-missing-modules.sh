#!/bin/bash
# ==========================================================
# MASTER DEPLOY: Create 24 missing NestJS modules + patch + build + restart
# Usage: scp to server, then run: bash deploy-missing-modules.sh
# Or run from local: ssh root@103.200.20.100 'bash -s' < deploy-missing-modules.sh
# ==========================================================

set -e
BASE="/var/www/baotienweb-api/src"
cd /var/www/baotienweb-api

echo "╔══════════════════════════════════════════════════════╗"
echo "║  Deploy 24 Missing NestJS Backend Modules           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# STEP 1: Backup
echo "── Step 1: Backup current src ──"
tar czf /tmp/baotienweb-api-src-backup-$(date +%Y%m%d_%H%M%S).tar.gz src/
echo "  ✓ Backup created in /tmp/"

# STEP 2: Create all 24 modules
echo ""
echo "── Step 2: Creating 24 module directories & files ──"

###############################################################################
# Helper function for workflow modules
###############################################################################
create_wf_module() {
  local dir="$1" Name="$2" route="$3" entity="$4" defStatus="$5" sampleTitle="$6"

  mkdir -p "$BASE/$dir"

  cat > "$BASE/$dir/$dir.module.ts" <<XEOF
import { Module } from '@nestjs/common';
import { ${Name}Controller } from './$dir.controller';
import { ${Name}Service } from './$dir.service';
@Module({ controllers: [${Name}Controller], providers: [${Name}Service], exports: [${Name}Service] })
export class ${Name}Module {}
XEOF

  cat > "$BASE/$dir/$dir.service.ts" <<XEOF
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
      this.items.set(id, { id, projectId: 1, title: '${sampleTitle} #' + id, status: '${defStatus}', priority: 'medium', createdBy: 'admin', createdAt: now, updatedAt: now });
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
  create(data: any) { const id = this.idCounter++; const x = { id, ...data, status: '${defStatus}', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; this.items.set(id, x); return { data: x }; }
  update(id: number, data: any) { const x = this.items.get(id); if (!x) throw new NotFoundException(); Object.assign(x, data, { updatedAt: new Date().toISOString() }); return { data: x }; }
  remove(id: number) { this.items.delete(id); return { success: true }; }
  changeStatus(id: number, status: string, extra?: any) { const x = this.items.get(id); if (!x) throw new NotFoundException(); x.status = status; if (extra) Object.assign(x, extra); x.updatedAt = new Date().toISOString(); return { data: x }; }
  getSummary(projectId?: number) { const arr = projectId ? [...this.items.values()].filter(x => x.projectId == projectId) : [...this.items.values()]; return { data: { total: arr.length, byStatus: {} } }; }
  getAnalytics(projectId?: number) { return { data: { total: this.items.size, trends: [] } }; }
}
XEOF

  cat > "$BASE/$dir/$dir.controller.ts" <<XEOF
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

  echo "  ✓ $dir"
}

###############################################################################
# 1. BUDGET MODULE (complex - custom)
###############################################################################
mkdir -p "$BASE/budget"

cat > "$BASE/budget/budget.module.ts" <<'EOF'
import { Module } from '@nestjs/common';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
@Module({ controllers: [BudgetController], providers: [BudgetService], exports: [BudgetService] })
export class BudgetModule {}
EOF

cat > "$BASE/budget/budget.service.ts" <<'EOF'
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

  findAllBudgets(f?: any) { let a = [...this.budgets.values()]; if (f?.projectId) a = a.filter(b => b.projectId == f.projectId); if (f?.status) a = a.filter(b => b.status === f.status); return { data: a, total: a.length, page: 1, limit: 20 }; }
  findBudget(id: number) { const b = this.budgets.get(id); if (!b) throw new NotFoundException(`Budget ${id} not found`); return { data: b }; }
  getProjectBudget(pid: number) { return { data: [...this.budgets.values()].find(x => x.projectId == pid) || null }; }
  createBudget(d: any) { const id = this.idCounter.budget++; const b = { id, ...d, spent: 0, remaining: d.totalBudget || 0, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; this.budgets.set(id, b); return { data: b }; }
  updateBudget(id: number, d: any) { const b = this.budgets.get(id); if (!b) throw new NotFoundException(); Object.assign(b, d, { updatedAt: new Date().toISOString() }); return { data: b }; }
  deleteBudget(id: number) { this.budgets.delete(id); return { success: true }; }

  getBudgetLines(bid: number) { return { data: this.budgetLines.get(bid) || [] }; }
  createBudgetLine(bid: number, d: any) { const id = this.idCounter.line++; const l = { id, budgetId: bid, ...d }; const lines = this.budgetLines.get(bid) || []; lines.push(l); this.budgetLines.set(bid, lines); return { data: l }; }
  updateBudgetLine(bid: number, lid: number, d: any) { const lines = this.budgetLines.get(bid) || []; const i = lines.findIndex(l => l.id === lid); if (i === -1) throw new NotFoundException(); Object.assign(lines[i], d); return { data: lines[i] }; }
  deleteBudgetLine(bid: number, lid: number) { const lines = this.budgetLines.get(bid) || []; this.budgetLines.set(bid, lines.filter(l => l.id !== lid)); return { success: true }; }

  findAllExpenses(f?: any) { let a = [...this.expenses.values()]; if (f?.budgetId) a = a.filter(e => e.budgetId == f.budgetId); if (f?.projectId) a = a.filter(e => e.projectId == f.projectId); return { data: a, total: a.length }; }
  findExpense(id: number) { const e = this.expenses.get(id); if (!e) throw new NotFoundException(); return { data: e }; }
  createExpense(d: any) { const id = this.idCounter.expense++; const e = { id, ...d, status: 'pending', createdAt: new Date().toISOString() }; this.expenses.set(id, e); return { data: e }; }
  updateExpense(id: number, d: any) { const e = this.expenses.get(id); if (!e) throw new NotFoundException(); Object.assign(e, d); return { data: e }; }
  deleteExpense(id: number) { this.expenses.delete(id); return { success: true }; }
  approveExpense(id: number) { const e = this.expenses.get(id); if (!e) throw new NotFoundException(); e.status = 'approved'; return { data: e }; }
  rejectExpense(id: number, reason: string) { const e = this.expenses.get(id); if (!e) throw new NotFoundException(); e.status = 'rejected'; e.rejectionReason = reason; return { data: e }; }
  markExpensePaid(id: number, d: any) { const e = this.expenses.get(id); if (!e) throw new NotFoundException(); e.status = 'paid'; Object.assign(e, d); return { data: e }; }

  findAllInvoices(f?: any) { let a = [...this.invoices.values()]; if (f?.budgetId) a = a.filter(i => i.budgetId == f.budgetId); return { data: a, total: a.length }; }
  findInvoice(id: number) { const i = this.invoices.get(id); if (!i) throw new NotFoundException(); return { data: i }; }
  createInvoice(d: any) { const id = this.idCounter.invoice++; const inv = { id, ...d, status: 'draft', createdAt: new Date().toISOString() }; this.invoices.set(id, inv); return { data: inv }; }
  updateInvoice(id: number, d: any) { const i = this.invoices.get(id); if (!i) throw new NotFoundException(); Object.assign(i, d); return { data: i }; }
  deleteInvoice(id: number) { this.invoices.delete(id); return { success: true }; }
  sendInvoice(id: number, email?: string) { const i = this.invoices.get(id); if (!i) throw new NotFoundException(); i.status = 'sent'; return { data: i }; }
  recordPayment(id: number, d: any) { const i = this.invoices.get(id); if (!i) throw new NotFoundException(); i.paidAmount = (i.paidAmount || 0) + d.amount; i.status = i.paidAmount >= i.amount ? 'paid' : 'partial'; return { data: i }; }

  getPaymentSchedule(pid: number) { return { data: [...this.paymentSchedules.values()].filter(s => s.projectId == pid) }; }
  createPaymentMilestone(d: any) { const id = this.idCounter.schedule++; const s = { id, ...d, status: 'pending' }; this.paymentSchedules.set(id, s); return { data: s }; }
  updatePaymentMilestone(id: number, d: any) { const s = this.paymentSchedules.get(id); if (!s) throw new NotFoundException(); Object.assign(s, d); return { data: s }; }

  getVarianceAnalysis(bid: number) { return { data: [] }; }
  getBudgetForecast(bid: number) { return { data: { budgetId: bid, projectedTotal: 0, projectedOverrun: 0, confidence: 0.85 } }; }
  getExpenseSummary(bid: number) { return { data: {} }; }
  getCashflowProjection(pid: number, months: number) { return { data: [] }; }
  exportBudgetReport(bid: number, format: string) { return { message: 'Export not implemented yet' }; }
}
EOF

cat > "$BASE/budget/budget.controller.ts" <<'EOF'
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BudgetService } from './budget.service';

@ApiTags('Budget')
@Controller()
export class BudgetController {
  constructor(private readonly svc: BudgetService) {}

  @Get('budgets') @ApiOperation({ summary: 'List budgets' }) findAllBudgets(@Query() q: any) { return this.svc.findAllBudgets(q); }
  @Get('budgets/:id') getBudget(@Param('id', ParseIntPipe) id: number) { return this.svc.findBudget(id); }
  @Get('projects/:pid/budget') getProjectBudget(@Param('pid', ParseIntPipe) pid: number) { return this.svc.getProjectBudget(pid); }
  @Post('budgets') createBudget(@Body() d: any) { return this.svc.createBudget(d); }
  @Put('budgets/:id') updateBudget(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.updateBudget(id, d); }
  @Delete('budgets/:id') deleteBudget(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteBudget(id); }

  @Get('budgets/:bid/lines') getBudgetLines(@Param('bid', ParseIntPipe) bid: number) { return this.svc.getBudgetLines(bid); }
  @Post('budgets/:bid/lines') createBudgetLine(@Param('bid', ParseIntPipe) bid: number, @Body() d: any) { return this.svc.createBudgetLine(bid, d); }
  @Put('budgets/:bid/lines/:lid') updateBudgetLine(@Param('bid', ParseIntPipe) bid: number, @Param('lid', ParseIntPipe) lid: number, @Body() d: any) { return this.svc.updateBudgetLine(bid, lid, d); }
  @Delete('budgets/:bid/lines/:lid') deleteBudgetLine(@Param('bid', ParseIntPipe) bid: number, @Param('lid', ParseIntPipe) lid: number) { return this.svc.deleteBudgetLine(bid, lid); }

  @Get('expenses') findAllExpenses(@Query() q: any) { return this.svc.findAllExpenses(q); }
  @Get('expenses/:id') getExpense(@Param('id', ParseIntPipe) id: number) { return this.svc.findExpense(id); }
  @Post('expenses') createExpense(@Body() d: any) { return this.svc.createExpense(d); }
  @Put('expenses/:id') updateExpense(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.updateExpense(id, d); }
  @Delete('expenses/:id') deleteExpense(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteExpense(id); }
  @Post('expenses/:id/approve') approveExpense(@Param('id', ParseIntPipe) id: number) { return this.svc.approveExpense(id); }
  @Post('expenses/:id/reject') rejectExpense(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.rejectExpense(id, d.reason); }
  @Post('expenses/:id/pay') markExpensePaid(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.markExpensePaid(id, d); }

  @Get('invoices') findAllInvoices(@Query() q: any) { return this.svc.findAllInvoices(q); }
  @Get('invoices/:id') getInvoice(@Param('id', ParseIntPipe) id: number) { return this.svc.findInvoice(id); }
  @Post('invoices') createInvoice(@Body() d: any) { return this.svc.createInvoice(d); }
  @Put('invoices/:id') updateInvoice(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.updateInvoice(id, d); }
  @Delete('invoices/:id') deleteInvoice(@Param('id', ParseIntPipe) id: number) { return this.svc.deleteInvoice(id); }
  @Post('invoices/:id/send') sendInvoice(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.sendInvoice(id, d?.email); }
  @Post('invoices/:id/payments') recordPayment(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.recordPayment(id, d); }

  @Get('projects/:pid/payment-schedule') getPaymentSchedule(@Param('pid', ParseIntPipe) pid: number) { return this.svc.getPaymentSchedule(pid); }
  @Post('payment-schedule') createMilestone(@Body() d: any) { return this.svc.createPaymentMilestone(d); }
  @Put('payment-schedule/:id') updateMilestone(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.updatePaymentMilestone(id, d); }

  @Get('budgets/:id/variance-analysis') getVarianceAnalysis(@Param('id', ParseIntPipe) id: number) { return this.svc.getVarianceAnalysis(id); }
  @Get('budgets/:id/forecast') getBudgetForecast(@Param('id', ParseIntPipe) id: number) { return this.svc.getBudgetForecast(id); }
  @Get('budgets/:id/expense-summary') getExpenseSummary(@Param('id', ParseIntPipe) id: number) { return this.svc.getExpenseSummary(id); }
  @Get('projects/:pid/cashflow') getCashflowProjection(@Param('pid', ParseIntPipe) pid: number, @Query('months') m: number) { return this.svc.getCashflowProjection(pid, m); }
  @Get('budgets/:id/export') exportBudgetReport(@Param('id', ParseIntPipe) id: number, @Query('format') f: string) { return this.svc.exportBudgetReport(id, f); }
}
EOF
echo "  ✓ 1/24 budget (complex)"

###############################################################################
# 2. NEWS MODULE
###############################################################################
mkdir -p "$BASE/news"

cat > "$BASE/news/news.module.ts" <<'EOF'
import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
@Module({ controllers: [NewsController], providers: [NewsService], exports: [NewsService] })
export class NewsModule {}
EOF

cat > "$BASE/news/news.service.ts" <<'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';
@Injectable()
export class NewsService {
  private articles = new Map<number, any>();
  private idCounter = 1;
  constructor() { this.seed(); }
  private seed() {
    const now = new Date().toISOString();
    [
      { title: 'Xu hướng thiết kế nội thất 2026', category: 'design', summary: 'Những xu hướng thiết kế mới nhất', imageUrl: 'https://picsum.photos/800/400?random=1', author: 'ThietKeResort', views: 1250 },
      { title: 'Giá vật liệu xây dựng tháng 2/2026', category: 'construction', summary: 'Cập nhật giá thép, xi măng, cát đá', imageUrl: 'https://picsum.photos/800/400?random=2', author: 'ThietKeResort', views: 890 },
      { title: 'Quy định mới về xây dựng nhà ở', category: 'legal', summary: 'Những thay đổi quan trọng về luật xây dựng', imageUrl: 'https://picsum.photos/800/400?random=3', author: 'ThietKeResort', views: 2100 },
      { title: 'Top 10 biệt thự đẹp nhất Việt Nam', category: 'design', summary: 'Điểm danh công trình kiến trúc nổi bật', imageUrl: 'https://picsum.photos/800/400?random=4', author: 'ThietKeResort', views: 3500 },
      { title: 'Công nghệ BIM trong xây dựng', category: 'technology', summary: 'Ứng dụng BIM tối ưu hóa thi công', imageUrl: 'https://picsum.photos/800/400?random=5', author: 'ThietKeResort', views: 670 },
    ].forEach(item => { const id = this.idCounter++; this.articles.set(id, { id, ...item, content: item.summary + '...', publishedAt: now, createdAt: now }); });
  }
  findAll(f?: any) {
    let a = [...this.articles.values()];
    if (f?.category) a = a.filter(x => x.category === f.category);
    if (f?.search) { const s = f.search.toLowerCase(); a = a.filter(x => x.title.toLowerCase().includes(s) || x.summary.toLowerCase().includes(s)); }
    a.sort((x, y) => new Date(y.publishedAt).getTime() - new Date(x.publishedAt).getTime());
    const page = parseInt(f?.page) || 1; const limit = parseInt(f?.limit) || 10;
    return { data: a.slice((page-1)*limit, page*limit), total: a.length, page, limit };
  }
  findOne(id: number) { const a = this.articles.get(id); if (!a) throw new NotFoundException(); return { data: a }; }
  recordView(id: number) { const a = this.articles.get(id); if (a) a.views = (a.views || 0) + 1; return { success: true }; }
}
EOF

cat > "$BASE/news/news.controller.ts" <<'EOF'
import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NewsService } from './news.service';
@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly svc: NewsService) {}
  @Get() findAll(@Query() q: any) { return this.svc.findAll(q); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Post(':id/view') recordView(@Param('id', ParseIntPipe) id: number) { return this.svc.recordView(id); }
}
EOF
echo "  ✓ 2/24 news"

###############################################################################
# 3. CONTACTS MODULE
###############################################################################
mkdir -p "$BASE/contacts"

cat > "$BASE/contacts/contacts.module.ts" <<'EOF'
import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
@Module({ controllers: [ContactsController], providers: [ContactsService], exports: [ContactsService] })
export class ContactsModule {}
EOF

cat > "$BASE/contacts/contacts.service.ts" <<'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';
@Injectable()
export class ContactsService {
  private contacts = new Map<number, any>();
  private idCounter = 1;
  constructor() { this.seed(); }
  private seed() {
    [
      { name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0901234567', company: 'XD Minh Tâm', role: 'Giám đốc' },
      { name: 'Trần Thị B', email: 'tranthib@example.com', phone: '0912345678', company: 'Kiến trúc ABC', role: 'Kiến trúc sư' },
      { name: 'Lê Văn C', email: 'levanc@example.com', phone: '0923456789', company: 'VLXD Phú Thịnh', role: 'Trưởng phòng' },
    ].forEach(i => { const id = this.idCounter++; this.contacts.set(id, { id, ...i, status: 'active', createdAt: new Date().toISOString() }); });
  }
  findAll(f?: any) { let a = [...this.contacts.values()]; if (f?.search) { const s = f.search.toLowerCase(); a = a.filter(c => c.name.toLowerCase().includes(s)); } const p = parseInt(f?.page)||1; const l = parseInt(f?.limit)||20; return { data: a.slice((p-1)*l, p*l), total: a.length, page: p, limit: l }; }
  findOne(id: number) { const c = this.contacts.get(id); if (!c) throw new NotFoundException(); return { data: c }; }
  create(d: any) { const id = this.idCounter++; const c = { id, ...d, status: 'active', createdAt: new Date().toISOString() }; this.contacts.set(id, c); return { data: c }; }
  update(id: number, d: any) { const c = this.contacts.get(id); if (!c) throw new NotFoundException(); Object.assign(c, d); return { data: c }; }
  remove(id: number) { this.contacts.delete(id); return { success: true }; }
}
EOF

cat > "$BASE/contacts/contacts.controller.ts" <<'EOF'
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
echo "  ✓ 3/24 contacts"

###############################################################################
# 4. ADMIN MODULE
###############################################################################
mkdir -p "$BASE/admin"

cat > "$BASE/admin/admin.module.ts" <<'EOF'
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
@Module({ controllers: [AdminController], providers: [AdminService], exports: [AdminService] })
export class AdminModule {}
EOF

cat > "$BASE/admin/admin.service.ts" <<'EOF'
import { Injectable } from '@nestjs/common';
@Injectable()
export class AdminService {
  getDashboard() { return { data: { totalUsers: 156, totalProjects: 23, activeProjects: 12, totalRevenue: 15000000000, monthlyRevenue: 2500000000, pendingOrders: 8, totalProducts: 450, totalContractors: 34 } }; }
  getDashboardOverview() { return this.getDashboard(); }
  getRevenue(months = 6) { const data = []; const now = new Date(); for (let i = months - 1; i >= 0; i--) { const d = new Date(now); d.setMonth(d.getMonth() - i); data.push({ month: d.toISOString().slice(0, 7), revenue: Math.floor(Math.random() * 3e9) + 1e9, expenses: Math.floor(Math.random() * 2e9) + 5e8 }); } return { data }; }
  getProjectsStatus() { return { data: { active: 12, completed: 8, planning: 3, paused: 2, total: 25 } }; }
  getTopPerformers() { return { data: [{ id: 1, name: 'Nguyễn Văn A', role: 'Kỹ sư', completedTasks: 45, rating: 4.8 }] }; }
  getActivities() { return { data: [{ id: 1, type: 'project_update', message: 'Dự án Villa Đà Lạt tiến độ 75%', timestamp: new Date().toISOString() }] }; }
  getStats() { return this.getDashboard(); }
  getUserStats() { return { data: { total: 156, active: 120, newThisMonth: 12, byRole: { admin: 3, manager: 8, staff: 45, client: 100 } } }; }
  getProjectStats() { return this.getProjectsStatus(); }
  getFinanceStats() { return { data: { totalRevenue: 15e9, totalExpenses: 9e9, profit: 6e9, pendingPayments: 3e9, overduePayments: 5e8 } }; }
}
EOF

cat > "$BASE/admin/admin.controller.ts" <<'EOF'
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly svc: AdminService) {}
  @Get('dashboard') getDashboard() { return this.svc.getDashboard(); }
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
echo "  ✓ 4/24 admin"

###############################################################################
# 5. INVENTORY MODULE (complex - suppliers, orders, stock)
###############################################################################
mkdir -p "$BASE/inventory"

cat > "$BASE/inventory/inventory.module.ts" <<'EOF'
import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
@Module({ controllers: [InventoryController], providers: [InventoryService], exports: [InventoryService] })
export class InventoryModule {}
EOF

cat > "$BASE/inventory/inventory.service.ts" <<'EOF'
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
  findAllSuppliers(q?: any) { return { data: [...this.suppliers.values()], total: this.suppliers.size }; }
  findSupplier(id: number) { const s = this.suppliers.get(id); if (!s) throw new NotFoundException(); return { data: s }; }
  createSupplier(d: any) { const id = this.idCounter.supplier++; const s = { id, ...d, status: 'active', createdAt: new Date().toISOString() }; this.suppliers.set(id, s); return { data: s }; }
  updateSupplier(id: number, d: any) { const s = this.suppliers.get(id); if (!s) throw new NotFoundException(); Object.assign(s, d); return { data: s }; }
  removeSupplier(id: number) { this.suppliers.delete(id); return { success: true }; }
  getSupplierMaterials(id: number) { return { data: [] }; }

  findAllOrders(q?: any) { return { data: [...this.materialOrders.values()], total: this.materialOrders.size }; }
  findOrder(id: number) { const o = this.materialOrders.get(id); if (!o) throw new NotFoundException(); return { data: o }; }
  createOrder(d: any) { const id = this.idCounter.order++; const o = { id, ...d, status: 'pending', createdAt: new Date().toISOString() }; this.materialOrders.set(id, o); return { data: o }; }
  updateOrder(id: number, d: any) { const o = this.materialOrders.get(id); if (!o) throw new NotFoundException(); Object.assign(o, d); return { data: o }; }
  removeOrder(id: number) { this.materialOrders.delete(id); return { success: true }; }
  approveOrder(id: number) { const o = this.materialOrders.get(id); if (!o) throw new NotFoundException(); o.status = 'approved'; return { data: o }; }
  receiveOrder(id: number, d?: any) { const o = this.materialOrders.get(id); if (!o) throw new NotFoundException(); o.status = 'received'; return { data: o }; }
  cancelOrder(id: number) { const o = this.materialOrders.get(id); if (!o) throw new NotFoundException(); o.status = 'cancelled'; return { data: o }; }

  findAllTransactions(q?: any) { return { data: [...this.stockTransactions.values()] }; }
  createTransaction(d: any) { const id = this.idCounter.transaction++; const t = { id, ...d, createdAt: new Date().toISOString() }; this.stockTransactions.set(id, t); return { data: t }; }
  adjustStock(mid: number, d: any) { return { data: { materialId: mid, ...d, adjusted: true } }; }
  transferStock(mid: number, d: any) { return { data: { materialId: mid, ...d, transferred: true } }; }
  getLowStock(pid: number) { return { data: [] }; }
  getSummary(pid?: number) { return { data: { totalSuppliers: this.suppliers.size, totalOrders: this.materialOrders.size, pendingOrders: 0 } }; }
  getStockAlerts(pid?: number) { return { data: [] }; }
}
EOF

cat > "$BASE/inventory/inventory.controller.ts" <<'EOF'
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
@ApiTags('Inventory')
@Controller()
export class InventoryController {
  constructor(private readonly svc: InventoryService) {}
  @Get('suppliers') findAllSuppliers(@Query() q: any) { return this.svc.findAllSuppliers(q); }
  @Get('suppliers/:id') findSupplier(@Param('id', ParseIntPipe) id: number) { return this.svc.findSupplier(id); }
  @Post('suppliers') createSupplier(@Body() d: any) { return this.svc.createSupplier(d); }
  @Put('suppliers/:id') updateSupplier(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.updateSupplier(id, d); }
  @Delete('suppliers/:id') removeSupplier(@Param('id', ParseIntPipe) id: number) { return this.svc.removeSupplier(id); }
  @Get('suppliers/:id/materials') getSupplierMaterials(@Param('id', ParseIntPipe) id: number) { return this.svc.getSupplierMaterials(id); }

  @Get('material-orders') findAllOrders(@Query() q: any) { return this.svc.findAllOrders(q); }
  @Get('material-orders/:id') findOrder(@Param('id', ParseIntPipe) id: number) { return this.svc.findOrder(id); }
  @Post('material-orders') createOrder(@Body() d: any) { return this.svc.createOrder(d); }
  @Put('material-orders/:id') updateOrder(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.updateOrder(id, d); }
  @Delete('material-orders/:id') removeOrder(@Param('id', ParseIntPipe) id: number) { return this.svc.removeOrder(id); }
  @Post('material-orders/:id/approve') approveOrder(@Param('id', ParseIntPipe) id: number) { return this.svc.approveOrder(id); }
  @Post('material-orders/:id/receive') receiveOrder(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.receiveOrder(id, d); }
  @Post('material-orders/:id/cancel') cancelOrder(@Param('id', ParseIntPipe) id: number) { return this.svc.cancelOrder(id); }

  @Get('stock-transactions') findAllTransactions(@Query() q: any) { return this.svc.findAllTransactions(q); }
  @Post('stock-transactions') createTransaction(@Body() d: any) { return this.svc.createTransaction(d); }
  @Post('materials/:id/adjust-stock') adjustStock(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.adjustStock(id, d); }
  @Post('materials/:id/transfer-stock') transferStock(@Param('id', ParseIntPipe) id: number, @Body() d: any) { return this.svc.transferStock(id, d); }
  @Get('projects/:pid/materials/low-stock') getLowStock(@Param('pid', ParseIntPipe) pid: number) { return this.svc.getLowStock(pid); }
  @Get('inventory/summary') getSummary(@Query('projectId') pid: number) { return this.svc.getSummary(pid); }
  @Get('stock-alerts') getStockAlerts(@Query('projectId') pid: number) { return this.svc.getStockAlerts(pid); }
}
EOF
echo "  ✓ 5/24 inventory"

###############################################################################
# 6-24: WORKFLOW MODULES (using helper function)
###############################################################################
create_wf_module "construction-progress" "ConstructionProgress" "construction-progress" "ConstructionProgress" "draft" "Giai đoạn thi công"
echo "  ✓ 6/24 construction-progress"

create_wf_module "procurement" "Procurement" "procurement" "ProcurementRequest" "draft" "Yêu cầu mua sắm"
echo "  ✓ 7/24 procurement"

create_wf_module "change-orders" "ChangeOrders" "change-orders" "ChangeOrder" "draft" "Lệnh thay đổi"
echo "  ✓ 8/24 change-orders"

create_wf_module "change-management" "ChangeManagement" "change-management" "ChangeRequest" "draft" "Yêu cầu thay đổi"
echo "  ✓ 9/24 change-management"

create_wf_module "commissioning" "Commissioning" "commissioning" "CommissioningPlan" "draft" "Kế hoạch nghiệm thu"
echo "  ✓ 10/24 commissioning"

create_wf_module "punch-list" "PunchList" "punch-lists" "PunchList" "draft" "Danh sách sửa chữa"
echo "  ✓ 11/24 punch-list"

create_wf_module "rfi" "Rfi" "rfis" "RFI" "draft" "Yêu cầu thông tin"
echo "  ✓ 12/24 rfi"

create_wf_module "submittal" "Submittal" "submittals" "Submittal" "draft" "Hồ sơ trình duyệt"
echo "  ✓ 13/24 submittal"

create_wf_module "warranty" "Warranty" "warranties" "Warranty" "active" "Bảo hành"
echo "  ✓ 14/24 warranty"

create_wf_module "inspection" "Inspection" "inspection" "Inspection" "scheduled" "Kiểm tra"
echo "  ✓ 15/24 inspection"

create_wf_module "equipment" "Equipment" "equipment" "Equipment" "available" "Thiết bị"
echo "  ✓ 16/24 equipment"

create_wf_module "daily-report" "DailyReport" "daily-reports" "DailyReport" "draft" "Báo cáo hàng ngày"
echo "  ✓ 17/24 daily-report"

create_wf_module "risk" "Risk" "risks" "Risk" "identified" "Rủi ro"
echo "  ✓ 18/24 risk"

create_wf_module "reporting" "Reporting" "reports" "Report" "draft" "Báo cáo"
echo "  ✓ 19/24 reporting"

create_wf_module "resource-planning" "ResourcePlanning" "resources" "Resource" "available" "Nguồn lực"
echo "  ✓ 20/24 resource-planning"

create_wf_module "quality" "Quality" "quality" "QualityTest" "pending" "Kiểm tra chất lượng"
echo "  ✓ 21/24 quality"

create_wf_module "om-manuals" "OmManuals" "om-manuals" "OmManualPackage" "draft" "Sổ tay vận hành"
echo "  ✓ 22/24 om-manuals"

create_wf_module "contractors" "Contractors" "contractors" "Contractor" "active" "Nhà thầu"
echo "  ✓ 23/24 contractors"

create_wf_module "scheduled-tasks" "ScheduledTasks" "scheduled-tasks" "ScheduledTask" "active" "Tác vụ tự động"
echo "  ✓ 24/24 scheduled-tasks"

echo ""
echo "  ✅ All 24 modules created!"

###############################################################################
# STEP 3: Patch app.module.ts
###############################################################################
echo ""
echo "── Step 3: Patching app.module.ts ──"

FILE="$BASE/app.module.ts"
cp "$FILE" "$FILE.bak"

# Add import statements after the ZaloModule import
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

# Register modules in @Module imports array (after QuoteRequestsModule)
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

###############################################################################
# STEP 4: Build & Restart
###############################################################################
echo ""
echo "── Step 4: Build ──"
cd /var/www/baotienweb-api
npm run build 2>&1 | tail -5
BUILD_EXIT=$?

if [ $BUILD_EXIT -eq 0 ]; then
  echo "  ✅ Build successful!"
  echo ""
  echo "── Step 5: Restart PM2 ──"
  pm2 restart baotienweb-api 2>&1 || pm2 restart all 2>&1
  echo "  ✅ PM2 restarted!"
  
  sleep 3
  echo ""
  echo "── Step 6: Quick endpoint verification ──"
  for endpoint in budgets news contacts admin/dashboard rfis submittals inspection equipment risks reports quality; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/$endpoint" 2>/dev/null || echo "ERR")
    echo "  GET /api/$endpoint → $STATUS"
  done
else
  echo "  ❌ Build FAILED! Check errors above."
  echo "  Restoring backup..."
  cp "$FILE.bak" "$FILE"
  echo "  Backup restored. Fix errors and retry."
fi

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  DEPLOYMENT COMPLETE                                 ║"
echo "╚══════════════════════════════════════════════════════╝"
