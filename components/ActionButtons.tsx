"use client";
import { useState } from 'react';
import { TaskType, DbOption } from '@/lib/types';
import { Send, TerminalSquare, GitBranch } from 'lucide-react';

interface ActionButtonsProps {
  onGenerate: (type: TaskType, dbOption?: DbOption) => void;
  isLoading: boolean;
}

export default function ActionButtons({ onGenerate, isLoading }: ActionButtonsProps) {
  const [dbOption, setDbOption] = useState<DbOption>('PostgreSQL');

  return (
    <div className="flex flex-wrap md:flex-nowrap gap-3 items-end">
      <button
        onClick={() => onGenerate('flow')}
        disabled={isLoading}
        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        <GitBranch className="w-5 h-5" />
        순서도 생성
      </button>
      
      <div className="flex-1 flex flex-col gap-2 relative">
        <label className="text-[11px] font-bold text-slate-500 absolute -top-5 left-1">DB 환경 (SQL 한정)</label>
        <div className="flex h-full gap-1">
          <select 
            value={dbOption}
            onChange={(e) => setDbOption(e.target.value as DbOption)}
            disabled={isLoading}
            className="flex-none w-28 px-2 py-3 border border-slate-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
          >
            <option value="PostgreSQL">PostgreSQL</option>
            <option value="MySQL">MySQL</option>
            <option value="Oracle">Oracle</option>
          </select>
          <button
            onClick={() => onGenerate('sql', dbOption)}
            disabled={isLoading}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <TerminalSquare className="w-5 h-5" />
            SQL 생성
          </button>
        </div>
      </div>

      <button
        onClick={() => onGenerate('ts')}
        disabled={isLoading}
        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        <Send className="w-5 h-5" />
        TypeScript 생성
      </button>
    </div>
  );
}
