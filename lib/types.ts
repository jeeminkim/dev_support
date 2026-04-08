export type TaskType = 'flow' | 'sql' | 'ts';

/** API·LLM용 DB 식별자 (소문자) */
export type DbType = 'postgresql' | 'mysql' | 'oracle';

/** SQL 생성 UI 옵션 (로컬 상태, API에는 문자열로 직렬화) */
export type SqlStyleOptions = {
  readabilityFirst: boolean;
  performanceAware: boolean;
  preferCte: boolean;
};

export const DEFAULT_SQL_STYLE_OPTIONS: SqlStyleOptions = {
  readabilityFirst: true,
  performanceAware: true,
  preferCte: false,
};

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
  /** SQL 전용: 가독성/성능/CTE 등 사용자 선호를 한 줄로 전달 */
  sqlStyleHints?: string;
};

export type RecentResult = {
  id: string;
  taskType: TaskType;
  title: string;
  prompt: string;
  createdAt: string;
  /** SQL 재현용 (선택) */
  schemaContext?: string;
  dbType?: DbType;
  sqlStyleHints?: string;
};

/** 저장된 입력 템플릿 (SQL 옵션 포함) */
export type SavedPromptTemplate = {
  id: string;
  name: string;
  prompt: string;
  schemaContext: string;
  dbType: DbType;
  sqlStyle: SqlStyleOptions;
  createdAt: string;
};
