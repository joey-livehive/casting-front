// 코드 system prompt 를 md 로 추출하는 헬퍼.
// 사용: npx tsx scripts/dump-system-prompts.ts
import { writeFileSync } from 'fs';
import {
  DEFAULT_PERSON_SYSTEM_PROMPT,
  DEFAULT_PAIR_SYSTEM_PROMPT,
} from '../lib/casting/prompts/system-prompts';

const HEADER = (title: string) => `# ${title} — System Prompt (current)

> 이 파일은 \`lib/casting/prompts/system-prompts.ts\` 에서 자동 dump.
> 직접 수정하지 말고 \`system-prompts.ts\` 갱신 후 다시 dump 하세요:
> \`\`\`
> npx tsx scripts/dump-system-prompts.ts
> \`\`\`

`;

writeFileSync(
  'docs/casting-template/prompts/system-prompt-person-current.md',
  HEADER('PERSON BUNDLE') + DEFAULT_PERSON_SYSTEM_PROMPT + '\n'
);
writeFileSync(
  'docs/casting-template/prompts/system-prompt-pair-current.md',
  HEADER('PAIR BUNDLE') + DEFAULT_PAIR_SYSTEM_PROMPT + '\n'
);
console.log('✓ dumped:');
console.log('  docs/casting-template/prompts/system-prompt-person-current.md');
console.log('  docs/casting-template/prompts/system-prompt-pair-current.md');
