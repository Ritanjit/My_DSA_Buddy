export type MessageType = 'PROBLEM_SOLVED' | 'SYNC_STATUS' | 'SETTINGS_UPDATED' | 'SYNC_ALL_TO_GITHUB' | 'FLUSH_QUEUE' | 'UNLINK_GITHUB' | 'LOGOUT';

export interface ProblemSolvedPayload {
  problemId: number;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  language: string;
  solution: string;
  url: string;
}

export interface SyncStatusPayload {
  success: boolean;
  problemTitle: string;
  error?: string;
}

export interface SyncAllProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: boolean;
}

export interface ExtensionMessage {
  type: MessageType;
  payload: ProblemSolvedPayload | SyncStatusPayload | SyncAllProgress | Record<string, unknown>;
}

export function sendToBackground(message: ExtensionMessage): Promise<unknown> {
  return chrome.runtime.sendMessage(message);
}

export function onMessage(
  handler: (message: ExtensionMessage, sender: chrome.runtime.MessageSender) => void | Promise<unknown>
): void {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const result = handler(message as ExtensionMessage, sender);
    if (result instanceof Promise) {
      result.then(sendResponse);
      return true;
    }
  });
}
