import type { Block } from './block';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type FeedbackMode = 'immediate' | 'deferred';

export interface Author {
  id: string;
  name: string;
}

export interface Metadata {
  estimatedDuration: number;
  difficulty: Difficulty;
  tags: string[];
  thumbnail: string;
}

export interface QuizConfig {
  feedbackMode: FeedbackMode;
  passingScore: number;
  showScoreOnCompletion: boolean;
}

export interface Module {
  moduleId: string;
  title: string;
  description: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  metadata: Metadata;
  blocks: Block[];
  quizConfig: QuizConfig;
}

export interface ModuleExport {
  moduleId: string;
  title: string;
  description: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  metadata: Metadata;
  blocks: Block[];
  quizConfig: QuizConfig;
}
