import { QuizSessionConfig, JoinSessionPayload } from '../types';
import { getSupabaseConfigStatus } from '../lib/supabase';

export interface SessionResult {
  success: boolean;
  code?: string;
  message: string;
  details?: Record<string, unknown>;
}

export const sessionService = {
  /**
   * Validates and prepares session creation requests.
   */
  async createSession(config: QuizSessionConfig): Promise<SessionResult> {
    const status = getSupabaseConfigStatus();

    // Input validation
    if (!config.title.trim()) {
      return { success: false, message: 'Session title is required.' };
    }
    if (!config.hostName.trim()) {
      return { success: false, message: 'Host display name is required.' };
    }

    // Generate a 6-character uppercase alphanumeric join code for local preview/demo
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    if (!status.isConfigured) {
      return {
        success: true,
        code,
        message: `Local session scaffolded (${code}). Connect real Supabase project to persist sessions across clients.`,
        details: { mode: 'offline-preview', config },
      };
    }

    // When Supabase is configured, this will execute database insert queries once schema is migrated.
    return {
      success: true,
      code,
      message: `Session code ${code} initialized. Ready for question setup.`,
      details: { config, supabaseActive: true },
    };
  },

  /**
   * Validates and prepares session join requests.
   */
  async joinSession(payload: JoinSessionPayload): Promise<SessionResult> {
    const formattedCode = payload.joinCode.trim().toUpperCase();

    if (!formattedCode || formattedCode.length < 4) {
      return { success: false, message: 'Please enter a valid join code (e.g. APTI99).' };
    }
    if (!payload.participantName.trim()) {
      return { success: false, message: 'Participant name is required.' };
    }

    return {
      success: true,
      code: formattedCode,
      message: `Joined session ${formattedCode} as ${payload.participantName}. Waiting for host...`,
      details: { payload },
    };
  },
};
