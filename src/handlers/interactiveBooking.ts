import { Client, FlexMessage } from '@line/bot-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const treatmentsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/treatments.json'), 'utf-8')
);

/**
 * 互動式預約流程處理器
 * 參考舊系統的精美 Flex Message 設計
 */

/**
 * Step 1: 顯示療程分類選擇
 */
export async function showTreatmentCategories(
  client: Client,
  replyToken: string
): Promise<void> {
  const flexMessage = createCategorySelectionFlex();
  await client.replyMessage(replyToken, flexMessage);
}

/**
 * Step 2: 顯示特定分類的療程列表
 */
export async function showCategoryTreatments(
  client: Client,
  replyToken: string,
  categoryId: string
): Promise<void> {
  const category = treatmentsData.categories.find((c: any) => c.id === categoryId);

  if (!category) {
    await client.replyMessage(replyToken, {
      type: 'text',
      text: '找不到該療程分類，請重新選擇',
    });
    return;
  }

  const flexMessage = createTreatmentListFlex(category);
  await client.replyMessage(replyToken, flexMessage);
}

/**
 * 建立療程分類選擇 Flex Message
 */
function createCategorySelectionFlex(): FlexMessage {
  const categories = treatmentsData.categories.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
  }));

  // 分成兩頁顯示（每頁最多 8 個分類）
  const page1Categories = categories.slice(0, 8);
  const page2Categories = categories.slice(8);

  const createCategoryButtons = (cats: any[]) =>
    cats.map((cat: any) => ({
      type: 'button' as const,
      style: 'primary' as const,
      height: 'sm' as const,
      action: {
        type: 'message' as const,
        label: cat.name.replace(/[✦◆]/g, '').trim(),
        text: `查看療程:${cat.id}`,
      },
      color: '#9b59b6',
      margin: 'sm',
    }));

  const bubble1 = {
    type: 'bubble' as const,
    size: 'mega' as const,
    header: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'text' as const,
          text: '🏥 療程選擇 (1/3)',
          color: '#ffffff',
          size: 'xl' as const,
          weight: 'bold' as const,
        },
        {
          type: 'text' as const,
          text: '請選擇您感興趣的療程項目',
          color: '#ffffff',
          size: 'sm' as const,
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
          text: '基礎保養 & 注射療程',
          size: 'md' as const,
          weight: 'bold' as const,
          color: '#9b59b6',
          margin: 'md',
        },
        ...createCategoryButtons(page1Categories),
      ],
      paddingAll: '20px',
    },
    footer: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'text' as const,
          text: '💡 更多療程請往右滑動',
          size: 'xs' as const,
          color: '#999999',
          align: 'center' as const,
        },
      ],
      paddingAll: '15px',
    },
  };

  const bubble2 = {
    type: 'bubble' as const,
    size: 'mega' as const,
    header: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'text' as const,
          text: '🏥 療程選擇 (2/3)',
          color: '#ffffff',
          size: 'xl' as const,
          weight: 'bold' as const,
        },
        {
          type: 'text' as const,
          text: '請選擇您感興趣的療程項目',
          color: '#ffffff',
          size: 'sm' as const,
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
          text: '進階療程 & 體雕',
          size: 'md' as const,
          weight: 'bold' as const,
          color: '#9b59b6',
          margin: 'md',
        },
        ...createCategoryButtons(page2Categories),
      ],
      paddingAll: '20px',
    },
  };

  const bubble3 = {
    type: 'bubble' as const,
    size: 'mega' as const,
    header: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'text' as const,
          text: '💬 需要協助？',
          color: '#ffffff',
          size: 'xl' as const,
          weight: 'bold' as const,
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
          text: '不確定選擇哪個療程？',
          size: 'md' as const,
          weight: 'bold' as const,
          color: '#333333',
          margin: 'md',
        },
        {
          type: 'text' as const,
          text: '您可以：',
          size: 'sm' as const,
          color: '#666666',
          margin: 'md',
        },
        {
          type: 'text' as const,
          text: '✓ 直接告訴我您的需求\n✓ 輸入「醫師」查看專業團隊\n✓ 輸入「診所資訊」了解更多',
          size: 'sm' as const,
          color: '#666666',
          wrap: true,
          margin: 'sm',
        },
        {
          type: 'button' as const,
          style: 'primary' as const,
          height: 'sm' as const,
          action: {
            type: 'message' as const,
            label: '我想諮詢',
            text: '我想諮詢適合的療程',
          },
          color: '#e74c3c',
          margin: 'lg',
        },
        {
          type: 'button' as const,
          style: 'link' as const,
          height: 'sm' as const,
          action: {
            type: 'message' as const,
            label: '查看醫師團隊',
            text: '醫師',
          },
          margin: 'sm',
        },
      ],
      paddingAll: '20px',
    },
  };

  return {
    type: 'flex',
    altText: '請選擇療程分類',
    contents: {
      type: 'carousel',
      contents: [bubble1, bubble2, bubble3],
    },
  };
}

