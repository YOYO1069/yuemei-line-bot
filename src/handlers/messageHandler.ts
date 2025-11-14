import { WebhookEvent, TextMessage, FlexMessage } from '@line/bot-sdk';
import { getDoctors } from '../db/supabase.js';
import { getBenmeiReply } from '../utils/benmei.js';
import { createDoctorListMessage } from '../templates/appointmentFlexMessage.js';
import { createClinicInfoMessage } from './clinicInfo.js';

export async function handleMessage(event: WebhookEvent): Promise<TextMessage | FlexMessage | null> {
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
  
  // 醫師查詢 - 使用 Flex Message 顯示醫師卡片
  if (/醫師|doctor/i.test(userMessage)) {
    try {
      const doctors = await getDoctors();
      if (doctors.length === 0) {
        return {
          type: 'text',
          text: '目前沒有醫師資料喔 💕',
        };
      }
      // 返回 Flex Message 醫師卡片
      return createDoctorListMessage(doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return {
        type: 'text',
        text: getBenmeiReply('error'),
      };
    }
  }
  
  // 診所資訊
  if (/診所資訊|診所|地址|電話|營業時間|clinic info/i.test(userMessage)) {
    return createClinicInfoMessage();
  }
  
  // 幫助
  if (/幫助|help|說明/i.test(userMessage)) {
    return {
      type: 'text',
      text: getBenmeiReply('help'),
    };
  }
  
  // 預約 - 引導使用者開啟 LIFF 預約表單
  if (/預約|booking|約診/i.test(userMessage)) {
    return {
      type: 'text',
      text: '💖 想要預約嗎？\n\n請點選下方選單的「📅 立即預約」按鈕，\n邊美醬會幫您開啟預約表單喔～\n\n超方便的！✨',
    };
  }
  
  // 默認回覆
  return {
    type: 'text',
    text: getBenmeiReply('unknown'),
  };
}
