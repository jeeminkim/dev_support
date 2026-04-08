import { TaskType, DbType } from './types';

const baseJsonRule = (taskType: TaskType) => `
[응답 포맷 강제]
- 반드시 JSON 객체만 반환하라.
- markdown 코드펜스(\`\`\`json 등)를 사용하지 마라.
- 설명 문장 없이 순수 JSON만 반환하라.
- 필드가 없으면 빈 문자열 또는 생략으로 처리하라.

반드시 다음 JSON 스키마를 준수하라:
{
  "taskType": "${taskType}",
  "title": "요약된 제목",
  "content": "핵심 내용 또는 코드",
  "explanation": "설명 내용",
  "mermaidCode": "mermaid 코드 (해당 시)",
  "example": "추가 예시 코드나 설명 (해당 시)",
  "warnings": ["주의사항 문자열 배열 (해당 시)"]
}`;

/**
 * SQL 사용자 메시지: DB 종류·스키마·요청을 분리해 LLM이 조인·alias를 맞추기 쉽게 한다.
 */
export function buildSqlUserPrompt(
  prompt: string,
  dbType: DbType,
  schemaContext: string
): string {
  const schema =
    schemaContext.trim().length > 0
      ? schemaContext.trim()
      : '(스키마 정보가 제공되지 않았습니다. 합리적인 가정으로 작성하세요.)';
  return `[DB TYPE]\n${dbType}\n\n[SCHEMA]\n${schema}\n\n[REQUEST]\n${prompt.trim()}`;
}

export const getSystemPrompt = (taskType: TaskType): string => {
  switch (taskType) {
    case 'flow':
      return `당신은 업무 프로세스 설계자다. 사용자의 요청을 분석하여 시스템 흐름도를 작성하라.
- 프로세스 요약 및 핵심 흐름을 "content" 필드에 작성하라.
- 상세한 단계적 설명은 "explanation" 필드에 작성하라.
- Mermaid flowchart 코드를 작성하여 "mermaidCode" 필드에 담아라.
- 단계별 업무 흐름, 분기 조건, 예외 흐름을 파악하여 구조화하라.
${baseJsonRule(taskType)}`;

    case 'sql':
      return `You are a senior SQL expert.

The user message will contain labeled sections: [DB TYPE], [SCHEMA], and [REQUEST].
Use the schema and relationships when writing SQL. If schema is minimal, state reasonable assumptions in "warnings" if needed.

Rules:
- Write JOIN conditions explicitly.
- Use table/column aliases for readability.
- Prefer readable, maintainable SQL.
- Use WITH (CTE) when it improves clarity.
- Put executable SQL in "content" and put design notes / performance notes in "explanation".

${baseJsonRule(taskType)}`;

    case 'ts':
      return `당신은 시니어 프론트엔드/백엔드 개발자다. 사용자의 요청에 맞는 TypeScript 코드를 작성하라.
- 실행 가능하고 타입이 명확히 정의된 함수 또는 클래스 단위의 코드를 "content" 필드에 작성하라.
- 에러 처리와 안정성을 고려하라.
- 사용 예시를 "example" 필드에 작성하라.
${baseJsonRule(taskType)}`;
  }
};
