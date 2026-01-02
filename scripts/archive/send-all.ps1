# Auto send all notification types
param(
    [string]$Email,
    [string]$Password
)

Write-Host "=== SEND ALL NOTIFICATIONS ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://baotienweb.cloud/api/v1"

# Get credentials if not provided
if (-not $Email) {
    $Email = "admin@nhaxinhdesign.com"
}
if (-not $Password) {
    $Password = "Admin123456!"
}

Write-Host "Logging in as $Email..." -ForegroundColor Yellow

$loginData = @{
    email = $Email
    password = $Password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod `
        -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData
    
    Write-Host "  Login OK!" -ForegroundColor Green
    $token = $loginResponse.accessToken
    
} catch {
    Write-Host "  Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Define notifications with correct enum types
$notifs = @(
    @{
        name = "1. Message"
        data = @{
            type = "MESSAGE"
            title = "New message from Nguyen Van A"
            body = "Chao ban! Du an cua chung ta tien trien the nao roi?"
            priority = "HIGH"
            metadata = '{"category":"message","senderName":"Nguyen Van A","messageType":"chat","senderAvatar":"https://i.pravatar.cc/150?img=12"}'
        }
    },
    @{
        name = "2. Task Assigned"
        data = @{
            type = "TASK_ASSIGNED"
            title = "New task assigned to you"
            body = "Complete electrical inspection by Friday"
            priority = "HIGH"
            metadata = '{"category":"task","taskId":"123","assignedBy":"Project Manager"}'
        }
    },
    @{
        name = "3. System"
        data = @{
            type = "SYSTEM"
            title = "System maintenance"
            body = "System will be under maintenance at 2:00 AM"
            priority = "MEDIUM"
            metadata = '{"category":"system","systemType":"maintenance"}'
        }
    },
    @{
        name = "4. Project Update"
        data = @{
            type = "PROJECT_UPDATE"
            title = "Project milestone completed"
            body = "Foundation work has been completed successfully"
            priority = "HIGH"
            metadata = '{"category":"project","projectId":"456","milestone":"foundation"}'
        }
    },
    @{
        name = "5. Payment"
        data = @{
            type = "PAYMENT"
            title = "Payment due soon"
            body = "Invoice #INV-2025-001 is due in 3 days"
            priority = "HIGH"
            metadata = '{"category":"payment","invoiceId":"INV-2025-001","amount":"50000000","dueDate":"2025-12-06"}'
        }
    }
)

Write-Host ""
Write-Host "Sending 5 notifications..." -ForegroundColor Yellow
Write-Host ""

$success = 0
$failed = 0

foreach ($notif in $notifs) {
    Write-Host "Sending: $($notif.name)..." -ForegroundColor Cyan
    
    $json = $notif.data | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod `
            -Uri "$baseUrl/notifications" `
            -Method POST `
            -Headers $headers `
            -Body $json
        
        Write-Host "  OK - ID: $($response.id)" -ForegroundColor Green
        $success++
        
    } catch {
        Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
    
    if ($notif -ne $notifs[-1]) {
        Start-Sleep -Seconds 1
    }
}

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Cyan
Write-Host "Success: $success | Failed: $failed" -ForegroundColor White
Write-Host ""
Write-Host "Check app notifications tab now!" -ForegroundColor Green
