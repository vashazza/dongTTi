// 고유명사(Proper Noun) 목록 — 여기 추가하면 <Pn text="..."> 가 자동으로 배콜사 스크립트로 꾸며줘요.
// 표기는 대소문자를 무시하고 찾고, 화면에는 여기 적힌 표기로 보여줘요 (예: DONGTTI.ZIP → dongTTi.zip).
// 한글 이름은 넣지 마세요: 필기체 폰트(Dancing Script·Script Casual)에 한글 글자가 없어요.
export const PROPER_NOUNS = ['Dongcho Park', 'dongTTi.zip', 'dongTTi'];

export type PnSegment = { text: string; pn: boolean };

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// 긴 것부터 매칭해야 'dongTTi.zip'이 'dongTTi'보다 먼저 잡혀요
const RE = new RegExp(
  `(${[...PROPER_NOUNS].sort((a, b) => b.length - a.length).map(escape).join('|')})`,
  'gi',
);
const canonical = (m: string) => PROPER_NOUNS.find((n) => n.toLowerCase() === m.toLowerCase()) ?? m;

export function splitProperNouns(text: string): PnSegment[] {
  const out: PnSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(RE)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: text.slice(last, i), pn: false });
    out.push({ text: canonical(m[0]), pn: true });
    last = i + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), pn: false });
  return out;
}
