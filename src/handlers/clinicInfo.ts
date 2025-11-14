import { TextMessage, FlexMessage } from '@line/bot-sdk';

/**
 * 建立診所資訊的 Flex Message
 */
export function createClinicInfoMessage(): FlexMessage {
  return {
    type: 'flex',
    altText: 'FLOS 曜診所資訊',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'FLOS 曜診所',
            color: '#ffffff',
            size: 'xl',
            weight: 'bold',
          },
          {
            type: 'text',
            text: '專業醫美 · 用心服務',
            color: '#ffffff99',
            size: 'sm',
            margin: 'xs',
          },
        ],
        paddingAll: '20px',
        backgroundColor: '#9b59b6',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'md',
            contents: [
              // 地址
              {
                type: 'box',
                layout: 'horizontal',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '📍',
                    size: 'xl',
                    flex: 0,
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    spacing: 'xs',
                    contents: [
                      {
                        type: 'text',
                        text: '診所地址',
                        color: '#aaaaaa',
                        size: 'xs',
                      },
                      {
                        type: 'text',
                        text: '台北市信義區信義路五段7號',
                        size: 'sm',
                        color: '#666666',
                        wrap: true,
                        weight: 'bold',
                      },
                    ],
                  },
                ],
              },
              // 電話
              {
                type: 'box',
                layout: 'horizontal',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '📞',
                    size: 'xl',
                    flex: 0,
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    spacing: 'xs',
                    contents: [
                      {
                        type: 'text',
                        text: '聯絡電話',
                        color: '#aaaaaa',
                        size: 'xs',
                      },
                      {
                        type: 'text',
                        text: '(02) 2345-6789',
                        size: 'sm',
                        color: '#666666',
                        weight: 'bold',
                      },
                    ],
                  },
                ],
              },
              // 營業時間
              {
                type: 'box',
                layout: 'horizontal',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '🕐',
                    size: 'xl',
                    flex: 0,
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    spacing: 'xs',
                    contents: [
                      {
                        type: 'text',
                        text: '營業時間',
                        color: '#aaaaaa',
                        size: 'xs',
                      },
                      {
                        type: 'text',
                        text: '週一至週五 09:00 - 21:00\n週六 09:00 - 18:00\n週日公休',
                        size: 'sm',
                        color: '#666666',
                        wrap: true,
                        weight: 'bold',
                      },
                    ],
                  },
                ],
              },
              // 交通資訊
              {
                type: 'box',
                layout: 'horizontal',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '🚇',
                    size: 'xl',
                    flex: 0,
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    spacing: 'xs',
                    contents: [
                      {
                        type: 'text',
                        text: '交通方式',
                        color: '#aaaaaa',
                        size: 'xs',
                      },
                      {
                        type: 'text',
                        text: '捷運市政府站 3 號出口\n步行約 5 分鐘',
                        size: 'sm',
                        color: '#666666',
                        wrap: true,
                        weight: 'bold',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'separator',
            margin: 'xl',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            contents: [
              {
                type: 'text',
                text: '💖 服務項目',
                size: 'md',
                weight: 'bold',
                color: '#9b59b6',
              },
              {
                type: 'text',
                text: '• 醫美療程\n• 皮膚科診療\n• 微整形\n• 雷射治療\n• 美容諮詢',
                size: 'xs',
                color: '#666666',
                margin: 'md',
                wrap: true,
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'uri',
              label: '📍 Google 地圖',
              uri: 'https://maps.google.com/?q=台北市信義區信義路五段7號',
            },
            color: '#9b59b6',
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'uri',
              label: '📞 撥打電話',
              uri: 'tel:02-2345-6789',
            },
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [],
            margin: 'sm',
          },
        ],
        flex: 0,
      },
    },
  };
}

/**
 * 取得診所資訊的簡單文字訊息
 */
export function getClinicInfoText(): string {
  return `📍 FLOS 曜診所

🏥 地址：台北市信義區信義路五段7號
📞 電話：(02) 2345-6789

🕐 營業時間：
週一至週五 09:00 - 21:00
週六 09:00 - 18:00
週日公休

🚇 交通方式：
捷運市政府站 3 號出口
步行約 5 分鐘

💖 歡迎預約諮詢！`;
}
