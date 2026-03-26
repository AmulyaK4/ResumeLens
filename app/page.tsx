'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { ResumeAnalysis } from '@/lib/types';
import ResultsPanel from '@/components/ResultsPanel';
import ATSScoreRing from '@/components/ATSScoreRing';
import type { FileRejection } from 'react-dropzone';
import { useTheme } from '@/components/ThemeProvider';
import { Upload, FileText, Zap, ArrowRight, X, AlertTriangle, CheckCircle2, Sun, Moon } from 'lucide-react';

const STAGES = [
  'Parsing document structure…',
  'Cross-referencing ATS patterns…',
  'Evaluating impact language…',
  'Generating expert feedback…',
];

export default function Home() {
  const { theme, toggle } = useTheme();
  const [resumeText, setResumeText]     = useState('');
  const [fileName,   setFileName]       = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading,    setLoading]        = useState(false);
  const [analysis,   setAnalysis]       = useState<ResumeAnalysis | null>(null);
  const [error,      setError]          = useState<string | null>(null);
  const [stage,      setStage]          = useState(0);
  const [activeTab,  setActiveTab]      = useState<'paste' | 'upload'>('paste');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    setStage(0);
    timerRef.current = setInterval(() => setStage(s => Math.min(s + 1, STAGES.length - 1)), 1800);
  };
  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const runAnalysis = async (fd?: FormData, text?: string) => {
    setLoading(true); setError(null); setAnalysis(null); startTimer();
    try {
      const res = fd
        ? await fetch('/api/enhance', { method: 'POST', body: fd })
        : await fetch('/api/enhance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeText: text }),
          });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(
          res.status === 401
            ? 'API key is missing or invalid. Please set GROQ_API_KEY in your .env.local file.'
            : `Server error (${res.status}). Make sure your GROQ_API_KEY is set in .env.local and the dev server was restarted.`
        );
      }

      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || `Error ${res.status}`);
      setAnalysis(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      stopTimer(); setLoading(false);
    }
  };

  const handleAnalyzeText = () => {
    if (resumeText.trim().length < 50) { setError('Please paste your full resume text (at least a few lines).'); return; }
    setError(null); runAnalysis(undefined, resumeText);
  };

  const handleAnalyzeFile = () => {
    if (!uploadedFile) { setError('Please upload a file first.'); return; }
    setError(null);
    const fd = new FormData(); fd.append('file', uploadedFile);
    runAnalysis(fd);
  };

