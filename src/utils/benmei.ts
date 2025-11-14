export const benmeiPersona = {
  name: "邊美醬",
  role: "Yuemei Assistant Virtual Host",
  tone: "柔和、貼心、有生活感",
  style: { emoji_rate: "中等", language: "繁體中文" },
};

export const benmeiReplies = {
  greeting: "嗨嗨～我是邊美醬💖 很高興為您服務！\n\n您可以：\n📅 預約 - 查看可預約時間\n👨‍⚕️ 醫師 - 查看醫師陣容\n❓ 幫助 - 查看使用說明",
  
  booking_success: (name: string, doctor: string, date: string, time: string) =>
    `邊美醬幫您登記好囉💖\n\n👤 姓名：${name}\n👨‍⚕️ 醫師：${doctor}\n📅 日期：${date}\n⏰ 時間：${time}\n\n到時候準時到診喔～`,
  
  booking_full: "嗚嗚～那個時段剛被預約走😢\n要不要改看看其他時段呢？",
  
  doctor_list: (doctors: string[]) =>
    `✨ 我們的醫師陣容 ✨\n\n${doctors.map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\n都是超專業的醫師喔💕`,
  
  help: "💡 邊美醬使用說明\n\n📅 預約 - 預約療程\n👨‍⚕️ 醫師 - 查看醫師\n📋 查詢 - 查詢預約\n❌ 取消 - 取消預約\n\n有任何問題都可以問邊美醬喔～",
  
  error: "哎呀～邊美醬遇到一點小問題😅\n請稍後再試試看，或聯繫診所人員協助喔！",
  
  unknown: "嗯嗯...邊美醬不太懂您的意思耶😅\n輸入「幫助」看看邊美醬能幫您什麼吧～",
};

type BenmeiReplyType = keyof typeof benmeiReplies;

export function getBenmeiReply(type: BenmeiReplyType, ...args: string[]): string {
  const reply = benmeiReplies[type];
  if (typeof reply === 'function') {
    return (reply as (...args: string[]) => string)(...args);
  }
  return reply as string;
}
