import { ReactNode } from 'react';

/**
 * mockData의 제한된 마크업만 렌더링 — `<b>강조</b>` 와 `<blur>가림</blur>` 두 종 허용.
 * 중첩 지원 (예: `<b>조용한 <blur>◯◯◯</blur></b>`).
 * 짝이 안 맞거나 다른 태그는 리터럴로 출력. `dangerouslySetInnerHTML` 전면 제거 목적.
 */
export function SafeText({ children }: { children: string }) {
  return <>{tokenize(children)}</>;
}

const OPEN_RE = /<(b|blur)>/;

function tokenize(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  while (cursor < text.length) {
    const open = text.slice(cursor).match(OPEN_RE);
    if (!open) {
      out.push(text.slice(cursor));
      break;
    }
    const openIdx = cursor + (open.index ?? 0);
    const tag = open[1] as 'b' | 'blur';

    if (openIdx > cursor) out.push(text.slice(cursor, openIdx));

    const contentStart = openIdx + open[0].length;
    const closeIdx = findMatchingClose(text, tag, contentStart);
    if (closeIdx === -1) {
      // 짝 없는 태그는 리터럴로 출력 후 종료
      out.push(text.slice(openIdx));
      break;
    }

    const inner = text.slice(contentStart, closeIdx);
    const innerNodes = tokenize(inner);
    if (tag === 'b') {
      out.push(<b key={key++}>{innerNodes}</b>);
    } else {
      out.push(
        <span key={key++} className="blur-text">
          {innerNodes}
        </span>,
      );
    }
    cursor = closeIdx + `</${tag}>`.length;
  }

  return out;
}

/** 중첩 깊이를 카운트해서 매칭되는 닫힘 태그 위치 반환. 없으면 -1. */
function findMatchingClose(text: string, tag: 'b' | 'blur', from: number): number {
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  let depth = 1;
  let i = from;
  while (i < text.length) {
    if (text.startsWith(close, i)) {
      depth--;
      if (depth === 0) return i;
      i += close.length;
    } else if (text.startsWith(open, i)) {
      depth++;
      i += open.length;
    } else {
      i++;
    }
  }
  return -1;
}
