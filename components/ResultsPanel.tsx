'use client';
import { useState } from 'react';
import { ResumeAnalysis, ResumeSection } from '@/lib/types';
import ATSScoreRing from './ATSScoreRing';
import {
  RotateCcw, Download, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, XCircle, Zap, Tag, LayoutList,
} from 'lucide-react';

function SectionCard({ section, index }: { section: ResumeSection; index: number }) {
  const [open, setOpen] = useState(index < 2);

  const cfg = {
    good:             { Icon: CheckCircle2, color: '#3a6b35', bg: '#f0f7ee', border: '#b8d4b4', label: 'Strong' },
    needs_improvement:{ Icon: AlertCircle,  color: '#9a6b1a', bg: '#fff8ed', border: '#f0d49a', label: 'Improve' },
    critical:         { Icon: XCircle,      color: '#9a3a2e', bg: '#fdf0ee', border: '#f0b4ae', label: 'Critical' },
  }[section.status];

  const barColor = section.score >= 70 ? '#3a6b35' : section.score >= 45 ? '#c9a84c' : '#9a3a2e';

  return (
    <div
      className="animate-fade-up mb-3 rounded-sm overflow-hidden"
      style={{ border: `1px solid ${cfg.border}`, animationDelay: `${index * 0.07}s` }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-all hover:brightness-95"
        style={{ background: cfg.bg }}
      >
        <div className="flex items-center gap-3">
          <cfg.Icon size={15} style={{ color: cfg.color }} />
          <span className="font-semibold text-gray-800 text-sm">{section.name}</span>
          <span
            className="hidden sm:inline text-xs px-2 py-0.5 rounded-sm font-medium"
            style={{ color: cfg.color, background: 'white', border: `1px solid ${cfg.border}` }}
          >
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-white rounded-full hidden sm:block">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${section.score}%`, background: barColor }} />
            </div>
            <span className="text-xs font-mono font-medium" style={{ color: barColor }}>{section.score}/100</span>
          </div>
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-5 py-4 bg-white border-t" style={{ borderColor: cfg.border }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {section.issues.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-2.5 flex items-center gap-1.5">
                  <AlertCircle size={10} /> Issues
                </p>
                <ul className="space-y-2">
                  {section.issues.map((issue, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">–</span>{issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {section.suggestions.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 size={10} /> Suggestions
                </p>
                <ul className="space-y-2">
                  {section.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                      <span className="text-green-600 mt-0.5 flex-shrink-0">→</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {section.rewrite_example && (
            <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-sm">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-1.5">Example Rewrite</p>
              <p className="text-sm text-gray-700 leading-relaxed italic">{section.rewrite_example}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResultsPanel({ analysis, onReset }: { analysis: ResumeAnalysis; onReset: () => void }) {
  const [tab, setTab] = useState<'sections' | 'keywords' | 'quick'>('sections');

  const avgScore = Math.round(
    analysis.sections.reduce((a, s) => a + s.score, 0) / (analysis.sections.length || 1)
  );

  const handleDownload = () => {
    const lines = [
      'RESUMÉLENS — ANALYSIS REPORT',
      '='.repeat(50),
      `ATS Score: ${analysis.ats_score}/100`,
      `Overall: ${analysis.overall_impression}`,
      '',
      'STRENGTHS',
      ...analysis.strengths.map(s => `• ${s}`),
      '',
      'SECTIONS',
      ...analysis.sections.flatMap(s => [
        `\n${s.name} — ${s.score}/100 (${s.status})`,
        ...s.issues.map(i => `  Issue: ${i}`),
        ...s.suggestions.map(sg => `  Tip: ${sg}`),
        s.rewrite_example ? `  Example: ${s.rewrite_example}` : '',
      ]),
      '',
      'MISSING KEYWORDS',
      analysis.keywords_missing.join(', '),
      '',
      'QUICK WINS',
      ...analysis.quick_wins.map(q => `• ${q}`),
      '',
      'FORMATTING NOTES',
      ...analysis.formatting_notes.map(f => `• ${f}`),
      '',
      `Generated by ResuméLens · ${new Date().toLocaleDateString()}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'resumelens-report.txt' });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-medium text-amber-600 uppercase tracking-widest mb-1">Analysis Complete</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
            Your Resume Report
          </h2>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-widest text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-gray-700 transition-all rounded-sm">
            <Download size={12} /> Download
          </button>
          <button onClick={onReset} className="flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-widest text-white bg-gray-900 hover:bg-gray-700 transition-all rounded-sm">
            <RotateCcw size={12} /> New Resume
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 card mb-6">
        <div className="p-5 flex flex-col items-center justify-center border-r border-b sm:border-b-0 border-gray-100">
          <ATSScoreRing score={analysis.ats_score} size={120} />
        </div>
        <div className="p-5 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-gray-100">
          <span className="text-4xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-display)' }}>{avgScore}</span>
          <span className="text-xs text-gray-400 uppercase tracking-widest mt-1">Avg Section</span>
          <div className="w-16 h-1 bg-gray-100 mt-3 rounded-full">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${avgScore}%` }} />
          </div>
        </div>
        <div className="p-5 flex flex-col items-center justify-center border-r border-gray-100">
          <span className="text-4xl font-bold text-green-700" style={{ fontFamily: 'var(--font-display)' }}>{analysis.strengths.length}</span>
          <span className="text-xs text-gray-400 uppercase tracking-widest mt-1">Strengths</span>
        </div>
        <div className="p-5 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-red-600" style={{ fontFamily: 'var(--font-display)' }}>{analysis.keywords_missing.length}</span>
          <span className="text-xs text-gray-400 uppercase tracking-widest mt-1">Missing Keywords</span>
        </div>
      </div>

      {/* Overall impression */}
      <div className="card p-5 mb-6 border-l-4 border-amber-400">
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-2">Expert Impression</p>
        <p className="text-gray-700 leading-relaxed text-sm">{analysis.overall_impression}</p>
      </div>

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <CheckCircle2 size={11} /> What&apos;s Working Well
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.strengths.map((s, i) => (
              <span key={i} className="badge-good text-xs px-3 py-1.5 rounded-sm font-medium">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b-2 border-gray-200 mb-5">
        {([
          { id: 'sections', label: 'Section Analysis', Icon: LayoutList },
          { id: 'keywords', label: 'Missing Keywords', Icon: Tag },
          { id: 'quick',    label: 'Quick Wins',       Icon: Zap },
        ] as const).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-xs font-semibold uppercase tracking-widest border-b-2 -mb-0.5 transition-all ${
              tab === id
                ? 'border-amber-500 text-amber-700 bg-amber-50'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={11} />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'sections' && (
        <div>{analysis.sections.map((s, i) => <SectionCard key={s.name} section={s} index={i} />)}</div>
      )}

      {tab === 'keywords' && (
        <div className="animate-fade-up">
          <div className="p-4 bg-red-50 border border-red-100 rounded-sm mb-5">
            <p className="text-xs text-red-600">These industry-standard keywords are missing from your resume and may cause ATS rejection.</p>
          </div>
          <div className="flex flex-wrap gap-2.5 mb-8">
            {analysis.keywords_missing.map((kw, i) => (
              <span key={i} className="badge-critical text-xs px-3 py-2 rounded-sm font-medium animate-fade-up" style={{ animationDelay: `${i*0.04}s` }}>
                + {kw}
              </span>
            ))}
          </div>
          {analysis.formatting_notes.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Formatting Notes</p>
              <ul className="space-y-2.5">
                {analysis.formatting_notes.map((note, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed pb-2.5 border-b border-gray-100 last:border-0">
                    <span className="text-amber-500 flex-shrink-0 mt-0.5">◆</span>{note}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {tab === 'quick' && (
        <div className="animate-fade-up space-y-3">
          <p className="text-sm text-gray-500 mb-4">Highest-impact changes — most take under 5 minutes.</p>
          {analysis.quick_wins.map((win, i) => (
            <div key={i} className="flex gap-4 p-4 card hover:border-amber-200 hover:bg-amber-50 transition-all animate-fade-up" style={{ animationDelay: `${i*0.06}s` }}>
              <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-amber-400 text-white text-xs font-bold rounded-sm">
                {i + 1}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{win}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
