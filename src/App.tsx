import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { FeedbackSubmission } from './types';

import PhoneSimulator from './components/PhoneSimulator';
import BigScreenDashboard from './components/BigScreenDashboard';
import { saveSubmission, subscribeSubmissions } from './lib/dataService';
import {
  loadMySubmission,
  saveMySubmission,
  clearMySubmission,
  loadMirrorSubmissions,
  upsertMirrorSubmission,
  updateMirrorSubmission,
  removeMirrorSubmission,
  mergeSubmissions,
} from './lib/localStore';

const personaLabel = (persona: FeedbackSubmission['persona']) =>
  persona === 'INNOVATOR'
    ? '创新共创者'
    : persona === 'NAVIGATOR'
      ? '远见领航者'
      : persona === 'ACCELERATOR'
        ? '高效推进者'
        : '生态链接者';

type Notification = {
  message: string;
  type: 'success' | 'info' | 'error';
};

function Toast({ notification }: { notification: Notification | null }) {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          id="toast-notification"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 p-4 rounded-xl shadow-2xl sm:max-w-md border text-xs leading-relaxed flex items-start gap-3.5 backdrop-blur-md ${
            notification.type === 'success'
              ? 'bg-slate-900/95 border-emerald-500/30'
              : notification.type === 'error'
                ? 'bg-slate-900/95 border-rose-500/40'
                : 'bg-slate-900/95 border-indigo-500/30'
          }`}
        >
          <div className="p-1.5 rounded-lg shrink-0 bg-indigo-550 text-white">
            <Sparkles className="w-3.5 h-3.5 font-bold" />
          </div>
          <div>
            <h5 className="font-bold text-[12px] uppercase tracking-wider mb-0.5 text-white">
              {notification.type === 'success'
                ? '提交成功'
                : notification.type === 'error'
                  ? '提交异常'
                  : '会场通知'}
            </h5>
            <p className="text-slate-300 font-sans">{notification.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** 手机端问卷：不订阅全量数据，避免不必要的重渲染与流量消耗 */
function MobileRoute() {
  const [lastSubmission, setLastSubmission] = useState<FeedbackSubmission | null>(
    () => loadMySubmission()
  );
  const [notification, setNotification] = useState<Notification | null>(null);

  const triggerNotification = (
    message: string,
    type: Notification['type'] = 'success'
  ) => {
    setNotification({ message, type });
    window.setTimeout(() => setNotification(null), 5000);
  };

  const handleAddNewFeedback = async (submission: FeedbackSubmission) => {
    const localDoc: FeedbackSubmission = {
      ...submission,
      id: submission.id || `local-${Date.now()}`,
    };

    // 先本地留存，保证嘉宾一定能看到自己的结果
    saveMySubmission(localDoc);
    upsertMirrorSubmission(localDoc);
    setLastSubmission(localDoc);

    try {
      const savedDoc = await saveSubmission(localDoc);
      saveMySubmission(savedDoc);
      upsertMirrorSubmission(savedDoc);
      setLastSubmission(savedDoc);

      const firstName =
        savedDoc.name
          ? savedDoc.name.length > 3
            ? savedDoc.name.substring(0, 3)
            : savedDoc.name
          : '嘉宾';
      triggerNotification(
        `感谢 ${firstName}！您已获得「${personaLabel(savedDoc.persona)}」专属勋章。`
      );
      return savedDoc;
    } catch (e) {
      console.error('Cloud save failed:', e);
      triggerNotification(
        '您的结果已生成，但网络提交未成功，请稍后重试或联系现场工作人员。',
        'error'
      );
      return localDoc;
    }
  };

  const handleResetDemoState = () => {
    setLastSubmission(null);
    clearMySubmission();
  };

  return (
    <div
      id="app-root-container"
      className="h-[100dvh] w-full bg-[#F8FAFC] text-[#1E293B] selection:bg-indigo-600 selection:text-white overflow-hidden"
    >
      <div className="w-full h-full flex flex-col">
        <PhoneSimulator
          onSubmitFeedback={handleAddNewFeedback}
          lastSubmission={lastSubmission}
          onResetDemo={handleResetDemoState}
        />
      </div>

      <Toast notification={notification} />
    </div>
  );
}

/** 大屏看板：只有这里需要持续拉取全量数据 */
function DashboardRoute() {
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>(() =>
    loadMirrorSubmissions()
  );

  useEffect(() => {
    const unsub = subscribeSubmissions((data) => {
      setSubmissions((prev) => mergeSubmissions(data, prev));
    });
    return () => unsub();
  }, []);

  const handleHideLocal = (id: string) => {
    updateMirrorSubmission(id, { isHidden: true });
    setSubmissions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isHidden: true } : item))
    );
  };

  const handleDeleteLocal = (id: string) => {
    removeMirrorSubmission(id);
    setSubmissions((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <BigScreenDashboard
      submissions={submissions}
      onHidden={handleHideLocal}
      onDeleted={handleDeleteLocal}
    />
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MobileRoute />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
      </Routes>
    </HashRouter>
  );
}
