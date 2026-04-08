"use client";
import { useState } from 'react';
import { TaskType, DbType } from '@/lib/types';
import { Send, TerminalSquare, GitBranch, Table2 } from 'lucide-react';

interface ActionButtonsProps {
  onGenerate: (type: TaskType, dbType?: DbType) => void;
  isLoading: boolean;
  showSqlSchema: boolean;
  onToggleSqlSchema: () => void;
}

const DB_LABEL: Record<DbType, string> = {
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  oracle: 'Oracle',
};

export default function ActionButtons({
  onGenerate,
  isLoading,
  showSqlSchema,
  onToggleSqlSchema,
}: ActionButtonsProps) {
  const [dbType, setDbType] = useState<DbType>('postgresql');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap md:flex-nowrap gap-3 items-end">
        <button
          type="button"
          onClick={() => onGenerate('flow')}
          disabled={isLoading}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          <GitBranch className="w-5 h-5" />
          순서도 생성
        </button>

        <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 min-h-[18px]">
            <label className="text-[11px] font-bold text-slate-500">대상 DB</label>
            <button
              type="button"
              onClick={onToggleSqlSchema}
              disabled={isLoading}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline disabled:opacity-50"
            >
              {showSqlSchema ? '스키마 입력 닫기' : '스키마 입력'}
            </button>
          </div>
          <div className="flex gap-2">
            <select
              value={dbType}
              onChange={(e) => setDbType(e.target.value as DbType)}
              disabled={isLoading}
              className="flex-none min-w-[7.5rem] px-2 py-3 border border-slate-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
              aria-label="대상 DB"
            >
              {(Object.keys(DB_LABEL) as DbType[]).map((key) => (
                <option key={key} value={key}>
                  {DB_LABEL[key]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onGenerate('sql', dbType)}
              disabled={isLoading}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md disabled:opacity-50 transition-colors flex items-center justify-center gap-2 min-w-0"
            >
              <TerminalSquare className="w-5 h-5 shrink-0" />
              <span className="truncate">SQL 생성</span>
              <span className="text-emerald-100 text-xs font-normal hidden sm:inline">
                · {DB_LABEL[dbType]}
              </span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onGenerate('ts')}
          disabled={isLoading}
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          TypeScript 생성
        </button>
      </div>

      {showSqlSchema && (
        <p className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-md px-3 py-2">
          <Table2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          위에서 &quot;스키마 입력&quot;을 연 상태면 테이블·조인 정보가 SQL 프롬프트에 포함됩니다.
        </p>
      )}
    </div>
  );
}
