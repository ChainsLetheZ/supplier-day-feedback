import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award, ChevronRight, Check, RefreshCw, Star
} from 'lucide-react';
import { 
  FeedbackSubmission, ParticipantType, PersonaType, PERSONA_DETAILS, Q5_OPTIONS, BU_OPTIONS, MOCK_FIRST_NAMES, MOCK_LAST_NAMES, MOCK_COMPANIES
} from '../types';
import { loadMySubmission } from '../lib/localStore';

interface PhoneSimulatorProps {
  onSubmitFeedback: (submission: FeedbackSubmission) => Promise<FeedbackSubmission | void> | void;
  lastSubmission: FeedbackSubmission | null;
  onResetDemo: () => void;
}

type BasicInfoErrors = Partial<
  Record<'participantType' | 'email' | 'businessUnit' | 'otherBusinessUnit', string>
>;

export default function PhoneSimulator({ onSubmitFeedback, lastSubmission, onResetDemo }: PhoneSimulatorProps) {
  // Sync restore from localStorage so refresh keeps the ticket (no flash back to Q1)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(() =>
    loadMySubmission() ? 7 : 1
  );
  const [participantType, setParticipantType] = useState<ParticipantType | ''>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [businessUnit, setBusinessUnit] = useState('');
  const [otherBusinessUnit, setOtherBusinessUnit] = useState('');
  const [basicInfoErrors, setBasicInfoErrors] = useState<BasicInfoErrors>({});
  const [surveyStartedAt, setSurveyStartedAt] = useState(() => new Date().toISOString());
  
  const [localSubmission, setLocalSubmission] = useState<FeedbackSubmission | null>(() =>
    loadMySubmission()
  );
  
  const [q1Rating, setQ1Rating] = useState<number>(0);
  const [q2Rating, setQ2Rating] = useState(0);
  const [q3Matrix, setQ3Matrix] = useState({
    keynoteSpeech: 0, panelDiscussion: 0, marketplace: 0, awardingCeremony: 0, supplierMeeting: 0
  });
  const [q4Favorite, setQ4Favorite] = useState<string | null>(null);
  const [q5Expectations, setQ5Expectations] = useState<string[]>([]);
  const [q5OtherText, setQ5OtherText] = useState('');
  const [q6Suggestions, setQ6Suggestions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    if (step !== 7) setShowGift(false);
  }, [step]);

  // If parent later hydrates a ticket while we are idle on home, show result.
  // Never interrupt an in-progress form (steps 2–5) or waiting (step 6).
  useEffect(() => {
    if (!lastSubmission) return;
    if (step === 1 || step === 7) {
      setLocalSubmission(lastSubmission);
      if (step === 1) setStep(7);
    }
  }, [lastSubmission]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRandomizeInputs = () => {
    const isChinese = Math.random() > 0.4;
    let fallbackName = '';
    if (isChinese) {
      const fn = MOCK_FIRST_NAMES[Math.floor(Math.random() * MOCK_FIRST_NAMES.length)];
      const ln = MOCK_LAST_NAMES[Math.floor(Math.random() * MOCK_LAST_NAMES.length)];
      fallbackName = fn.match(/[\u4e00-\u9fa5]/) ? `${fn}${ln}` : `${ln}${fn}`;
    } else {
      const fn = MOCK_FIRST_NAMES[Math.floor(Math.random() * 20)];
      const ln = MOCK_LAST_NAMES[Math.floor(Math.random() * 8)];
      fallbackName = `${fn} ${ln}`;
    }
    setName(fallbackName);
    setEmail(`${fallbackName.replace(/\s+/g, '.').toLowerCase()}@example.com`);
    setCompany(MOCK_COMPANIES[Math.floor(Math.random() * MOCK_COMPANIES.length)]);
    setParticipantType(Math.random() > 0.5 ? 'BOSCH' : 'SUPPLIER');
    setBusinessUnit(BU_OPTIONS[Math.floor(Math.random() * BU_OPTIONS.length)]);
  };

  const handleNextStep = () => {
    if (step === 1) {
      const errors: BasicInfoErrors = {};
      const normalizedEmail = email.trim();
      if (!participantType) errors.participantType = '请选择您的身份 Please select your participant type';
      if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        errors.email = '邮箱格式不正确 Please enter a valid email address';
      }
      if (!businessUnit) errors.businessUnit = '请选择事业部 Please select a business unit';
      if (businessUnit === 'Others' && !otherBusinessUnit.trim()) {
        errors.otherBusinessUnit = '请输入事业部名称 Please specify your business unit';
      }
      setBasicInfoErrors(errors);
      const firstInvalidField = Object.keys(errors)[0];
      if (firstInvalidField) {
        document.getElementById(`basic-${firstInvalidField}`)?.focus();
        return;
      }
    }
    if (step === 2 && (q1Rating === 0 || q2Rating === 0)) return;
    
    if (step < 6) { setStep((step + 1) as any); }
  };

  const handlePrevStep = () => {
    if (step > 1 && step < 6) {
      setStep((step - 1) as any);
    }
  };

  const handleQ5Toggle = (tagKey: string) => {
    if (q5Expectations.includes(tagKey)) {
      setQ5Expectations(q5Expectations.filter(t => t !== tagKey));
    } else {
      if (q5Expectations.length >= 3) return;
      setQ5Expectations([...q5Expectations, tagKey]);
    }
  };

  const handleSubmit = async () => {
    if (q2Rating === 0 || submitting) return;
    setSubmitting(true);
    setShowGift(false);
    // Stay on waiting screen — do NOT jump back to step 1
    setStep(6);

    // Provisional random result. The storage layer applies the final 50-person cap.
    const personas: PersonaType[] = ['INNOVATOR', 'NAVIGATOR', 'ACCELERATOR', 'CONNECTOR'];
    const persona = personas[Math.floor(Math.random() * personas.length)];
    const surveyCompletedAt = new Date().toISOString();
    const surveyDurationSeconds = Math.max(
      0,
      Math.round(
        (new Date(surveyCompletedAt).getTime() -
          new Date(surveyStartedAt).getTime()) /
          1000
      )
    );

    const submission: FeedbackSubmission = {
      id: `attendee-${Date.now()}`,
      participantType: participantType as ParticipantType,
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      businessUnit: businessUnit === 'Others' ? otherBusinessUnit.trim() : businessUnit,
      q1Rating,
      q2Rating,
      q3Matrix,
      q4Favorite: '',
      q5Expectations,
      q5OtherText,
      q6Suggestions,
      timestamp: surveyCompletedAt,
      surveyStartedAt,
      surveyCompletedAt,
      surveyDurationSeconds,
      persona: persona as PersonaType,
    };

    setLocalSubmission(submission);

    // Keep waiting visible at least ~1.2s so users perceive "generating"
    const minWait = new Promise((r) => setTimeout(r, 1200));
    try {
      const result = await Promise.all([
        Promise.resolve(onSubmitFeedback(submission)),
        minWait,
      ]);
      const saved = result[0];
      if (saved) setLocalSubmission(saved);
    } catch (e) {
      console.error(e);
      // Still show local persona ticket
    }

    setSubmitting(false);
    setStep(7);
  };

  const startNewSurvey = () => {
    setParticipantType('');
    setName('');
    setEmail('');
    setCompany('');
    setBusinessUnit('');
    setOtherBusinessUnit('');
    setBasicInfoErrors({});
    setSurveyStartedAt(new Date().toISOString());
    setQ1Rating(0);
    setQ2Rating(0);
    setQ3Matrix({
      keynoteSpeech: 0,
      panelDiscussion: 0,
      marketplace: 0,
      awardingCeremony: 0,
      supplierMeeting: 0,
    });
    setQ4Favorite(null);
    setQ5Expectations([]);
    setQ5OtherText('');
    setQ6Suggestions('');
    setLocalSubmission(null);
    setSubmitting(false);
    setStep(1);
    onResetDemo();
  };

  const activeSubmission = lastSubmission || localSubmission;
  const currentPersonaConfig = activeSubmission ? PERSONA_DETAILS[activeSubmission.persona] : null;

  return (
    <div className="bosch-ui flex flex-col w-full h-[100dvh] bg-slate-50 relative overflow-hidden text-slate-800 font-sans sm:py-6">
      <img className="bosch-supergraphic" src="/brand/supergraphic-responsive.svg" alt="" aria-hidden="true" />
      <header className="bosch-brand-header" aria-label="Bosch China Supplier Day">
        <div className="bosch-brand-row">
          <img className="bosch-brand-logo" src="/brand/bosch-logo.svg" alt="Bosch" />
          <span className="bosch-brand-title">China Supplier Day 2026</span>
        </div>
        <div className="bosch-progress" role="progressbar" aria-label="Questionnaire progress" aria-valuemin={0} aria-valuemax={5} aria-valuenow={Math.min(step, 5)}>
          <span className="bosch-progress-track"><span className="bosch-progress-fill" style={{ width: `${Math.min(step, 5) / 5 * 100}%` }} /></span>
        </div>
      </header>
      <div className="max-w-md mx-auto w-full min-h-0 flex flex-col flex-1 relative bg-white sm:rounded-[32px] sm:shadow-2xl sm:border border-slate-200 overflow-hidden">
        
        <div className="w-full h-full min-h-0 flex flex-col select-none text-slate-800">
          
          <div ref={contentRef} className="flex-1 min-h-0 overflow-y-auto px-5 py-5 flex flex-col pb-24">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <motion.div key="step-1" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="flex flex-col flex-1">
                  <div className="mb-6">
                    <h2 className="text-[20px] font-bold text-slate-900 mb-1 leading-tight">基本信息 Basic Info</h2>
                    <p className="text-xs text-slate-500">感谢参加 Bosch 中国区供应商大会。<br/>Thank you for attending the Bosch China Supplier Day.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">身份 Participant Type <span className="text-rose-500">* 必填 Required</span></label>
                      <div id="basic-participantType" tabIndex={-1} className={`grid grid-cols-2 gap-2 rounded-xl ${basicInfoErrors.participantType ? 'ring-2 ring-rose-500/30' : ''}`}>
                        {([
                          { value: 'BOSCH', zh: '博世', en: 'Bosch' },
                          { value: 'SUPPLIER', zh: '供应商', en: 'Supplier' },
                        ] as const).map((option) => (
                          <button key={option.value} type="button" onClick={() => { setParticipantType(option.value); setBasicInfoErrors((prev) => ({ ...prev, participantType: undefined })); }} className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${participantType === option.value ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-700'}`}>
                            {option.zh}<span className="block text-[10px] font-medium mt-0.5">{option.en}</span>
                          </button>
                        ))}
                      </div>
                      {basicInfoErrors.participantType && <p className="mt-1.5 text-xs font-medium text-rose-600">{basicInfoErrors.participantType}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">您归属的事业部 Business Unit <span className="text-rose-500">* 必填 Required</span></label>
                      <select id="basic-businessUnit" value={businessUnit || ""} onChange={(e) => { setBusinessUnit(e.target.value); setBasicInfoErrors((prev) => ({ ...prev, businessUnit: undefined, otherBusinessUnit: undefined })); }} aria-invalid={!!basicInfoErrors.businessUnit} className={`w-full px-4 py-3 bg-white border rounded-xl text-base focus:outline-none focus:ring-2 transition-shadow ${basicInfoErrors.businessUnit ? 'border-rose-500 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-indigo-500/50'}`}>
                        <option value="" disabled>请选择 Please select</option>
                        {BU_OPTIONS.map(bu => <option key={bu} value={bu}>{bu}</option>)}
                      </select>
                      {basicInfoErrors.businessUnit && <p className="mt-1.5 text-xs font-medium text-rose-600">{basicInfoErrors.businessUnit}</p>}
                      {businessUnit === 'Others' && (
                        <input
                          id="basic-otherBusinessUnit"
                          type="text"
                          value={otherBusinessUnit}
                          onChange={(e) => { setOtherBusinessUnit(e.target.value); setBasicInfoErrors((prev) => ({ ...prev, otherBusinessUnit: undefined })); }}
                          aria-invalid={!!basicInfoErrors.otherBusinessUnit}
                          className={`w-full mt-2 px-4 py-3 bg-white border rounded-xl text-base focus:outline-none focus:ring-2 transition-shadow ${basicInfoErrors.otherBusinessUnit ? 'border-rose-500 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-indigo-500/50'}`}
                          placeholder="请输入事业部 Please specify"
                        />
                      )}
                      {basicInfoErrors.otherBusinessUnit && <p className="mt-1.5 text-xs font-medium text-rose-600">{basicInfoErrors.otherBusinessUnit}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">公司 Company <span className="text-slate-400">选填 Optional</span></label>
                      <input id="basic-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow" placeholder="您的公司名称 Your company" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">姓名 Name <span className="text-slate-400">选填 Optional</span></label>
                      <input id="basic-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow" placeholder="您的姓名 Your name" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">邮箱 Email <span className="text-slate-400">选填 Optional</span></label>
                      <input id="basic-email" type="email" inputMode="email" autoCapitalize="none" value={email} onChange={(e) => { setEmail(e.target.value); setBasicInfoErrors((prev) => ({ ...prev, email: undefined })); }} aria-invalid={!!basicInfoErrors.email} className={`w-full px-4 py-3 bg-white border rounded-xl text-base focus:outline-none focus:ring-2 transition-shadow ${basicInfoErrors.email ? 'border-rose-500 focus:ring-rose-500/30' : 'border-slate-200 focus:ring-indigo-500/50'}`} placeholder="您的邮箱 Your email" />
                      {basicInfoErrors.email && <p className="mt-1.5 text-xs font-medium text-rose-600">{basicInfoErrors.email}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Overall Rating & Helpful Content */}
              {step === 2 && (
                <motion.div key="step-2" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="flex flex-col flex-1">
                  <div className="mb-6">
                    <h2 className="text-[20px] font-bold text-slate-900 mb-1 leading-tight">大会体验评分 Event Ratings</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[13px] font-bold text-slate-800 mb-3">1. 请您为本次供应商大会整体安排打分<br/>Please rate the overall arrangement (5-star rating)</label>
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button 
                            key={score}
                            onClick={() => setQ1Rating(score)}
                            className={`flex flex-col items-center gap-1.5 focus:outline-none transition-transform hover:scale-110 p-2 ${q1Rating >= score ? 'opacity-100' : 'opacity-40 grayscale'}`}
                          >
                            <Star className={`w-8 h-8 transition-colors ${q1Rating >= score ? 'fill-amber-400 text-amber-400 drop-shadow-sm' : 'fill-slate-100 text-slate-300 hover:text-amber-200'}`} />
                            <span className="text-[10px] font-bold font-mono">{score}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-slate-800 mb-3">2. 请您为本次供应商大会内容有用程度打分<br/>Please rate the usefulness of the content (5-star rating)</label>
                      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button
                            key={score}
                            onClick={() => setQ2Rating(score)}
                            className={`flex flex-col items-center gap-1.5 focus:outline-none transition-transform hover:scale-110 p-2 ${q2Rating >= score ? 'opacity-100' : 'opacity-40 grayscale'}`}
                          >
                            <Star className={`w-8 h-8 transition-colors ${q2Rating >= score ? 'fill-amber-400 text-amber-400 drop-shadow-sm' : 'fill-slate-100 text-slate-300 hover:text-amber-200'}`} />
                            <span className="text-[10px] font-bold font-mono">{score}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Matrix */}
              {step === 3 && (
                <motion.div key="step-3" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="flex flex-col flex-1">
                  <div className="mb-4">
                    <h2 className="text-[20px] font-bold text-slate-900 mb-1 leading-tight">
                      3. 活动维度体验满意度
                      <span className="block text-sm font-semibold text-slate-600 mt-1">Satisfaction with Event Dimensions</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      矩阵题，1–5 分（1 = 低，5 = 高）<br />
                      Matrix rating, 1–5 (1 = Low, 5 = High)
                    </p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { key: 'keynoteSpeech', labelZh: '主题演讲', labelEn: 'Keynote Speech' },
                      { key: 'panelDiscussion', labelZh: '圆桌讨论', labelEn: 'Panel Discussion' },
                      { key: 'marketplace', labelZh: '市集展示', labelEn: 'Marketplace' },
                      { key: 'awardingCeremony', labelZh: '颁奖典礼', labelEn: 'Awarding Ceremony' },
                      { key: 'supplierMeeting', labelZh: 'GB 单独供应商会议', labelEn: 'GB Individual Supplier Meeting' }
                    ].map((item) => (
                      <div key={item.key} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="mb-2">
                          <div className="text-[12px] font-bold text-slate-800">{item.labelZh}</div>
                          <div className="text-[10px] font-medium text-slate-500 mt-0.5">{item.labelEn}</div>
                        </div>
                        <div className="flex justify-between items-center px-2">
                          {[1, 2, 3, 4, 5].map((score) => {
                            const currentScore = (q3Matrix as any)[item.key];
                            return (
                              <button
                                key={score}
                                onClick={() => setQ3Matrix({ ...q3Matrix, [item.key]: score })}
                                aria-label={`${item.labelZh} ${item.labelEn}: ${score} 分`}
                                className="focus:outline-none transition-transform hover:scale-110 p-1"
                              >
                                <Star className={`w-6 h-6 transition-colors ${currentScore >= score ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200 hover:text-amber-200'}`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Expectations */}
              {step === 4 && (
                <motion.div key="step-4" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="flex flex-col flex-1">
                  <div className="mb-4">
                    <h2 className="text-[20px] font-bold text-slate-900 mb-1 leading-tight">期待 Expectations</h2>
                  </div>
                  <div className="space-y-5 flex-1 flex flex-col">
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-end mb-1">
                        <label className="block text-[12px] font-bold text-slate-800">4. 您希望明年的供应商大会增加哪些内容？<br/>What would you like to see more next year?</label>
                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">最多3项 Max 3</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-3 animate-pulse font-bold text-center">👇 请上下滑动查看全部选项 Please scroll to see all options 👇</p>
                      <div className="space-y-2 pr-1 pb-10">
                        {Q5_OPTIONS.map(opt => {
                          const isSelected = q5Expectations.includes(opt.key);
                          const isDisabled = !isSelected && q5Expectations.length >= 3;
                          return (
                            <button key={opt.key} disabled={isDisabled} onClick={() => handleQ5Toggle(opt.key)} className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs font-medium transition-all flex items-center justify-between ${isSelected ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm' : isDisabled ? 'opacity-50 bg-slate-50 cursor-not-allowed border-slate-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                              <div className="flex flex-col pr-2">
                                <span>{opt.labelZh}</span>
                                <span className="text-[10px] opacity-70 mt-0.5">{opt.labelEn}</span>
                              </div>
                              <div className={`w-4 h-4 shrink-0 rounded flex items-center justify-center border transition-colors ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-transparent'}`}>
                                {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                              </div>
                            </button>
                          );
                        })}
                        {q5Expectations.includes('I') && (
                          <input type="text" value={q5OtherText} onChange={e => setQ5OtherText(e.target.value)} placeholder="请注明其他内容 Please specify" className="w-full mt-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: Suggestions */}
              {step === 5 && (
                <motion.div key="step-5" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="flex flex-col flex-1">
                  <div className="mb-4">
                    <h2 className="text-[20px] font-bold text-slate-900 mb-1 leading-tight">其他建议 Any Other Suggestions</h2>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-800 mb-2">5. 您的其他改进意见和建议是？（选填）<br/>Any other suggestions? (Optional)</label>
                      <textarea value={q6Suggestions} onChange={(e) => setQ6Suggestions(e.target.value)} className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-32 resize-none" placeholder="例如：喜欢的环节或其他建议 e.g., favorite parts or suggestions" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: WAITING — stay here until result is ready */}
              {step === 6 && (
                <motion.div
                  key="step-6-waiting"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="flex flex-col flex-1 items-center justify-center py-4"
                >
                  <div className="flex flex-col items-center justify-center space-y-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">正在生成专属结果…</h2>
                    <p className="text-sm text-slate-500 text-center px-4">
                      请稍候，不要返回。正在根据您的反馈匹配专属 Persona
                      <br />
                      Please wait — generating your badge…
                    </p>
                  </div>
                </motion.div>
              )}

              {/* STEP 7: COMPLETION - DIGITAL TICKET */}
              {step === 7 && currentPersonaConfig && activeSubmission && (
                <motion.div
                  key="step-7-result"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="flex flex-col flex-1 items-center justify-center py-4"
                >
                  <div
                    className={`w-full max-w-sm mx-auto relative rounded-2xl overflow-hidden bg-slate-900 border-2 ${currentPersonaConfig.borderColor} ${currentPersonaConfig.glowColor} shadow-2xl transition-all duration-700`}
                    style={{ perspective: '1000px' }}
                  >
                    <div className="absolute inset-0 opacity-40">
                      <div
                        className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${currentPersonaConfig.themeGradient}`}
                      ></div>
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white blur-[60px] rounded-full opacity-20"></div>
                      <div className="absolute top-10 -left-10 w-32 h-32 bg-indigo-500 blur-[50px] rounded-full opacity-20"></div>
                    </div>

                    <button type="button" onClick={() => setShowGift(true)} className={`absolute inset-0 z-20 p-6 text-center flex flex-col items-center justify-center text-white bg-slate-900/80 backdrop-blur-sm transition-all duration-700 [transform-style:preserve-3d] ${showGift ? 'opacity-0 pointer-events-none [transform:rotateY(180deg)]' : 'opacity-100'}`}>
                      <span className="text-xs tracking-widest uppercase text-white/60">Your Persona</span>
                      <strong className="mt-3 text-4xl font-black">{currentPersonaConfig.titleZh}</strong>
                      <span className={`mt-1 text-sm font-bold uppercase tracking-[0.2em] ${currentPersonaConfig.textColor}`}>{currentPersonaConfig.title}</span>
                      <span className="mt-8 text-xs text-white/60">{activeSubmission.name || '嘉宾 Guest'} · ID {activeSubmission.id?.split('-')[1]?.substring(0, 6) || '10293'}</span>
                      <span className="mt-6 text-[10px] text-white/50">点击查看礼物 · Tap to reveal gift</span>
                    </button>
                    <div className={`relative z-10 p-5 flex flex-col h-full min-h-[25rem] backdrop-blur-md transition-all duration-700 [transform-style:preserve-3d] ${showGift ? 'opacity-100' : 'opacity-0 pointer-events-none [transform:rotateY(180deg)]'}`}>
                      <div className="flex justify-between items-start mb-6">
                        <div aria-hidden="true" />
                        <Award className={`w-6 h-6 ${currentPersonaConfig.textColor}`} />
                      </div>

                      <div className="text-center mb-6 mt-2">
                        <h4 className="text-white/60 font-medium text-xs mb-1 uppercase tracking-wider">
                          您的 PERSONA · YOUR PERSONA
                        </h4>
                        <h2
                          className={`text-3xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-b ${currentPersonaConfig.themeGradient.replace('from-', 'from-white via-').replace('to-', 'to-white/80')}`}
                        >
                          {currentPersonaConfig.titleZh}
                        </h2>
                        <h3
                          className={`text-[11px] uppercase tracking-[0.2em] mt-1 font-bold ${currentPersonaConfig.textColor}`}
                        >
                          {currentPersonaConfig.title}
                        </h3>
                      </div>

                      <div className="mb-6 rounded-2xl border border-white/15 bg-black/20 p-3 backdrop-blur-lg">
                        <div className="flex items-center gap-3">
                          <img
                            src={currentPersonaConfig.giftImage}
                            alt={`${currentPersonaConfig.titleZh} ${currentPersonaConfig.gift}`}
                            className="w-24 h-24 rounded-xl object-cover bg-white shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Award className={`w-4 h-4 shrink-0 ${currentPersonaConfig.textColor}`} />
                              <span className="text-[10px] font-semibold text-white/60">您的礼品 · Your Gift</span>
                            </div>
                            <p className="text-sm font-bold text-white">
                              {currentPersonaConfig.gift}
                            </p>
                            <p className="text-[10px] text-white/65 mt-2 leading-relaxed">
                              请寻找相关工作人员领取礼物<br />
                              Please find the designated staff member to collect your gift.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-end">
                        <div className="max-w-[70%]">
                          <h5 className="text-white font-bold text-base truncate">
                            {activeSubmission.name || '嘉宾 Guest'}
                          </h5>
                          <p className="text-white/50 text-xs truncate">
                            {activeSubmission.company || '未填写公司 Company not provided'}
                          </p>
                          <p className="text-white/40 text-[10px] mt-1 truncate">
                            BU: {activeSubmission.businessUnit}
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="text-white/30 text-[9px] uppercase tracking-widest font-mono">
                            ID:{' '}
                            {activeSubmission.id?.split('-')[1]?.substring(0, 6) || '10293'}
                          </span>
                        </div>
                      </div>
                      <button type="button" onClick={() => setShowGift(false)} className="mt-4 text-[10px] text-white/60 underline">返回 Persona · Back</button>
                    </div>
                  </div>

                  <p className="text-center text-[11px] text-slate-400 mt-6 px-4">
                    感谢您参与本次供应商大会并分享宝贵意见！
                    <br />
                    Thank you for participating and sharing your valuable feedback!
                  </p>

                  {/* Explicit restart — only this button goes back to Q1 */}
                  <button
                    type="button"
                    onClick={startNewSurvey}
                    className="mt-5 w-full max-w-sm py-3.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="leading-tight text-center">
                      返回首页重新填写
                      <br />
                      <span className="text-[10px] font-semibold text-slate-400">
                        Back to start · New response
                      </span>
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fixed navigation area; the questionnaire content above owns all scrolling. */}
          {step < 6 && (
            <div className="shrink-0 w-full bg-white border-t border-slate-200/60 p-4 sm:pb-6 z-40">
              <div className="flex gap-3 max-w-sm mx-auto">
                {step > 1 && (
                  <button 
                    onClick={handlePrevStep}
                    className="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-sm shadow-sm hover:bg-slate-100 transition-colors flex items-center justify-center text-center leading-tight"
                  >
                    上一步<br/>Back
                  </button>
                )}
                
                {step < 5 ? (
                  <button 
                    onClick={handleNextStep}
                    disabled={(step === 2 && (q1Rating === 0 || q2Rating === 0)) || (step === 3 && Object.values(q3Matrix).some(v => v === 0)) || (step === 4 && (q5Expectations.length === 0 || (q5Expectations.includes('I') && !q5OtherText.trim())))}
                    className="flex-[2] flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed leading-tight"
                  >
                    <div className="flex flex-col items-center">
                      <span>下一步</span>
                      <span className="text-[10px]">Next</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-[2] flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" /> 结果生成中 Processing... </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Award className="w-4 h-4" /> 提交 Submit </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
