import { Client, FlexMessage } from '@line/bot-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load treatments database
const treatmentsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/treatments.json'), 'utf-8')
);

interface TreatmentRecommendation {
  categoryName: string;
  treatments: Array<{
    name: string;
    description: string;
    benefits: string[];
    suitable_for: string[];
  }>;
  reason: string;
}

/**
 * AI 智能諮詢處理器
 * 根據客戶需求推薦適合的療程，遵守醫美法規不顯示價格
 */
export async function handleAIConsultation(
  client: Client,
  replyToken: string,
  userMessage: string,
  userId: string
): Promise<void> {
  try {
    // 分析客戶需求
    const recommendations = await analyzeAndRecommend(userMessage);

    if (recommendations.length === 0) {
      // 沒有找到適合的療程，提供通用回覆
      await client.replyMessage(replyToken, {
        type: 'text',
        text: '感謝您的諮詢！💖\n\n為了給您最專業的建議，建議您：\n\n1️⃣ 點選下方選單「立即預約」預約諮詢\n2️⃣ 或輸入「醫師」查看我們的專業醫師團隊\n3️⃣ 輸入「診所資訊」了解更多\n\n我們的專業團隊會根據您的需求，提供最適合的療程建議！✨',
      });
      return;
    }

    // 生成推薦 Flex Message
    const flexMessage = createRecommendationFlexMessage(recommendations);

    await client.replyMessage(replyToken, flexMessage);
  } catch (error) {
    console.error('[AI Consultation] Error:', error);
    await client.replyMessage(replyToken, {
      type: 'text',
      text: '抱歉，系統處理時發生錯誤，請稍後再試或直接聯繫我們 🙏',
    });
  }
}

/**
 * 分析客戶訊息並推薦療程
 */
async function analyzeAndRecommend(userMessage: string): Promise<TreatmentRecommendation[]> {
  const recommendations: TreatmentRecommendation[] = [];
  const keywords = treatmentsData.consultation_guidelines.keywords_mapping;

  // 關鍵字匹配
  const matchedCategories = new Set<string>();

  for (const [keyword, categoryIds] of Object.entries(keywords)) {
    if (userMessage.includes(keyword)) {
      (categoryIds as string[]).forEach((id) => matchedCategories.add(id));
    }
  }

  // 如果沒有匹配到關鍵字，嘗試模糊匹配
  if (matchedCategories.size === 0) {
    // 檢查常見問題
    if (
      userMessage.includes('暗沉') ||
      userMessage.includes('黑') ||
      userMessage.includes('白')
    ) {
      matchedCategories.add('laser');
      matchedCategories.add('iv_drip');
    }
    if (userMessage.includes('皺') || userMessage.includes('紋')) {
      matchedCategories.add('botox');
      matchedCategories.add('rf_ultrasound');
    }
    if (userMessage.includes('鬆') || userMessage.includes('垂')) {
      matchedCategories.add('rf_ultrasound');
    }
    if (userMessage.includes('毛') && !userMessage.includes('毛孔')) {
      matchedCategories.add('hair_removal');
    }
  }

  // 生成推薦
  matchedCategories.forEach((categoryId) => {
    const category = treatmentsData.categories.find((c: any) => c.id === categoryId);
    if (category) {
      recommendations.push({
        categoryName: category.name,
        treatments: category.treatments.slice(0, 3), // 只推薦前 3 個療程
        reason: generateRecommendationReason(userMessage, category),
      });
    }
  });

  return recommendations.slice(0, 2); // 最多推薦 2 個分類
}

/**
 * 生成推薦理由
 */
function generateRecommendationReason(userMessage: string, category: any): string {
  const reasons: { [key: string]: string } = {
    hydration: '水光針療程能深層補水，改善肌膚乾燥與暗沉問題',
    dermapen: '微針療程能有效改善痘疤、毛孔粗大與膚質不均',
    hair_removal: '專業雷射除毛，安全有效，讓您擁有光滑肌膚',
    botox: '肉毒注射能改善動態紋，讓您看起來更年輕',
    hair_care: '專業育髮療程，改善落髮與頭皮問題',
    laser: '雷射療程能有效淡斑、美白，改善膚色不均',
    rf_ultrasound: '電音波療程能緊緻拉提，改善鬆弛與下垂',
    facial: '專業臉部保養，深層清潔與保濕',
    iv_drip: '客製化點滴療程，補充營養與促進健康',
    body_sculpting: '體雕療程能雕塑體態，緊緻肌膚',
    curejet: '無針霧化導入，改善痘疤與毛孔',
    emsw: '體外震波療程，改善男性功能障礙',
  };

  return reasons[category.id] || '專業療程，為您量身打造';
}

