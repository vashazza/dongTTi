import { useEffect, useState } from 'react';
import { announceSignIn } from './StatusBar';

const STATUSES = ['Online', 'Busy', 'Training models', 'Be right back'];

/** 가상의 메신저 로그인 창 — 닉네임만 받는 장식용 (비밀번호 칸 없음) */
export default function MessengerLogin({ photo }: { photo?: string }) {
  const [nick, setNick] = useState('');
  const [signed, setSigned] = useState(false);
  const [status, setStatus] = useState(0);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('dongti:nick');
      if (saved) {
        setNick(saved);
        setSigned(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const name = nick.trim() || 'visitor';

  function toggle() {
    const next = !signed;
    setSigned(next);
    announceSignIn(next ? name : null);
  }

  return (
    <div className="login">
      <div className="avatar">
        {photo ? <img src={photo} alt="dongTTi 프로필 사진" /> : <span className="f-hand">[ 프로필<br />사진 ]</span>}
      </div>
      <div className="fields">
        <label htmlFor="nick">Your nickname:</label>
        <input
          id="nick"
          className="inset"
          type="text"
          value={nick}
          placeholder="visitor"
          onChange={(e) => setNick(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && toggle()}
        />
        <div className="status-row">
          <span>Status:</span>
          <button type="button" onClick={() => setStatus((s) => (s + 1) % STATUSES.length)}>
            {STATUSES[status]} ▾
          </button>
        </div>
        <button type="button" className="btn-aqua f-display signin" onClick={toggle}>
          {signed ? 'Sign out' : 'Sign in'}
        </button>
      </div>
      <p className="welcome f-hand" aria-live="polite">
        {signed ? `${name}님 어서오세요! 아래에서 골라봐요 ↓` : ''}
      </p>

      <style>{`
        .login { background: linear-gradient(180deg,#FFFFFF 0%,#DCE9FF 60%,#B9D3FF 100%); padding: 28px 36px 20px;
          display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .login .avatar { width: 132px; height: 132px; border-radius: 16px; border: 3px solid #FFFFFF; overflow: hidden;
          box-shadow: 0 0 0 2px #6C8FD8, 0 6px 14px rgba(10,36,106,.35); background: linear-gradient(135deg,#FFD6EE,#C9DBFF);
          display: flex; align-items: center; justify-content: center; text-align: center; color: #5B5FA8; font-size: 18px; }
        .login .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .login .fields { width: 100%; max-width: 300px; display: flex; flex-direction: column; gap: 10px; }
        .login label, .login .status-row { font-size: 13px; color: #0A246A; }
        .login input { padding: 8px 10px; font-size: 15px; min-height: 40px; }
        .login .status-row { display: flex; align-items: center; gap: 8px; }
        .login .status-row button { background: none; border: none; color: #0A246A; font-size: 13px; padding: 4px 0; min-height: 32px; }
        .login .signin { font-size: 16px; font-weight: 800; }
        .login .welcome { margin: 0; min-height: 24px; font-size: 18px; color: #C2007A; text-align: center; }
      `}</style>
    </div>
  );
}
