import { GenerateResponse } from '@/lib/types';

export const FOLLOW_UP_MAX_COUNT = 5;

/**
 * 후속 수정(follow-up) 요청 시 누적 횟수에 따라 새로운 프롬프트를 조합합니다.
 */
export function buildFollowUpPrompt(
  currentPrompt: string,
  followUpText: string,
  result: GenerateResponse,
  newCount: number
): string {
  if (newCount >= FOLLOW_UP_MAX_COUNT) {
    // 5회 이상 시 프롬프트 요약 재구성 (컨텍스트 오버플로우 방지)
    const baseContent = result.content || result.explanation || '';
    return `[현재 결과 기준]\n${baseContent}\n\n[추가 수정 요청]\n${followUpText}`;
  } else {
    // 5회 미만 시 누적 방식 유지
    return `[기존 업무 내용]\n${currentPrompt}\n\n[추가 수정 요청 사항]\n${followUpText}`;
  }
}
