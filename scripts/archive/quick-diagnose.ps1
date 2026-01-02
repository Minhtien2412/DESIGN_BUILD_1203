param([string]$Server = "103.200.20.100", [string]$User = "root")
$cmd = "systemctl status postgresql; sudo -u postgres psql -l; pm2 list; cat /root/baotienweb-api/.env | grep DATABASE || cat /root/backend-nestjs/.env | grep DATABASE"
Write-Host "Diagnosing PostgreSQL on $Server..." -ForegroundColor Cyan
ssh ${User}@${Server} $cmd
