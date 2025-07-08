export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: Role;
  content: string;
  timestamp?: string;
  model?: string;
  isError?: boolean;
}
