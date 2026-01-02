# SSH Direct API Test - Execute API tests directly on server
# Usage: .\ssh-api-test.ps1 [-Role admin|engineer|client]

param(
    [string]$Role = "admin",
    [string]$Server = "103.200.20.100",
    [string]$User = "root"
)

Write-Host "🚀 SSH Direct API Test" -ForegroundColor Blue
Write-Host "=======================" -ForegroundColor Blue
Write-Host ""
Write-Host "Server: $Server" -ForegroundColor Cyan
Write-Host "User: $User" -ForegroundColor Cyan
Write-Host "Role: $Role" -ForegroundColor Cyan
Write-Host ""

# Test accounts
$Accounts = @{
    admin = @{
        Email = "admin@baotien.vn"
        Password = "admin123"
    }
    engineer = @{
        Email = "engineer@baotien.vn"
        Password = "engineer123"
    }
    client = @{
        Email = "client@baotien.vn"
        Password = "client123"
    }
}

$Account = $Accounts[$Role]
$Email = $Account.Email
$Password = $Account.Password

Write-Host "Testing with account: $Email" -ForegroundColor Yellow
Write-Host ""

# Create temporary test script on server
$testScript = @"
#!/bin/bash
API_BASE="http://localhost:3000"
API_PREFIX="/api/v1"
API_KEY="baotienweb-api-key-2025"
EMAIL="$Email"
PASSWORD="$Password"
ROLE="$Role"

echo "================================================"
echo "🧪 API Direct Test on Server"
echo "================================================"
echo ""

# Test 1: Health Check
echo "1️⃣ Health Check"
echo "GET \${API_BASE}/health"
HEALTH=\$(curl -s "\${API_BASE}/health")
echo "Response: \$HEALTH"
if [[ \$HEALTH == *"healthy"* ]] || [[ \$HEALTH == *"ok"* ]]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
fi
echo ""

