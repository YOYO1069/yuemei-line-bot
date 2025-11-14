import { Client, FlexMessage } from '@line/bot-sdk';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

interface AftercareSchedule {
  userId: string;
  userName: string;
  treatmentName: string;
  treatmentDate: string;
  followUpDays: number[];
  notes?: string;
}

/**
 * 術後關懷自動化系統
 * 在療程後自動發送關懷訊息
 */

/**
 * 建立術後關懷排程
 */
export async function scheduleAftercare(schedule: AftercareSchedule): Promise<void> {
  try {
    const { data, error } = await supabase.from('aftercare_schedules').insert({
      user_id: schedule.userId,
      user_name: schedule.userName,
      treatment_name: schedule.treatmentName,
      treatment_date: schedule.treatmentDate,
      follow_up_days: schedule.followUpDays,
      notes: schedule.notes,
      status: 'scheduled',
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[Aftercare] Failed to schedule:', error);
    } else {
      console.log('[Aftercare] Scheduled successfully:', data);
    }
  } catch (error) {
    console.error('[Aftercare] Error:', error);
  }
}

/**
 * 發送術後關懷訊息
 */
export async function sendAftercareMessage(
  client: Client,
  userId: string,
  userName: string,
  treatmentName: string,
  daysSinceTreatment: number
): Promise<void> {
  const message = createAftercareFlexMessage(userName, treatmentName, daysSinceTreatment);

  try {
    await client.pushMessage(userId, message);
    console.log(`[Aftercare] Sent message to ${userId} for ${treatmentName} (Day ${daysSinceTreatment})`);
  } catch (error) {
    console.error('[Aftercare] Failed to send message:', error);
  }
}

/**
 * 建立術後關懷 Flex Message
 */
function createAftercareFlexMessage(
  userName: string,
  treatmentName: string,
  daysSinceTreatment: number
): FlexMessage {
  const messages = getAftercareMessageByDay(treatmentName, daysSinceTreatment);

  return {
    type: 'flex',
    altText: `${userName}，您的術後關懷提醒`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '💖 術後關懷',
            color: '#ffffff',
            size: 'xl',
            weight: 'bold',
          },
          {
            type: 'text',
            text: `${userName}，您好！`,
            color: '#ffffff',
            size: 'sm',
            margin: 'sm',
          },
        ],
        backgroundColor: '#9b59b6',
        paddingAll: '20px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${treatmentName} 療程後第 ${daysSinceTreatment} 天`,
            size: 'md',
            weight: 'bold',
            color: '#9b59b6',
            margin: 'md',
          },
          {
            type: 'separator',
            margin: 'lg',
          },
          {
            type: 'text',
            text: messages.greeting,
            size: 'sm',
            color: '#666666',
            wrap: true,
            margin: 'lg',
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '📋 注意事項',
                size: 'sm',
                weight: 'bold',
                color: '#333333',
                margin: 'lg',
              },
              ...messages.tips.map((tip) => ({
                type: 'text' as const,
                text: `• ${tip}`,
                size: 'sm' as const,
                color: '#666666',
                wrap: true,
                margin: 'sm' as const,
              })),
            ],
          },
          ...(messages.recommendations
            ? [
                {
                  type: 'box' as const,
                  layout: 'vertical' as const,
                  contents: [
                    {
                      type: 'text' as const,
                      text: '💡 建議',
                      size: 'sm' as const,
                      weight: 'bold' as const,
                      color: '#333333',
                      margin: 'lg' as const,
                    },
                    ...messages.recommendations.map((rec) => ({
                      type: 'text' as const,
                      text: `✓ ${rec}`,
                      size: 'sm' as const,
                      color: '#9b59b6',
                      wrap: true,
                      margin: 'sm' as const,
                    })),
                  ],
                },
              ]
            : []),
        ],
        paddingAll: '20px',
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '如有任何不適或疑問，請立即聯繫我們',
            size: 'xs',
            color: '#999999',
            align: 'center',
            wrap: true,
          },
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'uri',
              label: '聯絡診所',
              uri: 'tel:+886277051866',
            },
            color: '#e74c3c',
            margin: 'md',
          },
          {
            type: 'button',
            style: 'link',
            height: 'sm',
            action: {
              type: 'message',
              label: '我想預約回診',
              text: '預約回診',
            },
            margin: 'sm',
          },
        ],
        paddingAll: '20px',
      },
    },
  };
}

/**
 * 根據療程和天數獲取對應的關懷訊息
 */
