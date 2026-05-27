import type { ProblemSolvedPayload } from '../shared/messaging';

let lastSubmittedSlug: string | null = null;
let isWaitingForResult = false;
let resultTimeout: ReturnType<typeof setTimeout> | null = null;
let currentPath = window.location.pathname;

function getSlugFromPath(path: string): string | null {
  const match = path.match(/\/problems\/([^/]+)/);
  return match ? match[1] : null;
}

function extractSlug(): string {
  const match = window.location.pathname.match(/\/problems\/([^/]+)/);
  return match ? match[1] : '';
}

function extractTitle(): string {
  const titleEl = document.querySelector('[data-cy="question-title"]');
  if (titleEl?.textContent) return titleEl.textContent.trim();

  const docTitle = document.title.replace(/ - LeetCode$/, '').trim();
  if (docTitle && docTitle !== 'LeetCode') return docTitle;

  const slug = extractSlug();
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractProblemId(): number {
  const titleEl = document.querySelector('[data-cy="question-title"]');
  if (titleEl?.textContent) {
    const match = titleEl.textContent.match(/^(\d+)\./);
    if (match) return parseInt(match[1], 10);
  }

  const links = document.querySelectorAll('a[href*="/problems/"]');
  for (const link of links) {
    const text = link.textContent?.trim() || '';
    const match = text.match(/^(\d+)\./);
    if (match) return parseInt(match[1], 10);
  }

  return 0;
}

function extractDifficulty(): 'Easy' | 'Medium' | 'Hard' {
  const diffSelectors = [
    '[class*="text-difficulty-easy"]',
    '[class*="text-difficulty-medium"]',
    '[class*="text-difficulty-hard"]',
    '[class*="text-easy"]',
    '[class*="text-medium"]',
    '[class*="text-hard"]',
    '[diff]',
  ];

  for (const sel of diffSelectors) {
    const el = document.querySelector(sel);
    if (el) {
      const text = el.textContent?.trim().toLowerCase() || '';
      if (text.includes('easy')) return 'Easy';
      if (text.includes('medium')) return 'Medium';
      if (text.includes('hard')) return 'Hard';
    }
  }

  const spans = document.querySelectorAll('span');
  for (const span of spans) {
    const text = span.textContent?.trim() || '';
    if (text === 'Easy' || text === 'Medium' || text === 'Hard') {
      return text as 'Easy' | 'Medium' | 'Hard';
    }
  }

  return 'Medium';
}

function extractLanguage(): string {
  const selectors = [
    '[class*="lang-btn"]',
    'button[id*="lang"]',
    '[class*="language-selector"] button',
    '[class*="ant-select-selection-item"]',
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el?.textContent) {
      const lang = el.textContent.trim().toLowerCase();
      if (lang && lang.length < 20) return lang;
    }
  }

  return 'unknown';
}

function extractSolution(): string {
  try {
    const w = window as unknown as { monaco?: { editor: { getModels: () => Array<{ getValue: () => string }> } } };
    if (w.monaco?.editor) {
      const models = w.monaco.editor.getModels();
      if (models.length > 0) return models[0].getValue();
    }
  } catch {}

  const viewLines = document.querySelectorAll('.view-lines .view-line');
  if (viewLines.length > 0) {
    return Array.from(viewLines).map((line) => line.textContent || '').join('\n');
  }

  return '';
}

function extractTopics(): string[] {
  const els = document.querySelectorAll('a[href*="/tag/"]');
  return Array.from(els)
    .map((el) => el.textContent?.trim() ?? '')
    .filter(Boolean);
}

function buildPayload(): ProblemSolvedPayload {
  return {
    problemId: extractProblemId(),
    slug: extractSlug(),
    title: extractTitle(),
    difficulty: extractDifficulty(),
    topics: extractTopics(),
    language: extractLanguage(),
    solution: extractSolution(),
    url: window.location.href.split('?')[0],
  };
}

