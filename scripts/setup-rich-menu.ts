import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const LIFF_ID = process.env.LIFF_ID || ''; // 需要先建立 LIFF App

if (!CHANNEL_ACCESS_TOKEN) {
  console.error('❌ LINE_CHANNEL_ACCESS_TOKEN is required');
  process.exit(1);
}

if (!LIFF_ID) {
  console.warn('⚠️  LIFF_ID not set, using placeholder. Please update after creating LIFF app.');
}

const richMenuObject = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: '邊美醬預約選單',
  chatBarText: '預約服務 💖',
  areas: [
    // 第一排 - 立即預約
    {
      bounds: {
        x: 0,
        y: 0,
        width: 833,
        height: 843,
      },
      action: {
        type: 'uri',
        uri: LIFF_ID ? `https://liff.line.me/${LIFF_ID}` : 'https://example.com',
      },
    },
    // 第一排 - 我的預約
    {
      bounds: {
        x: 833,
        y: 0,
        width: 834,
        height: 843,
      },
      action: {
        type: 'uri',
        uri: LIFF_ID ? `https://liff.line.me/${LIFF_ID}?view=my-appointments` : 'https://example.com',
      },
    },
    // 第一排 - 取消預約
    {
      bounds: {
        x: 1667,
        y: 0,
        width: 833,
        height: 843,
      },
      action: {
        type: 'uri',
        uri: LIFF_ID ? `https://liff.line.me/${LIFF_ID}?view=cancel` : 'https://example.com',
      },
    },
    // 第二排 - 醫師介紹
    {
      bounds: {
        x: 0,
        y: 843,
        width: 833,
        height: 843,
      },
      action: {
        type: 'message',
        text: '醫師',
      },
    },
    // 第二排 - 診所資訊
    {
      bounds: {
        x: 833,
        y: 843,
        width: 834,
        height: 843,
      },
      action: {
        type: 'message',
        text: '診所資訊',
      },
    },
    // 第二排 - 使用說明
    {
      bounds: {
        x: 1667,
        y: 843,
        width: 833,
        height: 843,
      },
      action: {
        type: 'message',
        text: '幫助',
      },
    },
  ],
};

async function createRichMenu() {
  try {
    console.log('📝 Creating Rich Menu...');
    
    // Step 1: Create Rich Menu
    const createResponse = await fetch('https://api.line.me/v2/bot/richmenu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(richMenuObject),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Failed to create rich menu: ${error}`);
    }

    const { richMenuId } = await createResponse.json() as { richMenuId: string };
    console.log(`✅ Rich Menu created: ${richMenuId}`);

    // Step 2: Upload Image
    console.log('📤 Uploading Rich Menu image...');
    const imagePath = path.join(__dirname, '../../yuemei-rich-menu.png');
    
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image not found at ${imagePath}`);
    }

    const imageBuffer = fs.readFileSync(imagePath);
    
    const uploadResponse = await fetch(
      `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'image/png',
          Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
        },
        body: imageBuffer,
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`Failed to upload image: ${error}`);
    }

    console.log('✅ Image uploaded successfully');

    // Step 3: Set as default Rich Menu
    console.log('🔧 Setting as default Rich Menu...');
    const setDefaultResponse = await fetch(
      `https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
        },
      }
    );

    if (!setDefaultResponse.ok) {
      const error = await setDefaultResponse.text();
      throw new Error(`Failed to set default rich menu: ${error}`);
    }

    console.log('✅ Rich Menu set as default');
    console.log('\n🎉 Rich Menu setup completed successfully!');
    console.log(`📋 Rich Menu ID: ${richMenuId}`);
    
    return richMenuId;
  } catch (error) {
    console.error('❌ Error setting up Rich Menu:', error);
    throw error;
  }
}

async function listRichMenus() {
  try {
    console.log('\n📋 Listing existing Rich Menus...');
    const response = await fetch('https://api.line.me/v2/bot/richmenu/list', {
      headers: {
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to list rich menus');
    }

    const data = await response.json() as { richmenus: any[] };
    console.log(`Found ${data.richmenus.length} Rich Menu(s):`);
    data.richmenus.forEach((menu) => {
      console.log(`  - ${menu.name} (ID: ${menu.richMenuId})`);
    });
  } catch (error) {
    console.error('❌ Error listing Rich Menus:', error);
  }
}

async function deleteAllRichMenus() {
  try {
    console.log('\n🗑️  Deleting all existing Rich Menus...');
    const response = await fetch('https://api.line.me/v2/bot/richmenu/list', {
      headers: {
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to list rich menus');
    }

    const data = await response.json() as { richmenus: any[] };
    
    for (const menu of data.richmenus) {
      const deleteResponse = await fetch(
        `https://api.line.me/v2/bot/richmenu/${menu.richMenuId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
          },
        }
      );

      if (deleteResponse.ok) {
        console.log(`✅ Deleted: ${menu.name} (${menu.richMenuId})`);
      } else {
        console.log(`❌ Failed to delete: ${menu.richMenuId}`);
      }
    }
  } catch (error) {
    console.error('❌ Error deleting Rich Menus:', error);
  }
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'create':
    createRichMenu();
    break;
  case 'list':
    listRichMenus();
    break;
  case 'delete-all':
    deleteAllRichMenus();
    break;
  case 'reset':
    deleteAllRichMenus().then(() => createRichMenu());
    break;
  default:
    console.log(`
Usage:
  npm run setup-richmenu create      - Create and set new Rich Menu
  npm run setup-richmenu list        - List all Rich Menus
  npm run setup-richmenu delete-all  - Delete all Rich Menus
  npm run setup-richmenu reset       - Delete all and create new
    `);
}
