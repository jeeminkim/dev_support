"use client";
import { useState, useEffect } from 'react';
import { getSettings, saveSettings, clearDraft, clearRecentResults, clearAllLocalData } from '@/lib/storage';
import { X, KeyRound, ShieldCheck, Trash2, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // page 쪽에 초기화 이벤트를 전파할 필요가 있을 경우 사용할 콜백 (여기서는 단순히 refresh 위해 넘길 수 있음)
  onDataCleared?: () => void; 
}

export default function SettingsModal({ isOpen, onClose, onDataCleared }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(() => setApiKey(getSettings().geminiApiKey));
  }, [isOpen]);

  const handleSave = () => {
    saveSettings({ geminiApiKey: apiKey.trim() });
    onClose();
  };

  const handleClearDraft = () => {
    if (confirm('작성 중인 작업 내용(초안)을 삭제하시겠습니까?')) {
      clearDraft();
      if (onDataCleared) onDataCleared();
      alert('초안이 삭제되었습니다. 새로고침을 권장합니다.');
    }
  };

  const handleClearRecent = () => {
    if (confirm('최근 작업 이력을 모두 삭제하시겠습니까?')) {
      clearRecentResults();
      if (onDataCleared) onDataCleared();
      alert('최근 이력이 삭제되었습니다.');
    }
  };

  const handleClearAll = () => {
    if (confirm('주의: 설정된 API Key, 초안, 최근 검색 이력, 저장 템플릿, 피드백 등 모든 로컬 데이터가 영구히 삭제됩니다. 계속 진행하시겠습니까?')) {
      clearAllLocalData();
      setApiKey('');
      if (onDataCleared) onDataCleared();
      alert('모든 데이터가 초기화되었습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-none">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-bold text-slate-800">설정 및 데이터 관리</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* API Key 관리 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AI Studio에서 발급받은 API Key"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm mb-4 transition-shadow shadow-sm"
            />
            
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed space-y-1">
                <p><strong>API Key는 브라우저 내부(localStorage)에만 저장됩니다.</strong></p>
                <p>생성 요청 시 서버리스 API(/api/generate)로 일회성 전달되며, 서버는 이를 영구 저장하지 않습니다.</p>
                <p>또한 어떠한 서버 로그나 콘솔 화면에도 Key 값이 기록되지 않으므로 안심하고 사용하세요.</p>
              </div>
            </div>
          </div>

          {/* 데이터 초기화 영역 */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <Trash2 className="w-4 h-4 text-slate-500" />
              로컬 데이터 초기화
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleClearDraft}
                className="col-span-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors border border-slate-200"
              >
                진행 중인 초안 삭제
              </button>
              <button
                onClick={handleClearRecent}
                className="col-span-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors border border-slate-200"
              >
                최근 검색 이력 삭제
              </button>
              <button
                onClick={handleClearAll}
                className="col-span-2 px-3 py-2 mt-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-md transition-colors border border-red-200"
              >
                <AlertTriangle className="w-3 h-3" />
                전체 초기화 (모든 데이터 삭제)
              </button>
            </div>
          </div>

        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 flex-none">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-md shadow-sm transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
