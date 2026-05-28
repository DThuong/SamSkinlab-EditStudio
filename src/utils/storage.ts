import { defaultBubbleContent } from '../data/bubbleTemplates';
import type { BubbleContent } from '../types/bubble';

const CONTENT_KEY = 'sam-bubble-content-v1';

export function loadContent(): BubbleContent {
  try {
    const raw = localStorage.getItem(CONTENT_KEY);
    if (!raw) return defaultBubbleContent;
    const parsed = JSON.parse(raw) as BubbleContent;
    return {
      ...defaultBubbleContent,
      ...parsed,
      services: Array.isArray(parsed.services) ? parsed.services : defaultBubbleContent.services,
    };
  } catch {
    return defaultBubbleContent;
  }
}

export function saveContent(content: BubbleContent) {
  localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
}

export function resetContent() {
  localStorage.removeItem(CONTENT_KEY);
}
