# 🔍 Test All Backend Endpoints
# Script kiểm tra tất cả endpoints backend API

$API_BASE = "https://baotienweb.cloud/api/v1"
$API_KEY = "baotienweb-api-key-2025"

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     BACKEND API COMPREHENSIVE ENDPOINT TEST        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Base URL: $API_BASE" -ForegroundColor Yellow
Write-Host "Testing at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# Counters
$totalTests = 0
$passedTests = 0
$failedTests = 0

function Test-Endpoint {
    param(
        [string]$Method = "GET",
        [string]$Path,
        [string]$Description
    )
    
    $script:totalTests++
    $url = "$API_BASE$Path"
    
    Write-Host "[$script:totalTests] $Description" -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method $Method -UseBasicParsing -ErrorAction Stop
        Write-Host " ✅ $($response.StatusCode)" -ForegroundColor Green
        $script:passedTests++
    }
    catch {
        $status = 0
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
        }
        
        if ($status -eq 404) {
            Write-Host " ❌ 404" -ForegroundColor Red
            $script:failedTests++
        }
        elseif ($status -eq 401 -or $status -eq 403) {
            Write-Host " 🔒 $status" -ForegroundColor Yellow
            $script:passedTests++
        }
        elseif ($status -eq 400) {
            Write-Host " ⚠️ 400" -ForegroundColor Yellow
            $script:passedTests++
        }
        else {
            Write-Host " ❌ Error" -ForegroundColor Red
            $script:failedTests++
        }
    }
}

# ═══════════════════════════════════════════════════════
# 1️⃣ CORE SYSTEM ENDPOINTS
# ═══════════════════════════════════════════════════════
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "1️⃣  CORE SYSTEM ENDPOINTS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Test-Endpoint -Path "/" -Description "API Root"
Test-Endpoint -Path "/health" -Description "Health Check"

# ═══════════════════════════════════════════════════════
# 2️⃣ AUTHENTICATION ENDPOINTS
# ═══════════════════════════════════════════════════════
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "2️⃣  AUTHENTICATION ENDPOINTS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Test-Endpoint -Method "POST" -Path "/auth/register" -Description "Register"
Test-Endpoint -Method "POST" -Path "/auth/login" -Description "Login"
Test-Endpoint -Method "POST" -Path "/auth/refresh" -Description "Refresh Token"
Test-Endpoint -Path "/auth/profile" -Description "Get Profile"
Test-Endpoint -Method "POST" -Path "/auth/logout" -Description "Logout"
Test-Endpoint -Method "POST" -Path "/auth/social" -Description "Social Login"

# ═══════════════════════════════════════════════════════
# 3️⃣ PROJECTS ENDPOINTS
# ═══════════════════════════════════════════════════════
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "3️⃣  PROJECTS ENDPOINTS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Test-Endpoint -Path "/projects" -Description "List Projects"
Test-Endpoint -Path "/projects/1" -Description "Get Project by ID"
Test-Endpoint -Method "POST" -Path "/projects" -Description "Create Project"
Test-Endpoint -Method "PATCH" -Path "/projects/1" -Description "Update Project"
Test-Endpoint -Method "DELETE" -Path "/projects/1" -Description "Delete Project"

# ═══════════════════════════════════════════════════════
# 4️⃣ TIMELINE ENDPOINTS
# ═══════════════════════════════════════════════════════
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "4️⃣  TIMELINE ENDPOINTS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Test-Endpoint -Path "/timeline" -Description "List Timelines"
Test-Endpoint -Path "/timeline/1" -Description "Get Timeline by Project"
Test-Endpoint -Method "POST" -Path "/timeline/1/milestone" -Description "Create Milestone"
Test-Endpoint -Method "PATCH" -Path "/timeline/milestone/1" -Description "Update Milestone"

# ═══════════════════════════════════════════════════════
# 5️⃣ TASKS ENDPOINTS
# ═══════════════════════════════════════════════════════
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "5️⃣  TASKS ENDPOINTS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Test-Endpoint -Path "/tasks" -Description "List Tasks"
Test-Endpoint -Path "/tasks/1" -Description "Get Task by ID"
Test-Endpoint -Path "/tasks/project/1" -Description "Get Tasks by Project"
Test-Endpoint -Method "POST" -Path "/tasks" -Description "Create Task"
Test-Endpoint -Method "PATCH" -Path "/tasks/1" -Description "Update Task"

# ═══════════════════════════════════════════════════════
# 6️⃣ PRODUCTS ENDPOINTS
# ═══════════════════════════════════════════════════════
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "6️⃣  PRODUCTS ENDPOINTS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Test-Endpoint -Path "/products" -Description "List Products"
Test-Endpoint -Path "/products/1" -Description "Get Product by ID"
Test-Endpoint -Path "/products/categories" -Description "List Categories"
Test-Endpoint -Path "/products/search?q=cement" -Description "Search Products"
Test-Endpoint -Method "POST" -Path "/products" -Description "Create Product"

