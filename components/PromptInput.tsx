"use client";
import { useState } from 'react';
import { TaskType } from '@/lib/types';

interface PromptInputProps {
  value: string;
  onChange: (val: string) => void;
  schemaContext: string;
  onSchemaChange: (val: string) => void;
  showSchema: boolean;
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
  ],
};

const SCHEMA_PLACEHOLDER = `[테이블]
customer(cust_id, cust_name, status_cd)
contract(contract_id, cust_id, product_cd)
payment(payment_id, contract_id, unpaid_yn)

[관계]
customer.cust_id = contract.cust_id
contract.contract_id = payment.contract_id

[요청]
최근 미납 이력이 있는 고객 조회`;

export default function PromptInput({
  value,
  onChange,
  schemaContext,
  onSchemaChange,
  showSchema,
}: PromptInputProps) {
  const [activeTab, setActiveTab] = useState<TaskType>('flow');

  return (
    <div className="w-full">
      <div className="mb-4">
        <label className="block text-sm font-bold text-slate-800 mb-2">프롬프트 템플릿 예시</label>
        <div className="flex gap-2 mb-2">
          {(['flow', 'sql', 'ts'] as TaskType[]).map((type) => (
            <button
              key={type}
              type="button"
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
              type="button"
              onClick={() => onChange(ex)}
              className="px-3 py-2 text-xs text-left font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors truncate max-w-full"
            >
              • {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-6">
        <label className="block text-sm font-bold text-slate-800 mb-2">요구사항 입력</label>
        <p className="text-xs text-slate-500 mb-2">무엇을 조회·집계·수정할지 구체적으로 적어 주세요.</p>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="예) 미납 건이 있는 고객만 추출하고, 최근 결제일 기준으로 정렬"
          className="w-full h-36 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none bg-white font-sans text-slate-800 shadow-inner"
        />
        {value.trim() === '' && (
          <div className="absolute right-4 bottom-4 text-xs font-medium text-slate-400 pointer-events-none">
            내용을 입력해주세요
          </div>
        )}
      </div>

      {showSchema && (
        <div className="relative border-t border-slate-100 pt-6">
          <label className="block text-sm font-bold text-slate-800 mb-2">
            테이블 구조 / 조인 관계
          </label>
          <p className="text-xs text-slate-500 mb-2">
            SQL 생성 시에만 사용됩니다. 컬럼명과 조인 키를 적으면 실무에 가까운 쿼리를 얻기 쉽습니다.
          </p>
          <textarea
            value={schemaContext}
            onChange={(e) => onSchemaChange(e.target.value)}
            placeholder={SCHEMA_PLACEHOLDER}
            className="w-full min-h-[200px] p-4 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow resize-y bg-emerald-50/40 font-mono text-sm text-slate-800 shadow-inner"
          />
        </div>
      )}
    </div>
  );
}
