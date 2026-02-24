<#
.SYNOPSIS
    Quick test backend OAuth endpoint
    
.DESCRIPTION
    Script để test backend /auth/google endpoint
#>

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Backend OAuth Endpoint Test" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "https://baotienweb.cloud/api/auth/google"

Write-Host "🔍 Testing endpoint: $backendUrl" -ForegroundColor Yellow
Write-Host ""

# Test 1: Check if endpoint exists
Write-Host "Test 1: Checking endpoint availability..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $backendUrl -Method POST `
        -ContentType "application/json" `
        -Body '{"token":"test"}' `
        -ErrorAction Stop
    
    Write-Host "✅ Endpoint exists and responds" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400 -or $statusCode -eq 401) {
        Write-Host "✅ Endpoint exists (returns $statusCode for test token)" -ForegroundColor Green
    } else {
        Write-Host "❌ Endpoint error: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Test 2: Checking CORS headers..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $backendUrl -Method OPTIONS `
        -Headers @{
            "Origin" = "http://localhost:8081"
            "Access-Control-Request-Method" = "POST"
        } `
        -ErrorAction SilentlyContinue
    
    if ($response.Headers["Access-Control-Allow-Origin"]) {
        Write-Host "✅ CORS configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  CORS headers not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not check CORS (may still work)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Backend Checklist" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend should have:" -ForegroundColor Yellow
Write-Host "  [ ] POST /auth/google endpoint" -ForegroundColor White
Write-Host "  [ ] Accepts: { token, email, name, picture }" -ForegroundColor White
Write-Host "  [ ] Validates Google token with Google API" -ForegroundColor White
Write-Host "  [ ] Returns: { accessToken, refreshToken, user }" -ForegroundColor White
Write-Host "  [ ] Creates user if not exists" -ForegroundColor White
Write-Host "  [ ] CORS enabled for localhost (dev)" -ForegroundColor White
Write-Host "  [ ] Google Client Secret configured" -ForegroundColor White
Write-Host ""
Write-Host "To implement backend (NestJS example):" -ForegroundColor Yellow
Write-Host @"

@Post('google')
async googleAuth(@Body() body: { token: string; email: string; name?: string; picture?: string }) {
  // 1. Verify token with Google API
  const ticket = await this.googleClient.verifyIdToken({
    idToken: body.token,
    audience: GOOGLE_CLIENT_ID
  });
  
  // 2. Get user info
  const payload = ticket.getPayload();
  
  // 3. Find or create user
  let user = await this.userService.findByEmail(body.email);
  if (!user) {
    user = await this.userService.create({
      email: body.email,
      name: body.name,
      avatar: body.picture,
      provider: 'google'
    });
  }
  
  // 4. Generate JWT
  const accessToken = this.jwtService.sign({ userId: user.id });
  const refreshToken = this.generateRefreshToken(user.id);
  
  // 5. Return tokens
  return {
    accessToken,
    refreshToken,
    user
  };
}

"@ -ForegroundColor Gray

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
