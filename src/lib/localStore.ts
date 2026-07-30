import { FeedbackSubmission } from '../types';

const MY_KEY = 'my_supplier_submission';
const MIRROR_KEY = 'supplier_day_submissions_mirror';
const CHANNEL = 'supplier-day-feedback';

export function loadMySubmission(): FeedbackSubmission | null {
  try {
    const raw = localStorage.getItem(MY_KEY);
    return raw ? (JSON.parse(raw) as FeedbackSubmission) : null;
  } catch {
    return null;
  }
}

export function saveMySubmission(submission: FeedbackSubmission) {
  localStorage.setItem(MY_KEY, JSON.stringify(submission));
}

export function clearMySubmission() {
  localStorage.removeItem(MY_KEY);
}

export function loadMirrorSubmissions(): FeedbackSubmission[] {
  try {
    const raw = localStorage.getItem(MIRROR_KEY);
    return raw ? (JSON.parse(raw) as FeedbackSubmission[]) : [];
  } catch {
    return [];
  }
}

export function upsertMirrorSubmission(submission: FeedbackSubmission) {
  const list = loadMirrorSubmissions();
  const idx = list.findIndex(
    (s) => s.id && submission.id && s.id === submission.id
  );
  if (idx >= 0) {
    list[idx] = submission;
  } else {
    // Dedupe by name+company+timestamp if id changed after cloud sync
    const softIdx = list.findIndex(
      (s) =>
        s.name === submission.name &&
        s.company === submission.company &&
        s.timestamp === submission.timestamp
    );
    if (softIdx >= 0) {
      list[softIdx] = submission;
    } else {
      list.push(submission);
    }
  }
  // Keep latest 200
  const trimmed = list
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-200);
  localStorage.setItem(MIRROR_KEY, JSON.stringify(trimmed));
  broadcastSubmission(submission);
  return trimmed;
}

export function mergeSubmissions(
  remote: FeedbackSubmission[],
  local: FeedbackSubmission[]
): FeedbackSubmission[] {
  const map = new Map<string, FeedbackSubmission>();
  const softKey = (s: FeedbackSubmission) =>
    `${s.name}|${s.company}|${s.timestamp}`;

  [...local, ...remote].forEach((s) => {
    const key = s.id || softKey(s);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, s);
      return;
    }
    // Prefer cloud id / newer hidden flag
    map.set(key, {
      ...existing,
      ...s,
      id: s.id || existing.id,
      isHidden: s.isHidden ?? existing.isHidden,
    });
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

export function broadcastSubmission(submission: FeedbackSubmission) {
  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.postMessage({ type: 'upsert', submission });
    bc.close();
  } catch {
    // BroadcastChannel unsupported — ignore
  }
}

export function subscribeLocalSubmissions(
  callback: (submission: FeedbackSubmission) => void
): () => void {
  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(CHANNEL);
    bc.onmessage = (event) => {
      if (event.data?.type === 'upsert' && event.data.submission) {
        callback(event.data.submission);
      }
    };
  } catch {
    bc = null;
  }

  const onStorage = (e: StorageEvent) => {
    if (e.key !== MIRROR_KEY || !e.newValue) return;
    try {
      const list = JSON.parse(e.newValue) as FeedbackSubmission[];
      const latest = list[list.length - 1];
      if (latest) callback(latest);
    } catch {
      // ignore
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    bc?.close();
    window.removeEventListener('storage', onStorage);
  };
}
