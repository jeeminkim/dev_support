"use client";
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import CodeBlock from './CodeBlock';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { logDevError } from '@/lib/utils';

interface MermaidViewerProps {
  chart: string;
}

export default function MermaidViewer({ chart }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const renderChart = async () => {
      setHasError(false);
      try {
        mermaid.initialize({ startOnLoad: false, theme: 'default' });
        if (containerRef.current) {
          const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).substring(7)}`, chart);
          if (isMounted) {
            containerRef.current.innerHTML = svg;
          }
        }
      } catch (error) {
        logDevError('Mermaid 렌더링 에러', error);
        if (isMounted) {
          setHasError(true);
          setShowRaw(true); // 에러 발생 시 원문을 자동으로 펼침
        }
      }
    };

    if (chart) {
      renderChart();
    }

    return () => {
      isMounted = false;
    };
  }, [chart]);

  return (
    <div className="space-y-3">
      {hasError && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
          Mermaid 다이어그램 렌더링에 실패했습니다. 아래 원문 코드를 확인해주세요.
        </div>
      )}

      {/* 렌더링 성공 시점에만 svg 컨테이너 노출 */}
      <div className={`bg-white p-6 rounded-md border border-slate-200 shadow-sm overflow-x-auto ${hasError ? 'hidden' : 'block'}`}>
        <div ref={containerRef} className="flex justify-center" />
      </div>

      <div>
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          {showRaw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Mermaid 원문 보기
        </button>
        {showRaw && (
          <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <CodeBlock code={chart} language="mermaid" />
          </div>
        )}
      </div>
    </div>
  );
}