/**
 * 建立推薦 Flex Message
 */
function createRecommendationFlexMessage(
  recommendations: TreatmentRecommendation[]
): FlexMessage {
  const bubbles = recommendations.map((rec) => ({
    type: 'bubble' as const,
    size: 'mega' as const,
    header: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'text' as const,
          text: '💖 為您推薦',
          color: '#ffffff',
          size: 'sm' as const,
          weight: 'bold' as const,
        },
        {
          type: 'text' as const,
          text: rec.categoryName,
          color: '#ffffff',
          size: 'xl' as const,
          weight: 'bold' as const,
          margin: 'sm',
        },
      ],
      backgroundColor: '#9b59b6',
      paddingAll: '20px',
    },
    body: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'text' as const,
          text: rec.reason,
          color: '#666666',
          size: 'sm' as const,
          wrap: true,
          margin: 'md',
        },
        {
          type: 'separator' as const,
          margin: 'lg',
        },
        ...rec.treatments.flatMap((treatment, index) => [
          {
            type: 'box' as const,
            layout: 'vertical' as const,
            contents: [
              {
                type: 'text' as const,
                text: treatment.name,
                size: 'md' as const,
                weight: 'bold' as const,
                color: '#9b59b6',
                margin: 'lg',
              },
              {
                type: 'text' as const,
                text: treatment.description,
                size: 'sm' as const,
                color: '#666666',
                wrap: true,
                margin: 'sm',
              },
              {
                type: 'box' as const,
                layout: 'vertical' as const,
                contents: treatment.benefits.slice(0, 3).map((benefit) => ({
                  type: 'text' as const,
                  text: `✓ ${benefit}`,
                  size: 'xs' as const,
                  color: '#999999',
                  margin: 'xs',
                })),
                margin: 'sm',
              },
            ],
            margin: 'md',
          },
          ...(index < rec.treatments.length - 1
            ? [{ type: 'separator' as const, margin: 'md' }]
            : []),
        ]),
      ],
      paddingAll: '20px',
    },
    footer: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'text' as const,
          text: '💡 價格與詳細資訊',
          size: 'xs' as const,
          color: '#999999',
          align: 'center' as const,
        },
        {
          type: 'text' as const,
          text: '依照醫美法規，請來店諮詢',
          size: 'xs' as const,
          color: '#999999',
          align: 'center' as const,
          margin: 'xs',
        },
        {
          type: 'button' as const,
          style: 'primary' as const,
          height: 'sm' as const,
          action: {
            type: 'uri' as const,
            label: '立即預約諮詢',
            uri: `https://liff.line.me/${process.env.LIFF_ID || '2008492658-mpyqvyoe'}`,
          },
          color: '#9b59b6',
          margin: 'md',
        },
        {
          type: 'button' as const,
          style: 'link' as const,
          height: 'sm' as const,
          action: {
            type: 'message' as const,
            label: '查看更多療程',
            text: '療程介紹',
          },
          margin: 'sm',
        },
      ],
      paddingAll: '20px',
    },
  }));

  return {
    type: 'flex',
    altText: '為您推薦的療程',
    contents: {
      type: 'carousel',
      contents: bubbles,
    },
  };
}

/**
 * 檢查是否為諮詢類訊息
 */
export function isConsultationMessage(message: string): boolean {
  const consultationKeywords = [
    '推薦',
    '建議',
    '適合',
    '想要',
    '需要',
    '改善',
    '治療',
    '美白',
    '除斑',
    '保濕',
    '抗老',
    '除毛',
    '痘疤',
    '毛孔',
    '緊緻',
    '拉提',
    '瘦臉',
    '除皺',
    '育髮',
    '體雕',
    '減重',
    '暗沉',
    '皺紋',
    '鬆弛',
    '下垂',
  ];

  return consultationKeywords.some((keyword) => message.includes(keyword));
}
