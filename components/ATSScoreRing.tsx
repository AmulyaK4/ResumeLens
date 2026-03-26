'use client';
import { useEffect, useState } from 'react';

export default function ATSScoreRing({
  score, loading = false, size = 140,
}: { score: number; loading?: boolean; size?: number }) {
  const [val, setVal] = useState(0);
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (val / 100) * circ;

  const color = score >= 75 ? '#3a6b35' : score >= 50 ? '#c9a84c' : '#9a3a2e';
  const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : score >= 35 ? 'Fair' : 'Needs Work';

  useEffect(() => {
    if (loading) return;
    let cur = 0;
    const step = score / 55;
    const id = setInterval(() => {
      cur += step;
      if (cur >= score) { setVal(score); clearInterval(id); }
      else setVal(Math.floor(cur));
    }, 16);
    return () => clearInterval(id);
  }, [score, loading]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8e3d8" strokeWidth={size*0.06} />
          <circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={loading ? '#e8c97a' : color}
            strokeWidth={size*0.06}
            strokeLinecap="butt"
            strokeDasharray={circ}
            strokeDashoffset={loading ? circ * 0.65 : offset}
            className={loading ? 'animate-spin origin-center score-ring' : 'score-ring'}
            style={{ transformOrigin: `${size/2}px ${size/2}px` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {loading ? (
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
          ) : (
            <>
              <span className="font-bold leading-none" style={{ fontSize: size*0.21, color, fontFamily: 'var(--font-display)' }}>{val}</span>
              <span className="text-gray-400 leading-none" style={{ fontSize: size*0.09 }}>/100</span>
              <span className="font-medium uppercase tracking-wide" style={{ fontSize: size*0.08, color, marginTop: 2 }}>{label}</span>
            </>
          )}
        </div>
      </div>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">ATS Score</span>
    </div>
  );
}
