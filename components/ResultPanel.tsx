"use client";
import { useState, useCallback, useEffect } from 'react';
import { GenerateResponse } from '@/lib/types';
import CodeBlock from './CodeBlock';
import MermaidViewer, { type MermaidRenderState } from './MermaidViewer';
import {
  AlertCircle,
  Sparkles,
  CornerDownRight,
  Download,
  Copy,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ImageDown,
  FileText,
  ClipboardList,
} from 'lucide-react';
import {
  formatResultAsMarkdown,
  downloadTextFile,
  downloadTextFileMarkdown,
  sanitizeFilename,
  buildFlowTextExport,
  downloadSvgAsPng,
} from '@/lib/utils';
import { saveFeedback } from '@/lib/storage';

interface ResultPanelProps {
  result: GenerateResponse;
  onFollowUp: (prompt: string) => void;
  isGenerating: boolean;
}

const FlowTaskView = ({
  result,
  onMermaidRenderState,
}: {
  result: GenerateResponse;
  onMermaidRenderState: (state: MermaidRenderState) => void;
}) => (
  <>
    {result.mermaidCode && (
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">프로세스 시각화</h3>
        <MermaidViewer chart={result.mermaidCode} onRenderStateChange={onMermaidRenderState} />
      </section>
    )}
    {result.content && (
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">프로세스 요약</h3>
        <div className="text-sm text-slate-700 bg-white p-5 border border-slate-200 rounded-md shadow-sm whitespace-pre-wrap leading-relaxed">
          {result.content}
        </div>
      </section>
    )}
    {result.explanation && (
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">상세 설명</h3>
        <div className="text-sm text-slate-600 bg-blue-50 p-5 rounded-md border border-blue-100 whitespace-pre-wrap leading-relaxed">
          {result.explanation}
        </div>
      </section>
    )}
  </>
);

const CodeTaskView = ({ result, isSql }: { result: GenerateResponse; isSql: boolean }) => (
  <>
    {result.explanation && (
      <section className="bg-slate-50 p-5 rounded-md border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
        <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">
          {isSql ? '설계·주의·성능 (SQL)' : 'Explanation'}
        </h3>
        {result.explanation}
      </section>
    )}
    {result.content && (
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">
          {isSql ? 'SQL 코드' : 'TypeScript 구현'}
        </h3>
        <CodeBlock code={result.content} language={isSql ? 'sql' : 'typescript'} />
      </section>
    )}
    {result.example && (
      <section>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">사용 예시</h3>
        <CodeBlock code={result.example} language={isSql ? 'sql' : 'typescript'} />
      </section>
    )}
  </>
);

function flowExportBaseName(result: GenerateResponse): string {
  const dateStr = new Date().toISOString().slice(0, 10);
  if (result.title?.trim()) {
    return `${sanitizeFilename(result.title)}_${dateStr}`;
  }
  return `flow_result_${dateStr}`;
}

