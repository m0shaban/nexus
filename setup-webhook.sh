#!/bin/bash
# Telegram Webhook Setup Script
# Load environment variables
if [ -f .env.local ]; then
  source .env.local
fi
# Make sure to set your environment variables first

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN is not set"
    echo "Please set it first: export TELEGRAM_BOT_TOKEN=your_token_here"
    exit 1
fi

if [ -z "$WEBHOOK_URL" ]; then
    echo "❌ WEBHOOK_URL is not set"
    echo "Please set it first: export WEBHOOK_URL=https://your-domain.com"
    exit 1
fi

if [ -z "$TELEGRAM_WEBHOOK_SECRET" ]; then
    echo "❌ TELEGRAM_WEBHOOK_SECRET is not set"
    echo "Please set it first: export TELEGRAM_WEBHOOK_SECRET=your_secret_here"
    exit 1
fi

echo "🚀 Setting up Telegram webhook..."
echo "Bot Token: ${TELEGRAM_BOT_TOKEN:0:10}..."
echo "Webhook URL: $WEBHOOK_URL/api/telegram-webhook"
echo "Secret: ${TELEGRAM_WEBHOOK_SECRET:0:5}..."

# Set the webhook
response=$(curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$WEBHOOK_URL/api/telegram-webhook\",
    \"secret_token\": \"$TELEGRAM_WEBHOOK_SECRET\"
  }")

echo "📡 Webhook response:"
echo $response | jq '.' 2>/dev/null || echo $response

# Get webhook info
echo -e "\n📋 Current webhook info:"
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo" | jq '.' 2>/dev/null

echo -e "\n✅ Webhook setup complete!"
echo "Send a message to your bot to test the connection."
