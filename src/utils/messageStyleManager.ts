/**
 * Message Style Manager
 * 管理不同风格的提醒文案
 */

export type MessageStyle = 'professional' | 'cute' | 'motivational' | 'humorous' | 'minimal'
export type MessageContext = 'first' | 'repeat' | 'late' | 'veryLate'

/**
 * 文案变量接口
 */
export interface MessageVariables {
  streak?: number // 连续天数
  time?: string // 当前时间
  deadline?: string // 截止时间
  ruleName?: string // 规则名称
  [key: string]: string | number | undefined
}

/**
 * 双语文案接口
 */
export interface BilingualMessage {
  en: string[]
  zh: string[]
}

/**
 * 文案风格管理器类
 */
export class MessageStyleManager {
  /**
   * 获取随机文案
   * @param style 文案风格
   * @param context 使用场景
   * @param variables 变量对象
   * @param lang 语言 ('en' | 'zh' | 'auto')
   * @returns 文案字符串
   */
  getRandomMessage(
    style: MessageStyle,
    context: MessageContext,
    variables: MessageVariables = {},
    lang: 'en' | 'zh' | 'auto' = 'auto',
  ): string {
    const messages = MESSAGE_TEMPLATES[style][context]

    // 自动检测语言
    const detectedLang = lang === 'auto' ? this.detectLanguage() : lang

    // 随机选择一条文案
    const messageList = messages[detectedLang]
    const randomMessage = messageList[Math.floor(Math.random() * messageList.length)]

    // 替换变量
    return this.replaceVariables(randomMessage, variables)
  }

  /**
   * 替换文案中的变量
   * @param text 文案模板
   * @param variables 变量对象
   * @returns 替换后的文案
   */
  private replaceVariables(text: string, variables: MessageVariables): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const value = variables[key]
      return value !== undefined ? String(value) : `{{${key}}}`
    })
  }

  /**
   * 检测浏览器语言
   * @returns 'en' | 'zh'
   */
  private detectLanguage(): 'en' | 'zh' {
    const browserLang = navigator.language || navigator.languages?.[0] || 'en'
    return browserLang.startsWith('zh') ? 'zh' : 'en'
  }

  /**
   * 根据提醒次数判断使用场景
   * @param reminderCount 提醒次数
   * @returns 使用场景
   */
  static getContextByReminderCount(reminderCount: number): MessageContext {
    if (reminderCount === 0) return 'first'
    if (reminderCount <= 2) return 'repeat'
    if (reminderCount <= 5) return 'late'
    return 'veryLate'
  }
}

/**
 * 文案模板库
 * 每种风格包含4种场景，每种场景包含中英文各10条文案
 */
