import { supabase, getSupabaseConfigStatus } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeEventPayload {
  eventType: string;
  payload: Record<string, unknown>;
}

export const realtimeService = {
  /**
   * Subscribes to Supabase Realtime channel for a specific competition room.
   */
  subscribeToRoom(
    roomId: string,
    onPresenceChange?: (players: Record<string, unknown>[]) => void,
    onGameEvent?: (event: RealtimeEventPayload) => void
  ): RealtimeChannel | null {
    const config = getSupabaseConfigStatus();
    if (!config.isConfigured) return null;

    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: { key: roomId },
      },
    });

    // Handle presence sync
    if (onPresenceChange) {
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const presenceList = Object.values(state).flat();
        onPresenceChange(presenceList as Record<string, unknown>[]);
      });
    }

    // Handle broadcast events
    if (onGameEvent) {
      channel.on('broadcast', { event: 'GAME_EVENT' }, ({ payload }) => {
        onGameEvent(payload as RealtimeEventPayload);
      });
    }

    // Subscribe to Postgres changes on game_rounds
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_rounds',
      },
      payload => {
        if (onGameEvent) {
          onGameEvent({
            eventType: 'ROUND_STATE_CHANGED',
            payload: payload as unknown as Record<string, unknown>,
          });
        }
      }
    );

    channel.subscribe();
    return channel;
  },

  /**
   * Broadcasts a game event to room channel.
   */
  async broadcastEvent(channel: RealtimeChannel | null, eventType: string, payload: Record<string, unknown>) {
    if (!channel) return;
    await channel.send({
      type: 'broadcast',
      event: 'GAME_EVENT',
      payload: { eventType, payload },
    });
  },
};
