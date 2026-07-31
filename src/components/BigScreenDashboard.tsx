import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Activity, Award, MessageSquare, Percent, Tag, 
  Search, Users, Star, Calendar, ArrowRight, ShieldCheck, HelpCircle, X, Trash2, EyeOff
} from 'lucide-react';
import { FeedbackSubmission, PERSONA_DETAILS, Q5_OPTIONS } from '../types';
import { calculateNps, getTagCloudData, getQ2Distribution } from '../utils';
import { destroySubmission, hideSubmission } from '../lib/dataService';

interface BigScreenDashboardProps {
  submissions: FeedbackSubmission[];
  onHidden: (id: string) => void;
  onDeleted: (id: string) => void;
}

export default function BigScreenDashboard({
  submissions,
  onHidden,
  onDeleted,
}: BigScreenDashboardProps) {
  const [filterPersona, setFilterPersona] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modal & hide state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use visible submissions for calculations
  const visibleSubmissions = submissions.filter(sub => sub.id && !sub.isHidden);

  // Calculations
  const npsMetrics = calculateNps(visibleSubmissions);
  const tagCloud = getTagCloudData(visibleSubmissions);
  const q2Dist = getQ2Distribution(visibleSubmissions);

  // Filtered submissions for list view
  const filteredSubmissions = visibleSubmissions.filter(sub => {
    const matchesPersona = filterPersona === 'ALL' || sub.persona === filterPersona;
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPersona && matchesSearch;
  }).reverse(); // Latest first

  const handleHide = async (id: string | undefined) => {
    if (!id) return;
    try {
      await hideSubmission(id, true);
      onHidden(id);
    } catch (e) {
      console.error(e);
      alert(`隐藏失败：${e instanceof Error ? e.message : '请检查网络或腾讯云 CloudBase 配置'}`);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm("确定要永久删除这条数据吗？")) {
      try {
        await destroySubmission(id);
        onDeleted(id);
      } catch (e) {
        console.error(e);
        alert(`删除失败：${e instanceof Error ? e.message : '请检查网络或腾讯云 CloudBase 配置'}`);
      }
    }
  };

  // Safe color mappings
  const getNpsGlowClass = (score: number) => {
    if (score >= 50) return 'text-emerald-600';
    if (score >= 0) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getBadgeStyle = (persona: string) => {
    switch (persona) {
      case 'INNOVATOR':
        return 'bg-amber-50 border-amber-200 text-amber-700 font-semibold';
      case 'NAVIGATOR':
        return 'bg-cyan-50 border-cyan-200 text-cyan-700 font-semibold';
      case 'ACCELERATOR':
        return 'bg-rose-50 border-rose-200 text-rose-700 font-semibold';
      case 'CONNECTOR':
        return 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700 font-semibold';
      default:
        return 'bg-slate-100 border-slate-200 text-slate-600';
    }
  };

  return (
    <div id="dashboard-container" className="flex-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col space-y-6 select-none font-sans">
      
      {/* Dashboard Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-sans font-semibold text-slate-500 uppercase tracking-widest">
              Live Stage LED Screen Broadcast 
            </span>
          </div>
          <h1 className="text-2xl font-display font-black text-slate-900 tracking-tight flex items-center gap-2">
            2026 Supplier Day <span className="text-indigo-600 font-extrabold">体验与词云共建大屏</span>
          </h1>
        </div>

        <div 
          className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-205/80 shadow-inner cursor-pointer hover:bg-slate-100 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          <Calendar className="w-5 h-5 text-indigo-600" />
          <div className="text-left font-sans">
            <div className="text-[10px] text-slate-400 font-bold uppercase leading-none">TOTAL RECORDS</div>
            <div className="text-lg font-bold text-slate-800 mt-0.5">{visibleSubmissions.length} 位已提交</div>
          </div>
        </div>
      </div>

      {/* CORE EXPERIENCE METRICS LAYOUT (NPS & Gauge & Distribution Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* NPS Detailed Semicircle Gauge Card */}
        <div className="lg:col-span-5 bg-slate-50/50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              整体推荐意愿 (NPS 净推荐指数)
            </h3>
            
            <div className="relative group">
              <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-500 cursor-help" />
              <div className="absolute right-0 bottom-6 hidden group-hover:block w-64 bg-slate-900 border border-slate-800 p-3 rounded-lg text-[10px] text-slate-300 z-50 leading-relaxed shadow-xl">
                NPS = 强烈推荐者比例 (9-10分) 减去 贬损者比例 (0-6分)。所得区间为 -100 到 +100，正数表示优秀，大于50代表卓越表现。
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 py-4 items-center">
            {/* Semicircle Vector Dial */}
            <div className="col-span-5 flex flex-col items-center justify-center relative">
              <svg className="w-28 h-20" viewBox="0 0 100 60">
                {/* Dial background arc */}
                <path 
                  d="M10,50 A40,40 0 0,1 90,50" 
                  fill="none" 
                  stroke="#e2e8f0" 
                  strokeWidth="10" 
                  strokeLinecap="round" 
                />
                
                {/* Dynamically calculated colored fill arc */}
                {/* NPS score mapped to dashoffset. 
                    NPS ranges from -100 to 100 on an arc of length ~125.6 (PI * r).
                    Score + 100 converts -100..100 to 0..200.
                */}
                <path 
                  d="M10,50 A40,40 0 0,1 90,50" 
                  fill="none" 
                  stroke={npsMetrics.score >= 50 ? '#10b981' : npsMetrics.score >= 0 ? '#f59e0b' : '#ef4444'} 
                  strokeWidth="10" 
                  strokeLinecap="round" 
                  strokeDasharray="126"
                  strokeDashoffset={126 - (126 * Math.max(0, npsMetrics.score + 100)) / 200}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-3">
                <span className={`text-2xl font-black font-display leading-none ${getNpsGlowClass(npsMetrics.score)}`}>
                  {npsMetrics.score > 0 ? `+${npsMetrics.score}` : npsMetrics.score}
                </span>
                <span className="text-[8px] font-mono font-bold text-slate-400 mt-1 uppercase">NPS Score</span>
              </div>
            </div>

            {/* Score Breakdown Bars */}
            <div className="col-span-7 space-y-2.5">
              {/* Promoters (5) */}
              <div>
                <div className="flex justify-between text-[10px] mb-1 font-sans">
                  <span className="text-emerald-600 font-semibold text-[10.5px]">非常满意 (Promoter) | 5星</span>
                  <span className="text-emerald-700 font-medium font-mono">{npsMetrics.promoters}人 ({npsMetrics.promoterPercent}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${npsMetrics.promoterPercent}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>

              {/* Passive (4) */}
              <div>
                <div className="flex justify-between text-[10px] mb-1 font-sans">
                  <span className="text-amber-600 font-semibold text-[10.5px]">满意 (Passive) | 4星</span>
                  <span className="text-amber-700 font-medium font-mono">{npsMetrics.passives}人 ({npsMetrics.passivePercent}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${npsMetrics.passivePercent}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
              </div>

              {/* Detractors (1-3) */}
              <div>
                <div className="flex justify-between text-[10px] mb-1 font-sans">
                  <span className="text-rose-605 font-semibold text-[10.5px]">一般及以下 (Detractor) | 1-3分</span>
                  <span className="text-rose-700 font-medium font-mono">{npsMetrics.detractors}人 ({npsMetrics.detractorPercent}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${npsMetrics.detractorPercent}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-rose-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Q2 Event Section Value Distribution Gauge */}
        <div className="lg:col-span-7 bg-slate-50/50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-emerald-600" />
            各环节业务价值分布 (Q2)
          </h3>

          <div className="flex-1 flex flex-col justify-center space-y-3">
            {q2Dist.map((item, index) => {
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.fill}`}></span>
                      <span className="font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-mono font-semibold text-slate-600">
                      {item.count} 票 ({item.percent}%)
                    </span>
                  </div>

                  <div className="w-full h-3.5 bg-slate-100/60 rounded-xl overflow-hidden p-0.5 border border-slate-200/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-lg ${
                        item.key === 'A' 
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400' 
                          : item.key === 'B' 
                            ? 'bg-gradient-to-r from-cyan-500 to-cyan-400' 
                            : 'bg-gradient-to-r from-fuchsia-500 to-fuchsia-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CORE VISUALIZER: REAL-TIME KEYWORD WORD CLOUD (Q3) */}
      <div className="bg-slate-50/30 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-600" />
              下一届最期盼的加码干货 (Q3-实时共建词云)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              用户勾选后，代表该业务版块统计上升。标签百分比展示该诉求在供应商心中的热度指数。
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-full font-bold uppercase">
            Realtime Tag cloud
          </span>
        </div>

        {/* Word Cloud Tag Bubble Matrix */}
        <div id="word-cloud-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
          {tagCloud.map((item, idx) => {
            const isWinner = idx === 0;
            const isRunnerUp = idx === 1;
            
            const containerBg = isWinner 
              ? 'bg-indigo-50/60 border-indigo-200 shadow-sm' 
              : isRunnerUp 
                ? 'bg-white border-slate-200 shadow-xs' 
                : 'bg-white/80 border-slate-150';

            const rankBadge = isWinner
              ? 'bg-indigo-600 text-white'
              : isRunnerUp
                ? 'bg-slate-100 text-indigo-650'
                : 'bg-slate-100 text-slate-400';

            return (
              <motion.div
                id={`dashboard-q3-${idx}`}
                key={item.textEn}
                layout
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${containerBg}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-mono font-bold w-4 h-4 rounded flex items-center justify-center shrink-0 ${rankBadge}`}>
                        {idx + 1}
                      </span>
                      <span className={`text-sm font-bold tracking-tight ${isWinner ? 'text-indigo-900 text-base' : 'text-slate-850'}`}>
                        {item.text}
                      </span>
                    </div>
                    <span className="text-[10.5px] font-sans text-slate-400 block mt-1 ml-5 leading-none">
                      {item.textEn}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`text-base font-mono font-black ${isWinner ? 'text-indigo-600' : 'text-slate-600'}`}>
                      {item.count}票
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block leading-none">
                      占比 {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Mini Track */}
                <div className="mt-3">
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      className={`h-full rounded-full ${isWinner ? 'bg-indigo-600' : 'bg-slate-400'}`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* RECENT SUBMISSIONS FEED STREAM TABLE */}
      <div className="bg-slate-50/30 border border-slate-200 rounded-2xl p-6 flex flex-col flex-1 min-h-[300px] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">
              参会代表流与特质颁发滚轴 (Live Feed)
            </h3>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="feed-search"
                type="text"
                placeholder="搜索名字/企业"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white text-slate-705 placeholder-slate-400 text-[11px] pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-36 sm:w-44 transition-all shadow-inner"
              />
            </div>

            {/* Persona Switchers */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
              {['ALL', 'INNOVATOR', 'NAVIGATOR', 'ACCELERATOR', 'CONNECTOR'].map((cat) => {
                const label = cat === 'ALL' ? '全部' : cat === 'INNOVATOR' ? '创新先锋' : cat === 'NAVIGATOR' ? '领航舵手' : cat === 'ACCELERATOR' ? '增长引擎' : '社群链接者';
                const isSelected = filterPersona === cat;
                return (
                  <button
                    id={`filter-tab-${cat}`}
                    key={cat}
                    onClick={() => setFilterPersona(cat)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg transition-all ${
                      isSelected 
                        ? 'bg-white text-slate-800 font-bold border border-slate-200 shadow-xs'
                        : 'text-slate-500 hover:text-slate-750'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* List representation with virtual table row styling */}
        <div className="flex-1 overflow-y-auto max-h-[350px] space-y-2 pr-1">
          <AnimatePresence>
            {filteredSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Users className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
                <p className="text-xs">暂无匹配的签到回执数据</p>
              </div>
            ) : (
              filteredSubmissions.map((sub) => {
                const pers = PERSONA_DETAILS[sub.persona];
                const cleanTime = new Date(sub.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const optQ5Names = sub.q5Expectations.map(tag => {
                  const match = Q5_OPTIONS.find(o => o.key === tag);
                  return match ? match.labelZh : tag;
                }).join('、');

                return (
                  <motion.div
                    id={`feed-row-${sub.id}`}
                    key={sub.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3.5 bg-white border border-slate-150 hover:border-slate-300 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs tracking-wide hover:shadow-xs transition-colors"
                  >
                    <div className="flex-1 min-w-0 md:pr-4 flex items-center gap-3">
                      <div className="p-2 shrink-0 rounded-lg bg-slate-50 border border-slate-100 font-mono text-[10px] text-slate-500 font-semibold text-center leading-tight">
                        <div>{cleanTime}</div>
                      </div>
                      
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800 text-sm shrink-0">
                            {sub.name}
                          </span>
                          <span className="text-slate-400 text-[11px] shrink-0 font-sans">
                            ({sub.company})
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded border leading-none shrink-0 ${getBadgeStyle(sub.persona)}`}>
                            {pers.titleZh}
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-slate-500 mt-1 lines-clamp-1">
                          已勾选期望强化的内容: <span className="text-slate-700">{optQ5Names || '暂未勾选'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 shrink-0 md:border-l md:border-slate-100 md:pl-4">
                      {/* Rating score pill indicator */}
                      <div className="font-sans flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">评分 Rating:</span>
                        <div className="flex items-center gap-0.5 ml-1">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <Star key={score} className={`w-3.5 h-3.5 ${sub.q1Rating >= score ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                          ))}
                        </div>
                      </div>

                      {/* Gift representation */}
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150">
                        <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate max-w-[130px] font-medium text-slate-600">{pers.sticker} Sticker + 礼品</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail List Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col relative z-10 overflow-hidden font-sans"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  所有提交详情 (Admin View)
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {submissions.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">暂无数据</div>
                ) : (
                  submissions.map(sub => {
                    const isHidden = !!sub.isHidden;
                    const pers = PERSONA_DETAILS[sub.persona];
                    return (
                      <div 
                        key={sub.id} 
                        className={`p-4 border rounded-xl flex flex-col md:flex-row gap-4 justify-between transition-opacity ${isHidden ? 'opacity-40 border-slate-200 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-bold text-slate-800 text-[15px]">{sub.name}</span>
                            <span className="text-slate-500 text-xs">({sub.company})</span>
                            {isHidden && <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-500 font-bold ml-2">已隐藏</span>}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
                            <span className={`px-2 py-0.5 rounded border ${getBadgeStyle(sub.persona)}`}>{pers.titleZh}</span>
                            <span className="flex items-center gap-1">Rating: <span className="flex items-center">
                              {[1, 2, 3, 4, 5].map((score) => (
                                <Star key={score} className={`w-3 h-3 ${sub.q1Rating >= score ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                              ))}
                            </span></span>
                            <span>BU: {sub.businessUnit}</span>
                          </div>
                          {sub.email && (
                            <p className="text-[11px] text-slate-500 mb-1">
                              Email: {sub.email}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-500">
                            Expectations: {sub.q5Expectations.join(', ')}
                          </p>
                          <p className="text-[11px] text-slate-500 italic mt-1">
                            "{sub.q6Suggestions}"
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">
                            ID: {sub.id} • {new Date(sub.timestamp).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 md:border-l border-slate-100 md:pl-4">
                          <button
                            onClick={() => handleHide(sub.id)}
                            disabled={isHidden}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isHidden ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            隐藏
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            删除
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
