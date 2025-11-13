import express from 'express';
import { middleware, Client, WebhookEvent } from '@line/bot-sdk';
import { config, validateConfig } from './config.js';
import { handleTextMessage } from './handlers/message.js';

validateConfig();

const app = express();
const client = new Client({
  channelAccessToken: config.line.channelAccessToken,
  channelSecret: config.line.channelSecret,
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: '約美助理小幫手 - 邊美醬',
    timestamp: new Date().toISOString(),
  });
});

app.post('/webhook', middleware({ channelSecret: config.line.channelSecret }), async (req, res) => {
  try {
    const events: WebhookEvent[] = req.body.events;
    await Promise.all(events.map(handleEvent));
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function handleEvent(event: WebhookEvent): Promise<void> {
  if (event.type === 'message' && event.message.type === 'text') {
    const userId = event.source.userId || '';
    await handleTextMessage(client, event.replyToken, event.message.text, userId);
  }
}

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`✅ 邊美醬 LINE Bot running on port ${PORT}`);
  console.log(`📍 Webhook URL: http://localhost:${PORT}/webhook`);
});
