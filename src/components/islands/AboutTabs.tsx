import { useEffect, useState } from 'react';

interface Paper { id: string; role: string; title: string; venue: string; status: string; note: string; link?: string }
interface Project { id: string; no: string; tag: string; name: string; desc: string; stack: string[]; link?: string; upcoming?: boolean }
interface Award { id: string; prize: string; name: string; year?: number }

type Tab = 'papers' | 'projects' | 'awards' | 'stack';
/** 프로젝트 id → 관련 글로 가는 링크 (글이 1개면 그 글, 여러 개면 프로젝트 페이지) */
export type Related = Record<string, { count: number; href: string }>;

interface Props {
  papers: Paper[];
  projects: Project[];
  awards: Award[];
  stack: { group: string; items: string[] }[];
  related?: Related;
}

const TITLES: Record<Tab, string> = { papers: 'last papers', projects: 'project closet', awards: 'awards & honors', stack: 'tech stack' };
const ROLE_COLOR: Record<string, string> = { '1st': '#FF0099', '2nd': '#1A2FD1', '3rd': '#3A8A2B', co: '#555' };

export default function AboutTabs({ papers, projects, awards, stack, related = {} }: Props) {
  const [tab, setTab] = useState<Tab>('papers');
  const [pi, setPi] = useState(0);
  const [dir, setDir] = useState<'next' | 'prev'>('next');
  const go = (step: 1 | -1) => { setDir(step === 1 ? 'next' : 'prev'); setPi(pi + step); };
  const current = ((pi % projects.length) + projects.length) % projects.length;
  const tabs = Object.keys(TITLES) as Tab[];

  // /about?tab=projects&p=<프로젝트 id> 로 들어오면 그 프로젝트를 바로 펼쳐요 (프로젝트 페이지의 '돌아가기' 링크용)
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const t = q.get('tab');
    if (t && t in TITLES) setTab(t as Tab);
    const i = projects.findIndex((p) => p.id === q.get('p'));
    if (i >= 0) setPi(i);
  }, []);

  return (
    <div className="about-tabs">
      <div className="nav" role="tablist">
        {tabs.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="cols">
        <div className="content-col">
          <div className="panel content">
            <div className="bar">
              <span>{TITLES[tab]}</span>
            </div>
            <div className="inner pop" key={tab}>
              {tab === 'papers' && papers.map((p) => (
                <a className="paper" key={p.id} href={p.link} target="_blank" rel="noopener">
                  <span className="f-accent role" style={{ background: ROLE_COLOR[p.role] }}>{p.role}</span>
                  <div>
                    <div className="f-display ptitle">{p.title}</div>
                    <div className="venue">{p.venue}{p.status === 'under-review' ? ' (under review)' : ''}</div>
                    <div className="f-ui note">{p.note}</div>
                  </div>
                </a>
              ))}

              {/* 프로젝트는 한 칸에 겹쳐 두고 보이는 것만 바꿔요 → 넘겨도 창 크기가 그대로, 스크롤 없음 */}
              {tab === 'projects' && (
                <div className="stack-cell">
                  {projects.map((proj, i) => (
                    <div className={`closet${i === current ? ` on from-${dir}` : ''}`} key={proj.id} aria-hidden={i !== current}>
                      <div className="swatch">
                        <span className="f-accent no">{proj.no}</span>
                        <span className="f-hand">{proj.tag}</span>
                      </div>
                      <div className="pinfo">
                        <span className="f-display pname">{proj.upcoming ? '[진행 예정] ' : ''}{proj.name}</span>
                        <span className="f-ui">{proj.desc}</span>
                        <div className="tags">{proj.stack.map((s) => <span className="f-accent" key={s}>{s}</span>)}</div>
                        {related[proj.id] && (
                          <a className="btn-pill more" href={related[proj.id].href} tabIndex={i === current ? 0 : -1}>
                            more about this ▶{related[proj.id].count > 1 ? ` (${related[proj.id].count} posts)` : ''}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'awards' && awards.map((a) => (
                <div className="award" key={a.id}>
                  <span className="f-display prize">{a.prize}</span>
                  <span className="aname">{a.name}</span>
                  {a.year && <span className="f-display ayear">{a.year}</span>}
                </div>
              ))}

              {tab === 'stack' && stack.map((g) => (
                <div className="stack" key={g.group}>
                  <span className="f-display group">{g.group}</span>
                  <div className="tags">{g.items.map((i) => <span className="f-accent" key={i}>{i}</span>)}</div>
                </div>
              ))}
            </div>
          </div>

          {tab === 'projects' && (
            <div className="arrows">
              <button type="button" className="glossy glossy--yellow" aria-label="이전 프로젝트" onClick={() => go(-1)}>◀</button>
              <span className="f-accent count">{current + 1} / {projects.length}</span>
              <button type="button" className="glossy glossy--yellow" aria-label="다음 프로젝트" onClick={() => go(1)}>▶</button>
            </div>
          )}
        </div>

        <div className="side">
          <div className="f-display dream-title">dreamscape</div>
          <div className="dream-sub">dongTTi, GPU-poor researcher</div>
          <p className="f-read" style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            세브란스에서 심혈관 영상으로 의료 AI를 시작했고, KAIST에서 뇌 MRI 판독문 생성 모델을 평가하고 최적화했어요.
            지금은 좋은 모델을 병원 서버 한 대에서도 돌아가게 만드는 일에 꽂혀 있어요.
          </p>
        </div>
      </div>

      <style>{`
        .about-tabs { display: flex; flex-direction: column; gap: 20px; }
        .about-tabs .nav { background: #FFFFFF; border: 3px solid #3F6FD8; box-shadow: inset 0 0 0 3px #CFE0FF;
          display: flex; flex-wrap: wrap; justify-content: space-around; padding: 2px 10px; }
        .about-tabs .nav button { background: none; border: none; color: var(--link); font-size: 15px; font-family: var(--font-read); font-style: italic; text-transform: uppercase; letter-spacing: .02em; padding: 8px 6px; min-height: 44px; text-underline-offset: 4px; }
        .about-tabs .nav button[aria-selected="true"] { color: var(--link-hover); text-decoration: underline; }
        .about-tabs .nav button:hover { text-decoration: underline; }
        .about-tabs .cols { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
        .about-tabs .panel { background: #FFFFFF; border: 3px solid #3F6FD8; box-shadow: inset 0 0 0 3px #CFE0FF, 5px 5px 0 rgba(10,26,110,.35); }
        .about-tabs .content-col { flex: 999 1 520px; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .about-tabs .content { width: 100%; }
        .about-tabs .stack-cell { display: grid; overflow: hidden; }
        .about-tabs .stack-cell > .closet { grid-area: 1 / 1; visibility: hidden; }
        .about-tabs .stack-cell > .closet.on { visibility: visible; }
        .about-tabs .closet.on.from-next { animation: slide-from-right .35s ease both; }
        .about-tabs .closet.on.from-prev { animation: slide-from-left .35s ease both; }
        @keyframes slide-from-right { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: none; } }
        @keyframes slide-from-left { from { opacity: 0; transform: translateX(-60px); } to { opacity: 1; transform: none; } }
        .about-tabs .side { flex: 1 1 260px; padding: 18px; display: flex; flex-direction: column; gap: 10px; rotate: 1deg;
          background: linear-gradient(180deg,#FFE3F1 0%,#FFFFFF 70%); border: 3px dashed var(--hot); border-radius: 18px; box-shadow: 5px 5px 0 var(--hot-deep); }
        .about-tabs .dream-title { font-family: var(--font-script); font-size: 28px; color: var(--hot-deep); }
        .about-tabs .dream-sub { font-size: 13px; color: var(--violet); }
        .about-tabs .bar { background: linear-gradient(180deg,#F4F8FF,#C9DBFF); border-bottom: 2px solid #3F6FD8; padding: 6px 12px; font-size: 14px; }
        .about-tabs .inner { padding: 18px; display: flex; flex-direction: column; gap: 14px; }
        .about-tabs .paper { display: flex; gap: 14px; border-bottom: 1px dashed #9DB4F5; padding-bottom: 14px; color: inherit; text-decoration: none; }
        .about-tabs a.paper[href]:hover .ptitle { color: var(--link-hover); }
        .about-tabs .role { flex: none; color: #FFFFFF; font-size: 15px; border: 1.5px solid #0A1A6E; padding: 0 8px; min-width: 56px; text-align: center; height: fit-content; }
        .about-tabs .ptitle { font-size: 18px; font-weight: 700; color: #0A1A6E; line-height: 1.3; }
        .about-tabs .venue { font-size: 14px; color: #D4001A; margin-top: 4px; }
        .about-tabs .note { font-size: 14px; color: #3A4A8A; margin-top: 2px; }
        .about-tabs .closet { display: flex; flex-wrap: wrap; gap: 16px; }
        .about-tabs .swatch { flex: 1 1 200px; min-height: 200px; border: 2px solid #0A1A6E; color: #FFFFFF;
          background: linear-gradient(135deg,#FF7AD9 0%,#3A0CA3 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-size: 20px; }
        .about-tabs .no { font-size: 64px; line-height: 1; }
        .about-tabs .pinfo { flex: 2 1 260px; display: flex; flex-direction: column; gap: 10px; font-size: 15px; line-height: 1.6; }
        .about-tabs .pname { font-size: 22px; color: #1A2FD1; line-height: 1.3; }
        .about-tabs .tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .about-tabs .tags span { font-size: 14px; border: 1.5px solid #0A1A6E; border-radius: 999px; padding: 0 10px; background: #E4EEFF; }
        .about-tabs .arrows { display: flex; gap: 14px; align-items: center; justify-content: center; }
        .about-tabs .arrows .glossy { width: 56px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; font-size: 18px; }
        .about-tabs .count { min-width: 64px; text-align: center; font-size: 22px; color: #0A1A6E; }
        .about-tabs .award { display: flex; gap: 12px; align-items: center; }
        .about-tabs .prize { flex: none; width: 72px; font-size: 16px; color: #FF0099; }
        .about-tabs .aname { font-weight: 700; flex: 1; }
        .about-tabs .ayear { flex: none; font-size: 14px; color: #3A4A8A; }
        .about-tabs .group { font-size: 15px; color: #1A2FD1; text-transform: uppercase; }
        .about-tabs .stack { display: flex; flex-direction: column; gap: 6px; }
        .about-tabs .more { align-self: flex-start; margin-top: 4px; padding: 6px 16px; font-size: 14px; min-height: 40px; }
      `}</style>
    </div>
  );
}
