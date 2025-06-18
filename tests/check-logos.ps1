# فحص حالة جداول نظام Logos AI
# PowerShell Script لفحص توفر الجداول في Supabase

Write-Host "🔍 فحص حالة جداول نظام Logos AI..." -ForegroundColor Cyan
Write-Host ""

# قراءة متغيرات البيئة
$envFile = ".env.local"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    $env = @{}
    
    foreach ($line in $envContent) {
        if ($line -and !$line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            if ($parts.Length -eq 2) {
                $env[$parts[0]] = $parts[1]
            }
        }
    }
    
    $supabaseUrl = $env["NEXT_PUBLIC_SUPABASE_URL"]
    $supabaseKey = $env["SUPABASE_SERVICE_ROLE_KEY"]
    
    Write-Host "📡 معلومات الاتصال:" -ForegroundColor Yellow
    Write-Host "URL: $(if ($supabaseUrl) { 'موجود ✅' } else { 'مفقود ❌' })"
    Write-Host "Key: $(if ($supabaseKey) { 'موجود ✅' } else { 'مفقود ❌' })"
    Write-Host ""
    
    if (!$supabaseUrl -or !$supabaseKey) {
        Write-Host "❌ متغيرات البيئة مفقودة!" -ForegroundColor Red
        exit 1
    }
    
    # قائمة الجداول المطلوبة
    $logosTables = @(
        "logos_conversations",
        "logos_messages", 
        "logos_user_preferences",
        "logos_analysis_sessions"
    )
    
    Write-Host "📋 فحص الجداول المطلوبة:" -ForegroundColor Yellow
    
    $existingTables = 0
    
    foreach ($tableName in $logosTables) {
        try {
            $headers = @{
                "apikey" = $supabaseKey
                "Authorization" = "Bearer $supabaseKey"
                "Content-Type" = "application/json"
                "Prefer" = "count=exact"
            }
            
            $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/$tableName" -Method GET -Headers $headers -TimeoutSec 10
            
            Write-Host "  ✅ $tableName`: موجود ويعمل" -ForegroundColor Green
            $existingTables++
            
        } catch {
            if ($_.Exception.Response.StatusCode -eq 404 -or $_.Exception.Message -contains "does not exist") {
                Write-Host "  ❌ $tableName`: الجدول غير موجود" -ForegroundColor Red
            } else {
                Write-Host "  ⚠️ $tableName`: خطأ في الوصول" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host ""
    Write-Host "📊 النتيجة: $existingTables/$($logosTables.Count) جداول موجودة" -ForegroundColor Cyan
    
    # التوصيات
    Write-Host ""
    Write-Host "💡 التوصيات:" -ForegroundColor Yellow
    
    if ($existingTables -eq 0) {
        Write-Host "   🔧 يجب تنفيذ سكريپت setup-logos-database.sql في Supabase" -ForegroundColor Red
        Write-Host "   📋 الخطوات:" -ForegroundColor White
        Write-Host "      1. افتح Supabase Dashboard" -ForegroundColor Gray
        Write-Host "      2. اذهب إلى SQL Editor" -ForegroundColor Gray
        Write-Host "      3. انسخ محتويات setup-logos-database.sql" -ForegroundColor Gray
        Write-Host "      4. ألصق السكريپت وشغله" -ForegroundColor Gray
    } elseif ($existingTables -lt $logosTables.Count) {
        Write-Host "   ⚠️ بعض الجداول مفقودة - راجع سكريپت setup-logos-database.sql" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ جميع جداول Logos موجودة ومتاحة!" -ForegroundColor Green
        Write-Host "   🚀 النظام جاهز لاختبار تكامل Logos AI" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "🔗 روابط مفيدة:" -ForegroundColor Yellow
    $dashboardUrl = $supabaseUrl -replace "/rest/v1", "" -replace "https://", "https://supabase.com/dashboard/project/"
    Write-Host "   📊 Supabase Dashboard: $dashboardUrl" -ForegroundColor Cyan
    Write-Host "   📝 SQL Editor: اذهب للداشبورد > SQL Editor" -ForegroundColor Cyan
    
} else {
    Write-Host "❌ ملف .env.local غير موجود!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🏁 تم الانتهاء من فحص نظام Logos AI" -ForegroundColor Green