# Test 2: Login
echo "2️⃣ Login (\$ROLE)"
echo "POST \${API_PREFIX}/auth/login"
LOGIN_RESPONSE=\$(curl -s -X POST "\${API_BASE}\${API_PREFIX}/auth/login" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: \${API_KEY}" \
    -d "{\"email\":\"\${EMAIL}\",\"password\":\"\${PASSWORD}\"}")

echo "Response: \$LOGIN_RESPONSE"

# Extract token using grep and sed
TOKEN=\$(echo "\$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -n "\$TOKEN" ]; then
    echo "✅ Login successful"
    echo "Token: \${TOKEN:0:30}..."
else
    echo "❌ Login failed - No token"
    exit 1
fi
echo ""

# Test 3: Get Current User
echo "3️⃣ Get Current User"
echo "GET \${API_PREFIX}/auth/me"
ME_RESPONSE=\$(curl -s -X GET "\${API_BASE}\${API_PREFIX}/auth/me" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: \${API_KEY}" \
    -H "Authorization: Bearer \${TOKEN}")

echo "Response: \$ME_RESPONSE"
if [[ \$ME_RESPONSE == *"email"* ]]; then
    echo "✅ Get user successful"
else
    echo "❌ Get user failed"
fi
echo ""

# Test 4: List Projects
echo "4️⃣ List Projects"
echo "GET \${API_PREFIX}/projects?page=1&limit=5"
PROJECTS_RESPONSE=\$(curl -s -X GET "\${API_BASE}\${API_PREFIX}/projects?page=1&limit=5" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: \${API_KEY}" \
    -H "Authorization: Bearer \${TOKEN}")

echo "Response: \$PROJECTS_RESPONSE"
if [[ \$PROJECTS_RESPONSE == *"data"* ]] || [[ \$PROJECTS_RESPONSE == *"projects"* ]]; then
    echo "✅ List projects successful"
else
    echo "❌ List projects failed"
fi
echo ""

# Test 5: Get Dashboard
echo "5️⃣ Get Dashboard (\$ROLE)"
echo "GET \${API_PREFIX}/dashboard/\${ROLE}"
DASHBOARD_RESPONSE=\$(curl -s -X GET "\${API_BASE}\${API_PREFIX}/dashboard/\${ROLE}" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: \${API_KEY}" \
    -H "Authorization: Bearer \${TOKEN}")

echo "Response: \$DASHBOARD_RESPONSE"
if [[ \$DASHBOARD_RESPONSE == *"stats"* ]] || [[ \$DASHBOARD_RESPONSE == *"total"* ]]; then
    echo "✅ Get dashboard successful"
else
    echo "❌ Get dashboard failed"
fi
echo ""

# Test 6: List Users (Admin only)
if [ "\$ROLE" = "admin" ]; then
    echo "6️⃣ List Users (Admin)"
    echo "GET \${API_PREFIX}/users?page=1&limit=5"
    USERS_RESPONSE=\$(curl -s -X GET "\${API_BASE}\${API_PREFIX}/users?page=1&limit=5" \
        -H "Content-Type: application/json" \
        -H "X-API-Key: \${API_KEY}" \
        -H "Authorization: Bearer \${TOKEN}")
    
    echo "Response: \$USERS_RESPONSE"
    if [[ \$USERS_RESPONSE == *"data"* ]]; then
        echo "✅ List users successful"
    else
        echo "❌ List users failed"
    fi
    echo ""
fi

# Test 7: List Tasks
echo "7️⃣ List Tasks"
echo "GET \${API_PREFIX}/tasks?page=1&limit=5"
TASKS_RESPONSE=\$(curl -s -X GET "\${API_BASE}\${API_PREFIX}/tasks?page=1&limit=5" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: \${API_KEY}" \
    -H "Authorization: Bearer \${TOKEN}")

echo "Response: \$TASKS_RESPONSE"
if [[ \$TASKS_RESPONSE == *"data"* ]] || [[ \$TASKS_RESPONSE == *"tasks"* ]]; then
    echo "✅ List tasks successful"
else
    echo "❌ List tasks failed"
fi
echo ""

# Summary
echo "================================================"
echo "🎉 API Test Complete!"
echo "================================================"
echo ""
echo "Access Token (valid for testing):"
echo "\$TOKEN"
echo ""
"@

# Save script to temp file
$tempScript = [System.IO.Path]::GetTempFileName()
$testScript | Out-File -FilePath $tempScript -Encoding UTF8

Write-Host "Executing tests on server..." -ForegroundColor Yellow
Write-Host ""

# Execute via SSH
try {
    Write-Host "Connecting to ${User}@${Server}..." -ForegroundColor Cyan
    Write-Host ""
    
    # Read script content and execute via SSH
    $scriptContent = Get-Content -Path $tempScript -Raw
    $sshCommand = "bash -c `"$($scriptContent -replace '"', '\"')`""
    
    # Run SSH command using pipe
    $scriptContent | ssh "${User}@${Server}" "bash -s"
    
    Write-Host ""
    Write-Host "✅ SSH test completed!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ SSH test failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "1. SSH client is installed (OpenSSH)" -ForegroundColor Yellow
    Write-Host "2. You have access to ${Server}" -ForegroundColor Yellow
    Write-Host "3. Backend is running on port 3000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual SSH command:" -ForegroundColor Cyan
    Write-Host "ssh ${User}@${Server}" -ForegroundColor White
    
} finally {
    # Clean up temp file
    Remove-Item -Path $tempScript -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Tip: You can also SSH directly and run commands manually:" -ForegroundColor Cyan
Write-Host "  ssh ${User}@${Server}" -ForegroundColor White
Write-Host "  curl http://localhost:3000/health" -ForegroundColor White
Write-Host "  curl http://localhost:3000/api/v1/auth/login -X POST -H 'Content-Type: application/json' -d '{\"email\":\"$Email\",\"password\":\"$Password\"}'" -ForegroundColor White
