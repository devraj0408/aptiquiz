export type AptitudeCategory = 
  | 'Quantitative Aptitude'
  | 'Logical Reasoning'
  | 'Verbal Ability'
  | 'Data Interpretation'
  | 'General Aptitude';

export interface QuizSessionConfig {
  title: string;
  category: AptitudeCategory;
  questionCount: number;
  timePerQuestionSec: number;
  mode: 'Standard' | 'Pressure Cooker' | 'Team Relay';
  hostName: string;
  collegeName?: string;
  customQuestions?: ActiveQuestion[];
}


export interface JoinSessionPayload {
  joinCode: string;
  participantName: string;
  collegeName?: string;
}

export interface ConnectionState {
  status: 'unconfigured' | 'checking' | 'connected' | 'error';
  message: string;
  displayUrl?: string | null;
  missingVars?: string[];
  latencyMs?: number;
  lastCheckedAt?: Date;
}

export interface ActiveQuestionOption {
  id: string;
  key: string;
  text: string;
}

export interface ActiveQuestion {
  id: string;
  prompt: string;
  options: ActiveQuestionOption[];
  correctOptionId: string;
  explanation: string;
  category: AptitudeCategory;
}

export interface ActivePlayer {
  id: string;
  name: string;
  college?: string;
  isHost: boolean;
  score: number;
  status: 'joined' | 'ready' | 'submitted' | 'disconnected';
  lastAnswerCorrect?: boolean;
}

export interface ActiveGameSession {
  roomId?: string;
  roomCode: string;
  title: string;
  category: AptitudeCategory;
  mode: 'Standard' | 'Pressure Cooker' | 'Team Relay';
  timePerQuestion: number;
  totalQuestions: number;
  currentRoundIndex: number;
  status: 'lobby' | 'active_round' | 'evaluating' | 'completed';
  hostName: string;
  players: ActivePlayer[];
  questions: ActiveQuestion[];
}

