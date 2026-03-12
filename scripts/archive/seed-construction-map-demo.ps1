# Seed Construction Map Demo Data
# Seeds demo data for villa-001 project

$API_URL = "https://baotienweb.cloud/api/construction-map"
$PROJECT_ID = "villa-001"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Seed Construction Map Demo Data" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "? Project ID: $PROJECT_ID" -ForegroundColor Green
Write-Host "? API URL: $API_URL" -ForegroundColor Green
Write-Host ""

# Seed demo data
Write-Host "? Seeding demo data..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/$PROJECT_ID/seed-demo" -Method Post -Headers @{
        "Content-Type" = "application/json"
    }
    
    Write-Host "✅ Demo data seeded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "? Data created:" -ForegroundColor Cyan
    Write-Host "   - Stages: $($response.data.stages)" -ForegroundColor White
    Write-Host "   - Tasks: $($response.data.tasks)" -ForegroundColor White
    Write-Host "   - Links: $($response.data.links)" -ForegroundColor White
    Write-Host ""
    
    # Verify by fetching project data
    Write-Host "? Verifying project data..." -ForegroundColor Yellow
    $project = Invoke-RestMethod -Uri "$API_URL/$PROJECT_ID" -Method Get
    
    Write-Host "✅ Project data verified!" -ForegroundColor Green
    Write-Host ""
    Write-Host "? Project Structure:" -ForegroundColor Cyan
    Write-Host "   - Stages: $($project.stages.Count)" -ForegroundColor White
    Write-Host "   - Tasks: $($project.tasks.Count)" -ForegroundColor White
    Write-Host "   - Links: $($project.links.Count)" -ForegroundColor White
    Write-Host ""
    
    # Show stages
    Write-Host "? Stages:" -ForegroundColor Cyan
    foreach ($stage in $project.stages) {
        Write-Host "   [$($stage.number)] $($stage.label) - $($stage.status)" -ForegroundColor White
    }
    Write-Host ""
    
    # Show tasks
    Write-Host "? Tasks:" -ForegroundColor Cyan
    foreach ($task in $project.tasks) {
        $statusColor = switch ($task.status) {
            "completed" { "Green" }
            "in-progress" { "Yellow" }
            "pending" { "Gray" }
            default { "White" }
        }
        Write-Host "   - $($task.label) ($($task.progress)%) [$($task.status)]" -ForegroundColor $statusColor
    }
    Write-Host ""
    
    Write-Host "? Test URL: https://baotienweb.cloud/api/construction-map/$PROJECT_ID" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "✅ All done! Open the Construction Map screen in app." -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "? Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Check if backend is running" -ForegroundColor White
    Write-Host "   2. Verify API URL: $API_URL" -ForegroundColor White
    Write-Host "   3. Check database connection" -ForegroundColor White
    exit 1
}