const onDrop = useCallback(
  (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length) {
      setError(
        fileRejections[0]?.errors?.[0]?.code === 'file-too-large'
          ? 'File too large (max 5 MB).'
          : 'Only PDF or TXT files are accepted.'
      );
      return;
    }

    const f = acceptedFiles[0];
    if (!f) return;

    setFileName(f.name);
    setUploadedFile(f);
    setError(null);
  },
  []
);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1, maxSize: 5 * 1024 * 1024,
  });

  const clearAll = () => {
    setResumeText(''); setFileName(null); setUploadedFile(null); setAnalysis(null); setError(null);
  };

  const words = resumeText.trim().split(/\s+/).filter(Boolean).length;

  const s = {
    page:      { background: 'var(--bg-page)', minHeight: '100vh' },
    header:    { background: 'var(--bg-header)', borderBottom: '1px solid var(--border)' },
    hero:      { background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' },
    card:      { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px' },
    divider:   { borderBottom: '1px solid var(--border)' },
    strip:     { borderTop: '1px solid var(--border)', background: 'var(--bg-strip)' },
    sideItem:  { borderBottom: '1px solid var(--border-light)' },
    quote:     { borderLeft: '2px solid var(--text-primary)' },
    btn:       { background: 'var(--btn-bg)', color: 'var(--btn-text)' },
    btnLoad:   { background: 'var(--text-muted)', color: 'var(--btn-text)' },
    footer:    { background: 'var(--bg-footer)', borderTop: '1px solid var(--border)' },
    overlay:   { background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' },
    toggleBtn: {
      background: 'var(--bg-strip)',
      border: '1px solid var(--border)',
      color: 'var(--text-primary)',
      borderRadius: '6px',
      padding: '6px 12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      fontWeight: 500,
      transition: 'all 0.15s ease',
      whiteSpace: 'nowrap',
    } as React.CSSProperties,
  };

  return (
    <div style={s.page}>

      {/* ── TOP BAR ── */}
      <div style={s.header} className="px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center rounded-sm flex-shrink-0" style={{ background: 'var(--btn-bg)' }}>
            <FileText size={13} color="var(--btn-text)" />
          </div>
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>ResuméLens</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>llama-3.3-70b-versatile</span>
          </div>
          <button onClick={toggle} style={s.toggleBtn}>
            {theme === 'light' ? <><Moon size={12} />Dark</> : <><Sun size={12} />Light</>}
          </button>
        </div>
      </div>

      {/* ── HERO ── */}
      <div style={s.hero} className="px-4 sm:px-8 py-6 sm:py-8 text-center">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-2" style={{ color: 'var(--text-primary)' }}>
          AI Resume Analyzer
        </h1>
        <p className="text-xs sm:text-sm max-w-lg mx-auto leading-relaxed px-4" style={{ color: 'var(--text-secondary)' }}>
          Paste your resume and get structured, actionable improvements — section by section.
        </p>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 py-6 sm:py-8">
        {!analysis ? (
          <div className="flex flex-col lg:flex-row gap-5">

            {/* ── LEFT: INPUT — 50% on desktop ── */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <div style={s.card} className="overflow-hidden flex flex-col">

                {/* Card header */}
                <div className="px-4 sm:px-6 py-4" style={s.divider}>
                  <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Paste your resume</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>We&apos;ll review structure, ATS readability, and keyword alignment.</p>
                </div>

                {/* Tabs */}
                <div className="flex" style={s.divider}>
                  {(['paste', 'upload'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => { setActiveTab(t); setError(null); }}
                      className="flex items-center gap-1.5 px-4 sm:px-5 py-3 text-xs font-medium uppercase tracking-wider transition-all border-b-2 -mb-px"
                      style={{
                        borderBottomColor: activeTab === t ? 'var(--text-primary)' : 'transparent',
                        color: activeTab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                      }}
                    >
                      {t === 'paste' ? <><FileText size={11} />Text</> : <><Upload size={11} />PDF Upload</>}
                    </button>
                  ))}
                </div>

                {/* Input area */}
                {activeTab === 'paste' ? (
                  <div className="relative flex-1">
                    <textarea
                      value={resumeText}
                      onChange={e => { setResumeText(e.target.value); setError(null); }}
                      placeholder={`Paste resume text here…\n\nJOHN DOE\njohn@email.com  |  LinkedIn  |  (555) 000-0000\n\nSUMMARY\nResults-driven engineer with 5+ years…\n\nEXPERIENCE\nSenior Engineer | Acme Corp | 2021–Present\n• Built microservices serving 2M+ users`}
                      className="w-full px-4 sm:px-6 py-4 text-xs sm:text-sm leading-relaxed focus:outline-none"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-primary)',
                        background: 'var(--bg-input)',
                        height: '280px',
                        resize: 'none',
                      }}
                    />
                    {resumeText && (
                      <button onClick={() => { setResumeText(''); setError(null); }}
                        className="absolute top-3 right-3 p-1.5 transition-colors"
                        style={{ color: 'var(--text-muted)' }}>
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className="flex flex-col items-center justify-center cursor-pointer transition-all"
                    style={{
                      height: '280px',
                      background: isDragActive || fileName ? 'var(--bg-strip)' : 'var(--bg-input)',
                    }}
                  >
                    <input {...getInputProps()} />
                    <div className="text-center px-6">
                      <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 rounded-sm"
                        style={{ border: '1px solid var(--border)', background: 'var(--bg-strip)' }}>
                        {fileName
                          ? <CheckCircle2 size={20} className="text-green-500" />
                          : <Upload size={20} style={{ color: 'var(--text-muted)' }} />}
                      </div>
                      {fileName ? (
                        <div>
                          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{fileName}</p>
                          <p className="text-xs text-green-500 mt-1">File ready — click Analyze below</p>
                          <button
                            onClick={e => { e.stopPropagation(); setFileName(null); setUploadedFile(null); }}
                            className="mt-2 text-xs underline" style={{ color: 'var(--text-muted)' }}
                          >Remove</button>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                            {isDragActive ? 'Drop it here…' : 'Drag & drop your resume'}
                          </p>
                          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>PDF or TXT · Max 5 MB</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>or tap to browse</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer strip */}
                <div className="px-4 sm:px-6 py-3 flex items-center justify-between" style={s.strip}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Groq powered</span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {activeTab === 'paste' && resumeText ? `${words} words` : 'No signup · No storage'}
                  </span>
                </div>
              </div>

              {/* Privacy note */}
              <p className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>
                By submitting, your resume is processed in real-time and never stored on our servers.
              </p>

              {/* Error */}
              {error && (
                <div className="px-4 py-3 rounded-sm flex items-start gap-2.5"
                  style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <AlertTriangle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-red-600 leading-relaxed">{error}</span>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={activeTab === 'paste' ? handleAnalyzeText : handleAnalyzeFile}
                disabled={loading || (activeTab === 'paste' ? !resumeText.trim() : !uploadedFile)}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 text-sm font-semibold uppercase tracking-widest transition-all rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
                style={loading ? s.btnLoad : s.btn}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-xs sm:text-sm">{STAGES[stage]}</span>
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    <span>Analyze Resume</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>

            {/* ── RIGHT SIDEBAR — 50% on desktop ── */}
            <div className="w-full lg:w-1/2 flex flex-col gap-5">

              {/* What we analyze */}
              <div style={s.card} className="overflow-hidden">
                <div className="px-5 py-4" style={s.divider}>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>What We Analyze</p>
                </div>
                <div className="px-5 py-2">
                  {[
                    { title: 'ATS Compatibility Score',   desc: 'Keyword density & parse-ability.' },
                    { title: 'Section-by-Section Review', desc: 'Summary, Experience, Skills & more.' },
                    { title: 'Impact Language Audit',     desc: 'Replace weak verbs with action words.' },
                    { title: 'Missing Keywords',          desc: 'Terms ATS systems expect to see.' },
                    { title: 'Quick Wins',                desc: 'Fastest changes for max ROI.' },
                    { title: 'Formatting Notes',          desc: 'Structure, spacing, and clarity.' },
                  ].map(({ title, desc }) => (
                    <div key={title} className="py-3 flex gap-3" style={s.sideItem}>
                      <span className="mt-1 flex-shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>–</span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pull quote */}
              <div style={s.quote} className="pl-4 py-1">
                <p className="text-sm leading-snug italic" style={{ color: 'var(--text-primary)' }}>
                  &ldquo;75% of resumes are rejected by ATS before a human ever reads them.&rdquo;
                </p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>— Harvard Business Review</p>
              </div>
            </div>

          </div>
        ) : (
          <ResultsPanel analysis={analysis} onReset={clearAll} />
        )}
      </div>

      {/* ── LOADING OVERLAY ── */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={s.overlay}>
          <div className="text-center w-full max-w-xs mx-auto px-8 py-10 rounded-md"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="mx-auto mb-6">
              <ATSScoreRing score={0} loading size={90} />
            </div>
            <p className="font-semibold text-lg mb-1.5" style={{ color: 'var(--text-primary)' }}>Analyzing…</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{STAGES[stage]}</p>
            <div className="mt-5 flex gap-1.5 justify-center">
              {STAGES.map((_, i) => (
                <div key={i} className="h-0.5 w-8 rounded-full transition-all duration-700"
                  style={{ background: i <= stage ? 'var(--text-primary)' : 'var(--border)' }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={s.footer} className="mt-10 py-5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center rounded-sm" style={{ background: 'var(--btn-bg)' }}>
              <FileText size={11} color="var(--btn-text)" />
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>ResuméLens</span>
          </div>
          <p className="text-xs text-center sm:text-right" style={{ color: 'var(--text-muted)' }}>
            Your resume is never stored · Built with Next.js · Groq · Llama 3.3
          </p>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Built by K.A</p>
        </div>
      </footer>
    </div>
  );
}
