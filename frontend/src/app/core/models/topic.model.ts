export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Topic {
  id: number;
  name: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  customPrompt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TopicRequest {
  name: string;
  description: string;
  difficulty: Difficulty;
  tags: string;
  customPrompt: string | null;
  active: boolean;
}
