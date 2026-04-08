export type TaskType = 'flow' | 'sql' | 'ts';

/** API·LLM용 DB 식별자 (소문자) */
export type DbType = 'postgresql' | 'mysql' | 'oracle';

export type GenerateResponse = {
  taskType: TaskType;
  title?: string;
  content: string;
  explanation?: string;
  mermaidCode?: string;
  example?: string;
  warnings?: string[];
  provider?: 'gemini';
  error?: string;
};

export type GenerateRequest = {
  prompt: string;
  taskType: TaskType;
  provider: 'gemini';
  apiKey: string;
  /** SQL 전용: 미지정 시 서버에서 postgresql 기본값 처리 */
  dbType?: DbType;
  /** SQL 전용: 테이블·조인 관계 등 */
  schemaContext?: string;
};

export type RecentResult = {
  id: string;
  taskType: TaskType;
  title: string;
  prompt: string;
  createdAt: string;
};