# ═══════════════════════════════════════════════════════
# 7️⃣ PAYMENT ENDPOINTS
# ═══════════════════════════════════════════════════════
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "7️⃣  PAYMENT ENDPOINTS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Test-Endpoint -Path "/payment/invoices" -Description "List Invoices"
Test-Endpoint -Path "/payment/invoices/1" -Description "Get Invoice by ID"
Test-Endpoint -Path "/payment/statistics" -Description "Payment Statistics"
Test-Endpoint -Path "/payment/aging-report" -Description "Aging Report"
Test-Endpoint -Method "POST" -Path "/payment/invoices" -Description "Create Invoice"

# ═══════════════════════════════════════════════════════
# 8️⃣ NOTIFICATIONS ENDPOINTS
# ═══════════════════════════════════════════════════════
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "8️⃣  NOTIFICATIONS ENDPOINTS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Test-Endpoint -Path "/notifications" -Description "List Notifications"
Test-Endpoint -Method "PATCH" -Path "/notifications/1/read" -Description "Mark as Read"
Test-Endpoint -Method "POST" -Path "/notifications/mark-all-read" -Description "Mark All as Read"

# ═══════════════════════════════════════════════════════
# 9️⃣ CHAT/MESSAGES ENDPOINTS
# ═══════════════════════════════════════════════════════
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "9️⃣  CHAT/MESSAGES ENDPOINTS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Test-Endpoint -Path "/messages" -Description "List Messages"
Test-Endpoint -Path "/messages/conversations" -Description "List Conversations"
Test-Endpoint -Path "/chat/rooms" -Description "List Chat Rooms"
Test-Endpoint -Method "POST" -Path "/messages" -Description "Send Message"

# ═══════════════════════════════════════════════════════
# 🔟 VIDEO/CALL ENDPOINTS
# ═══════════════════════════════════════════════════════
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔟 VIDEO/CALL ENDPOINTS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Test-Endpoint -Path "/video/rooms" -Description "List Video Rooms"
Test-Endpoint -Method "POST" -Path "/video/call/initiate" -Description "Initiate Call"
Test-Endpoint -Path "/video/token" -Description "Get Video Token"

# ═══════════════════════════════════════════════════════
# 1️⃣1️⃣ USERS ENDPOINTS
# ═══════════════════════════════════════════════════════
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "1️⃣1️⃣ USERS ENDPOINTS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Test-Endpoint -Path "/users" -Description "List Users"
Test-Endpoint -Path "/users/1" -Description "Get User by ID"
Test-Endpoint -Method "PATCH" -Path "/users/1" -Description "Update User"

# ═══════════════════════════════════════════════════════
# 1️⃣2️⃣ CONSTRUCTION MAP ENDPOINTS
# ═══════════════════════════════════════════════════════
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "1️⃣2️⃣ CONSTRUCTION MAP ENDPOINTS (Local Module)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Test-Endpoint -Path "/construction-map/health" -Description "Construction Map Health"
Test-Endpoint -Path "/construction-map/1" -Description "Get Project Map"
Test-Endpoint -Path "/construction-map/1/tasks" -Description "Get Map Tasks"

# ═══════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
$successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if($successRate -ge 70) { "Green" } elseif($successRate -ge 50) { "Yellow" } else { "Red" })
Write-Host ""

if ($failedTests -gt 0) {
    Write-Host "⚠️  Some endpoints are not available or returned errors." -ForegroundColor Yellow
    Write-Host "This could mean:" -ForegroundColor Gray
    Write-Host "  - Endpoints don't exist on this backend" -ForegroundColor Gray
    Write-Host "  - Authentication required (401/403 errors counted as 'working')" -ForegroundColor Gray
    Write-Host "  - Network issues" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. SSH into server: ssh root@103.200.20.100" -ForegroundColor White
    Write-Host "  2. Check actual structure: cd /root/baotienweb-api && ls -la src/" -ForegroundColor White
    Write-Host "  3. Review controller files: find src/ -name '*.controller.ts'" -ForegroundColor White
} else {
    Write-Host "✅ All tests completed successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Backend Status: $(if($successRate -ge 70) { '✅ HEALTHY' } elseif($successRate -ge 50) { '⚠️  PARTIAL' } else { '❌ ISSUES' })" -ForegroundColor $(if($successRate -ge 70) { "Green" } elseif($successRate -ge 50) { "Yellow" } else { "Red" })
Write-Host "API Base URL: $API_BASE" -ForegroundColor Gray
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""
