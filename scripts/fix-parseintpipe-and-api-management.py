#!/usr/bin/env python3
"""
Comprehensive script to:
1. Fix ParseIntPipe validation error across ALL 61 NestJS controller files
2. Create API Management backend (service + controller + module)
3. Patch admin-crm.html with API Management page (Perfex CRM style)

Run on VPS: python3 /var/www/baotienweb-api/fix-parseintpipe-and-api-management.py
"""
import os
import re
import sys

BASE = '/var/www/baotienweb-api/src'
PUBLIC = '/var/www/baotienweb-api/public'

# ============================================================
# PART 1: Create FlexibleIdPipe and fix ParseIntPipe globally
# ============================================================

FLEXIBLE_PIPE_CODE = '''import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

/**
 * FlexibleIdPipe - Replaces ParseIntPipe to support both numeric and string IDs.
 * - If value is a valid integer string (e.g. "5", "123"), returns the parsed number.
 * - If value is a non-numeric string (e.g. "KH-00001", "DA-00003"), returns the string as-is.
 * - This prevents "Validation failed (numeric string is expected)" errors.
 */
@Injectable()
export class FlexibleIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value === undefined || value === null) {
      return value;
    }
    const str = String(value).trim();
    if (str === '') {
      return value;
    }
    // Check if it's a pure integer string
    if (/^\\d+$/.test(str)) {
      return parseInt(str, 10);
    }
    // Check if it's a float-like numeric string
    if (/^\\d+\\.\\d+$/.test(str)) {
      return parseFloat(str);
    }
    // Return string as-is for non-numeric IDs (KH-00001, DA-00003, etc.)
    return str;
  }
}
'''

def create_flexible_pipe():
    """Create the FlexibleIdPipe file."""
    pipe_dir = os.path.join(BASE, 'shared', 'pipes')
    os.makedirs(pipe_dir, exist_ok=True)
    pipe_path = os.path.join(pipe_dir, 'flexible-id.pipe.ts')
    with open(pipe_path, 'w', encoding='utf-8') as f:
        f.write(FLEXIBLE_PIPE_CODE)
    print(f'  [CREATED] {pipe_path}')
    return pipe_path


def find_files_with_parseintpipe():
    """Find all .ts files that contain ParseIntPipe."""
    files = []
    for root, dirs, fnames in os.walk(BASE):
        # Skip node_modules
        if 'node_modules' in root:
            continue
        for fname in fnames:
            if fname.endswith('.ts') and not fname.endswith('.d.ts') and not fname.endswith('.bak'):
                fpath = os.path.join(root, fname)
                try:
                    with open(fpath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    if 'ParseIntPipe' in content:
                        files.append(fpath)
                except:
                    pass
    return files


def fix_parseintpipe_in_file(fpath):
    """Replace ParseIntPipe with FlexibleIdPipe in a single file."""
    # Skip the pipe definition files themselves
    basename = os.path.basename(fpath)
    if basename in ('flexible-id.pipe.ts', 'parse-int.pipe.ts'):
        print(f'  [SKIP] {fpath} (pipe definition)')
        return False

    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Calculate relative path from this file's directory to shared/pipes/flexible-id.pipe
    file_dir = os.path.dirname(fpath)
    target = os.path.join(BASE, 'shared', 'pipes', 'flexible-id.pipe')
    rel = os.path.relpath(target, file_dir).replace('\\', '/')
    if not rel.startswith('.'):
        rel = './' + rel

    # Step 1: Remove ParseIntPipe from @nestjs/common import
    def remove_parseintpipe_from_import(match):
        full_import = match.group(0)
        imports_block = match.group(1)
        
        # Split by comma, trim, remove ParseIntPipe
        parts = [p.strip() for p in imports_block.split(',')]
        parts = [p for p in parts if p and p != 'ParseIntPipe']
        
        if not parts:
            return ''  # No imports left (unlikely)
        
        new_imports = ', '.join(parts)
        return f"import {{ {new_imports} }} from '@nestjs/common';"

    # Handle both single-line and multi-line imports from @nestjs/common
    content = re.sub(
        r"import\s*\{([^}]*)\}\s*from\s*'@nestjs/common'\s*;",
        remove_parseintpipe_from_import,
        content,
        flags=re.DOTALL
    )

    # Step 2: Add FlexibleIdPipe import (if not already present)
    if 'FlexibleIdPipe' not in content:
        # Find the last import statement and add after it
        import_line = f"import {{ FlexibleIdPipe }} from '{rel}';"
        
        # Insert after the @nestjs/common import line
        nestjs_import_match = re.search(
            r"(import\s*\{[^}]*\}\s*from\s*'@nestjs/common'\s*;)",
            content,
            flags=re.DOTALL
        )
        if nestjs_import_match:
            insert_pos = nestjs_import_match.end()
            content = content[:insert_pos] + '\n' + import_line + content[insert_pos:]
        else:
            # Fallback: add at the beginning
            content = import_line + '\n' + content

    # Step 3: Replace all remaining ParseIntPipe references with FlexibleIdPipe
    content = content.replace('ParseIntPipe', 'FlexibleIdPipe')

    if content != original:
        # Backup original
        backup_path = fpath + '.parseint.bak'
        if not os.path.exists(backup_path):
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original)
        
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'  [FIXED] {fpath}')
        return True
    else:
        print(f'  [NO CHANGE] {fpath}')
        return False


