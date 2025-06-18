# ========================================
# cleanup-old-files.ps1
# سكريبت تنظيف الملفات القديمة من مجلد قاعدة البيانات
# ========================================

param(
    [switch]$Force,
    [switch]$DryRun
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$dbDir = Join-Path $scriptDir "db"

# قائمة الملفات القديمة المراد حذفها
$oldFiles = @(
    "00-drop-old-tables.sql",
    "01-extensions-and-helpers.sql",
    "02-create-users.sql",
    "02-notes.sql", 
    "03-create-clients.sql",
    "03-projects.sql",
    "03.5-streaks.sql",
    "04-create-projects.sql",
    "04-scenarios.sql",
    "05-create-logos.sql",
    "05-mirror.sql",
    "06-create-files.sql",
    "06-logos.sql",
    "07-create-categories-tags.sql",
    "07-test-data.sql",
    "08-create-logo-categories-tags.sql",
    "08-views.sql",
    "09-create-comments.sql",
    "09-master.sql",
    "add-streaks-table.sql",
    "catalyst-database.sql",
    "check-database-status.sql",
    "cleanup-database.sql",
    "complete-database-setup-final.sql",
    "complete-database-setup-fixed.sql",
    "complete-database-setup.sql",
    "database-schema.sql",
    "fresh-database-setup.sql",
    "logos-database-setup.sql",
    "logos-test-data.sql",
    "mirror-database-setup-fixed.sql",
    "mirror-database-setup.sql",
    "nexus-compatible-database-setup.sql",
    "oracle-database-setup.sql",
    "quick-fix.sql",
    "rebuild-database.sql",
    "schema_info.sql",
    "setup-new-database.sql",
    "test-data-setup.sql",
    "test-data.sql"
)

Write-Host "🧹 سكريبت تنظيف الملفات القديمة" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "📋 معاينة الملفات التي سيتم حذفها:" -ForegroundColor Yellow
} else {
    Write-Host "🗑️  حذف الملفات القديمة..." -ForegroundColor Yellow
}

$deletedCount = 0
$notFoundCount = 0

foreach ($file in $oldFiles) {
    $filePath = Join-Path $dbDir $file
    
    if (Test-Path $filePath) {
        $fileSize = (Get-Item $filePath).Length
        $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
        
        if ($DryRun) {
            Write-Host "  📄 $file ($fileSizeKB KB)" -ForegroundColor White
        } else {
            try {
                Remove-Item $filePath -Force
                Write-Host "  ✅ حُذف: $file ($fileSizeKB KB)" -ForegroundColor Green
                $deletedCount++
            } catch {
                Write-Host "  ❌ خطأ في حذف: $file - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    } else {
        $notFoundCount++
    }
}

Write-Host "" -ForegroundColor White
Write-Host "📊 إحصائيات التنظيف:" -ForegroundColor Cyan

if ($DryRun) {
    $foundFiles = $oldFiles.Count - $notFoundCount
    Write-Host "  📄 الملفات الموجودة: $foundFiles" -ForegroundColor White
    Write-Host "  📄 الملفات غير الموجودة: $notFoundCount" -ForegroundColor Gray
    Write-Host "" -ForegroundColor White
    Write-Host "لتنفيذ الحذف الفعلي، شغّل السكريبت بدون -DryRun" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ تم حذفها: $deletedCount" -ForegroundColor Green
    Write-Host "  📄 غير موجودة: $notFoundCount" -ForegroundColor Gray
    
    if ($deletedCount -gt 0) {
        Write-Host "" -ForegroundColor White
        Write-Host "🎉 تم تنظيف مجلد قاعدة البيانات بنجاح!" -ForegroundColor Green
        Write-Host "الملفات الحديثة المتبقية:" -ForegroundColor Cyan
        
        # عرض الملفات المتبقية
        $remainingFiles = Get-ChildItem $dbDir -Filter "*.sql" | Sort-Object Name
        foreach ($file in $remainingFiles) {
            if ($file.Name -match "^(\d{2}-)") {
                Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
            } else {
                Write-Host "  📄 $($file.Name)" -ForegroundColor White
            }
        }
    }
}

Write-Host "" -ForegroundColor White
Write-Host "=================================" -ForegroundColor Cyan
