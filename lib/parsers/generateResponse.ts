import { GenerateResponse, TaskType } from '../types';
import { ApiError, logDevError } from '../utils';

export function extractJsonObject(text: string): any {
  let cleanText = text.trim();
  
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.substring(3);
  }
  
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }
  
  const jsonStart = cleanText.indexOf('{');
  const jsonEnd = cleanText.lastIndexOf('}');
  
  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleanText = cleanText.slice(jsonStart, jsonEnd + 1);
  }

  try {
    return JSON.parse(cleanText);
  } catch (err) {
    logDevError('JSON 영역 파싱 실패', err);
    throw new ApiError('응답을 처리하는 중 오류가 발생했습니다. (JSON 파싱 실패)', 500);
  }
}

export function normalizeGenerateResponse(parsed: any, requestedTaskType: TaskType): GenerateResponse {
  const parsedTaskType = ['flow', 'sql', 'ts'].includes(parsed.taskType) ? parsed.taskType : requestedTaskType;
  const parsedContent = typeof parsed.content === 'string' && parsed.content.trim().length > 0 
    ? parsed.content 
    : '결과 내용이 생성되지 않았습니다.';
  const parsedExplanation = typeof parsed.explanation === 'string' ? parsed.explanation : undefined;
  const parsedMermaidCode = typeof parsed.mermaidCode === 'string' ? parsed.mermaidCode : undefined;
  const parsedExample = typeof parsed.example === 'string' ? parsed.example : undefined;
  const parsedWarnings = Array.isArray(parsed.warnings) 
    ? parsed.warnings.filter((w: any) => typeof w === 'string') 
    : [];

  return {
    taskType: parsedTaskType,
    title: typeof parsed.title === 'string' ? parsed.title : undefined,
    content: parsedContent,
    explanation: parsedExplanation,
    mermaidCode: parsedMermaidCode,
    example: parsedExample,
    warnings: parsedWarnings,
    provider: 'gemini',
  };
}
