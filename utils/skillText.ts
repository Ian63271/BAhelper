import { buffNames } from '@/constants/buffLabels';

// Skill descriptions from SchaleDB embed two kinds of tags:
//   <?N>   — per-level parameter, filled from parameters[N-1][level-1]
//   <x:Y>  — buff reference, x in b(uff)/d(ebuff)/c(rowd control)/s(pecial),
//            Y a key into buffNames (e.g. <b:AttackPower>)
// parseSkillDesc splits a description into typed segments so the UI can style
// values and buff names without dangerouslySetInnerHTML-style rendering.

export type SkillSegmentKind = 'plain' | 'value' | 'buff' | 'debuff' | 'cc' | 'special';

export interface SkillSegment {
  text: string;
  kind: SkillSegmentKind;
}

const TAG_KINDS: Record<string, SkillSegmentKind> = {
  b: 'buff',
  d: 'debuff',
  c: 'cc',
  s: 'special',
};

export function parseSkillDesc(
  desc: string,
  parameters: string[][] | undefined,
  level: number,
): SkillSegment[] {
  const segments: SkillSegment[] = [];
  let cursor = 0;

  for (const match of desc.matchAll(/<\?(\d+)>|<([bdcs]):([^>]+)>/g)) {
    if (match.index > cursor) {
      segments.push({ text: desc.slice(cursor, match.index), kind: 'plain' });
    }
    if (match[1] !== undefined) {
      // Clamp the level for unreleased students whose parameter arrays can be
      // short; fall back to the raw tag if the placeholder has no data at all.
      const values = parameters?.[Number(match[1]) - 1];
      if (values?.length) {
        segments.push({ text: values[Math.min(level, values.length) - 1], kind: 'value' });
      } else {
        segments.push({ text: match[0], kind: 'plain' });
      }
    } else {
      segments.push({ text: buffNames[match[3]] ?? match[3], kind: TAG_KINDS[match[2]] });
    }
    cursor = match.index + match[0].length;
  }

  if (cursor < desc.length) {
    segments.push({ text: desc.slice(cursor), kind: 'plain' });
  }

  return segments;
}
