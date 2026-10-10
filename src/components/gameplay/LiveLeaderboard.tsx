import React from 'react';
import { ActivePlayer } from '../../types';
import { Trophy, Award, Medal, Crown } from 'lucide-react';

interface LiveLeaderboardProps {
  players: ActivePlayer[];
  currentRound: number;
}

export const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({ players, currentRound }) => {
  // Sort players descending by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="card-flat bg-[var(--surface)] p-5 space-y-4 shadow-xs rounded-[8px] border-[var(--border)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="font-serif font-bold text-base text-[var(--ink)]">
            Live Standings
          </h3>
        </div>
        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--ink-muted)]">
          Round #{currentRound}
        </span>
      </div>

      <div className="space-y-2.5">
        {sortedPlayers.map((player, idx) => {
          const rank = idx + 1;
          return (
            <div
              key={player.id}
              className={`p-3 rounded-[6px] border flex items-center justify-between transition-all duration-300 shadow-2xs ${
                rank === 1
                  ? 'bg-[var(--brand-tint)] border-[var(--brand)]/50 ring-1 ring-[var(--brand)]/10 shadow-xs'
                  : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--brand)]/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0">
                  {rank === 1 && <Crown className="w-4 h-4 text-[var(--brand)] fill-current animate-bounce" />}
                  {rank === 2 && <Medal className="w-4 h-4 text-[var(--accent)]" />}
                  {rank === 3 && <Award className="w-4 h-4 text-[var(--ink-muted)]" />}
                  {rank > 3 && <span className="text-[var(--ink-muted)] font-bold">#{rank}</span>}
                </div>

                <div>
                  <div className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                    <span>{player.name}</span>
                    {player.isHost && (
                      <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--ink-muted)]">
                        Host
                      </span>
                    )}
                  </div>
                  {player.college && (
                    <div className="text-[10px] text-[var(--ink-muted)] font-mono">{player.college}</div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-sm font-extrabold text-[var(--brand)]">
                  {player.score} pts
                </div>
                {player.lastAnswerCorrect !== undefined && (
                  <div className={`text-[10px] font-bold ${
                    player.lastAnswerCorrect ? 'text-[var(--correct)]' : 'text-[var(--wrong)]'
                  }`}>
                    {player.lastAnswerCorrect ? '+Speed Bonus' : '0 pts'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
