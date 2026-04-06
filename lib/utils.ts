import { GenerateResponse } from './types';

export class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export function logDevError(message: string, ...optionalParams: any[]) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(message, ...optionalParams);
  }
}

export function formatResultAsMarkdown(result: GenerateResponse): string {
  let md = `# K-Dev Assistant Result\n\n`;
  if (result.title) md += `## ${result.title}\n\n`;
  md += `- Task Type: ${result.taskType}\n`;
  if (result.provider) md += `- Provider: ${result.provider}\n`;
  md += `\n---\n\n`;

  if (result.warnings && result.warnings.length > 0) {
    md += `### ⚠️ 주의사항\n`;
    result.warnings.forEach(w => md += `- ${w}\n`);
    md += `\n`;
  }

  if (result.taskType === 'flow') {
    if (result.mermaidCode) {
      md += `### 프로세스 시각화 (Mermaid)\n\`\`\`mermaid\n${result.mermaidCode}\n\`\`\`\n\n`;
    }
    if (result.content) {
      md += `### 프로세스 요약\n${result.content}\n\n`;
    }
    if (result.explanation) {
      md += `### 상세 설명\n${result.explanation}\n\n`;
    }
  } else {
    if (result.explanation) {
      md += `### Explanation\n${result.explanation}\n\n`;
    }
    if (result.content) {
      md += `### ${result.taskType === 'sql' ? 'SQL' : 'TypeScript'}\n\`\`\`${result.taskType === 'sql' ? 'sql' : 'typescript'}\n${result.content}\n\`\`\`\n\n`;
    }
    if (result.example) {
      md += `### Usage Example\n\`\`\`${result.taskType === 'sql' ? 'sql' : 'typescript'}\n${result.example}\n\`\`\`\n\n`;
    }
  }

  return md;
}

export function downloadTextFile(filename: string, text: string) {
  if (typeof window === 'undefined') return;
  const element = document.createElement('a');
  const file = new Blob([text], { type: 'text/markdown' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
  document.body.removeChild(element);
}
