param(
  [string]$BaseUrl = "http://127.0.0.1:4001",
  [string]$ApiPrefix = "/api",
  [int]$TimeoutSec = 10
)

Write-Host "Testing Thiet Ke Resort Auth System..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "BaseUrl: $BaseUrl" -ForegroundColor Cyan
Write-Host "ApiPrefix: $ApiPrefix" -ForegroundColor Cyan
Write-Host ""

function Join-Url([string]$base, [string]$path) {
  if ($path -match '^https?://') { return $path }
  $b = $base.TrimEnd('/')
  $p = if ($path.StartsWith('/')) { $path } else { "/$path" }
  return "$b$p"
}

function Get-ApiUrl([string]$path) {
  $p = if ($path.StartsWith('/')) { $path } else { "/$path" }
  if ($ApiPrefix -and -not $p.StartsWith($ApiPrefix + '/')) {
    $p = "$ApiPrefix$p"
  }
  return (Join-Url $BaseUrl $p)
}

function Invoke-Api {
  param(
    [Parameter(Mandatory=$true)][ValidateSet('GET','POST','PUT','PATCH','DELETE')][string]$Method,
    [Parameter(Mandatory=$true)][string]$Path,
    [object]$Body = $null,
    [hashtable]$Headers = $null,
    [switch]$TryNoPrefixFallback
  )
  $url = Get-ApiUrl $Path
  $jsonBody = $null
  if ($Body -ne $null) { $jsonBody = ($Body | ConvertTo-Json -Depth 8) }
  try {
    $params = @{ Uri = $url; Method = $Method; TimeoutSec = $TimeoutSec }
    if ($Headers) { $params['Headers'] = $Headers }
    if ($jsonBody) { $params['ContentType'] = 'application/json'; $params['Body'] = $jsonBody }
    return Invoke-RestMethod @params
  } catch {
    # On 404/405 and TryNoPrefixFallback, retry without prefix once
    if ($TryNoPrefixFallback) {
      $status = $_.Exception.Response.StatusCode.Value__
      if ($status -eq 404 -or $status -eq 405) {
        $noPrefixPath = if ($Path.StartsWith('/')) { $Path.Substring(1) } else { $Path }
        $url2 = Join-Url $BaseUrl "/$noPrefixPath"
        try {
          $params2 = @{ Uri = $url2; Method = $Method; TimeoutSec = $TimeoutSec }
          if ($Headers) { $params2['Headers'] = $Headers }
          if ($jsonBody) { $params2['ContentType'] = 'application/json'; $params2['Body'] = $jsonBody }
          return Invoke-RestMethod @params2
        } catch {
          throw $_
        }
      }
    }
    throw $_
  }
}

# 0) Health check
Write-Host "0. Health check:" -ForegroundColor Blue
try {
  $health = Invoke-Api -Method GET -Path '/health' -TryNoPrefixFallback
  $health | ConvertTo-Json -Depth 6
} catch {
  Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# 1) Roles (optional)
Write-Host "1. Getting available roles:" -ForegroundColor Blue
try {
  $roles = Invoke-Api -Method GET -Path '/auth/roles' -TryNoPrefixFallback
  $roles | ConvertTo-Json -Depth 6
} catch {
  Write-Host "Roles endpoint unavailable (skipping): $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Accounts
$clientEmail = "client@thietkeresort.com"
$contractorEmail = "contractor@thietkeresort.com"
$companyEmail = "company@thietkeresort.com"
$architectEmail = "architect@thietkeresort.com"
$pwd = "password123"

# 2) Existence pre-checks
Write-Host "2. Account existence checks:" -ForegroundColor Blue
foreach ($acc in @($clientEmail,$contractorEmail,$companyEmail,$architectEmail)) {
  try {
    $existsRes = Invoke-Api -Method GET -Path "/auth/exists?account=$([uri]::EscapeDataString($acc))" -TryNoPrefixFallback
    Write-Host "  $acc exists: $($existsRes.data.exists)"
  } catch {
    Write-Host "  exists-check failed for $acc: $($_.Exception.Message)" -ForegroundColor Yellow
  }
}
Write-Host ""

# 3) Register users (server expects: name/email/phone?/password)
function Register-User([string]$email,[string]$name,[string]$role) {
  $body = @{ name = $name; email = $email; password = $pwd }
  try {
    $res = Invoke-Api -Method POST -Path '/auth/register' -Body $body -TryNoPrefixFallback
    Write-Host ("SUCCESS: Registered {0} ({1})" -f $name,$role) -ForegroundColor Green
    $res | ConvertTo-Json -Depth 6
  } catch {
    Write-Host ("Register {0} result: {1}" -f $name,$_.Exception.Message) -ForegroundColor Yellow
  }
}

Write-Host "3. Registering users:" -ForegroundColor Blue
Register-User -email $clientEmail -name 'Nguyen Van Client' -role 'client'
Register-User -email $contractorEmail -name 'Tran Van Contractor' -role 'contractor'
Register-User -email $companyEmail -name 'ABC Resort Company' -role 'company'
Register-User -email $architectEmail -name 'Le Van Architect' -role 'architect'
Write-Host ""

# 4) Login (server expects: account/password)
Write-Host "4. Testing login:" -ForegroundColor Blue
$loginBody = @{ account = $clientEmail; password = $pwd }
try {
  $login = Invoke-Api -Method POST -Path '/auth/login' -Body $loginBody -TryNoPrefixFallback
  Write-Host "SUCCESS: Login successful" -ForegroundColor Green
  $login | ConvertTo-Json -Depth 6

  if ($login.token) {
    # 5) /auth/me to verify token
    Write-Host ""; Write-Host "5. Verifying token via /auth/me:" -ForegroundColor Blue
    $headers = @{ Authorization = "Bearer $($login.token)" }
    try {
      $me = Invoke-Api -Method GET -Path '/auth/me' -Headers $headers -TryNoPrefixFallback
      Write-Host "SUCCESS: Token verified" -ForegroundColor Green
      $me | ConvertTo-Json -Depth 6
    } catch {
      Write-Host "Token verification failed: $($_.Exception.Message)" -ForegroundColor Red
    }
  }
} catch {
  Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""; Write-Host "========================================" -ForegroundColor Green
Write-Host "Authentication testing completed!" -ForegroundColor Green
Write-Host ("Server base: {0} (prefix: {1})" -f $BaseUrl,$ApiPrefix) -ForegroundColor Cyan
