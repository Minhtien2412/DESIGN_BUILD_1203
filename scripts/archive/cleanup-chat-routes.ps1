# Chat Routes Cleanup Script
# This script identifies and cleans up duplicate chat routes

$ErrorActionPreference = "Stop"

Write-Host "🧹 Chat Routes Cleanup Analysis" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$appPath = "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025\app"

# Chat-related directories
$chatDirs = @(
    "chat",
    "messages", 
    "messages\chat"
)

Write-Host "`n📁 Current Chat Route Structure:" -ForegroundColor Yellow

foreach ($dir in $chatDirs) {
    $fullPath = Join-Path $appPath $dir
    if (Test-Path $fullPath) {
        Write-Host "`n  /$dir" -ForegroundColor White
        Get-ChildItem -Path $fullPath -File | ForEach-Object {
            $size = [math]::Round($_.Length / 1KB, 1)
            Write-Host "    - $($_.Name) (${size}KB)" -ForegroundColor Gray
        }
    }
}

Write-Host @"

📊 ANALYSIS:
============

DUPLICATE ROUTES FOUND:
-----------------------
1. /chat/[chatId].tsx     vs  /messages/[userId].tsx
   → Both handle individual conversations
   
2. /messages/chat/[id].tsx  vs  /messages/chat/[conversationId].tsx  
   → Same purpose, different param names
   
3. /messages/realtime-chat.tsx  vs  /messages/unified.tsx
   → Both are chat list screens

RECOMMENDED CLEANUP:
--------------------
KEEP:
  ✅ /messages/index.tsx          - Main messages list
  ✅ /messages/[userId].tsx       - Individual chat by user
  ✅ /messages/new-conversation.tsx - Create new chat
  ✅ /messages/groups.tsx         - Group chats
  ✅ /messages/_layout.tsx        - Layout

REMOVE/DEPRECATE:
  ⚠️ /chat/[chatId].tsx          - Redirect to /messages/[userId]
  ⚠️ /messages/chat/*            - Merge into main messages
  ⚠️ /messages/realtime-chat.tsx - Merge into index.tsx
  ⚠️ /messages/unified.tsx       - Merge into index.tsx

"@ -ForegroundColor White

# Files to potentially remove
$filesToCleanup = @(
    "messages\chat\[conversationId].tsx.new",  # Temporary file
    "messages\chat\enhanced.tsx",               # Can be merged
    "messages\unified.tsx"                      # Duplicate of index
)

Write-Host "`n🗑️ FILES SAFE TO DELETE:" -ForegroundColor Red
foreach ($file in $filesToCleanup) {
    $fullPath = Join-Path $appPath $file
    if (Test-Path $fullPath) {
        Write-Host "  - $file" -ForegroundColor Yellow
    }
}

Write-Host @"

⚠️ ACTION REQUIRED:
-------------------
Run with -Execute flag to perform cleanup:
  .\cleanup-chat-routes.ps1 -Execute

Or manually delete the files listed above.

"@ -ForegroundColor Cyan

# Optional: Execute cleanup
param(
    [switch]$Execute
)

if ($Execute) {
    Write-Host "`n🔥 EXECUTING CLEANUP..." -ForegroundColor Red
    
    foreach ($file in $filesToCleanup) {
        $fullPath = Join-Path $appPath $file
        if (Test-Path $fullPath) {
            Remove-Item -Path $fullPath -Force
            Write-Host "  ✅ Deleted: $file" -ForegroundColor Green
        }
    }
    
    Write-Host "`n✅ Cleanup complete!" -ForegroundColor Green
}
