"use client";
import { useState, useEffect } from 'react';
import { useGenerate } from '@/hooks/useGenerate';
import PromptInput from '@/components/PromptInput';
import ActionButtons from '@/components/ActionButtons';
import ResultPanel from '@/components/ResultPanel';
import SettingsModal from '@/components/SettingsModal';
import { getSettings, saveDraft, getDraft, getRecentResults } from '@/lib/storage';
import { TaskType, DbOption, RecentResult } from '@/lib/types';
import { Settings as SettingsIcon, Code2, AlertTriangle, History, Clock } from 'lucide-react';
import { buildFollowUpPrompt, FOLLOW_UP_MAX_COUNT } from '@/lib/utils/promptUtils';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [recentTasks, setRecentTasks] = useState<RecentResult[]>([]);
  
  const [lastDbOption, setLastDbOption] = useState<DbOption | undefined>(undefined);
  const [followUpCount, setFollowUpCount] = useState<number>(0);
  
  const { generate, isLoading, error, result } = useGenerate();

  useEffect(() => {
    setIsReady(true);
    const savedDraft = getDraft();
    if (savedDraft) {
      setPrompt(savedDraft);
    }
    
    setRecentTasks(getRecentResults());

    const settings = getSettings();
    if (!settings.geminiApiKey) {
      setIsSettingsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (isReady) saveDraft(prompt);
  }, [prompt, isReady]);

  // 새로운 결과 생성될 때마다 최근 기록 Refresh
  useEffect(() => {
    if (result) {
      setRecentTasks(getRecentResults());
    }
  }, [result]);

  const handleDataCleared = () => {
    // 모든 화면 상태 리셋
    setPrompt('');
    setRecentTasks([]);
    setFollowUpCount(0);
    // 참고: useGenerate.ts 내부 상태 훅을 명시적으로 컨트롤하진 않으나 새로고침을 권장하는 UX가 모달 내부에 있음
  };

  const handleGenerate = (type: TaskType, dbOption?: DbOption) => {
    setLastDbOption(dbOption);
    setFollowUpCount(0); // 새 작업 시작 시 카운터 초기화
    generate(prompt, type, dbOption);
  };

  const handleFollowUp = (followUpText: string) => {
    if (!result) return;
    
    const newCount = followUpCount + 1;
    setFollowUpCount(newCount);
    
    const newPrompt = buildFollowUpPrompt(prompt, followUpText, result, newCount);
    
    setPrompt(newPrompt); 
    generate(newPrompt, result.taskType, lastDbOption);
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-md flex items-center justify-center shadow-sm">
              <Code2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">K-Dev Assistant</h1>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="설정 및 관리"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="space-y-1 mb-8 border-b border-slate-100 pb-5">
                <h2 className="text-2xl font-bold text-slate-800">새 작업 시작</h2>
                <p className="text-sm text-slate-500 max-w-xl">
                  요구사항을 자연어로 입력하면 순서도, SQL, TypeScript 코드로 뼈대를 생성합니다.
                </p>
              </div>

              <div className="space-y-6">
                <PromptInput value={prompt} onChange={setPrompt} />
                <ActionButtons onGenerate={handleGenerate} isLoading={isLoading} />
              </div>
            </div>
            
            {/* 컨텍스트 누적 경고 메시지 */}
            {followUpCount >= 3 && !isLoading && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-md animate-in fade-in flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-orange-800 text-xs font-semibold leading-relaxed">
                  수정 요청이 연속으로 많이 누적되었습니다. 컨텍스트가 {FOLLOW_UP_MAX_COUNT}회 이상 과도하게 길어지면 품질이 저하될 수 있으므로 만족스럽지 않다면 현재 결과 복사 후 새 작업으로 시작하는 것을 권장합니다.
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md animate-in fade-in flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-red-800 text-sm font-medium leading-relaxed">{error}</div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center items-center py-16 bg-white rounded-xl shadow-sm border border-slate-200 border-dashed">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-sm text-slate-500 font-medium">안전한 환경에서 AI가 요청을 처리 중입니다...</p>
                </div>
              </div>
            )}

            {!isLoading && result && (
              <ResultPanel result={result} onFollowUp={handleFollowUp} isGenerating={isLoading} />
            )}
          </div>

          <div className="lg:col-span-4 hidden lg:block">
            <aside className="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-24 overflow-hidden">
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-800 text-sm">최근 작업 이력</h3>
              </div>
              <div className="divide-y divide-slate-100 max-h-[calc(100vh-200px)] overflow-y-auto">
                {recentTasks.length === 0 ? (
                  <p className="p-6 text-sm text-slate-400 text-center">최근 작업이 없습니다.</p>
                ) : (
                  recentTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                         setPrompt(task.prompt);
                         setFollowUpCount(0); // 이력 복구 시 새 작업 취급
                      }}
                      className="w-full text-left p-4 hover:bg-slate-50 transition-colors focus:bg-blue-50 focus:outline-none block group"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase uppercase">
                          {task.taskType}
                        </span>
                        <div className="flex items-center text-[10px] text-slate-400 gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(task.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-700 transition-colors">
                        {task.title}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onDataCleared={handleDataCleared} />
    </div>
  );
}
