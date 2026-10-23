import { useEffect, useId, useState } from 'react';

export const SIGNIN_EVENT = 'dongti:signin';
const KEY = 'dongti:nick';

function readNick(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** 메신저 로그인 창에서 호출: 상단 상태바 이름을 바꿔요 */
export function announceSignIn(nick: string | null) {
  try {
    if (nick) sessionStorage.setItem(KEY, nick);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* private mode 등에서는 무시 */
  }
  window.dispatchEvent(new CustomEvent(SIGNIN_EVENT, { detail: nick }));
}

// 광택 Y2K 집 아이콘 (핑크 지붕 · 아쿠아 문 · 반짝이)
function GlossyHouse() {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="home-icon" width={36} height={34} viewBox="0 0 40 38" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${id}roof`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFC2E4" /><stop offset=".48" stopColor="#FF5FBE" />
          <stop offset=".52" stopColor="#E0158F" /><stop offset="1" stopColor="#FF6FC4" />
        </linearGradient>
        <linearGradient id={`${id}wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" /><stop offset=".55" stopColor="#E4F0FF" /><stop offset="1" stopColor="#9CC6FF" />
        </linearGradient>
        <linearGradient id={`${id}door`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7FC0FF" /><stop offset=".5" stopColor="#1167E8" /><stop offset="1" stopColor="#0A3FA8" />
        </linearGradient>
      </defs>
      <rect x="27" y="5" width="5" height="9" rx="1" fill={`url(#${id}roof)`} stroke="#1B0033" strokeWidth="1.8" />
      <rect x="7" y="17" width="26" height="18" rx="2" fill={`url(#${id}wall)`} stroke="#1B0033" strokeWidth="2" />
      <rect x="17" y="24" width="7" height="11" rx="3.5" fill={`url(#${id}door)`} stroke="#1B0033" strokeWidth="1.6" />
      <circle cx="22.2" cy="30" r=".9" fill="#FFE600" />
      <rect x="10" y="25" width="5" height="5" rx="1" fill="#FFF27A" stroke="#1B0033" strokeWidth="1.4" />
      <path d="M3 19.5 L20 4 L37 19.5 Q37.6 21.4 35.6 21.4 L4.4 21.4 Q2.4 21.4 3 19.5 Z" fill={`url(#${id}roof)`} stroke="#1B0033" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 17.4 L20 6.6 L26 12 Q20 10.5 9.6 18.2 Z" fill="#FFFFFF" opacity=".7" />
      <path className="home-sparkle" d="M35 3 L35.9 5.6 L38.5 6.5 L35.9 7.4 L35 10 L34.1 7.4 L31.5 6.5 L34.1 5.6 Z" fill="#FFFFFF" stroke="#1B0033" strokeWidth=".8" />
    </svg>
  );
}

export default function StatusBar() {
  const [nick, setNick] = useState<string | null>(null);

  useEffect(() => {
    setNick(readNick());
    const onSignIn = (e: Event) => setNick((e as CustomEvent<string | null>).detail);
    window.addEventListener(SIGNIN_EVENT, onSignIn);
    return () => window.removeEventListener(SIGNIN_EVENT, onSignIn);
  }, []);

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <div className="status-bar" style={{ borderBottom: '3px solid var(--ink)', fontSize: 17 }}>
      <span className="online" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          className="blink"
          aria-hidden="true"
          style={{ width: 10, height: 10, borderRadius: '50%', background: '#18C936', display: 'inline-block' }}
        />
        {nick ?? 'dongTTi'} is now online!
      </span>
      <a href={`${base}/`} aria-label="홈으로" title="home" className="home-link"><GlossyHouse /></a>
    </div>
  );
}
