export interface Q3Matrix {
  keynoteSpeech: number;
  panelDiscussion: number;
  marketplace: number;
  awardingCeremony: number;
  supplierMeeting: number;
}

export interface FeedbackSubmission {
  id?: string;
  participantType: ParticipantType;
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
  surveyStartedAt?: string;
  surveyCompletedAt?: string;
  surveyDurationSeconds?: number;
  persona: PersonaType;
  isHidden?: boolean;
}

export type ParticipantType = 'BOSCH' | 'SUPPLIER';
export type PersonaType = 'INNOVATOR' | 'NAVIGATOR' | 'ACCELERATOR' | 'CONNECTOR';

export interface PersonaConfig {
  type: PersonaType;
  title: string;
  titleZh: string;
  badge: string;
  sticker: string;
  gift: string;
  giftImage: string;
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
    title: 'Innovator',
    titleZh: '创新共创者',
    badge: 'Innovator',
    sticker: '灵感源泉',
    gift: '青色徽章 Turquoise Badge',
    giftImage: '/persona-gifts/innovator-teal.jpg',
    giftIcon: 'Award',
    description: '创新共创者善于激发灵感，与伙伴共同创造新的可能。 Innovators inspire ideas and co-create new possibilities.',
    textColor: 'text-teal-300',
    bgColor: 'bg-teal-950/40',
    borderColor: 'border-teal-400/50',
    glowColor: 'shadow-teal-500/50',
    themeGradient: 'from-teal-700 via-teal-500 to-emerald-700',
  },
  NAVIGATOR: {
    type: 'NAVIGATOR',
    title: 'Navigator',
    titleZh: '远见领航者',
    badge: 'Navigator',
    sticker: '方向指引',
    gift: '蓝色徽章 Blue Badge',
    giftImage: '/persona-gifts/navigator-blue.jpg',
    giftIcon: 'Award',
    description: '远见领航者善于洞察方向，以清晰目标带领伙伴前行。 Navigators see the way forward and guide others with clarity.',
    textColor: 'text-blue-300',
    bgColor: 'bg-blue-950/40',
    borderColor: 'border-blue-400/50',
    glowColor: 'shadow-blue-500/50',
    themeGradient: 'from-blue-700 via-sky-500 to-blue-800',
  },
  ACCELERATOR: {
    type: 'ACCELERATOR',
    title: 'Accelerator',
    titleZh: '高效推进者',
    badge: 'Accelerator',
    sticker: '业务助推',
    gift: '紫色徽章 Purple Badge',
    giftImage: '/persona-gifts/accelerator-purple.jpg',
    giftIcon: 'Award',
    description: '高效推进者聚焦行动与成果，推动团队快速前进。 Accelerators turn ideas into action and move teams forward efficiently.',
    textColor: 'text-fuchsia-300',
    bgColor: 'bg-purple-950/40',
    borderColor: 'border-fuchsia-400/50',
    glowColor: 'shadow-fuchsia-500/50',
    themeGradient: 'from-purple-800 via-fuchsia-600 to-violet-900',
  },
  CONNECTOR: {
    type: 'CONNECTOR',
    title: 'Connector',
    titleZh: '生态链接者',
    badge: 'Connector',
    sticker: '超级连接',
    gift: '绿色徽章 Green Badge',
    giftImage: '/persona-gifts/connector-green.jpg',
    giftIcon: 'Award',
    description: '生态链接者善于连接伙伴、资源与机会，促进生态协作。 Connectors bring people, resources and opportunities together.',
    textColor: 'text-emerald-300',
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-400/50',
    glowColor: 'shadow-emerald-500/50',
    themeGradient: 'from-emerald-800 via-green-600 to-emerald-900',
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
  { key: 'D', labelEn: 'GB Individual Supplier Meeting', labelZh: '事业部采购分会场' }
];

export const Q5_OPTIONS = [
  { key: 'A', labelEn: 'More specific Bosch procurement strategy and category directions', labelZh: '更具体的 Bosch 采购战略和品类方向' },
  { key: 'B', labelEn: 'More showcases of new technologies, new products, and new business scenarios', labelZh: '更多新技术、新产品、新业务场景展示' },
  { key: 'C', labelEn: 'More supplier success stories and best practice sharing', labelZh: '更多供应商成功案例或最佳实践分享' },
  { key: 'D', labelEn: 'More opportunities for one-on-one business matching', labelZh: '更多一对一业务对接机会' },
  { key: 'E', labelEn: 'More technical workshops or topic-focused discussions', labelZh: '更多技术 Workshop 或专题讨论' },
  { key: 'F', labelEn: 'More guidance on quality, compliance, and sustainability requirements', labelZh: '更多关于质量、合规、可持续发展的要求说明' },
  { key: 'G', labelEn: 'More hands-on introductions to digital platforms, processes, and tools', labelZh: '更多数字化平台、流程、工具的实操介绍' },
  { key: 'H', labelEn: 'More opportunities for cross-region and cross-business-unit exchange', labelZh: '更多跨区域、跨业务部门的交流机会' },
  { key: 'I', labelEn: 'Other, please specify', labelZh: '其他，请注明' }
];