export const MESSAGE_TEMPLATES: Record<MessageStyle, Record<MessageContext, BilingualMessage>> = {
  // 专业严肃风格
  professional: {
    first: {
      en: [
        'Reminder: Please update your daily routine',
        'Time to complete your routine task',
        'Daily routine check-in required',
        'Please submit your routine update',
        'Routine task pending - action required',
        'Your daily routine awaits completion',
        'Scheduled reminder: Daily routine',
        'Please attend to your routine task',
        'Daily routine update needed',
        'Time-sensitive: Routine check-in',
      ],
      zh: [
        '提醒：请更新今日例行任务',
        '是时候完成您的例行任务了',
        '需要进行今日例行任务检查',
        '请提交您的例行任务更新',
        '例行任务待处理 - 需要操作',
        '您的每日例行任务等待完成',
        '定时提醒：每日例行任务',
        '请处理您的例行任务',
        '需要更新每日例行任务',
        '时效性任务：例行检查',
      ],
    },
    repeat: {
      en: [
        'Second reminder: Daily routine still pending',
        'Follow-up: Please complete your routine',
        'Gentle reminder: Routine task outstanding',
        'Your routine task requires attention',
        'Reminder: Routine completion pending',
        'Please prioritize your daily routine',
        'Follow-up reminder: Daily task',
        'Your routine is awaiting completion',
        'Reminder: Daily routine not yet submitted',
        'Please complete your pending routine',
      ],
      zh: [
        '第二次提醒：每日例行任务仍待处理',
        '跟进：请完成您的例行任务',
        '温馨提醒：例行任务尚未完成',
        '您的例行任务需要关注',
        '提醒：例行任务完成待定',
        '请优先处理您的每日例行任务',
        '跟进提醒：每日任务',
        '您的例行任务正在等待完成',
        '提醒：每日例行任务尚未提交',
        '请完成您的待处理例行任务',
      ],
    },
    late: {
      en: [
        'Important: Routine task overdue',
        'Urgent reminder: Please complete your routine',
        'Deadline approaching: Routine task',
        'Action required: Routine completion overdue',
        'Critical reminder: Daily routine pending',
        'Please complete your routine immediately',
        'Time-critical: Routine task outstanding',
        'Overdue: Daily routine completion required',
        'Immediate attention needed: Routine task',
        'Final reminder: Complete your routine',
      ],
      zh: [
        '重要：例行任务已超时',
        '紧急提醒：请完成您的例行任务',
        '截止时间临近：例行任务',
        '需要操作：例行任务完成超时',
        '关键提醒：每日例行任务待处理',
        '请立即完成您的例行任务',
        '时间紧迫：例行任务尚未完成',
        '超时：需要完成每日例行任务',
        '需要立即关注：例行任务',
        '最后提醒：完成您的例行任务',
      ],
    },
    veryLate: {
      en: [
        'CRITICAL: Routine task significantly overdue',
        'FINAL NOTICE: Complete your routine now',
        'URGENT: Immediate action required',
        'Routine task critically overdue',
        'ALERT: Please complete your routine ASAP',
        'LAST REMINDER: Routine completion required',
        'HIGH PRIORITY: Routine task pending',
        'DEADLINE PASSED: Complete routine immediately',
        'CRITICAL ACTION REQUIRED: Daily routine',
        'FINAL WARNING: Routine task overdue',
      ],
      zh: [
        '关键：例行任务严重超时',
        '最终通知：现在完成您的例行任务',
        '紧急：需要立即操作',
        '例行任务严重超时',
        '警报：请尽快完成您的例行任务',
        '最后提醒：需要完成例行任务',
        '高优先级：例行任务待处理',
        '截止时间已过：立即完成例行任务',
        '关键操作需要：每日例行任务',
        '最终警告：例行任务超时',
      ],
    },
  },

  // 可爱温柔风格
  cute: {
    first: {
      en: [
        "Hi there! Time to write today's plan! 🌸",
        'Good morning! Ready to plan your day? ✨',
        "Hey! Let's get today's routine done! 💫",
        'Time to shine! Your daily routine awaits~ 🌟',
        'Sweet reminder: Daily routine time! 🎀',
        'Hello! Your routine is calling~ 🌈',
        'Rise and shine! Time for your routine! ☀️',
        'Gentle nudge: Daily routine check! 💝',
        "Hey friend! Let's do this routine~ 🦋",
        'Morning! Time to tackle your routine! 🌺',
      ],
      zh: [
        '主人早上好呀~ 该写今天的计划啦 🌸',
        '新的一天开始了，规划一下吧！✨',
        '嗨！让我们完成今天的例行任务吧！💫',
        '闪耀时刻！您的每日例行任务在等待哦~ 🌟',
        '温柔提醒：每日例行任务时间到！🎀',
        '你好呀！您的例行任务在召唤~ 🌈',
        '起床啦！例行任务时间！☀️',
        '轻轻推一下：每日例行任务检查！💝',
        '嘿朋友！让我们一起完成这个例行任务~ 🦋',
        '早安！是时候处理您的例行任务了！🌺',
      ],
    },
    repeat: {
      en: [
        'Pssst... Your routine is still waiting~ 🐱',
        "Gentle reminder: Don't forget your routine! 💕",
        'Hey there! Still time for your routine~ ✨',
        'Your routine is getting lonely... 🥺',
        'Sweet reminder #2: Routine time! 🌸',
        'Knock knock! Your routine here~ 🚪',
        "Still here! Let's do that routine~ 💫",
        'Just checking in~ Routine time! 🌟',
        'Friendly reminder: Routine awaits! 🦄',
        'Your routine misses you~ 💝',
      ],
      zh: [
        '悄悄提醒~ 您的例行任务还在等待哦~ 🐱',
        '温柔提醒：别忘了您的例行任务！💕',
        '嘿！还有时间完成您的例行任务~ ✨',
        '您的例行任务感到孤单了... 🥺',
        '甜蜜提醒 #2：例行任务时间！🌸',
        '敲敲门！您的例行任务在这里~ 🚪',
        '还在这里！让我们完成那个例行任务~ 💫',
        '只是来看看~ 例行任务时间！🌟',
        '友好提醒：例行任务在等待！🦄',
        '您的例行任务想念您~ 💝',
      ],
    },
    late: {
      en: [
        'Uh oh! Routine getting late~ Please complete! 😣',
        'Time is ticking! Your routine needs you! ⏰',
        'Getting urgent~ Please finish your routine! 🙏',
        'Your routine is worrying now~ 😰',
        'Please please! Complete your routine soon! 💦',
        "Deadline approaching! Let's do this! 💪",
        'Your routine is anxious~ Help it! 😓',
        'Almost late! Please complete now! ⚡',
        'Hurry up please~ Routine time! 🏃',
        'Getting nervous~ Please submit routine! 😖',
      ],
      zh: [
        '哎呀！例行任务快迟了~ 请完成！😣',
        '时间在流逝！您的例行任务需要您！⏰',
        '变得紧急了~ 请完成您的例行任务！🙏',
        '您的例行任务现在很担心~ 😰',
        '拜托拜托！尽快完成您的例行任务！💦',
        '截止时间临近！让我们做这件事！💪',
        '您的例行任务很焦虑~ 帮帮它！😓',
        '快迟到了！请现在完成！⚡',
        '请快点~ 例行任务时间！🏃',
        '开始紧张了~ 请提交例行任务！😖',
      ],
    },
    veryLate: {
      en: [
        'EMERGENCY! Routine very very late! 🚨',
        'Please master! Complete routine NOW! 😭',
        'SO URGENT! Routine needs you RIGHT NOW! ⚠️',
        'HELP! Routine is super late! 🆘',
        'BEGGING! Please complete routine! 🙇',
        'CRITICAL! Routine waiting too long! ⏰',
        'PLEASE PLEASE PLEASE! Do routine now! 😱',
        'SUPER LATE! Routine panicking! 💥',
        'LAST CHANCE! Complete routine! 🔔',
        'URGENT SOS! Routine needs immediate help! 🚑',
      ],
      zh: [
        '紧急情况！例行任务非常非常迟了！🚨',
        '主人请！现在完成例行任务！😭',
        '超级紧急！例行任务现在需要您！⚠️',
        '救命！例行任务超级迟了！🆘',
        '恳求！请完成例行任务！🙇',
        '关键！例行任务等待太久了！⏰',
        '拜托拜托拜托！现在做例行任务！😱',
        '超级迟了！例行任务在恐慌！💥',
        '最后机会！完成例行任务！🔔',
        '紧急求救！例行任务需要立即帮助！🚑',
      ],
    },
  },

  // 激励鼓舞风格
  motivational: {
    first: {
      en: [
        "You're doing great! Keep the streak going! 🔥",
        "Another day to shine! Let's do this! ⭐",
        "You've got this! Time for your routine! 💪",
        'Stay strong! Your routine awaits! 🏆',
        'Keep pushing! Routine time! 🚀',
        "You're amazing! Let's crush this routine! ⚡",
        'One more step to success! 🎯',
        "You're on fire! {{streak}} days strong! 🔥",
        'Champions never quit! Routine time! 👑',
        "Your dedication inspires! Let's go! ✨",
      ],
      zh: [
        '你做得很好！保持连续记录！🔥',
        '又是闪耀的一天！让我们开始吧！⭐',
        '你能行！例行任务时间！💪',
        '保持强大！您的例行任务在等待！🏆',
        '继续加油！例行任务时间！🚀',
        '你太棒了！让我们征服这个例行任务！⚡',
        '成功又近一步！🎯',
        '你太火了！已坚持{{streak}}天！🔥',
        '冠军永不放弃！例行任务时间！👑',
        '你的奉献鼓舞人心！出发！✨',
      ],
    },
    repeat: {
      en: [
        'Still crushing it! Second reminder! 💪',
        "You're unstoppable! Keep going! 🚀",
        'Winners never skip! Routine time! 🏆',
        'Your persistence pays off! Continue! ⚡',
        "Stay committed! You're almost there! 🎯",
        'Greatness awaits! Complete your routine! 🌟',
        "You're building something great! 🏗️",
        "Every day counts! Let's do this! 📈",
        'Your future self will thank you! 💝',
        'Keep the momentum! Routine time! 🔥',
      ],
      zh: [
        '继续征服！第二次提醒！💪',
        '你势不可挡！继续前进！🚀',
        '赢家从不跳过！例行任务时间！🏆',
        '你的坚持会有回报！继续！⚡',
        '保持专注！你快到了！🎯',
        '伟大在等待！完成您的例行任务！🌟',
        '你正在建造伟大的东西！🏗️',
        '每一天都很重要！让我们做这件事！📈',
        '未来的你会感谢现在的你！💝',
        '保持势头！例行任务时间！🔥',
      ],
    },
    late: {
      en: [
        "Don't break the streak! You've got {{streak}} days! 🔥",
        'Quick! Save your progress! Complete now! ⚡',
        "You're too good to give up now! 💪",
        'Fight for your streak! Routine time! 🥊',
        "Champions finish strong! Let's go! 🏆",
        "This is your moment! Don't miss it! ⭐",
        "You're better than this! Complete now! 💥",
        'Prove yourself! Finish your routine! 🎯',
        "Winners don't quit! You can do it! 🚀",
        'Your streak is worth fighting for! 🔥',
      ],
      zh: [
        '不要打破连续记录！你已经{{streak}}天了！🔥',
        '快！保存你的进度！现在完成！⚡',
        '你太优秀了不能现在放弃！💪',
        '为你的连续记录而战！例行任务时间！🥊',
        '冠军以强势结束！出发！🏆',
        '这是你的时刻！不要错过！⭐',
        '你比这更好！现在完成！💥',
        '证明自己！完成您的例行任务！🎯',
        '赢家不放弃！你能做到！🚀',
        '你的连续记录值得为之奋斗！🔥',
      ],
    },
    veryLate: {
      en: [
        'FIGHT! Save your {{streak}}-day streak NOW! 🔥',
        "CHAMPIONS DON'T QUIT! Complete NOW! 🏆",
        'YOUR LEGACY DEPENDS ON THIS! GO! 💪',
        'PROVE YOUR STRENGTH! Finish routine! ⚡',
        "DON'T LET YOURSELF DOWN! Complete! 🎯",
        'WINNERS FINISH! DO IT NOW! 🚀',
        'YOUR STREAK IS EVERYTHING! SAVE IT! 💥',
        'BE THE CHAMPION YOU ARE! COMPLETE! 👑',
        'LAST CHANCE FOR GREATNESS! GO! 🌟',
        'SHOW YOUR POWER! Complete routine NOW! ⚡',
      ],
      zh: [
        '战斗！现在拯救您的{{streak}}天连续记录！🔥',
        '冠军不放弃！现在完成！🏆',
        '你的传奇取决于此！加油！💪',
        '证明你的力量！完成例行任务！⚡',
        '不要让自己失望！完成！🎯',
        '赢家会完成！现在就做！🚀',
        '你的连续记录就是一切！拯救它！💥',
        '成为你应有的冠军！完成！👑',
        '伟大的最后机会！加油！🌟',
        '展现你的力量！现在完成例行任务！⚡',
      ],
    },
  },

  // 幽默诙谐风格
  humorous: {
    first: {
      en: [
        'Your routine is calling... Answer it! 😏',
        'Time to adulting! Routine check-in! 🤓',
        'Your future self called. Wants you to do the routine. 📞',
        'Routine time! (Yes, already!) ⏰',
        'The routine fairy is watching... 👀',
        "Your routine won't do itself... sadly. 😅",
        'Beep boop! Routine reminder activated! 🤖',
        'Plot twist: You need to do your routine! 🎬',
        "Routine time! (Don't shoot the messenger) 📨",
        'Your routine is trending! Check it out! 📱',
      ],
      zh: [
        '您的例行任务在召唤... 接听吧！😏',
        '是时候成年人了！例行任务检查！🤓',
        '未来的你打来电话。想让你做例行任务。📞',
        '例行任务时间！（是的，已经！）⏰',
        '例行任务仙女在看着... 👀',
        '你的例行任务不会自己完成... 可惜。😅',
        '哔哔叭叭！例行任务提醒已激活！🤖',
        '剧情反转：你需要做你的例行任务！🎬',
        '例行任务时间！（别射信使）📨',
        '你的例行任务在热搜！快看！📱',
      ],
    },
    repeat: {
      en: [
        'Knock knock... Still the routine! 🚪',
        "Me again! Your routine's best friend! 😄",
        'Routine: Part 2 - The Reminder Strikes Back! 🎬',
        'Still here... Like that song stuck in your head! 🎵',
        'Reminder #2: Electric Boogaloo! ⚡',
        'Your routine is more persistent than I am! 😅',
        'Plot continues: Routine still pending! 📖',
        'Routine reminder: Season 2, Episode 2! 📺',
        "I'll stop when you do the routine! Deal? 🤝",
        'Your routine has unlimited retries! Game on! 🎮',
      ],
      zh: [
        '敲敲门... 还是例行任务！🚪',
        '又是我！你例行任务的最好朋友！😄',
        '例行任务：第二部 - 提醒反击战！🎬',
        '还在这里... 就像脑海里挥之不去的那首歌！🎵',
        '提醒 #2：电子布加洛！⚡',
        '你的例行任务比我还执着！😅',
        '情节继续：例行任务仍待处理！📖',
        '例行任务提醒：第二季，第二集！📺',
        '你做完例行任务我就停！成交？🤝',
        '你的例行任务有无限重试！游戏开始！🎮',
      ],
    },
    late: {
      en: [
        'Houston, we have a problem... Your routine! 🚀',
        'Red alert! Routine overdue! This is not a drill! 🚨',
        'Your routine is getting grumpy! 😤',
        'Breaking news: Routine still not done! 📰',
        'Error 404: Routine completion not found! 💻',
        'Your routine is judging you right now... 👀',
        'Routine status: Desperately seeking completion! 🔍',
        'Achievement unlocked: Procrastination Level 5! 🏆',
        "Your routine lawyer called. You're late! ⚖️",
        'Warning: Routine approaching critical sass levels! ⚠️',
      ],
      zh: [
        '休斯顿，我们有问题了... 您的例行任务！🚀',
        '红色警报！例行任务超时！这不是演习！🚨',
        '你的例行任务开始生气了！😤',
        '突发新闻：例行任务仍未完成！📰',
        '错误 404：未找到例行任务完成！💻',
        '你的例行任务现在正在评判你... 👀',
        '例行任务状态：迫切寻求完成！🔍',
        '成就解锁：拖延症5级！🏆',
        '你的例行任务律师打来电话。你迟到了！⚖️',
        '警告：例行任务接近临界吐槽水平！⚠️',
      ],
    },
    veryLate: {
      en: [
        'DEFCON 1! Routine emergency! All hands on deck! 🚨',
        'Your routine is having an existential crisis! HELP! 😱',
        'ABANDON SHIP! Wait no... COMPLETE ROUTINE! ⛵',
        "This is fine. Everything is fine. (It's not. Do routine!) 🔥",
        'ROUTINE APOCALYPSE! Only you can save the day! 💥',
        'Your routine just filed a complaint with HR! 📋',
        'CRITICAL: Routine threatening to strike! ⚡',
        'CODE RED! Routine patience: -100%! 🚫',
        'Your routine is writing a strongly worded letter! ✉️',
        'EMERGENCY! Routine has left the building! Bring it back! 🏃',
      ],
      zh: [
        '防卫紧急状态1级！例行任务紧急情况！全员待命！🚨',
        '你的例行任务正在经历存在危机！救命！😱',
        '弃船！等等不是... 完成例行任务！⛵',
        '这很好。一切都很好。（不是。做例行任务！）🔥',
        '例行任务启示录！只有你能拯救这一天！💥',
        '你的例行任务刚刚向人力资源部投诉！📋',
        '关键：例行任务威胁要罢工！⚡',
        '代码红色！例行任务耐心：-100%！🚫',
        '你的例行任务正在写一封措辞强烈的信！✉️',
        '紧急情况！例行任务已离开大楼！把它带回来！🏃',
      ],
    },
  },

  // 极简风格
  minimal: {
    first: {
      en: [
        'Routine?',
        'Time to check in',
        'Daily routine',
        'Routine reminder',
        'Check-in time',
        'Routine',
        'Daily check',
        'Time',
        'Reminder',
        'Now',
      ],
      zh: ['例行任务？', '该检查了', '每日例行', '例行提醒', '检查时间', '例行', '每日检查', '时间', '提醒', '现在'],
    },
    repeat: {
      en: [
        'Still pending',
        'Reminder #2',
        'Waiting',
        'Routine',
        'Again',
        'Second reminder',
        'Still here',
        'Pending',
        'Reminder',
        'Check-in',
      ],
      zh: ['仍待处理', '提醒 #2', '等待中', '例行', '再次', '第二次提醒', '还在', '待处理', '提醒', '检查'],
    },
    late: {
      en: ['Overdue', 'Late', 'Urgent', 'Now', 'Deadline', 'Immediate', 'Critical', 'Time', 'Hurry', 'Complete'],
      zh: ['超时', '迟了', '紧急', '现在', '截止', '立即', '关键', '时间', '快点', '完成'],
    },
    veryLate: {
      en: ['URGENT', 'NOW', 'CRITICAL', 'LAST CALL', 'IMMEDIATE', 'ASAP', 'FINAL', 'COMPLETE NOW', 'ACTION', 'OVERDUE'],
      zh: ['紧急', '现在', '关键', '最后通知', '立即', '尽快', '最终', '现在完成', '行动', '超时'],
    },
  },
}

/**
 * 全局文案管理器实例
 */
export const messageStyleManager = new MessageStyleManager()
