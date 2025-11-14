import { WebhookEvent, TextMessage } from '@line/bot-sdk';
import { getDoctors } from '../db/supabase.js';
import { getBenmeiReply } from '../utils/benmei.js';

export async function handleMessage(event: WebhookEvent): Promise<TextMessage | null> {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const userMessage = event.message.text.trim();
  
  // 問候語
  if (/^(hi|hello|你好|嗨|哈囉)/i.test(userMessage)) {
    return {
      type: 'text',
      text: getBenmeiReply('greeting'),
    };
  }
  
  // 醫師查詢
  if (/醫師|doctor/i.test(userMessage)) {
    try {
      const doctors = await getDoctors();
      const doctorNames = doctors.map(d => `${d.name} - ${d.specialty}`);
      const doctorList = `✨ 我們的醫師陣容 ✨\n\n${doctorNames.map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\n都是超專業的醫師喔💕`;
      return {
        type: 'text',
        text: doctorList,
      };
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return {
        type: 'text',
        text: getBenmeiReply('error'),
      };
    }
  }
  
  // 幫助
  if (/幫助|help|說明/i.test(userMessage)) {
    return {
      type: 'text',
      text: getBenmeiReply('help'),
    };
  }
  
  // 預約
  if (/預約|booking|約診/i.test(userMessage)) {
    return {
      type: 'text',
      text: '好的～請告訴邊美醬：\n1️⃣ 您的姓名\n2️⃣ 想看哪位醫師\n3️⃣ 希望的日期和時間\n\n例如：「王小明 陳醫師 明天下午2點」',
    };
  }
  
  // 默認回覆
  return {
    type: 'text',
    text: getBenmeiReply('unknown'),
  };
}
