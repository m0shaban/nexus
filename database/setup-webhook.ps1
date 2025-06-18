# Telegram Webhook Setup Script for PowerShell

# Load environment variables from .env.local
if (Test-Path ".env.local") {
    Write-Host "✅ Loading environment variables from .env.local"
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
            $envName = $matches[1].Trim()
            $envValue = $matches[2].Trim()
            # Remove quotes if present
            if ($envValue -match '^"(.*)"$' -or $envValue -match "^'(.*)'$") {
                $envValue = $matches[1]
            }
            [Environment]::SetEnvironmentVariable($envName, $envValue, "Process")
            Write-Host "  Set $envName"
        }
    }
    
    # Set variables from environment if available
    $BotToken = $env:TELEGRAM_BOT_TOKEN
    $WebhookUrl = $env:WEBHOOK_URL
    $WebhookSecret = $env:TELEGRAM_WEBHOOK_SECRET
    
    # Allow command-line parameters to override environment variables
    param(
        [string]$BotToken = $env:TELEGRAM_BOT_TOKEN,
        [string]$WebhookUrl = $env:WEBHOOK_URL,
        [string]$WebhookSecret = $env:TELEGRAM_WEBHOOK_SECRET
    )
} else {
    # If no .env.local, use command-line parameters
    param(
        [Parameter(Mandatory=$true)]
        [string]$BotToken,
        
        [Parameter(Mandatory=$true)]
        [string]$WebhookUrl,
        
        [Parameter(Mandatory=$true)]
        [string]$WebhookSecret
    )
    
    Write-Host "⚠️ No .env.local file found, using command-line parameters" -ForegroundColor Yellow
}

Write-Host "🚀 Setting up Telegram webhook..." -ForegroundColor Green
Write-Host "Bot Token: $($BotToken.Substring(0, [Math]::Min(10, $BotToken.Length)))..." -ForegroundColor Yellow
Write-Host "Webhook URL: $WebhookUrl/api/telegram-webhook" -ForegroundColor Yellow
Write-Host "Secret: $($WebhookSecret.Substring(0, [Math]::Min(5, $WebhookSecret.Length)))..." -ForegroundColor Yellow

# Prepare the request body
$body = @{
    url = "$WebhookUrl/api/telegram-webhook"
    secret_token = $WebhookSecret
} | ConvertTo-Json

# Set the webhook
try {
    Write-Host "📡 Setting webhook..." -ForegroundColor Blue
    $response = Invoke-RestMethod -Uri "https://api.telegram.org/bot$BotToken/setWebhook" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "📡 Webhook response:" -ForegroundColor Blue
    $response | ConvertTo-Json -Depth 3
    
    # Get webhook info
    Write-Host "`n📋 Current webhook info:" -ForegroundColor Blue
    $webhookInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$BotToken/getWebhookInfo" -Method Get
    $webhookInfo | ConvertTo-Json -Depth 3
    
    Write-Host "`n✅ Webhook setup complete!" -ForegroundColor Green
    Write-Host "Send a message to your bot to test the connection." -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Error setting webhook: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Example usage comment
Write-Host "`n💡 Example usage:" -ForegroundColor Magenta
Write-Host ".\setup-webhook.ps1 -BotToken 'your_bot_token' -WebhookUrl 'https://your-domain.com' -WebhookSecret 'your_secret'" -ForegroundColor Gray
