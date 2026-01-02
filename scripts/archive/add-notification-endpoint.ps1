# Script tự động thêm POST endpoint vào notifications controller
# Chạy: .\add-notification-endpoint.ps1

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  THÊM POST ENDPOINT VÀO NOTIFICATIONS CONTROLLER" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

$server = "root@baotienweb.cloud"
$backupDir = "~/baotienweb-api/backups"
$controllerFile = "~/baotienweb-api/src/notifications/notifications.controller.ts"

# Tạo nội dung method cần thêm
$newMethod = @'

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() body: any) {
    const userId = req.user.id;
    const { type, title, body: message, priority, metadata } = body;

    // Parse metadata if string
    let parsedMetadata = metadata;
    if (typeof metadata === 'string') {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (e) {
        parsedMetadata = {};
      }
    }

    return this.notificationsService.create({
      userId,
      type: type || 'IN_APP',
      title,
      message,
      priority: priority || 'MEDIUM',
      data: parsedMetadata,
    });
  }
'@

Write-Host "Bước 1: Tạo backup controller hiện tại..." -ForegroundColor Yellow
$cmd1 = "mkdir -p $backupDir; cp $controllerFile $backupDir/notifications.controller.ts.backup-$(date +%Y%m%d-%H%M%S)"

Write-Host "Bước 2: Thêm POST method vào controller..." -ForegroundColor Yellow
# Tạo file tạm với nội dung method mới
$tempFile = [System.IO.Path]::GetTempFileName()
$newMethod | Out-File -FilePath $tempFile -Encoding UTF8 -NoNewline

# Script để chèn method vào đúng vị trí (sau constructor)
$cmd2 = @"
cd ~/baotienweb-api && cat > /tmp/new_method.txt << 'ENDMETHOD'
$newMethod
ENDMETHOD

# Tìm dòng constructor và chèn method sau đó
sed -i '/constructor(private readonly notificationsService: NotificationsService) {}/r /tmp/new_method.txt' src/notifications/notifications.controller.ts
"@

Write-Host "Bước 3: Rebuild TypeScript..." -ForegroundColor Yellow
$cmd3 = "cd ~/baotienweb-api && npm run build"

Write-Host "Bước 4: Restart PM2..." -ForegroundColor Yellow
$cmd4 = "pm2 restart baotienweb-api"

Write-Host "Bước 5: Kiểm tra logs..." -ForegroundColor Yellow
$cmd5 = "pm2 logs baotienweb-api --lines 20 --nostream"

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  CHUẨN BỊ KẾT NỐI SSH" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nhập mật khẩu khi được yêu cầu..." -ForegroundColor Green
Write-Host ""

# Tạo script tổng hợp
$fullScript = @"
$cmd1 && echo '✓ Backup thành công' &&
$cmd2 && echo '✓ Thêm method thành công' &&
$cmd3 && echo '✓ Build thành công' &&
$cmd4 && echo '✓ Restart thành công' &&
$cmd5
"@

# Thực thi qua SSH
ssh $server "bash -c '$fullScript'"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Green
    Write-Host "  ✓ HOÀN THÀNH!" -ForegroundColor Green
    Write-Host "==================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "POST endpoint đã được thêm thành công!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Kiểm tra bằng cách chạy:" -ForegroundColor Yellow
    Write-Host "  .\send-all.ps1" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Red
    Write-Host "  ✗ CÓ LỖI XẢY RA" -ForegroundColor Red
    Write-Host "==================================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vui lòng kiểm tra logs ở trên hoặc SSH thủ công:" -ForegroundColor Yellow
    Write-Host "  ssh $server" -ForegroundColor Cyan
    Write-Host "  cd ~/baotienweb-api" -ForegroundColor Cyan
    Write-Host "  nano src/notifications/notifications.controller.ts" -ForegroundColor Cyan
    Write-Host ""
}

# Cleanup
Remove-Item $tempFile -ErrorAction SilentlyContinue
