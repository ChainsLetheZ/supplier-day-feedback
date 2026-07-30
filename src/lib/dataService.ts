import { FeedbackSubmission } from '../types';
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
  if (isTcbConfigured()) return tcbPostSubmission(submission);
  return apiPost(submission);
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
