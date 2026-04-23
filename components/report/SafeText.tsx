import { ReactNode } from 'react';

/**
 * mockData의 제한된 마크업만 렌더링 — `<b>강조</b>` 와 `<blur>가림</blur>` 두 종만 허용.
 * 중첩/다른 태그는 리터럴로 출력됨. `dangerouslySetInnerHTML` 전면 제거 목적.
 */
export function SafeText({ children }: { children: string }) {
  return <>{tokenize(children)}</>;
}

const PATTERN = /<(b|blur)>([^<]*)<\/\1>/g;

function tokenize(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let idx = 0;
  while ((match = PATTERN.exec(text)) !== null) {
    if (match.index > cursor) out.push(text.slice(cursor, match.index));
    const [, tag, inner] = match;
    if (tag === 'b') {
      out.push(<b key={idx++}>{inner}</b>);
    } else {
      out.push(
        <span key={idx++} className="blur-text">
          {inner}
        </span>,
      );
    }
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}