export default function ResultPanel({ result, onFollowUp, isGenerating }: ResultPanelProps) {
  const [followUpText, setFollowUpText] = useState('');
  const [feedback, setFeedback] = useState<'helpful' | 'notHelpful' | null>(null);
  const [mermaidState, setMermaidState] = useState<MermaidRenderState>({ ok: false, svg: null });
  const [pngExporting, setPngExporting] = useState(false);

  const handleMermaidRenderState = useCallback((state: MermaidRenderState) => {
    setMermaidState(state);
  }, []);

  useEffect(() => {
    setMermaidState({ ok: false, svg: null });
  }, [result]);

  const flowPngReady = result.taskType === 'flow' && mermaidState.ok && mermaidState.svg !== null;

  const submitFollowUp = () => {
    if (!followUpText.trim()) return;
    onFollowUp(followUpText);
    setFollowUpText('');
  };

  const handleExportMd = () => {
    const md = formatResultAsMarkdown(result);
    const sanitizedTitle = (result.title || 'task_result').replace(/[\/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_');
    downloadTextFileMarkdown(`kdev_${sanitizedTitle}.md`, md);
  };

  const handleExportFlowTxt = () => {
    const text = buildFlowTextExport(result);
    const name = `${flowExportBaseName(result)}.txt`;
    downloadTextFile(name, text, 'text/plain;charset=utf-8');
  };

  const handleExportFlowPng = async () => {
    if (!mermaidState.svg || !mermaidState.ok) {
      alert('PNG로 저장할 다이어그램이 없습니다. Mermaid가 정상 렌더된 뒤 다시 시도해 주세요.');
      return;
    }
    setPngExporting(true);
    try {
      const name = `${flowExportBaseName(result)}.png`;
      await downloadSvgAsPng(mermaidState.svg, name);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'PNG 저장에 실패했습니다.';
      alert(msg);
    } finally {
      setPngExporting(false);
    }
  };

  const handleCopySqlWarnings = async () => {
    if (!result.warnings?.length) return;
    const text = result.warnings.map((w, i) => `${i + 1}. ${w}`).join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      alert('경고·주의 내용이 클립보드에 복사되었습니다.');
    } catch {
      alert('복사에 실패했습니다.');
    }
  };

  const handleCopyMd = async () => {
    const md = formatResultAsMarkdown(result);
    try {
      await navigator.clipboard.writeText(md);
      alert('전체 결과가 마크다운으로 복사되었습니다.');
    } catch {
      alert('복사에 실패했습니다.');
    }
  };

  const handleFeedbackClick = (type: 'helpful' | 'notHelpful') => {
    if (feedback) return;
    saveFeedback(type);
    setFeedback(type);
  };

  const hasWarnings = result.warnings && result.warnings.length > 0;
  const sqlWarningBlock = result.taskType === 'sql' && hasWarnings;

  return (
    <div className="mt-8 border-t border-slate-200 pt-8 animate-in fade-in duration-500">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          {result.title && <h2 className="text-xl font-bold text-slate-800">{result.title}</h2>}
          {result.provider && (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-100">
              <Sparkles className="w-3 h-3" />
              Generated by {result.provider.toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopyMd}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-md transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            MD 복사
          </button>
          <button
            type="button"
            onClick={handleExportMd}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            MD 다운로드
          </button>
          {result.taskType === 'flow' && (
            <>
              <button
                type="button"
                onClick={handleExportFlowTxt}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 text-xs font-bold rounded-md transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                TXT 저장
              </button>
              <button
                type="button"
                onClick={handleExportFlowPng}
                disabled={!flowPngReady || pngExporting}
                title={
                  flowPngReady
                    ? '현재 화면의 Mermaid 다이어그램을 PNG로 저장'
                    : 'Mermaid가 정상 렌더된 경우에만 사용할 수 있습니다'
                }
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 hover:bg-blue-50 text-blue-800 text-xs font-bold rounded-md transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <ImageDown className="w-3.5 h-3.5" />
                {pngExporting ? 'PNG…' : 'PNG 저장'}
              </button>
            </>
          )}
        </div>
      </div>

      {sqlWarningBlock && (
        <div
          className="mb-6 rounded-xl border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50/80 p-5 shadow-sm ring-2 ring-amber-200/60"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h4 className="text-base font-bold text-amber-950 flex flex-wrap items-center gap-2">
                  가정·누락·주의 (SQL)
                  <span className="text-xs font-semibold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-200">
                    복사해 검토·이슈 트래킹에 활용
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={handleCopySqlWarnings}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-bold text-amber-900 hover:bg-amber-100/80"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  경고 전체 복사
                </button>
              </div>
              <pre className="mb-3 whitespace-pre-wrap rounded-md border border-amber-200/80 bg-white/90 p-3 text-xs font-mono text-amber-950 leading-relaxed">
                {result.warnings!.map((w, i) => `${i + 1}. ${w}`).join('\n\n')}
              </pre>
              <ul className="space-y-2 text-sm text-amber-950 font-medium leading-relaxed">
                {result.warnings!.map((warn, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-amber-600 font-bold shrink-0">{i + 1}.</span>
                    <span className="break-words">{warn}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {!sqlWarningBlock && hasWarnings && (
        <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 rounded-r-md flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h4 className="font-bold">주의사항</h4>
              <button
                type="button"
                onClick={async () => {
                  const text = result.warnings!.map((w, i) => `${i + 1}. ${w}`).join('\n\n');
                  try {
                    await navigator.clipboard.writeText(text);
                    alert('주의사항이 복사되었습니다.');
                  } catch {
                    alert('복사에 실패했습니다.');
                  }
                }}
                className="inline-flex items-center gap-1 rounded border border-amber-300 bg-white px-2 py-0.5 text-[11px] font-bold text-amber-900 hover:bg-amber-100"
              >
                <ClipboardList className="w-3 h-3" />
                복사
              </button>
            </div>
            <pre className="mb-2 whitespace-pre-wrap rounded bg-white/60 p-2 text-xs font-mono">
              {result.warnings!.map((w, i) => `${i + 1}. ${w}`).join('\n\n')}
            </pre>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              {result.warnings!.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {result.taskType === 'flow' ? (
          <FlowTaskView result={result} onMermaidRenderState={handleMermaidRenderState} />
        ) : (
          <CodeTaskView result={result} isSql={result.taskType === 'sql'} />
        )}
      </div>

      <div className="flex items-center justify-center gap-4 mt-10 pt-6 border-t border-slate-100">
        <span className="text-sm text-slate-500 font-medium">이 결과물이 실무에 도움이 되었나요?</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => handleFeedbackClick('helpful')} disabled={feedback !== null} className={`p-2 rounded-full transition-colors ${feedback === 'helpful' ? 'bg-blue-100 text-blue-600' : feedback === 'notHelpful' ? 'opacity-30' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`} title="유용함"><ThumbsUp className="w-4 h-4" /></button>
          <button type="button" onClick={() => handleFeedbackClick('notHelpful')} disabled={feedback !== null} className={`p-2 rounded-full transition-colors ${feedback === 'notHelpful' ? 'bg-red-100 text-red-600' : feedback === 'helpful' ? 'opacity-30' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`} title="아쉬움"><ThumbsDown className="w-4 h-4" /></button>
        </div>
        {feedback && <span className="text-xs text-slate-400">의견이 등록되었습니다.</span>}
      </div>

      <div className="mt-6 bg-slate-100 p-5 rounded-lg border border-slate-200">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
          <CornerDownRight className="w-4 h-4 text-slate-500" />
          결과가 마음에 들지 않나요? 추가 수정을 요청하세요.
        </label>
        <div className="flex gap-2">
          <input type="text" value={followUpText} onChange={(e) => setFollowUpText(e.target.value)} disabled={isGenerating} onKeyDown={(e) => { if (e.key === 'Enter') submitFollowUp(); }} placeholder="예시) Oracle용으로 변경해줘, 타입스크립트 제네릭을 적용해줘..." className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50" />
          <button type="button" onClick={submitFollowUp} disabled={isGenerating || !followUpText.trim()} className="px-6 py-2 bg-slate-800 text-white text-sm font-bold rounded-md hover:bg-slate-900 transition-colors disabled:opacity-50">수정 생성</button>
        </div>
      </div>
    </div>
  );
}
