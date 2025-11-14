import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

export const config = {
  line: {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  },
  supabase: {
    url: process.env.SUPABASE_URL || 'https://clzjdlykhjwrlksyjlfz.supabase.co',
    key: process.env.SUPABASE_KEY || '',
  },
  jsonbin: {
    apiKey: process.env.JSONBIN_API_KEY || '',
    calendarBinId: process.env.JSONBIN_CALENDAR_ID || '',
  },
  server: {
    port: parseInt(process.env.PORT || '8080'),
  },
  manus: {
    apiKey: process.env.MANUS_API_KEY || '',
  },
};

export function validateConfig() {
  const required = ['LINE_CHANNEL_ACCESS_TOKEN', 'LINE_CHANNEL_SECRET', 'SUPABASE_KEY'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
  }
  console.log('✅ Configuration loaded successfully');
}
