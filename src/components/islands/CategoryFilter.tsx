import { useEffect, useState } from 'react';

interface Props {
  /** 필터할 글 목록 컨테이너 id. 안의 [data-category] 요소를 숨기거나 보여줘요 */
  target: string;
  categories: { id: string; label: string }[];
}

export default function CategoryFilter({ target, categories }: Props) {
  const [active, setActive] = useState('all');
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    const root = document.getElementById(target);
    if (!root) return;
    let visible = 0;
    root.querySelectorAll<HTMLElement>('[data-category]').forEach((el) => {
      const show = active === 'all' || el.dataset.category === active;
      el.hidden = !show;
      if (show) visible++;
    });
    setEmpty(visible === 0);
  }, [active, target]);

  const button = (c: { id: string; label: string }) => (
    <button
      key={c.id}
      type="button"
      className="btn-gold f-display"
      aria-pressed={active === c.id}
      onClick={() => setActive(c.id)}
      style={{
        fontSize: 'clamp(11px, 3vw, 15px)', paddingInline: 6, whiteSpace: 'nowrap', textTransform: 'uppercase',
        outline: active === c.id ? '3px solid #FFFFFF' : 'none', outlineOffset: 2,
      }}
    >
      {c.label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {button({ id: 'all', label: '★ All posts ★' })}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
        {categories.map(button)}
      </div>
      {empty && (
        <p className="f-hand" role="status" style={{ margin: 0, fontSize: 18, color: '#0A1A6E' }}>
          이 카테고리는 아직 비어 있어요
        </p>
      )}
    </div>
  );
}