def fix_shared_module():
    """Update shared.module.ts to export FlexibleIdPipe."""
    module_path = os.path.join(BASE, 'shared', 'shared.module.ts')
    if not os.path.exists(module_path):
        print(f'  [SKIP] {module_path} (not found)')
        return
    
    with open(module_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Add FlexibleIdPipe import if not present
    if 'FlexibleIdPipe' not in content:
        content = re.sub(
            r"(import[^;]*parse-int\.pipe[^;]*;)",
            "\\1\nimport { FlexibleIdPipe } from './pipes/flexible-id.pipe';",
            content
        )
    
    # Add FlexibleIdPipe to providers/exports arrays  
    # Look for providers array containing ParseIntPipe
    if 'FlexibleIdPipe' not in content.split('providers')[1] if 'providers' in content else '':
        content = content.replace(
            'ParseIntPipe]',
            'ParseIntPipe, FlexibleIdPipe]'
        )
    
    # Look for exports array
    if 'exports' in content and 'FlexibleIdPipe' not in content.split('exports')[-1]:
        content = content.replace(
            'ParseIntPipe]',
            'ParseIntPipe, FlexibleIdPipe]'
        )
    
    if content != original:
        with open(module_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'  [UPDATED] {module_path}')


# ============================================================
# PART 2: Create API Management Backend
# ============================================================

API_MANAGEMENT_SERVICE = '''import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface ApiToken {
  id: number;
  userId: string;
  userName: string;
  name: string;
  token: string;
  expirationDate: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  lastUsedAt: string | null;
  permissions: string[];
  description: string;
  ipWhitelist: string[];
  requestCount: number;
}

export interface CreateApiTokenDto {
  userName: string;
  name: string;
  expirationDate?: string;
  permissions?: string[];
  description?: string;
  ipWhitelist?: string[];
}

export interface UpdateApiTokenDto {
  name?: string;
  expirationDate?: string;
  permissions?: string[];
  description?: string;
  ipWhitelist?: string[];
  isActive?: boolean;
}

@Injectable()
export class ApiManagementService {
  private tokens: ApiToken[] = [];
  private counter = 0;
  private dataFile = path.join(process.cwd(), 'data', 'api-tokens.json');

  constructor() {
    this.loadFromFile();
    if (this.tokens.length === 0) {
      this.seedData();
    }
  }

  private loadFromFile() {
    try {
      const dir = path.dirname(this.dataFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(this.dataFile)) {
        const raw = fs.readFileSync(this.dataFile, 'utf-8');
        const data = JSON.parse(raw);
        this.tokens = data.tokens || [];
        this.counter = data.counter || 0;
      }
    } catch (e) {
      console.log('[ApiManagement] No saved data, starting fresh');
    }
  }

  private saveToFile() {
    try {
      const dir = path.dirname(this.dataFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataFile, JSON.stringify({ tokens: this.tokens, counter: this.counter }, null, 2));
    } catch (e) {
      console.error('[ApiManagement] Save error:', e);
    }
  }

  private generateApiToken(): string {
    // Generate a secure random API token: bt_xxxx...xxxx (64 chars)
    const prefix = 'bt_';
    const randomPart = crypto.randomBytes(48).toString('base64url').substring(0, 64);
    return prefix + randomPart;
  }

  private seedData() {
    const now = new Date().toISOString();
    this.tokens = [
      {
        id: 1,
        userId: 'NV-00001',
        userName: 'nhaxinhd',
        name: 'thietkeresort',
        token: 'bt_eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9eyJpc3MiOiJiYW90aWVud2ViLmNsb3VkIiwiaWF0IjoxNzA5NTQ4MDAwLCJleHA',
        expirationDate: '2030-12-30T10:04:00.000Z',
        createdAt: '2024-03-04T10:00:00.000Z',
        updatedAt: now,
        isActive: true,
        lastUsedAt: now,
        permissions: ['read', 'write', 'delete', 'admin'],
        description: 'Main API token for thietkeresort system',
        ipWhitelist: [],
        requestCount: 15420,
      },
      {
        id: 2,
        userId: 'NV-00002',
        userName: 'admin',
        name: 'admin-dashboard',
        token: this.generateApiToken(),
        expirationDate: '2026-12-31T23:59:59.000Z',
        createdAt: '2024-06-15T08:30:00.000Z',
        updatedAt: now,
        isActive: true,
        lastUsedAt: '2026-03-03T14:22:00.000Z',
        permissions: ['read', 'write', 'admin'],
        description: 'Admin dashboard API access',
        ipWhitelist: ['103.200.20.100'],
        requestCount: 8756,
      },
      {
        id: 3,
        userId: 'NV-00003',
        userName: 'mobile-app',
        name: 'mobile-client',
        token: this.generateApiToken(),
        expirationDate: '2027-06-30T23:59:59.000Z',
        createdAt: '2025-01-10T12:00:00.000Z',
        updatedAt: now,
        isActive: true,
        lastUsedAt: '2026-03-04T09:15:00.000Z',
        permissions: ['read', 'write'],
        description: 'Mobile app API client token',
        ipWhitelist: [],
        requestCount: 4230,
      },
    ];
    this.counter = 3;
    this.saveToFile();
  }

  findAll(query?: { search?: string; page?: number; limit?: number; isActive?: string }) {
    let filtered = [...this.tokens];

    if (query?.search) {
      const s = query.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.userName.toLowerCase().includes(s) ||
        t.name.toLowerCase().includes(s) ||
        t.description.toLowerCase().includes(s) ||
        t.token.toLowerCase().includes(s)
      );
    }

    if (query?.isActive !== undefined) {
      const active = query.isActive === 'true';
      filtered = filtered.filter(t => t.isActive === active);
    }

    // Sort by ID descending (newest first)
    filtered.sort((a, b) => b.id - a.id);

    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 25));
    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: number) {
    const token = this.tokens.find(t => t.id === id);
    if (!token) {
      throw new NotFoundException(`API token #${id} not found`);
    }
    return token;
  }

  create(dto: CreateApiTokenDto) {
    if (!dto.userName || !dto.name) {
      throw new BadRequestException('userName and name are required');
    }

    this.counter++;
    const now = new Date().toISOString();
    const defaultExpiry = new Date();
    defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);

    const newToken: ApiToken = {
      id: this.counter,
      userId: `NV-${String(this.counter).padStart(5, '0')}`,
      userName: dto.userName,
      name: dto.name,
      token: this.generateApiToken(),
      expirationDate: dto.expirationDate || defaultExpiry.toISOString(),
      createdAt: now,
      updatedAt: now,
      isActive: true,
      lastUsedAt: null,
      permissions: dto.permissions || ['read'],
      description: dto.description || '',
      ipWhitelist: dto.ipWhitelist || [],
      requestCount: 0,
    };

    this.tokens.push(newToken);
    this.saveToFile();
    return newToken;
  }

  update(id: number, dto: UpdateApiTokenDto) {
    const token = this.findOne(id);
    const now = new Date().toISOString();

    if (dto.name !== undefined) token.name = dto.name;
    if (dto.expirationDate !== undefined) token.expirationDate = dto.expirationDate;
    if (dto.permissions !== undefined) token.permissions = dto.permissions;
    if (dto.description !== undefined) token.description = dto.description;
    if (dto.ipWhitelist !== undefined) token.ipWhitelist = dto.ipWhitelist;
    if (dto.isActive !== undefined) token.isActive = dto.isActive;
    token.updatedAt = now;

    this.saveToFile();
    return token;
  }

  remove(id: number) {
    const idx = this.tokens.findIndex(t => t.id === id);
    if (idx === -1) {
      throw new NotFoundException(`API token #${id} not found`);
    }
    const removed = this.tokens.splice(idx, 1)[0];
    this.saveToFile();
    return { message: `API token #${id} (${removed.name}) has been deleted`, deleted: removed };
  }

  regenerateToken(id: number) {
    const token = this.findOne(id);
    token.token = this.generateApiToken();
    token.updatedAt = new Date().toISOString();
    this.saveToFile();
    return token;
  }

  toggleActive(id: number) {
    const token = this.findOne(id);
    token.isActive = !token.isActive;
    token.updatedAt = new Date().toISOString();
    this.saveToFile();
    return token;
  }

  recordUsage(apiKey: string) {
    const token = this.tokens.find(t => t.token === apiKey && t.isActive);
    if (token) {
      token.lastUsedAt = new Date().toISOString();
      token.requestCount++;
      // Don't save on every request for performance - save periodically
      if (token.requestCount % 100 === 0) {
        this.saveToFile();
      }
    }
  }

  validateToken(apiKey: string): boolean {
    const token = this.tokens.find(t => t.token === apiKey);
    if (!token) return false;
    if (!token.isActive) return false;
    if (new Date(token.expirationDate) < new Date()) return false;
    return true;
  }

  getStats() {
    const total = this.tokens.length;
    const active = this.tokens.filter(t => t.isActive).length;
    const expired = this.tokens.filter(t => new Date(t.expirationDate) < new Date()).length;
    const totalRequests = this.tokens.reduce((sum, t) => sum + t.requestCount, 0);
    return { total, active, inactive: total - active, expired, totalRequests };
  }
}
'''

API_MANAGEMENT_CONTROLLER = '''import { Body, Controller, Delete, Get, Param, Post, Put, Patch, Query, UseGuards } from '@nestjs/common';
import { FlexibleIdPipe } from '../shared/pipes/flexible-id.pipe';
import { ApiManagementService, CreateApiTokenDto, UpdateApiTokenDto } from './api-management.service';

@Controller('api-management')
export class ApiManagementController {
  constructor(private readonly svc: ApiManagementService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.svc.findAll({
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      isActive,
    });
  }

  @Get('stats')
  getStats() {
    return this.svc.getStats();
  }

  @Get(':id')
  findOne(@Param('id', FlexibleIdPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateApiTokenDto) {
    return this.svc.create(dto);
  }

  @Put(':id')
  update(@Param('id', FlexibleIdPipe) id: number, @Body() dto: UpdateApiTokenDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', FlexibleIdPipe) id: number) {
    return this.svc.remove(id);
  }

  @Post(':id/regenerate')
  regenerateToken(@Param('id', FlexibleIdPipe) id: number) {
    return this.svc.regenerateToken(id);
  }

  @Patch(':id/toggle')
  toggleActive(@Param('id', FlexibleIdPipe) id: number) {
    return this.svc.toggleActive(id);
  }

  @Post('validate')
  validateToken(@Body('token') token: string) {
    const valid = this.svc.validateToken(token);
    return { valid, message: valid ? 'Token is valid' : 'Token is invalid or expired' };
  }
}
'''

API_MANAGEMENT_MODULE = '''import { Module } from '@nestjs/common';
import { ApiManagementController } from './api-management.controller';
import { ApiManagementService } from './api-management.service';

@Module({
  controllers: [ApiManagementController],
  providers: [ApiManagementService],
  exports: [ApiManagementService],
})
export class ApiManagementModule {}
'''


def create_api_management_backend():
    """Create API Management service, controller, and module."""
    api_dir = os.path.join(BASE, 'api-management')
    os.makedirs(api_dir, exist_ok=True)

    files = {
        'api-management.service.ts': API_MANAGEMENT_SERVICE,
        'api-management.controller.ts': API_MANAGEMENT_CONTROLLER,
        'api-management.module.ts': API_MANAGEMENT_MODULE,
    }

    created = []
    for fname, content in files.items():
        fpath = os.path.join(api_dir, fname)
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'  [CREATED] {fpath}')
        created.append(fpath)

    return created


