# 約美助理小幫手 - 邊美醬 LINE Bot

邊美醬人格化 AI 助理,為醫美診所提供溫暖貼心的預約服務。

## 功能

- 🤖 邊美醬人格化對話
- 📅 線上預約功能
- 👨‍⚕️ 醫師陣容查詢
- 💖 溫暖友善的互動體驗

## 環境變數

需要在 Zeabur 設定以下環境變數:

- LINE_CHANNEL_ACCESS_TOKEN
- LINE_CHANNEL_SECRET
- SUPABASE_URL
- SUPABASE_KEY
- JSONBIN_API_KEY (optional)
- JSONBIN_CALENDAR_ID (optional)
- PORT (default: 8080)

## 部署

### Zeabur 部署
1. 推送到 GitHub
2. 在 Zeabur 連接 GitHub repository
3. 設定環境變數
4. 自動部署

### LINE Webhook 設定
Webhook URL: `https://your-domain.zeabur.app/webhook`

## 開發

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
npm start
```
