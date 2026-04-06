"use client";
import { useState } from 'react';
import { TaskType } from '@/lib/types';

interface PromptInputProps {
  value: string;
  onChange: (val: string) => void;
}

const EXAMPLES: Record<TaskType, string[]> = {
  flow: [
    "장바구니에서 상품 결제 중 재고 부족 시 처리 프로세스",
    "이메일 인증 기반 회원가입 로직",
  ],
  sql: [
    "최근 1주일 로그인 이력이 없는 휴면 회원 목록 조회",
    "상품 카테고리별 일별 매출 합계 집계",
  ],
  ts: [
    "비밀번호가 조건(영문, 숫자, 특수문자 포함 8자 이상)을 만족하는지 검사",
    "입력된 날짜 배열에서 가장 가까운 미래의 날짜 하나를 반환하는 함수",
  ]
};

export default function PromptInput({ value, onChange }: PromptInputProps) {
  const [activeTab, setActiveTab] = useState<TaskType>('flow');

  return (
    <div className="w-full">
      <div className="mb-4">
        <label className="block text-sm font-bold text-slate-800 mb-2">프롬프트 템플릿 예시</label>
        <div className="flex gap-2 mb-2">
          {(['flow', 'sql', 'ts'] as TaskType[]).map(type => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                activeTab === type 
                ? 'bg-slate-800 text-white border border-slate-800' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {type === 'flow' ? 'Flow 예시' : type === 'sql' ? 'SQL 예시' : 'TS 예시'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {EXAMPLES[activeTab].map((ex, idx) => (
            <button
              key={idx}
              onClick={() => onChange(ex)}
              className="px-3 py-2 text-xs text-left font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors truncate max-w-full"
            >
              • {ex}
            </button>
          ))}
        </div>
      </div>
      
      <div className="relative">
        <label className="block text-sm font-bold text-slate-800 mb-2">요구사항 상세 입력</label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="예시) 회원가입 시 이메일 확인 후 비밀번호 암호화 저장 과정..."
          className="w-full h-36 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none bg-white font-sans text-slate-800 shadow-inner"
        />
        {value.trim() === '' && (
          <div className="absolute right-4 bottom-4 text-xs font-medium text-slate-400 pointer-events-none">
            내용을 입력해주세요
          </div>
        )}
      </div>
    </div>
  );
}
