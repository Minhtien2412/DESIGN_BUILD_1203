Param(
  [string]$BaseUrl = $env:EXPO_PUBLIC_API_BASE_URL,
  [string]$Prefix = $env:EXPO_PUBLIC_API_PREFIX
)

Write-Host "[verify-api] Starting API verification..." -ForegroundColor Cyan

# Candidate bases
$baseCandidates = @()
if ($BaseUrl -and $BaseUrl.Trim() -ne '') { $baseCandidates += $BaseUrl }
$baseCandidates += 'http://103.200.20.100'
$baseCandidates = @($baseCandidates | Select-Object -Unique)

# Candidate prefixes
$prefixCandidates = @()
if ($null -ne $Prefix) { $prefixCandidates += $Prefix }
$prefixCandidates += ''
$prefixCandidates += '/api'
$prefixCandidates = @($prefixCandidates | Select-Object -Unique)

function Join-Url([string]$a, [string]$b) {
  if (-not $a) { return $b }
  if ($a.EndsWith('/')) { $a = $a.TrimEnd('/') }
  if (-not $b) { return $a }
  if (-not $b.StartsWith('/')) { $b = '/' + $b }
  return $a + $b
}

function Test-Endpoint([string]$url, [string]$method = 'GET', $body = $null) {
  try {
    if ($method -eq 'GET') {
      $r = Invoke-WebRequest -UseBasicParsing -Method GET -Uri $url -TimeoutSec 8 -ErrorAction Stop
    } else {
      $json = $null
      if ($null -ne $body) { $json = ($body | ConvertTo-Json -Depth 5 -Compress) }
      $r = Invoke-WebRequest -UseBasicParsing -Method $method -Uri $url -ContentType 'application/json' -Body $json -TimeoutSec 10 -ErrorAction Stop
    }
    return @{ ok = $true; status = $r.StatusCode; body = $r.Content }
  } catch {
    $status = $null
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      $status = [int]$_.Exception.Response.StatusCode
    }
    return @{ ok = $false; status = $status; error = $_.Exception.Message }
  }
}

$healthSuccess = $null
$healthMatrix = @()
foreach ($b in $baseCandidates) {
  foreach ($p in $prefixCandidates) {
    $healthUrl = Join-Url $b (Join-Url $p '/health')
    $res = Test-Endpoint -url $healthUrl -method 'GET'
    $healthMatrix += @{ base = $b; prefix = $p; url = $healthUrl; result = $res }
    if ($res.ok -and $res.status -eq 200 -and -not $healthSuccess) {
      $healthSuccess = @{ base = $b; prefix = $p; url = $healthUrl }
    }
  }
}

Write-Host "[verify-api] Health check results:" -ForegroundColor Yellow
$healthMatrix | ForEach-Object {
  $r = $_.result
  $status = if ($null -ne $r.status) { $r.status } else { 'n/a' }
  Write-Host ("  - {0} -> {1}" -f $_.url, $status)
}

$recBase = if ($healthSuccess) { $healthSuccess.base } else { $baseCandidates[0] }
$recPrefix = if ($healthSuccess) { $healthSuccess.prefix } else { '' }

# Test social endpoints using POST with dummy body
$googleUrl = Join-Url $recBase (Join-Url $recPrefix '/auth/google')
$facebookUrl = Join-Url $recBase (Join-Url $recPrefix '/auth/facebook')
$g = Test-Endpoint -url $googleUrl -method 'POST' -body @{ access_token = 'test'; id_token = 'test' }
$f = Test-Endpoint -url $facebookUrl -method 'POST' -body @{ access_token = 'test' }

function Route-Exists($res) {
  if ($null -eq $res.status) { return $false }
  if ($res.status -eq 404) { return $false }
  # 200..499 (except 404) indicates route responds, even if body invalid
  if ($res.status -ge 200 -and $res.status -lt 500) { return $true }
  return $false
}

$googleExists = Route-Exists $g
$facebookExists = Route-Exists $f

Write-Host "[verify-api] Summary" -ForegroundColor Cyan
$gStatus = if ($null -ne $g.status) { $g.status } else { 'n/a' }
$fStatus = if ($null -ne $f.status) { $f.status } else { 'n/a' }
$gEnable = if ($googleExists) { '1' } else { '0' }
$fEnable = if ($facebookExists) { '1' } else { '0' }
Write-Host ("  Recommended EXPO_PUBLIC_API_BASE_URL = {0}" -f $recBase)
Write-Host ("  Recommended EXPO_PUBLIC_API_PREFIX   = {0}" -f $recPrefix)
Write-Host ("  Google route   ({0}) => status {1}" -f $googleUrl, $gStatus)
Write-Host ("  Facebook route ({0}) => status {1}" -f $facebookUrl, $fStatus)
Write-Host ("  EXPO_PUBLIC_ENABLE_SOCIAL_GOOGLE   = {0}" -f $gEnable)
Write-Host ("  EXPO_PUBLIC_ENABLE_SOCIAL_FACEBOOK = {0}" -f $fEnable)

# Output as JSON for programmatic use
$summary = [ordered]@{
  recommendedBase   = $recBase
  recommendedPrefix = $recPrefix
  health            = $healthMatrix
  social = [ordered]@{
    google = [ordered]@{ url = $googleUrl; status = $g.status; exists = $googleExists }
    facebook = [ordered]@{ url = $facebookUrl; status = $f.status; exists = $facebookExists }
  }
}

"`n[verify-api] JSON Output:" | Write-Host -ForegroundColor Yellow
$summary | ConvertTo-Json -Depth 6
