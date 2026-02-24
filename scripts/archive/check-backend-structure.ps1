# Check Backend API Structure via SSH
# Requires: plink.exe from PuTTY or SSH client

$SERVER = "103.200.20.100"
$USER = "root"
# Password will be prompted

Write-Host "=== CHECKING BACKEND API STRUCTURE ===" -ForegroundColor Cyan

# Commands to run on server
$commands = @(
    "# 1. Check .env database config",
    "cat /root/baotienweb-api/.env | grep -E 'DB_|DATABASE_URL'",
    "",
    "# 2. List backend project structure",
    "ls -la /root/baotienweb-api/src/",
    "",
    "# 3. Check existing modules",
    "ls -la /root/baotienweb-api/src/ | grep -E 'project|timeline|phase|report|budget|inventory'",
    "",
    "# 4. Check database schema",
    "sudo -u postgres psql -d postgres -c '\l' | grep -i thiet",
    "",
    "# 5. List all tables in database",
    "sudo -u postgres psql -d postgres -c '\dt' 2>/dev/null || echo 'Need correct DB name'",
    "",
    "# 6. Check PM2 process details",
    "pm2 describe baotienweb-api | grep -A5 'exec_cwd'",
    "",
    "# 7. Find package.json to see dependencies",
    "cat /root/baotienweb-api/package.json | grep -A20 'dependencies'"
)

Write-Host "`nConnect to server and run these commands manually:" -ForegroundColor Yellow
Write-Host "ssh root@$SERVER" -ForegroundColor Green
Write-Host ""
foreach ($cmd in $commands) {
    if ($cmd -ne "") {
        Write-Host $cmd -ForegroundColor Gray
    }
}

Write-Host "`n=== MANUAL STEPS ===" -ForegroundColor Cyan
Write-Host "1. Open new terminal: ssh root@103.200.20.100"
Write-Host "2. Find backend directory: cd /root/baotienweb-api"
Write-Host "3. Check structure: ls -la src/"
Write-Host "4. Check database: cat .env | grep DB"
Write-Host "5. List modules: ls -la src/ | grep module"
