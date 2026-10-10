import { QuizSessionConfig, JoinSessionPayload, ActiveQuestion } from '../types';
import { supabase, getSupabaseConfigStatus } from '../lib/supabase';

export interface SessionResult {
  success: boolean;
  code?: string;
  roomId?: string;
  roomPlayerId?: string;
  questionSetId?: string;
  message: string;
  details?: Record<string, unknown>;
}

export const sessionService = {
  /**
   * Generates a random 6-character uppercase alphanumeric join code.
   */
  generateJoinCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars (0, O, 1, I)
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  /**
   * Persists a question set with its questions, options, and secret answer keys to Supabase DB.
   */
  async saveQuestionSet(config: QuizSessionConfig, questionsToSave: ActiveQuestion[]): Promise<string | null> {
    const status = getSupabaseConfigStatus();
    if (!status.isConfigured || questionsToSave.length === 0) return null;

    try {
      // 1. Insert question_set
      const categoryName = config.category === 'General Aptitude' ? 'Quantitative Aptitude' : config.category;
      const { data: qSet, error: qSetError } = await supabase
        .from('question_sets')
        .insert({
          title: `${config.title.trim()} Question Set`,
          category: categoryName,
          is_public: true,
        })
        .select()
        .single();

      if (qSetError || !qSet) {
        console.warn('Could not persist question_set:', qSetError?.message);
        return null;
      }

      // 2. Insert questions, options, and answer keys
      for (let idx = 0; idx < questionsToSave.length; idx++) {
        const q = questionsToSave[idx];

        const { data: dbQ, error: qError } = await supabase
          .from('questions')
          .insert({
            question_set_id: qSet.id,
            prompt: q.prompt.trim(),
            explanation: q.explanation ? q.explanation.trim() : null,
            order_index: idx,
            difficulty: 'medium',
          })
          .select()
          .single();

        if (qError || !dbQ) continue;

        let selectedCorrectOptId: string | null = null;

        for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
          const opt = q.options[optIdx];
          const { data: dbOpt } = await supabase
            .from('question_options')
            .insert({
              question_id: dbQ.id,
              option_key: opt.key,
              option_text: opt.text.trim(),
              order_index: optIdx,
            })
            .select()
            .single();

          if (dbOpt && (q.correctOptionId === opt.id || q.correctOptionId === opt.key)) {
            selectedCorrectOptId = dbOpt.id;
          }
        }

        // Save secret answer key into protected question_answer_keys table
        if (selectedCorrectOptId) {
          await supabase
            .from('question_answer_keys')
            .insert({
              question_id: dbQ.id,
              correct_option_id: selectedCorrectOptId,
              points: 10,
            });
        }
      }

      return qSet.id;
    } catch (err) {
      console.warn('Error saving question set to DB:', err);
      return null;
    }
  },

  /**
   * Persists a new competition session into Supabase DB (or local preview fallback).
   */
  async createSession(config: QuizSessionConfig): Promise<SessionResult> {
    const status = getSupabaseConfigStatus();

    // Input validation
    if (!config.title || !config.title.trim()) {
      return { success: false, message: 'Session title is required.' };
    }
    if (!config.hostName || !config.hostName.trim()) {
      return { success: false, message: 'Host display name is required.' };
    }

    const code = this.generateJoinCode();

    if (!status.isConfigured) {
      return {
        success: true,
        code,
        roomId: `local_${code}`,
        message: `Local session scaffolded (${code}). Connect Supabase for cross-device room persistence.`,
        details: { mode: 'offline-preview', config },
      };
    }

    try {
      // Save custom/selected question set to Supabase DB if questions exist
      let questionSetId: string | null = null;
      if (config.customQuestions && config.customQuestions.length > 0) {
        questionSetId = await this.saveQuestionSet(config, config.customQuestions);
      }

      // 1. Insert room record into Supabase rooms table
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          join_code: code,
          title: config.title.trim(),
          game_mode: config.mode || 'Standard',
          question_set_id: questionSetId,
          max_players: 50,
          time_per_question_sec: config.timePerQuestionSec || 30,
          status: 'lobby',
        })
        .select()
        .single();

      if (roomError || !room) {
        console.warn('Supabase room creation notice:', roomError?.message);
        return {
          success: true,
          code,
          roomId: `local_${code}`,
          message: `Session code ${code} initialized in testing mode.`,
          details: { config, dbNotice: roomError?.message },
        };
      }

      // 2. Register host in room_players table
      const { data: hostPlayer } = await supabase
        .from('room_players')
        .insert({
          room_id: room.id,
          display_name: config.hostName.trim(),
          college_name: config.collegeName ? config.collegeName.trim() : null,
          is_host: true,
          status: 'ready',
        })
        .select()
        .single();

      return {
        success: true,
        code: room.join_code,
        roomId: room.id,
        roomPlayerId: hostPlayer?.id,
        questionSetId: room.question_set_id || undefined,
        message: `Session code ${room.join_code} initialized and persisted in Supabase database!`,
        details: { roomId: room.id, room },
      };
    } catch (err) {
      return {
        success: true,
        code,
        roomId: `local_${code}`,
        message: `Session initialized in local mode.`,
        details: { error: String(err) },
      };
    }
  },


  /**
   * Looks up an existing room in Supabase DB by join code and registers participant.
   */
  async joinSession(payload: JoinSessionPayload): Promise<SessionResult> {
    const formattedCode = payload.joinCode.trim().toUpperCase();
    const status = getSupabaseConfigStatus();

    if (!formattedCode || formattedCode.length < 4) {
      return { success: false, message: 'Please enter a valid 6-character join code (e.g. APTI99).' };
    }
    if (!payload.participantName || !payload.participantName.trim()) {
      return { success: false, message: 'Participant display name is required.' };
    }

    if (!status.isConfigured) {
      return {
        success: true,
        code: formattedCode,
        roomId: `local_${formattedCode}`,
        message: `Joined session ${formattedCode} in local mode.`,
      };
    }

    try {
      // 1. Query Supabase for room record with exact join_code
      const { data: room, error: findError } = await supabase
        .from('rooms')
        .select('*')
        .eq('join_code', formattedCode)
        .maybeSingle();

      if (findError) {
        console.warn('Room code lookup error:', findError.message);
        if (findError.message.includes('infinite recursion')) {
          return {
            success: false,
            message: 'Database policy update required: Please run migration 000009 in Supabase SQL Editor to fix RLS infinite recursion.',
          };
        }
        return { success: false, message: `Database error looking up room code: ${findError.message}` };
      }


      if (!room) {
        return {
          success: false,
          message: `Room code "${formattedCode}" not found. Please verify the code with the host.`,
        };
      }

      if (room.status !== 'lobby') {
        return {
          success: false,
          message: `Session "${formattedCode}" is currently ${room.status} and cannot accept new players.`,
        };
      }

      // 2. Check current room player count
      const { count } = await supabase
        .from('room_players')
        .select('id', { count: 'exact', head: true })
        .eq('room_id', room.id);

      if (count && count >= room.max_players) {
        return { success: false, message: `Room "${formattedCode}" has reached its maximum capacity (${room.max_players} players).` };
      }

      // 3. Register participant in room_players
      let displayName = payload.participantName.trim();
      const { data: existingName } = await supabase
        .from('room_players')
        .select('id')
        .eq('room_id', room.id)
        .eq('display_name', displayName)
        .maybeSingle();

      if (existingName) {
        displayName = `${displayName} (${Math.floor(Math.random() * 90 + 10)})`;
      }

      const { data: newPlayer, error: joinError } = await supabase
        .from('room_players')
        .insert({
          room_id: room.id,
          display_name: displayName,
          college_name: payload.collegeName ? payload.collegeName.trim() : null,
          is_host: false,
          status: 'ready',
        })
        .select()
        .single();

      if (joinError) {
        return { success: false, message: `Failed to register participant: ${joinError.message}` };
      }

      return {
        success: true,
        code: room.join_code,
        roomId: room.id,
        roomPlayerId: newPlayer?.id,
        message: `Successfully joined room ${room.join_code} as ${displayName}!`,
        details: { room, newPlayer },
      };
    } catch (err) {
      return {
        success: true,
        code: formattedCode,
        roomId: `local_${formattedCode}`,
        message: `Joined session ${formattedCode}.`,
        details: { error: String(err) },
      };
    }
  },

  /**
   * Fetches the current connected players for a room from Supabase DB.
   */
  async fetchRoomPlayers(roomId: string) {
    const status = getSupabaseConfigStatus();
    if (!status.isConfigured || roomId.startsWith('local_')) return [];

    const { data, error } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });

    if (error || !data) return [];
    return data;
  },

  /**
   * Updates room status (e.g. from 'lobby' to 'in_game' or 'completed').
   */
  async updateRoomStatus(roomId: string, newStatus: 'lobby' | 'in_game' | 'completed') {
    const status = getSupabaseConfigStatus();
    if (!status.isConfigured || roomId.startsWith('local_')) return;

    await supabase
      .from('rooms')
      .update({ status: newStatus })
      .eq('id', roomId);
  },

  /**
   * Fetches persisted questions for a question_set_id from Supabase DB.
   */
  async fetchRoomQuestions(questionSetId: string): Promise<ActiveQuestion[]> {
    const status = getSupabaseConfigStatus();
    if (!status.isConfigured || !questionSetId) return [];

    try {
      const { data: dbQuestions, error } = await supabase
        .from('questions')
        .select(`
          id,
          prompt,
          explanation,
          order_index,
          question_options (
            id,
            option_key,
            option_text,
            order_index
          )
        `)
        .eq('question_set_id', questionSetId)
        .order('order_index', { ascending: true });

      if (error || !dbQuestions) return [];

      return dbQuestions.map(q => {
        const sortedOpts = (q.question_options || [])
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .map(opt => ({
            id: opt.id,
            key: opt.option_key,
            text: opt.option_text,
          }));

        return {
          id: q.id,
          prompt: q.prompt,
          explanation: q.explanation || '',
          category: 'Quantitative Aptitude',
          options: sortedOpts,
          correctOptionId: '', // Secret! Answers are evaluated securely on server / submitted option checks
        };
      });
    } catch (err) {
      console.warn('Error fetching room questions:', err);
      return [];
    }
  },
};

