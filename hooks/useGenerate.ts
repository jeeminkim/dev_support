"use client";
import { useState } from 'react';
import { TaskType, GenerateResponse, DbOption } from '@/lib/types';
import { getSettings, saveRecentResult } from '@/lib/storage';

export const useGenerate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  const generate = async (prompt: string, taskType: TaskType, dbOption?: DbOption) => {
    setIsLoading(true);
    setError(null);

    const settings = getSettings();
    const apiKey = settings.geminiApiKey;

    if (!apiKey) {
      setError('설정에서 Gemini API Key를 먼저 입력해주세요.');
      setIsLoading(false);
      return;
    }

    if (!prompt.trim()) {
      setError('업무 내용을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          taskType,
          provider: 'gemini',
          apiKey,
          dbOption
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '생성에 실패했습니다.');
      }

      setResult(data);

      // 성공 시 스토리지에 최근 결과 저장
      saveRecentResult({
        taskType: data.taskType,
        title: data.title || prompt.substring(0, 30) + '...',
        prompt: prompt,
      });

    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { generate, isLoading, error, result };
};
