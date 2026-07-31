import { FeedbackSubmission, PersonaType, PERSONA_MATCHERS, MOCK_FIRST_NAMES, MOCK_LAST_NAMES, MOCK_COMPANIES, Q5_OPTIONS, BU_OPTIONS, Q2_Q4_OPTIONS } from './types';

// Generate a realistic individual submission
export function createSingleMockSubmission(id?: string): FeedbackSubmission {
  const isChinese = Math.random() > 0.4;
  let name = '';
  if (isChinese) {
    const fn = MOCK_FIRST_NAMES[Math.floor(Math.random() * MOCK_FIRST_NAMES.length)];
    const ln = MOCK_LAST_NAMES[Math.floor(Math.random() * MOCK_LAST_NAMES.length)];
    name = fn.match(/[\u4e00-\u9fa5]/) ? `${fn}${ln}` : `${ln}${fn}`;
  } else {
    const fn = MOCK_FIRST_NAMES[Math.floor(Math.random() * 20)]; // First half are English
    const ln = MOCK_LAST_NAMES[Math.floor(Math.random() * 8)]; // First few are English
    name = `${fn} ${ln}`;
  }

  const company = MOCK_COMPANIES[Math.floor(Math.random() * MOCK_COMPANIES.length)];
  const businessUnit = BU_OPTIONS[Math.floor(Math.random() * BU_OPTIONS.length)];
  
  // Decide Q2 & Q4 index
  const q2Values = ['A', 'B', 'C', 'D'];
  const q2Helpful = q2Values[Math.floor(Math.random() * 4)];
  const q4Favorite = q2Values[Math.floor(Math.random() * 4)];
  const persona = PERSONA_MATCHERS[q4Favorite];

  // Random ratings 1-5
  const getRandomRating = () => Math.floor(Math.random() * 2) + 4; // mostly 4-5
  const q1Rating = getRandomRating();
  
  const q3Matrix = {
    themeSpeech: getRandomRating(),
    buStrategy: getRandomRating(),
    relevance: getRandomRating(),
    exhibition: getRandomRating(),
    networking: getRandomRating()
  };

  // Random tags from Q5
  const count = 1 + Math.floor(Math.random() * 3); // 1 to 3 tags
  const shuffledTags = [...Q5_OPTIONS].filter(o => o.key !== 'I').sort(() => 0.5 - Math.random());
  const q5Expectations = shuffledTags.slice(0, count).map(o => o.key);

  const minsAgo = Math.floor(Math.random() * 120); // within last 2 hours
  const timestamp = new Date(Date.now() - minsAgo * 60 * 1000).toISOString();

  return {
    id: id || `mock-${Math.random().toString(36).substr(2, 9)}`,
    name,
    email: `${name.replace(/\s+/g, '.').toLowerCase()}@example.com`,
    company,
    businessUnit,
    q1Rating,
    q2Helpful,
    q3Matrix,
    q4Favorite,
    q5Expectations,
    q6Suggestions: 'Looking forward to next year!',
    timestamp,
    persona
  };
}

// Generate bulk mock submissions
export function generateMockSubmissions(count: number): FeedbackSubmission[] {
  const list: FeedbackSubmission[] = [];
  for (let i = 0; i < count; i++) {
    list.push(createSingleMockSubmission(`mock-init-${i}`));
  }
  // Sort by timestamp
  return list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// Calculate Average Rating metrics (replaces NPS)
export function calculateNps(submissions: FeedbackSubmission[]) {
  const total = submissions.length;
  if (total === 0) {
    return { score: 0, promoters: 0, passives: 0, detractors: 0, total: 0, promoterPercent: 0, detractorPercent: 0 };
  }

  // We still use NPS format for the dashboard to minimize changes, but adapt logic to 1-5 scale
  // Promoters: 5
  // Passives: 4
  // Detractors: 1-3
  let promotersCount = 0;
  let passivesCount = 0;
  let detractorsCount = 0;

  submissions.forEach(sub => {
    if (sub.q1Rating >= 5) {
      promotersCount++;
    } else if (sub.q1Rating === 4) {
      passivesCount++;
    } else {
      detractorsCount++;
    }
  });

  const promoterPercent = (promotersCount / total) * 100;
  const detractorPercent = (detractorsCount / total) * 100;
  const passivePercent = (passivesCount / total) * 100;
  
  // NPS = % Promoters - % Detractors
  const score = Math.round(promoterPercent - detractorPercent);

  return {
    score,
    promoters: promotersCount,
    passives: passivesCount,
    detractors: detractorsCount,
    total,
    promoterPercent: Math.round(promoterPercent),
    detractorPercent: Math.round(detractorPercent),
    passivePercent: Math.round(passivePercent),
  };
}

// Extract tag cloud frequency count from Q5
export function getTagCloudData(submissions: FeedbackSubmission[]) {
  const tagCounts: Record<string, number> = {};
  
  // Initialize all options at 0
  Q5_OPTIONS.forEach(opt => {
    tagCounts[opt.key] = 0;
  });

  let totalTagCredits = 0;
  submissions.forEach(sub => {
    sub.q5Expectations.forEach(tag => {
      if (tagCounts[tag] !== undefined) {
        tagCounts[tag]++;
        totalTagCredits++;
      }
    });
  });

  return Q5_OPTIONS.filter(o => o.key !== 'I').map(opt => {
    const count = tagCounts[opt.key] || 0;
    const percentage = totalTagCredits > 0 ? Math.round((count / totalTagCredits) * 100) : 0;
    return {
      text: opt.labelZh,
      textEn: opt.labelEn,
      count,
      percentage
    };
  }).sort((a, b) => b.count - a.count);
}

// Get distribution of Q2 responses
export function getQ2Distribution(submissions: FeedbackSubmission[]) {
  let a = 0;
  let b = 0;
  let c = 0;
  let d = 0;

  submissions.forEach(s => {
    if (s.q2Helpful === 'A') a++;
    else if (s.q2Helpful === 'B') b++;
    else if (s.q2Helpful === 'C') c++;
    else if (s.q2Helpful === 'D') d++;
  });

  const total = submissions.length || 1;

  return [
    { name: Q2_Q4_OPTIONS[0].labelZh, count: a, percent: Math.round((a / total) * 100), key: 'A', fill: 'bg-amber-500' },
    { name: Q2_Q4_OPTIONS[1].labelZh, count: b, percent: Math.round((b / total) * 100), key: 'B', fill: 'bg-cyan-500' },
    { name: Q2_Q4_OPTIONS[2].labelZh, count: c, percent: Math.round((c / total) * 100), key: 'C', fill: 'bg-rose-500' },
    { name: Q2_Q4_OPTIONS[3].labelZh, count: d, percent: Math.round((d / total) * 100), key: 'D', fill: 'bg-fuchsia-500' }
  ];
}
