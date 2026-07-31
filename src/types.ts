export interface Q3Matrix {
  keynoteSpeech: number;
  panelDiscussion: number;
  marketplace: number;
  awardingCeremony: number;
  supplierMeeting: number;
}

export interface FeedbackSubmission {
  id?: string;
  name: string;
  email: string;
  company: string;
  businessUnit: string;
  q1Rating: number;
  q2Rating: number;
  q2Helpful?: string;
  q3Matrix: Q3Matrix;
  q4Favorite: string;
  q5Expectations: string[];
  q5OtherText?: string;
  q6Suggestions: string;
  timestamp: string;
  persona: PersonaType;
  isHidden?: boolean;
}

export type PersonaType = 'INNOVATOR' | 'NAVIGATOR' | 'ACCELERATOR' | 'CONNECTOR';

export interface PersonaConfig {
  type: PersonaType;
  title: string;
  titleZh: string;
  badge: string;
  sticker: string;
  gift: string;
  giftIcon: string;
  description: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  themeGradient: string;
}

export const PERSONA_MATCHERS: Record<string, PersonaType> = {
  A: 'INNOVATOR',
  B: 'NAVIGATOR',
  C: 'ACCELERATOR',
  D: 'CONNECTOR',
};

export const PERSONA_DETAILS: Record<PersonaType, PersonaConfig> = {
  INNOVATOR: {
    type: 'INNOVATOR',
    title: 'The Innovator',
    titleZh: '创新先锋',
    badge: 'Innovator',
    sticker: '灵感源泉',
    gift: '极简设计笔记本组合',
    giftIcon: 'Notebook',
    description: '您是“创新先锋”！思维超前，掌控全局。您在今天的主题演讲中汲取了最多的养分。匹配一份极简设计笔记本组合，用于随笔记录宏伟的灵感火花。',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-950/40',
    borderColor: 'border-amber-500/40',
    glowColor: 'shadow-amber-500/50',
    themeGradient: 'from-amber-600 via-yellow-500 to-amber-700',
  },
  NAVIGATOR: {
    type: 'NAVIGATOR',
    title: 'The Navigator',
    titleZh: '领航舵手',
    badge: 'Navigator',
    sticker: '方向指引',
    gift: '多功能铝制手机支架',
    giftIcon: 'Compass',
    description: '您是“领航舵手”！善于在复杂信息中找到方向。今天的圆桌论坛为您提供了最清晰的指引。',
    textColor: 'text-cyan-400',
    bgColor: 'bg-cyan-950/40',
    borderColor: 'border-cyan-500/40',
    glowColor: 'shadow-cyan-500/50',
    themeGradient: 'from-cyan-600 via-teal-500 to-cyan-700',
  },
  ACCELERATOR: {
    type: 'ACCELERATOR',
    title: 'The Accelerator',
    titleZh: '增长引擎',
    badge: 'Accelerator',
    sticker: '业务助推',
    gift: '快速充电宝',
    giftIcon: 'Zap',
    description: '您是“增长引擎”！注重实效，寻找加速业务发展的机会。Marketplace 是您的主场。',
    textColor: 'text-rose-400',
    bgColor: 'bg-rose-950/40',
    borderColor: 'border-rose-500/40',
    glowColor: 'shadow-rose-500/50',
    themeGradient: 'from-rose-600 via-pink-500 to-rose-700',
  },
  CONNECTOR: {
    type: 'CONNECTOR',
    title: 'The Connector',
    titleZh: '社群链接者',
    badge: 'Connector',
    sticker: '超级连接',
    gift: '精美皮革多层卡包',
    giftIcon: 'Users',
    description: '您是“社群链接者”！高情商，善于链接资源与人脉。一对一供应商会议让您如鱼得水。为您呈递精美卡包，便于收纳新结识伙伴的闪光名片。',
    textColor: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-950/40',
    borderColor: 'border-fuchsia-500/40',
    glowColor: 'shadow-fuchsia-500/50',
    themeGradient: 'from-fuchsia-600 via-purple-500 to-fuchsia-700',
  }
};

export const MOCK_FIRST_NAMES = [
  'Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Ava', 'Elijah', 'Charlotte', 
  'William', 'Sophia', 'James', 'Amelia', 'Benjamin', 'Isabella', 'Lucas', 
  'Mia', 'Henry', 'Evelyn', 'Alexander', 'Harper', '陈', '林', '张', '王', 
  '李', '刘', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林'
];

export const MOCK_LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 
  '伟', '强', '芳', '丽', '洋', '勇', '杰', '娟', '涛', '静', '超', '秀'
];

export const MOCK_COMPANIES = [
  'Apex Solutions Inc.', 'TechFuture Co.', 'Quantum Materials Corp.', 
  'Global Logistics Ltd.', 'Silicon Craft China', 'Vanguard Industries', 
  'EcoEnergy Tech', 'NextGen Manufacturing', 'BlueGrid Systems', 'Nexus Solutions'
];

export const Q3_OPTIONS = [
  { key: 'More Tech Demos', labelEn: 'More Tech Demos', labelZh: '更多技术干货' },
  { key: '1-on-1 Matchmaking', labelEn: '1-on-1 Matchmaking', labelZh: '1对1业务对接' },
  { key: 'Longer Exhibit Time', labelEn: 'Longer Exhibit Time', labelZh: '延长展位交流时间' },
  { key: 'More Digital Interaction', labelEn: 'More Digital Interaction', labelZh: '更多数字化体验' },
  { key: 'Case Studies', labelEn: 'Case Studies', labelZh: '优秀供应商案例分享' },
  { key: 'Panel Discussions', labelEn: 'Panel Discussions', labelZh: '增加圆桌论坛环节' }
];

export const BU_OPTIONS = [
  'PT',
  'MAC',
  'BBM',
  'iBuy',
  'MA',
  'Others'
];

export const Q2_Q4_OPTIONS = [
  { key: 'A', labelEn: 'Keynote Speech', labelZh: 'Keynote Speech' },
  { key: 'B', labelEn: 'Panel Discussion', labelZh: 'Panel Discussion' },
  { key: 'C', labelEn: 'Marketplace', labelZh: 'Marketplace' },
  { key: 'D', labelEn: 'GB Individual Supplier Meeting', labelZh: 'GB Individual Supplier Meeting' }
];

export const Q5_OPTIONS = [
  { key: 'A', labelEn: 'Procurement Strategy', labelZh: '更具体的 Bosch 采购战略和品类方向' },
  { key: 'B', labelEn: 'New Tech & Products', labelZh: '更多新技术、新产品、新业务场景展示' },
  { key: 'C', labelEn: 'Best Practices', labelZh: '更多供应商成功案例或最佳实践分享' },
  { key: 'D', labelEn: '1-on-1 Matching', labelZh: '更多一对一业务对接机会' },
  { key: 'E', labelEn: 'Tech Workshops', labelZh: '更多技术 Workshop 或专题讨论' },
  { key: 'F', labelEn: 'Quality & Compliance', labelZh: '更多关于质量、合规、可持续发展的要求说明' },
  { key: 'G', labelEn: 'Digital Tools', labelZh: '更多数字化平台、流程、工具的实操介绍' },
  { key: 'H', labelEn: 'Cross-region Exchange', labelZh: '更多跨区域、跨业务部门的交流机会' },
  { key: 'I', labelEn: 'Other', labelZh: '其他，请注明' }
];
