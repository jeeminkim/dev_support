export type TaskType = 'flow' | 'sql' | 'ts';
export type DbOption = 'PostgreSQL' | 'MySQL' | 'Oracle';

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
  dbOption?: DbOption;
};

export type RecentResult = {
  id: string;
  taskType: TaskType;
  title: string;
  prompt: string;
  createdAt: string;
};
