import { FeedbackSubmission, PersonaType } from '../types';
import {
  fetchSubmissions as apiFetch,
  postSubmission as apiPost,
  patchSubmission as apiPatch,
  removeSubmission as apiRemove,
  pollSubmissions as apiPoll,
  checkApiHealth,
} from './api';
import {
  isTcbConfigured,
  tcbFetchSubmissions,
  tcbPostSubmission,
  tcbPatchSubmission,
  tcbRemoveSubmission,
  tcbPollSubmissions,
  tcbPing,
} from './tcb';

export type StorageMode = 'tcb' | 'local-api' | 'none';

export async function detectStorageMode(): Promise<StorageMode> {
  if (isTcbConfigured()) {
    const ok = await tcbPing();
    if (ok) return 'tcb';
    // Configured but ping failed — still prefer tcb path for writes (surface errors)
    return 'tcb';
  }
  if (await checkApiHealth()) return 'local-api';
  return 'none';
}

export function getPreferredMode(): StorageMode {
  if (isTcbConfigured()) return 'tcb';
  return 'local-api';
}

export async function saveSubmission(
  submission: Omit<FeedbackSubmission, 'id'> & { id?: string }
): Promise<FeedbackSubmission> {
  const existing = await listSubmissions().catch(() => []);
  const personas: PersonaType[] = [
    'INNOVATOR',
    'NAVIGATOR',
    'ACCELERATOR',
    'CONNECTOR',
  ];
  const available = personas.filter(
    (persona) => existing.filter((item) => item.persona === persona).length < 50
  );
  if (available.length === 0) {
    throw new Error('四种角色均已达到 50 人上限');
  }
  const persona = available[Math.floor(Math.random() * available.length)];
  const finalized = { ...submission, persona };
  if (isTcbConfigured()) return tcbPostSubmission(finalized);
  return apiPost(finalized);
}

export async function listSubmissions(): Promise<FeedbackSubmission[]> {
  if (isTcbConfigured()) return tcbFetchSubmissions();
  return apiFetch();
}

export async function hideSubmission(
  id: string,
  isHidden = true
): Promise<void> {
  if (isTcbConfigured()) {
    await tcbPatchSubmission(id, { isHidden });
    return;
  }
  await apiPatch(id, { isHidden });
}

export async function destroySubmission(id: string): Promise<void> {
  if (isTcbConfigured()) {
    await tcbRemoveSubmission(id);
    return;
  }
  await apiRemove(id);
}

export function subscribeSubmissions(
  callback: (submissions: FeedbackSubmission[]) => void
): () => void {
  if (isTcbConfigured()) return tcbPollSubmissions(callback);
  return apiPoll(callback);
}
