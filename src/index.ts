import express from 'express';
import { middleware, WebhookEvent, Client } from '@line/bot-sdk';
import { config, validateConfig } from './config.js';
import { handleMessage } from './handlers/messageHandler.js';

validateConfig();

const app = express();
const lineClient = new Client({
  channelAccessToken: config.line.channelAccessToken,
  channelSecret: config.line.channelSecret,
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: '約美助理小幫手 - 邊美醬 LINE Bot',
    timestamp: new Date().toISOString(),
  });
});

// LINE webhook endpoint
app.post('/webhook', middleware(config.line), async (req, res) => {
  try {
    const events: WebhookEvent[] = req.body.events;
    
    await Promise.all(
      events.map(async (event) => {
        if (event.type === 'message') {
          const replyMessage = await handleMessage(event);
          if (replyMessage && event.replyToken) {
            await lineClient.replyMessage(event.replyToken, replyMessage);
          }
        }
      })
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(config.server.port, () => {
  console.log(`🤖 邊美醬 LINE Bot is running on port ${config.server.port}`);
  console.log(`📍 Webhook URL: http://localhost:${config.server.port}/webhook`);
});
