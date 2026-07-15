import { contentItems, type ContentItem } from "./fixtures.ts";

export const previewStates = ["ready", "loading", "empty", "error", "focus"];

export function filterItems(query: string, topic: string, items: ContentItem[] = contentItems) {
  const normalized = query.trim().toLocaleLowerCase("ko");
  return items.filter((item) => {
    const topicMatch = topic === "전체" || item.topics.includes(topic);
    const queryMatch =
      normalized.length === 0 ||
      [item.title, item.summary, item.kind, item.repositoryPath, ...item.topics]
        .join(" ")
        .toLocaleLowerCase("ko")
        .includes(normalized);
    return topicMatch && queryMatch;
  });
}

export function resultLabel(count: number) {
  return `${count}개 자료`;
}
