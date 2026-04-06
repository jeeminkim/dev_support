import { NextResponse } from 'next/server';
import { GeminiProvider } from '@/lib/providers/gemini';
import { GenerateRequest } from '@/lib/types';
import { ApiError, logDevError } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const body: GenerateRequest = await req.json();
    
    // 명시적 검증 강화
    if (typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
      throw new ApiError('업무 내용(Prompt)이 누락되었거나 형식이 알맞지 않습니다.', 400);
    }
    if (!['flow', 'sql', 'ts'].includes(body.taskType)) {
      throw new ApiError('잘못된 생성 타입(TaskType) 요청입니다.', 400);
    }
    if (body.provider !== 'gemini') {
      throw new ApiError('현재 MVP에서는 gemini 이외의 Provider를 지원하지 않습니다.', 400);
    }
    if (typeof body.apiKey !== 'string' || body.apiKey.trim().length === 0) {
      throw new ApiError('API Key가 유효하지 않습니다.', 400);
    }

    const provider = new GeminiProvider();
    const result = await provider.generate(body);
    
    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof ApiError) {
      logDevError(`Route Handler ApiError [${error.statusCode}]: ${error.message}`);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    logDevError('Route Handler Internal Error', error);
    return NextResponse.json({ error: error.message || '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