function getAftercareMessageByDay(
  treatmentName: string,
  day: number
): {
  greeting: string;
  tips: string[];
  recommendations?: string[];
} {
  // 通用訊息
  const commonMessages: { [key: number]: any } = {
    1: {
      greeting: '感謝您選擇 FLOS 曜診所！療程後的第一天非常重要，請注意以下事項：',
      tips: [
        '避免碰觸治療部位',
        '保持治療部位清潔乾燥',
        '避免使用刺激性保養品',
        '多喝水，充足休息',
        '如有紅腫或不適屬正常現象',
      ],
    },
    3: {
      greeting: '療程後第三天，恢復狀況如何呢？',
      tips: [
        '可以開始使用溫和的保養品',
        '持續做好防曬（SPF50+）',
        '避免劇烈運動和高溫環境',
        '保持充足睡眠',
      ],
      recommendations: ['如需加強保濕，可考慮搭配保濕療程', '定期回診追蹤效果'],
    },
    7: {
      greeting: '一週過去了，您的肌膚狀況還好嗎？',
      tips: [
        '可以恢復正常保養程序',
        '持續做好防曬',
        '保持良好作息',
        '多攝取蔬果和水分',
      ],
      recommendations: [
        '療程效果會在 2-4 週逐漸顯現',
        '建議定期回診評估',
        '可諮詢後續保養療程',
      ],
    },
    14: {
      greeting: '兩週了！效果應該開始顯現了～',
      tips: ['持續做好日常保養', '防曬不可少', '保持健康生活習慣'],
      recommendations: [
        '如需加強效果，可預約下次療程',
        '定期保養能維持最佳狀態',
        '歡迎預約回診評估',
      ],
    },
  };

  // 特定療程的客製化訊息
  const treatmentSpecificMessages: { [key: string]: any } = {
    laser: {
      1: {
        tips: [
          '避免碰觸治療部位',
          '可能會有輕微結痂，請勿摳抓',
          '加強保濕和防曬（SPF50+）',
          '避免使用美白或酸類產品',
          '一週內避免泡溫泉、三溫暖',
        ],
      },
      7: {
        recommendations: [
          '結痂會自然脫落，請勿強行剝除',
          '建議 4-6 週後進行下次療程',
          '可搭配保濕或修復療程加強效果',
        ],
      },
    },
    dermapen: {
      1: {
        tips: [
          '前 24 小時避免碰水',
          '可能有輕微紅腫，屬正常現象',
          '使用診所提供的修復產品',
          '避免化妝和刺激性保養品',
          '一週內避免劇烈運動',
        ],
      },
      3: {
        recommendations: ['可開始使用溫和保養品', '建議搭配外泌體加速修復'],
      },
    },
    hair_removal: {
      1: {
        tips: [
          '治療部位可能微紅，屬正常現象',
          '避免使用刺激性產品',
          '加強保濕',
          '避免日曬和高溫環境',
          '一週內避免泡澡、游泳',
        ],
      },
      14: {
        recommendations: ['建議 4-6 週後進行下次療程', '完整療程需 6-8 次'],
      },
    },
    botox: {
      1: {
        tips: [
          '4 小時內避免平躺',
          '避免按摩治療部位',
          '避免劇烈運動',
          '不要做臉或使用高溫',
          '效果會在 3-7 天逐漸顯現',
        ],
      },
      7: {
        recommendations: ['效果可維持 4-6 個月', '建議定期回診評估'],
      },
    },
  };

  // 判斷療程類型
  let treatmentType = 'common';
  if (treatmentName.includes('雷射') || treatmentName.includes('皮秒')) {
    treatmentType = 'laser';
  } else if (treatmentName.includes('微針') || treatmentName.includes('DERMAPEN')) {
    treatmentType = 'dermapen';
  } else if (treatmentName.includes('除毛')) {
    treatmentType = 'hair_removal';
  } else if (treatmentName.includes('肉毒')) {
    treatmentType = 'botox';
  }

  // 合併通用和特定訊息
  const baseMessage = commonMessages[day] || commonMessages[1];
  const specificMessage = treatmentSpecificMessages[treatmentType]?.[day] || {};

  return {
    greeting: specificMessage.greeting || baseMessage.greeting,
    tips: specificMessage.tips || baseMessage.tips,
    recommendations: specificMessage.recommendations || baseMessage.recommendations,
  };
}

/**
 * 檢查並發送待發送的術後關懷訊息
 * 此函數應該由定時任務調用（例如每天執行一次）
 */
export async function checkAndSendScheduledAftercare(client: Client): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 查詢需要發送的關懷訊息
    const { data: schedules, error } = await supabase
      .from('aftercare_schedules')
      .select('*')
      .eq('status', 'scheduled');

    if (error) {
      console.error('[Aftercare] Failed to fetch schedules:', error);
      return;
    }

    for (const schedule of schedules || []) {
      const treatmentDate = new Date(schedule.treatment_date);
      const daysSince = Math.floor(
        (new Date().getTime() - treatmentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // 檢查是否需要在今天發送
      if (schedule.follow_up_days.includes(daysSince)) {
        await sendAftercareMessage(
          client,
          schedule.user_id,
          schedule.user_name,
          schedule.treatment_name,
          daysSince
        );

        // 如果是最後一次關懷，更新狀態為完成
        const maxDay = Math.max(...schedule.follow_up_days);
        if (daysSince >= maxDay) {
          await supabase
            .from('aftercare_schedules')
            .update({ status: 'completed' })
            .eq('id', schedule.id);
        }
      }
    }
  } catch (error) {
    console.error('[Aftercare] Error in checkAndSendScheduledAftercare:', error);
  }
}

/**
 * 預設的術後關懷排程（天數）
 */
export const DEFAULT_FOLLOWUP_DAYS = [1, 3, 7, 14];
