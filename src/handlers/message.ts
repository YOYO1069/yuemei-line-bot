import { Client, FlexMessage } from '@line/bot-sdk';
import { getDoctors } from '../db/supabase.js';
import { getBenmeiReply, benmeiReplies } from '../utils/benmei.js';

export async function handleTextMessage(client: Client, replyToken: string, text: string, userId: string): Promise<void> {
  const lowerText = text.toLowerCase().trim();
  
  try {
    if (lowerText.includes('嗨') || lowerText.includes('你好') || lowerText.includes('hi') || lowerText.includes('hello')) {
      await client.replyMessage(replyToken, { type: 'text', text: getBenmeiReply('greeting') });
    }
    else if (lowerText.includes('醫師') || lowerText.includes('doctor')) {
      const doctors = await getDoctors();
      const doctorNames = doctors.map(d => `${d.name} - ${d.specialty}`);
      const replyText = benmeiReplies.doctor_list(doctorNames);
      await client.replyMessage(replyToken, { type: 'text', text: replyText });
    }
    else if (lowerText.includes('預約') || lowerText.includes('booking')) {
      const flexMessage: FlexMessage = {
        type: 'flex',
        altText: '線上預約',
        contents: {
          type: 'bubble',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '💖 線上預約',
                weight: 'bold',
                size: 'xl',
                color: '#FF69B4'
              }
            ]
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '邊美醬為您準備了線上預約表單～',
                wrap: true,
                color: '#666666'
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: '立即預約',
                  uri: 'https://rad-paletas-14483a.netlify.app/booking/yuemei'
                },
                style: 'primary',
                color: '#FF69B4'
              }
            ]
          }
        }
      };
      await client.replyMessage(replyToken, flexMessage);
    }
    else if (lowerText.includes('幫助') || lowerText.includes('help')) {
      await client.replyMessage(replyToken, { type: 'text', text: getBenmeiReply('help') });
    }
    else {
      await client.replyMessage(replyToken, { type: 'text', text: getBenmeiReply('unknown') });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await client.replyMessage(replyToken, { type: 'text', text: getBenmeiReply('error') });
  }
}