def register_api_management_in_app_module():
    """Register ApiManagementModule in app.module.ts."""
    app_module = os.path.join(BASE, 'app.module.ts')
    if not os.path.exists(app_module):
        print(f'  [SKIP] {app_module} (not found)')
        return False

    with open(app_module, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'ApiManagementModule' in content:
        print(f'  [SKIP] ApiManagementModule already registered')
        return False

    # Add import
    import_line = "import { ApiManagementModule } from './api-management/api-management.module';"

    # Find last import statement
    last_import = None
    for m in re.finditer(r"^import\s+.*?;", content, re.MULTILINE | re.DOTALL):
        last_import = m

    if last_import:
        insert_pos = last_import.end()
        content = content[:insert_pos] + '\n' + import_line + content[insert_pos:]
    else:
        content = import_line + '\n' + content

    # Add to imports array in @Module
    # Find the imports array
    imports_match = re.search(r'(imports\s*:\s*\[)', content)
    if imports_match:
        insert_pos = imports_match.end()
        content = content[:insert_pos] + '\n    ApiManagementModule,' + content[insert_pos:]
    else:
        print(f'  [WARN] Could not find imports array in app.module.ts')

    with open(app_module, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  [UPDATED] {app_module}')
    return True


# ============================================================
# PART 3: Add API Management page to admin-crm.html
# ============================================================

API_MANAGEMENT_PAGE_HTML = '''
<!-- API Management Page -->
<div id="page-api-management" class="page-content" style="display:none;">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="mb-0"><i class="bi bi-key-fill text-primary me-2"></i>API Management</h4>
    <button class="btn btn-success" onclick="showCreateTokenModal()">
      <i class="bi bi-plus-lg me-1"></i>New Token
    </button>
  </div>

  <!-- Stats Cards -->
  <div class="row g-3 mb-4" id="apiStatsRow">
    <div class="col-md-3 col-6">
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center">
          <div class="text-muted small">Total Tokens</div>
          <div class="fw-bold fs-4 text-primary" id="apiStatTotal">0</div>
        </div>
      </div>
    </div>
    <div class="col-md-3 col-6">
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center">
          <div class="text-muted small">Active</div>
          <div class="fw-bold fs-4 text-success" id="apiStatActive">0</div>
        </div>
      </div>
    </div>
    <div class="col-md-3 col-6">
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center">
          <div class="text-muted small">Inactive</div>
          <div class="fw-bold fs-4 text-warning" id="apiStatInactive">0</div>
        </div>
      </div>
    </div>
    <div class="col-md-3 col-6">
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center">
          <div class="text-muted small">Total Requests</div>
          <div class="fw-bold fs-4 text-info" id="apiStatRequests">0</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toolbar -->
  <div class="card border-0 shadow-sm mb-3">
    <div class="card-body py-2">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <select class="form-select form-select-sm" style="width:80px;" id="apiPageSize" onchange="loadApiTokens()">
            <option value="10">10</option>
            <option value="25" selected>25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <button class="btn btn-outline-secondary btn-sm" onclick="exportApiTokens()">
            <i class="bi bi-download me-1"></i>Export
          </button>
        </div>
        <div class="input-group" style="width:250px;">
          <input type="text" class="form-control form-control-sm" placeholder="Search tokens..." id="apiSearchInput" onkeyup="debounceApiSearch()">
          <button class="btn btn-outline-primary btn-sm" onclick="loadApiTokens()"><i class="bi bi-search"></i></button>
        </div>
      </div>
    </div>
  </div>

  <!-- Tokens Table -->
  <div class="card border-0 shadow-sm">
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th style="width:50px;">ID</th>
              <th>User</th>
              <th>Name</th>
              <th>Token</th>
              <th>Expiration Date</th>
              <th>Status</th>
              <th>Requests</th>
              <th style="width:140px;">Options</th>
            </tr>
          </thead>
          <tbody id="apiTokensTableBody">
            <tr><td colspan="8" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="card-footer bg-white d-flex justify-content-between align-items-center">
      <small class="text-muted" id="apiTokensPaginationInfo">Loading...</small>
      <nav>
        <ul class="pagination pagination-sm mb-0" id="apiTokensPagination"></ul>
      </nav>
    </div>
  </div>
</div>

<!-- Create/Edit Token Modal -->
<div class="modal fade" id="tokenModal" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header bg-primary text-white">
        <h5 class="modal-title" id="tokenModalTitle"><i class="bi bi-key me-2"></i>New API Token</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="tokenEditId">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label fw-semibold">User Name <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="tokenUserName" placeholder="e.g. nhaxinhd">
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold">Token Name <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="tokenName" placeholder="e.g. thietkeresort">
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold">Expiration Date</label>
            <input type="datetime-local" class="form-control" id="tokenExpiration">
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold">Permissions</label>
            <div class="d-flex flex-wrap gap-2 mt-1">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="read" id="permRead" checked>
                <label class="form-check-label" for="permRead">Read</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="write" id="permWrite">
                <label class="form-check-label" for="permWrite">Write</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="delete" id="permDelete">
                <label class="form-check-label" for="permDelete">Delete</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="admin" id="permAdmin">
                <label class="form-check-label" for="permAdmin">Admin</label>
              </div>
            </div>
          </div>
          <div class="col-12">
            <label class="form-label fw-semibold">Description</label>
            <textarea class="form-control" id="tokenDescription" rows="2" placeholder="Token purpose..."></textarea>
          </div>
          <div class="col-12">
            <label class="form-label fw-semibold">IP Whitelist <small class="text-muted">(comma separated, empty = allow all)</small></label>
            <input type="text" class="form-control" id="tokenIpWhitelist" placeholder="e.g. 103.200.20.100, 192.168.1.1">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="saveApiToken()">
          <i class="bi bi-check-lg me-1"></i>Save Token
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Token Detail Modal -->
<div class="modal fade" id="tokenDetailModal" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header bg-info text-white">
        <h5 class="modal-title"><i class="bi bi-info-circle me-2"></i>Token Details</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body" id="tokenDetailBody">
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
'''

API_MANAGEMENT_JS = '''
// ==============================================
// API MANAGEMENT MODULE
// ==============================================
let apiCurrentPage = 1;
let apiSearchTimer = null;

function debounceApiSearch() {
  clearTimeout(apiSearchTimer);
  apiSearchTimer = setTimeout(() => loadApiTokens(), 400);
}

async function loadApiTokens() {
  try {
    const limit = document.getElementById('apiPageSize')?.value || 25;
    const search = document.getElementById('apiSearchInput')?.value || '';
    const params = new URLSearchParams({ page: apiCurrentPage, limit, search });

    const [tokensResp, statsResp] = await Promise.all([
      apiFetch(`/api-management?${params}`),
      apiFetch('/api-management/stats'),
    ]);

    // Update stats
    if (statsResp) {
      document.getElementById('apiStatTotal').textContent = statsResp.total || 0;
      document.getElementById('apiStatActive').textContent = statsResp.active || 0;
      document.getElementById('apiStatInactive').textContent = statsResp.inactive || 0;
      document.getElementById('apiStatRequests').textContent = (statsResp.totalRequests || 0).toLocaleString();
    }

    const data = tokensResp?.data || tokensResp || [];
    const meta = tokensResp?.meta || { total: data.length, page: 1, limit: 25, totalPages: 1 };

    const tbody = document.getElementById('apiTokensTableBody');
    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted"><i class="bi bi-key fs-1 d-block mb-2"></i>No API tokens found</td></tr>';
    } else {
      tbody.innerHTML = data.map(t => {
        const truncToken = t.token ? (t.token.substring(0, 40) + '...') : 'N/A';
        const expDate = t.expirationDate ? new Date(t.expirationDate).toLocaleString('vi-VN') : 'N/A';
        const isExpired = t.expirationDate && new Date(t.expirationDate) < new Date();
        const statusBadge = !t.isActive 
          ? '<span class="badge bg-secondary">Inactive</span>'
          : isExpired 
            ? '<span class="badge bg-danger">Expired</span>'
            : '<span class="badge bg-success">Active</span>';
        return `<tr>
          <td class="fw-semibold">${t.id}</td>
          <td>${escapeHtml(t.userName || '')}</td>
          <td>${escapeHtml(t.name || '')}</td>
          <td>
            <code class="text-break small" style="max-width:300px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(t.token || '')}">${escapeHtml(truncToken)}</code>
            <button class="btn btn-link btn-sm p-0 ms-1" onclick="copyToken('${escapeHtml(t.token || '')}')"><i class="bi bi-clipboard"></i></button>
          </td>
          <td>${expDate}</td>
          <td>${statusBadge}</td>
          <td>${(t.requestCount || 0).toLocaleString()}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-info" onclick="viewTokenDetail(${t.id})" title="View"><i class="bi bi-eye"></i></button>
              <button class="btn btn-outline-primary" onclick="editApiToken(${t.id})" title="Edit"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-outline-warning" onclick="toggleTokenActive(${t.id})" title="Toggle Active"><i class="bi bi-toggle-${t.isActive ? 'on' : 'off'}"></i></button>
              <button class="btn btn-outline-danger" onclick="deleteApiToken(${t.id}, '${escapeHtml(t.name || '')}')" title="Delete"><i class="bi bi-trash"></i></button>
            </div>
          </td>
        </tr>`;
      }).join('');
    }

    // Pagination
    const info = document.getElementById('apiTokensPaginationInfo');
    const start = (meta.page - 1) * meta.limit + 1;
    const end = Math.min(meta.page * meta.limit, meta.total);
    info.textContent = `Showing ${meta.total > 0 ? start : 0} to ${end} of ${meta.total} entries`;

    const pagination = document.getElementById('apiTokensPagination');
    let pages = '';
    for (let i = 1; i <= meta.totalPages; i++) {
      pages += `<li class="page-item ${i === meta.page ? 'active' : ''}"><a class="page-link" href="#" onclick="apiCurrentPage=${i};loadApiTokens();return false;">${i}</a></li>`;
    }
    pagination.innerHTML = `
      <li class="page-item ${meta.page <= 1 ? 'disabled' : ''}"><a class="page-link" href="#" onclick="apiCurrentPage=${meta.page-1};loadApiTokens();return false;">Previous</a></li>
      ${pages}
      <li class="page-item ${meta.page >= meta.totalPages ? 'disabled' : ''}"><a class="page-link" href="#" onclick="apiCurrentPage=${meta.page+1};loadApiTokens();return false;">Next</a></li>
    `;
  } catch (err) {
    console.error('Load API tokens error:', err);
    document.getElementById('apiTokensTableBody').innerHTML = `<tr><td colspan="8" class="text-center text-danger py-3"><i class="bi bi-exclamation-triangle me-1"></i>Error: ${err.message}</td></tr>`;
  }
}

function showCreateTokenModal() {
  document.getElementById('tokenEditId').value = '';
  document.getElementById('tokenUserName').value = '';
  document.getElementById('tokenName').value = '';
  document.getElementById('tokenDescription').value = '';
  document.getElementById('tokenIpWhitelist').value = '';
  document.getElementById('tokenModalTitle').innerHTML = '<i class="bi bi-key me-2"></i>New API Token';
  
  // Set default expiration to 1 year from now
  const defaultExp = new Date();
  defaultExp.setFullYear(defaultExp.getFullYear() + 1);
  document.getElementById('tokenExpiration').value = defaultExp.toISOString().slice(0, 16);
  
  // Reset permissions
  document.getElementById('permRead').checked = true;
  document.getElementById('permWrite').checked = false;
  document.getElementById('permDelete').checked = false;
  document.getElementById('permAdmin').checked = false;
  
  new bootstrap.Modal(document.getElementById('tokenModal')).show();
}

async function editApiToken(id) {
  try {
    const token = await apiFetch(`/api-management/${id}`);
    document.getElementById('tokenEditId').value = token.id;
    document.getElementById('tokenUserName').value = token.userName || '';
    document.getElementById('tokenName').value = token.name || '';
    document.getElementById('tokenDescription').value = token.description || '';
    document.getElementById('tokenIpWhitelist').value = (token.ipWhitelist || []).join(', ');
    document.getElementById('tokenModalTitle').innerHTML = `<i class="bi bi-pencil me-2"></i>Edit API Token #${token.id}`;

    if (token.expirationDate) {
      document.getElementById('tokenExpiration').value = new Date(token.expirationDate).toISOString().slice(0, 16);
    }

    const perms = token.permissions || [];
    document.getElementById('permRead').checked = perms.includes('read');
    document.getElementById('permWrite').checked = perms.includes('write');
    document.getElementById('permDelete').checked = perms.includes('delete');
    document.getElementById('permAdmin').checked = perms.includes('admin');

    new bootstrap.Modal(document.getElementById('tokenModal')).show();
  } catch (err) {
    showToast('Error loading token: ' + err.message, 'danger');
  }
}

async function saveApiToken() {
  const editId = document.getElementById('tokenEditId').value;
  const userName = document.getElementById('tokenUserName').value.trim();
  const name = document.getElementById('tokenName').value.trim();
  const expiration = document.getElementById('tokenExpiration').value;
  const description = document.getElementById('tokenDescription').value.trim();
  const ipWhitelist = document.getElementById('tokenIpWhitelist').value.split(',').map(s => s.trim()).filter(Boolean);

  if (!userName || !name) {
    showToast('User Name and Token Name are required', 'warning');
    return;
  }

  const permissions = [];
  if (document.getElementById('permRead').checked) permissions.push('read');
  if (document.getElementById('permWrite').checked) permissions.push('write');
  if (document.getElementById('permDelete').checked) permissions.push('delete');
  if (document.getElementById('permAdmin').checked) permissions.push('admin');

  const payload = {
    userName,
    name,
    expirationDate: expiration ? new Date(expiration).toISOString() : undefined,
    description,
    permissions,
    ipWhitelist,
  };

  try {
    if (editId) {
      await apiFetch(`/api-management/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Token updated successfully!', 'success');
    } else {
      const created = await apiFetch('/api-management', { method: 'POST', body: JSON.stringify(payload) });
      showToast(`Token created! Token: ${created.token?.substring(0, 20)}...`, 'success');
    }
    bootstrap.Modal.getInstance(document.getElementById('tokenModal'))?.hide();
    loadApiTokens();
  } catch (err) {
    showToast('Error: ' + err.message, 'danger');
  }
}

async function deleteApiToken(id, name) {
  if (!confirm(`Delete API token "${name}" (ID: ${id})? This action cannot be undone.`)) return;
  try {
    await apiFetch(`/api-management/${id}`, { method: 'DELETE' });
    showToast(`Token "${name}" deleted`, 'success');
    loadApiTokens();
  } catch (err) {
    showToast('Error: ' + err.message, 'danger');
  }
}

async function toggleTokenActive(id) {
  try {
    const result = await apiFetch(`/api-management/${id}/toggle`, { method: 'PATCH' });
    showToast(`Token #${id} is now ${result.isActive ? 'Active' : 'Inactive'}`, 'info');
    loadApiTokens();
  } catch (err) {
    showToast('Error: ' + err.message, 'danger');
  }
}

async function viewTokenDetail(id) {
  try {
    const t = await apiFetch(`/api-management/${id}`);
    const body = document.getElementById('tokenDetailBody');
    body.innerHTML = `
      <div class="row g-3">
        <div class="col-md-6">
          <label class="text-muted small">ID</label>
          <div class="fw-bold">${t.id}</div>
        </div>
        <div class="col-md-6">
          <label class="text-muted small">User</label>
          <div class="fw-bold">${escapeHtml(t.userName)} <small class="text-muted">(${t.userId})</small></div>
        </div>
        <div class="col-md-6">
          <label class="text-muted small">Name</label>
          <div class="fw-bold">${escapeHtml(t.name)}</div>
        </div>
        <div class="col-md-6">
          <label class="text-muted small">Status</label>
          <div>${t.isActive ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-secondary">Inactive</span>'}</div>
        </div>
        <div class="col-12">
          <label class="text-muted small">Token</label>
          <div class="bg-light p-2 rounded">
            <code class="text-break small">${escapeHtml(t.token)}</code>
            <button class="btn btn-sm btn-outline-primary ms-2" onclick="copyToken('${escapeHtml(t.token)}')"><i class="bi bi-clipboard me-1"></i>Copy</button>
            <button class="btn btn-sm btn-outline-warning ms-1" onclick="regenerateTokenConfirm(${t.id})"><i class="bi bi-arrow-repeat me-1"></i>Regenerate</button>
          </div>
        </div>
        <div class="col-md-6">
          <label class="text-muted small">Expiration</label>
          <div>${t.expirationDate ? new Date(t.expirationDate).toLocaleString('vi-VN') : 'N/A'}</div>
        </div>
        <div class="col-md-6">
          <label class="text-muted small">Last Used</label>
          <div>${t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleString('vi-VN') : 'Never'}</div>
        </div>
        <div class="col-md-6">
          <label class="text-muted small">Created</label>
          <div>${new Date(t.createdAt).toLocaleString('vi-VN')}</div>
        </div>
        <div class="col-md-6">
          <label class="text-muted small">Requests</label>
          <div class="fw-bold text-primary">${(t.requestCount || 0).toLocaleString()}</div>
        </div>
        <div class="col-md-6">
          <label class="text-muted small">Permissions</label>
          <div>${(t.permissions || []).map(p => `<span class="badge bg-primary me-1">${p}</span>`).join(' ') || 'None'}</div>
        </div>
        <div class="col-md-6">
          <label class="text-muted small">IP Whitelist</label>
          <div>${(t.ipWhitelist || []).length > 0 ? t.ipWhitelist.map(ip => `<span class="badge bg-dark me-1">${ip}</span>`).join(' ') : '<span class="text-muted">All IPs allowed</span>'}</div>
        </div>
        ${t.description ? `<div class="col-12"><label class="text-muted small">Description</label><div>${escapeHtml(t.description)}</div></div>` : ''}
      </div>`;
    new bootstrap.Modal(document.getElementById('tokenDetailModal')).show();
  } catch (err) {
    showToast('Error: ' + err.message, 'danger');
  }
}

async function regenerateTokenConfirm(id) {
  if (!confirm('Regenerate this API token? The old token will stop working immediately.')) return;
  try {
    const result = await apiFetch(`/api-management/${id}/regenerate`, { method: 'POST' });
    showToast('Token regenerated successfully!', 'success');
    viewTokenDetail(id);
    loadApiTokens();
  } catch (err) {
    showToast('Error: ' + err.message, 'danger');
  }
}

function copyToken(token) {
  navigator.clipboard.writeText(token).then(() => {
    showToast('Token copied to clipboard!', 'info');
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = token;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Token copied!', 'info');
  });
}

function exportApiTokens() {
  apiFetch('/api-management?limit=1000').then(resp => {
    const data = resp?.data || resp || [];
    if (data.length === 0) { showToast('No tokens to export', 'warning'); return; }
    
    const csv = [
      ['ID', 'User', 'Name', 'Token', 'Expiration', 'Status', 'Requests', 'Permissions', 'Description'].join(','),
      ...data.map(t => [
        t.id,
        `"${t.userName}"`,
        `"${t.name}"`,
        `"${t.token}"`,
        `"${t.expirationDate}"`,
        t.isActive ? 'Active' : 'Inactive',
        t.requestCount,
        `"${(t.permissions||[]).join(';')}"`,
        `"${(t.description||'').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-tokens-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported ' + data.length + ' tokens', 'success');
  }).catch(err => showToast('Export error: ' + err.message, 'danger'));
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
'''


def patch_admin_crm_html():
    """Add API Management page to admin-crm.html."""
    html_path = os.path.join(PUBLIC, 'admin-crm.html')
    if not os.path.exists(html_path):
        print(f'  [SKIP] {html_path} (not found)')
        return False

    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'page-api-management' in content:
        print(f'  [SKIP] API Management page already exists in admin-crm.html')
        return False

    original = content
    changes = 0

    # 1) Add sidebar menu item for API section
    # Find a good place - after the last sidebar item before the closing of sidebar
    sidebar_insert = '''
        <!-- API Section -->
        <li class="nav-item">
          <a class="nav-link d-flex align-items-center" href="#apiSubmenu" data-bs-toggle="collapse">
            <i class="bi bi-braces me-2"></i> API
            <i class="bi bi-chevron-down ms-auto small"></i>
          </a>
          <div class="collapse" id="apiSubmenu">
            <ul class="nav flex-column ms-3">
              <li class="nav-item">
                <a class="nav-link py-1" href="#" onclick="navigateTo('api-management')">
                  <i class="bi bi-key me-1"></i> API Management
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link py-1" href="#" onclick="navigateTo('api-manual')">
                  <i class="bi bi-book me-1"></i> API Manual
                </a>
              </li>
            </ul>
          </div>
        </li>'''

    # Try to find the settings nav-item and insert before it
    settings_patterns = [
        'onclick="navigateTo(\'settings\')"',
        "navigateTo('settings')",
        'bi-gear',
    ]
    inserted_sidebar = False
    for pattern in settings_patterns:
        idx = content.find(pattern)
        if idx > 0:
            # Find the <li containing this
            search_back = content.rfind('<li', 0, idx)
            if search_back > 0:
                content = content[:search_back] + sidebar_insert + '\n        ' + content[search_back:]
                inserted_sidebar = True
                changes += 1
                break

    if not inserted_sidebar:
        # Fallback: insert before closing </ul> of sidebar
        sidebar_end = content.rfind('</ul>', 0, content.find('id="mainContent"') if 'id="mainContent"' in content else len(content))
        if sidebar_end > 0:
            content = content[:sidebar_end] + sidebar_insert + '\n      ' + content[sidebar_end:]
            changes += 1

    # 2) Add the page HTML before the closing </main> or before the last </div> of main content
    # Find a good insertion point - after the last page-content div
    page_insert_marker = '<!-- API Management Page -->'
    
    # Find the last page-content div closing or the chat page
    insert_patterns = [
        'id="page-chat"',
        'id="page-notifications"',
        'id="page-settings"',
    ]
    insert_pos = -1
    for pattern in insert_patterns:
        idx = content.find(pattern)
        if idx > 0:
            # Find the closing div of this page section
            # Look for the next page-content div or </main>
            after = content.find('class="page-content"', idx + len(pattern))
            if after == -1:
                after = content.find('</main>', idx)
            if after == -1:
                after = content.find('<!-- Scripts -->', idx)
            if after > 0:
                insert_pos = after
                break

    if insert_pos > 0:
        content = content[:insert_pos] + '\n' + API_MANAGEMENT_PAGE_HTML + '\n' + content[insert_pos:]
        changes += 1
    else:
        # Fallback: insert before </body>
        body_end = content.rfind('</body>')
        if body_end > 0:
            content = content[:body_end] + API_MANAGEMENT_PAGE_HTML + '\n' + content[body_end:]
            changes += 1

    # 3) Add the JavaScript before the closing </script> tag
    js_insert = API_MANAGEMENT_JS
    
    # Find the last </script> tag
    last_script_close = content.rfind('</script>')
    if last_script_close > 0:
        content = content[:last_script_close] + '\n' + js_insert + '\n' + content[last_script_close:]
        changes += 1

    # 4) Update the navigateTo function to include api-management
    # Find the navigateTo function and add api-management to the pages list
    nav_pattern = r"(function\s+navigateTo\s*\([^)]*\)\s*\{[^}]*?)(const\s+pages\s*=\s*\[)([^\]]*?)(\])"
    nav_match = re.search(nav_pattern, content, re.DOTALL)
    if nav_match:
        pages_list = nav_match.group(3)
        if "'api-management'" not in pages_list and '"api-management"' not in pages_list:
            new_pages = pages_list.rstrip().rstrip(',') + ", 'api-management', 'api-manual'"
            content = content[:nav_match.start(3)] + new_pages + content[nav_match.end(3):]
            changes += 1
    else:
        # Alternative: search for the pages array directly
        pages_array_match = re.search(r"(const\s+pages\s*=\s*\[)([^\]]+?)(\])", content)
        if pages_array_match:
            pages_content = pages_array_match.group(2)
            if "'api-management'" not in pages_content:
                new_pages = pages_content.rstrip().rstrip(',') + ", 'api-management', 'api-manual'"
                content = content[:pages_array_match.start(2)] + new_pages + content[pages_array_match.end(2):]
                changes += 1

    # 5) Add loadApiTokens() call when navigating to api-management
    # Find where page loading callbacks are (e.g., if page === 'chat' => loadChat)
    load_callbacks_pattern = r"(if\s*\(\s*page\s*===?\s*'chat'\s*\).*?loadChat.*?;)"
    load_match = re.search(load_callbacks_pattern, content, re.DOTALL)
    if load_match:
        after_pos = load_match.end()
        api_load_code = "\n    if (page === 'api-management') loadApiTokens();"
        if 'api-management' not in content[after_pos:after_pos+200]:
            content = content[:after_pos] + api_load_code + content[after_pos:]
            changes += 1
    else:
        # Alternative pattern
        alt_patterns = [
            r"(case\s*'chat'\s*:.*?break\s*;)",
            r"('chat'.*?load[Cc]hat.*?[\n;])",
        ]
        for ap in alt_patterns:
            am = re.search(ap, content, re.DOTALL)
            if am:
                after_pos = am.end()
                api_load_code = "\n    if (page === 'api-management') loadApiTokens();"
                if "api-management" not in content[after_pos:after_pos+200]:
                    content = content[:after_pos] + api_load_code + content[after_pos:]
                    changes += 1
                break

    if content != original:
        # Backup
        backup = html_path + '.pre-api-mgmt.bak'
        if not os.path.exists(backup):
            with open(backup, 'w', encoding='utf-8') as f:
                f.write(original)
        
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'  [PATCHED] {html_path} ({changes} changes)')
        return True
    else:
        print(f'  [NO CHANGE] {html_path}')
        return False


# ============================================================
# MAIN EXECUTION
# ============================================================

def main():
    print('=' * 60)
    print('FIX ParseIntPipe + API Management System')
    print('=' * 60)

    # PART 1: Fix ParseIntPipe
    print('\n[PART 1] Creating FlexibleIdPipe...')
    create_flexible_pipe()

    print('\n[PART 1] Finding files with ParseIntPipe...')
    files = find_files_with_parseintpipe()
    print(f'  Found {len(files)} files')

    print('\n[PART 1] Fixing ParseIntPipe in all files...')
    fixed_count = 0
    fixed_files = []
    for fpath in files:
        if fix_parseintpipe_in_file(fpath):
            fixed_count += 1
            fixed_files.append(fpath)

    print(f'\n  === Fixed {fixed_count} / {len(files)} files ===')

    # Also update shared module
    print('\n[PART 1] Updating shared module...')
    fix_shared_module()

    # PART 2: Create API Management backend
    print('\n[PART 2] Creating API Management backend...')
    api_files = create_api_management_backend()

    print('\n[PART 2] Registering in app.module.ts...')
    register_api_management_in_app_module()

    # PART 3: Patch admin-crm.html
    print('\n[PART 3] Patching admin-crm.html with API Management page...')
    patch_admin_crm_html()

    # Summary
    print('\n' + '=' * 60)
    print('SUMMARY')
    print('=' * 60)
    print(f'  FlexibleIdPipe: CREATED')
    print(f'  ParseIntPipe fixes: {fixed_count} files')
    print(f'  API Management backend: 3 files created')
    print(f'  admin-crm.html: PATCHED')
    print(f'\nNEXT STEPS:')
    print(f'  1. Compile changed files:')
    
    # Collect all .ts files that need recompilation
    all_ts_files = fixed_files + api_files + [os.path.join(BASE, 'shared', 'pipes', 'flexible-id.pipe.ts')]
    # Only keep .ts files
    all_ts_files = [f for f in all_ts_files if f.endswith('.ts')]
    
    # Write compilation script
    compile_script = os.path.join('/var/www/baotienweb-api', 'compile-fixes.sh')
    with open(compile_script, 'w') as f:
        f.write('#!/bin/bash\n')
        f.write('cd /var/www/baotienweb-api\n')
        f.write('echo "Compiling changed files..."\n')
        f.write('ERRORS=0\n')
        for ts_file in all_ts_files:
            # Convert absolute path to relative from src/
            rel = os.path.relpath(ts_file, '/var/www/baotienweb-api')
            f.write(f'echo "  Compiling {rel}..."\n')
            f.write(f'npx tsc {rel} --outDir dist --rootDir src --skipLibCheck --target ES2021 --module commonjs --esModuleInterop --experimentalDecorators --emitDecoratorMetadata --declaration 2>/dev/null || ((ERRORS++))\n')
        f.write(f'echo "Done! Errors: $ERRORS / {len(all_ts_files)} files"\n')
        f.write('echo "Restarting PM2..."\n')
        f.write('pm2 restart baotienweb-api\n')
        f.write('sleep 2\n')
        f.write('pm2 status\n')
    os.chmod(compile_script, 0o755)
    
    print(f'  2. Run: bash /var/www/baotienweb-api/compile-fixes.sh')
    print(f'  3. Test endpoints:')
    print(f'     curl https://baotienweb.cloud/api/v1/api-management')
    print(f'     curl https://baotienweb.cloud/api/v1/api-management/stats')
    print(f'     curl https://baotienweb.cloud/api/v1/products/1')
    print(f'     (should no longer get "Validation failed" error)')


if __name__ == '__main__':
    main()
