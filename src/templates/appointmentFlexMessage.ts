import { FlexMessage } from '@line/bot-sdk';

interface AppointmentData {
  id: string;
  patientName: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
}

/**
 * 建立預約確認的 Flex Message
 */
export function createAppointmentConfirmationMessage(data: AppointmentData): FlexMessage {
  const { id, patientName, doctorName, doctorSpecialty, appointmentDate, appointmentTime, notes } = data;

  return {
    type: 'flex',
    altText: `預約確認 - ${doctorName}醫師`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '✨ 預約成功',
                color: '#ffffff',
                size: 'xl',
                weight: 'bold',
              },
              {
                type: 'text',
                text: 'FLOS 曜診所',
                color: '#ffffff99',
                size: 'sm',
                margin: 'xs',
              },
            ],
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
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '患者姓名',
                    color: '#aaaaaa',
                    size: 'sm',
                    flex: 2,
                  },
                  {
                    type: 'text',
                    text: patientName,
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 5,
                    weight: 'bold',
                  },
                ],
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '預約醫師',
                    color: '#aaaaaa',
                    size: 'sm',
                    flex: 2,
                  },
                  {
                    type: 'text',
                    text: `${doctorName} - ${doctorSpecialty}`,
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 5,
                    weight: 'bold',
                  },
                ],
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '預約日期',
                    color: '#aaaaaa',
                    size: 'sm',
                    flex: 2,
                  },
                  {
                    type: 'text',
                    text: appointmentDate,
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 5,
                    weight: 'bold',
                  },
                ],
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '預約時間',
                    color: '#aaaaaa',
                    size: 'sm',
                    flex: 2,
                  },
                  {
                    type: 'text',
                    text: appointmentTime,
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 5,
                    weight: 'bold',
                  },
                ],
              },
              ...(notes
                ? [
                    {
                      type: 'box' as const,
                      layout: 'baseline' as const,
                      spacing: 'sm',
                      contents: [
                        {
                          type: 'text' as const,
                          text: '備註',
                          color: '#aaaaaa',
                          size: 'sm' as const,
                          flex: 2,
                        },
                        {
                          type: 'text' as const,
                          text: notes,
                          wrap: true,
                          color: '#666666',
                          size: 'sm' as const,
                          flex: 5,
                        },
                      ],
                    },
                  ]
                : []),
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
                text: '💖 提醒事項',
                size: 'md',
                weight: 'bold',
                color: '#9b59b6',
              },
              {
                type: 'text',
                text: '• 請提前 10 分鐘到診所報到\n• 請攜帶健保卡及相關證件\n• 如需取消或更改，請提前通知',
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
              label: '查看我的預約',
              uri: `https://liff.line.me/2008492658-mpyqvyoe?action=view&id=${id}`,
            },
            color: '#9b59b6',
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'postback',
              label: '取消預約',
              data: `action=cancel_appointment&id=${id}`,
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
 * 建立醫師列表的 Flex Message (Carousel)
 */
export function createDoctorListMessage(doctors: any[]): FlexMessage {
  const bubbles = doctors.slice(0, 10).map((doctor) => ({
    type: 'bubble' as const,
    size: 'micro' as const,
    hero: {
      type: 'image' as const,
      url: doctor.photo_url || 'https://via.placeholder.com/300x200?text=Doctor',
      size: 'full' as const,
      aspectMode: 'cover' as const,
      aspectRatio: '320:213' as const,
    },
    body: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'text' as const,
          text: doctor.name,
          weight: 'bold' as const,
          size: 'md' as const,
          wrap: true,
        },
        {
          type: 'text' as const,
          text: doctor.specialty,
          size: 'xs' as const,
          color: '#9b59b6',
          margin: 'xs' as const,
          wrap: true,
        },
        {
          type: 'text' as const,
          text: doctor.description || '專業醫療服務',
          size: 'xxs' as const,
          color: '#999999',
          margin: 'md' as const,
          wrap: true,
        },
      ],
      spacing: 'sm' as const,
      paddingAll: '13px' as const,
    },
    footer: {
      type: 'box' as const,
      layout: 'vertical' as const,
      spacing: 'sm' as const,
      contents: [
        {
          type: 'button' as const,
          style: 'primary' as const,
          height: 'sm' as const,
          action: {
            type: 'uri' as const,
            label: '立即預約',
            uri: `https://liff.line.me/2008492658-mpyqvyoe?doctor=${doctor.id}`,
          },
          color: '#9b59b6',
        },
      ],
      flex: 0,
    },
  }));

  return {
    type: 'flex',
    altText: '醫師列表',
    contents: {
      type: 'carousel',
      contents: bubbles,
    },
  };
}
