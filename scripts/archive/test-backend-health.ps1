# Quick Backend Health Check
# Purpose: Test if backend is running and responding

Write-Host "Testing Backend Health..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 5
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running!" -ForegroundColor Green
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Content: $($response.Content)" -ForegroundColor White
        
        # Test API docs
        try {
            $apiDocs = Invoke-WebRequest -Uri "http://localhost:3000/api" -Method GET -TimeoutSec 3
            Write-Host "✅ API Docs available at: http://localhost:3000/api" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  API Docs endpoint not available" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "⚠️  Backend responded with status: $($response.StatusCode)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Backend is NOT running" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "" -ForegroundColor White
    Write-Host "To start backend, run:" -ForegroundColor Cyan
    Write-Host "  .\start-backend-local.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "" -ForegroundColor White
Write-Host "Quick API Tests:" -ForegroundColor Cyan
Write-Host "  Auth: http://localhost:3000/auth/login" -ForegroundColor White
Write-Host "  Products: http://localhost:3000/products" -ForegroundColor White
Write-Host "  Projects: http://localhost:3000/projects" -ForegroundColor White
