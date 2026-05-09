// 코드 system prompt 를 md 로 추출하는 헬퍼.
// 사용: npx tsx scripts/dump-system-prompts.ts
import { writeFileSync } from 'fs';
import {
  DEFAULT_PERSON_SYSTEM_PROMPT,
  DEFAULT_PAIR_SYSTEM_PROMPT,
} from '../lib/casting/prompts/system-prompts';
import { DEFAULT_INSTA_SYSTEM_PROMPT } from '../lib/casting/insta/system-prompt';

const HEADER = (title: string, sourcePath: string) => `# ${title} — System Prompt (current)

> 이 파일은 \`${sourcePath}\` 에서 자동 dump.
> 직접 수정하지 말고 source 갱신 후 다시 dump 하세요:
> \`\`\`
> npx tsx scripts/dump-system-prompts.ts
> \`\`\`

`;

const PROMPTS_DIR = 'docs/casting-template/prompts';

writeFileSync(
  `${PROMPTS_DIR}/system-prompt-person-current.md`,
  HEADER('PERSON BUNDLE', 'lib/casting/prompts/system-prompts.ts') + DEFAULT_PERSON_SYSTEM_PROMPT + '\n'
);
writeFileSync(
  `${PROMPTS_DIR}/system-prompt-pair-current.md`,
  HEADER('PAIR BUNDLE', 'lib/casting/prompts/system-prompts.ts') + DEFAULT_PAIR_SYSTEM_PROMPT + '\n'
);
writeFileSync(
  `${PROMPTS_DIR}/system-prompt-insta-current.md`,
  HEADER('INSTA BUNDLE', 'lib/casting/insta/system-prompt.ts') + DEFAULT_INSTA_SYSTEM_PROMPT + '\n'
);
console.log('✓ dumped:');
console.log(`  ${PROMPTS_DIR}/system-prompt-person-current.md`);
console.log(`  ${PROMPTS_DIR}/system-prompt-pair-current.md`);
console.log(`  ${PROMPTS_DIR}/system-prompt-insta-current.md`);