function handleAccepted(): void {
  if (!isWaitingForResult) return;

  const slug = extractSlug();
  if (!slug) return;

  isWaitingForResult = false;
  lastSubmittedSlug = slug;
  if (resultTimeout) {
    clearTimeout(resultTimeout);
    resultTimeout = null;
  }

  console.log('[DSA Buddy] Accepted detected for:', slug);

  setTimeout(() => {
    try {
      const payload = buildPayload();
      if (!payload.title || !payload.slug) return;
      console.log('[DSA Buddy] Sending PROBLEM_SOLVED to background:', payload.title);
      chrome.runtime.sendMessage({ type: 'PROBLEM_SOLVED', payload }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[DSA Buddy] Message send error:', chrome.runtime.lastError.message);
        } else {
          console.log('[DSA Buddy] Background response:', response);
        }
      });
    } catch (err) {
      console.error('[DSA Buddy] Error extracting problem data:', err);
    }
  }, 1500);
}

function isAcceptedVisible(): boolean {
  const resultEl = document.querySelector('[data-e2e-locator="submission-result"]');
  if (resultEl?.textContent?.toLowerCase().includes('accepted')) return true;

  const successEls = document.querySelectorAll('[class*="success"]');
  for (const el of successEls) {
    const text = el.textContent?.trim().toLowerCase() || '';
    if (text === 'accepted') return true;
  }

  return false;
}

function findSubmitButton(): HTMLElement | null {
  const selectors = [
    '[data-e2e-locator="console-submit-button"]',
    'button[data-cy="submit-code-btn"]',
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (el) return el;
  }

  const buttons = document.querySelectorAll('button');
  for (const btn of buttons) {
    const text = btn.textContent?.trim().toLowerCase() || '';
    if (text === 'submit' || text === 'submit code') {
      return btn;
    }
  }

  return null;
}

function hookSubmitButton(): void {
  const btn = findSubmitButton();
  if (btn && !btn.dataset.dsaBuddyHooked) {
    btn.dataset.dsaBuddyHooked = 'true';
    btn.addEventListener('click', onSubmitClicked);
    console.log('[DSA Buddy] Submit button hooked');
  }
}

function onSubmitClicked(): void {
  console.log('[DSA Buddy] Submit clicked');

  // Remove existing result element so we can detect the fresh one
  const existingResult = document.querySelector('[data-e2e-locator="submission-result"]');
  if (existingResult) {
    existingResult.remove();
  }

  lastSubmittedSlug = null;
  isWaitingForResult = true;

  if (resultTimeout) clearTimeout(resultTimeout);
  resultTimeout = setTimeout(() => {
    isWaitingForResult = false;
    console.log('[DSA Buddy] Result timeout — stopped waiting');
  }, 30000);
}

function resetStateForNavigation(): void {
  lastSubmittedSlug = null;
  isWaitingForResult = false;
  if (resultTimeout) {
    clearTimeout(resultTimeout);
    resultTimeout = null;
  }
}

function observeSubmissionResult(): void {
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
      const newPath = window.location.pathname;
      const oldSlug = getSlugFromPath(currentPath);
      const newSlug = getSlugFromPath(newPath);
      currentPath = newPath;

      if (newPath.includes('/problems/')) {
        if (newSlug !== oldSlug) {
          console.log('[DSA Buddy] Navigated to new problem:', newSlug);
          resetStateForNavigation();
        }
        hookSubmitButton();
      }
    }

    hookSubmitButton();

    if (isWaitingForResult && isAcceptedVisible()) {
      handleAccepted();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true, characterData: true });

  hookSubmitButton();

  setInterval(() => {
    if (window.location.pathname !== currentPath) {
      const newPath = window.location.pathname;
      const oldSlug = getSlugFromPath(currentPath);
      const newSlug = getSlugFromPath(newPath);
      currentPath = newPath;

      if (newPath.includes('/problems/')) {
        if (newSlug !== oldSlug) {
          console.log('[DSA Buddy] Navigated to new problem (poll):', newSlug);
          resetStateForNavigation();
        }
        hookSubmitButton();
      }
    }

    hookSubmitButton();
    if (isWaitingForResult && isAcceptedVisible()) {
      handleAccepted();
    }
  }, 2000);
}

if (window.location.hostname === 'leetcode.com' && window.location.pathname.includes('/problems/')) {
  console.log('[DSA Buddy] Content script initialized on:', window.location.pathname);
  observeSubmissionResult();
}