/**
 * 建立療程列表 Flex Message
 */
function createTreatmentListFlex(category: any): FlexMessage {
  const treatments = category.treatments.slice(0, 10); // 最多顯示 10 個療程

  const createTreatmentBox = (treatment: any) => ({
    type: 'box' as const,
    layout: 'vertical' as const,
    contents: [
      {
        type: 'text' as const,
        text: treatment.name,
        size: 'md' as const,
        weight: 'bold' as const,
        color: '#9b59b6',
      },
      {
        type: 'text' as const,
        text: treatment.description,
        size: 'sm' as const,
        color: '#666666',
        wrap: true,
        margin: 'xs',
      },
      ...(treatment.benefits
        ? [
            {
              type: 'box' as const,
              layout: 'vertical' as const,
              contents: treatment.benefits.slice(0, 3).map((benefit: string) => ({
                type: 'text' as const,
                text: `✓ ${benefit}`,
                size: 'xs' as const,
                color: '#999999',
                margin: 'xs',
              })),
              margin: 'sm',
            },
          ]
        : []),
      {
        type: 'button' as const,
        style: 'primary' as const,
        height: 'sm' as const,
        action: {
          type: 'uri' as const,
          label: '預約此療程',
          uri: `https://liff.line.me/${process.env.LIFF_ID || '2008492658-mpyqvyoe'}?treatment=${treatment.id}`,
        },
        color: '#9b59b6',
        margin: 'md',
      },
    ],
    paddingAll: '15px',
    backgroundColor: '#f8f8f8',
    cornerRadius: '10px',
    margin: 'md',
  });

  const bubble = {
    type: 'bubble' as const,
    size: 'mega' as const,
    header: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'text' as const,
          text: category.name,
          color: '#ffffff',
          size: 'xl' as const,
          weight: 'bold' as const,
        },
        {
          type: 'text' as const,
          text: category.description,
          color: '#ffffff',
          size: 'sm' as const,
          wrap: true,
          margin: 'sm',
        },
      ],
      backgroundColor: '#9b59b6',
      paddingAll: '20px',
    },
    body: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: treatments.map(createTreatmentBox),
      paddingAll: '20px',
    },
    footer: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'text' as const,
          text: '💡 價格與詳細資訊請來店諮詢',
          size: 'xs' as const,
          color: '#999999',
          align: 'center' as const,
        },
        {
          type: 'button' as const,
          style: 'link' as const,
          height: 'sm' as const,
          action: {
            type: 'message' as const,
            label: '返回療程分類',
            text: '療程介紹',
          },
          margin: 'md',
        },
      ],
      paddingAll: '15px',
    },
  };

  return {
    type: 'flex',
    altText: `${category.name} - 療程列表`,
    contents: bubble,
  };
}

/**
 * 解析療程查詢訊息
 */
export function parseTreatmentQuery(message: string): string | null {
  const match = message.match(/查看療程:(\w+)/);
  return match ? match[1] : null;
}
