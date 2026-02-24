param(
  [string]$Dir = "assets/videos",
  [int]$MaxMB = 30
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$target = Join-Path $root ".." | Join-Path -ChildPath $Dir

if (-not (Test-Path $target)) {
  Write-Host "No media directory found at $target" -ForegroundColor Yellow
  exit 0
}

$limit = $MaxMB * 1MB
$oversized = Get-ChildItem -Path $target -File -Include *.mp4,*.mov,*.m4v -Recurse | Where-Object { $_.Length -gt $limit }

if ($oversized.Count -gt 0) {
  Write-Error ("The following files exceed {0} MB:" -f $MaxMB)
  $oversized | ForEach-Object { Write-Host (" - {0} ({1:N1} MB)" -f $_.FullName, ($_.Length/1MB)) }
  exit 2
}

Write-Host "All media files are under ${MaxMB}MB." -ForegroundColor Green
exit 0
