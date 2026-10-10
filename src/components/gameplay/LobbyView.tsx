import React, { useState } from 'react';
import { ActiveGameSession } from '../../types';
import { Copy, Check, Users, Play, Shield, Clock, Layers, Sparkles, UserCheck, ArrowLeft } from 'lucide-react';

interface LobbyViewProps {
  session: ActiveGameSession;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ session, onStartGame, onLeaveRoom }) => {
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(session.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-in-up">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onLeaveRoom}
          className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
        >
          <ArrowLeft className="w-4 h-4 text-[var(--ink-muted)]" />
          <span>Exit Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded bg-[var(--brand-tint)] text-[var(--brand)] font-semibold border border-[var(--brand-tint)] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lobby Active</span>
          </span>
        </div>
      </div>

      {/* Main Room Code & Title Card */}
      <div className="card-flat bg-[var(--surface)] p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div>
            <div className="text-xs font-semibold text-[var(--brand)] uppercase tracking-wider mb-1">
              AptiQuiz Competition Room
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--ink)]">
              {session.title}
            </h1>
            <p className="text-xs text-[var(--ink-muted)] mt-1">
              Host: <strong className="text-[var(--ink)]">{session.hostName}</strong> • Topic: <strong className="text-[var(--ink)]">{session.category}</strong>
            </p>
          </div>

          {/* Join Code Display */}
          <div className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-[6px] text-center space-y-1 sm:min-w-[180px]">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--ink-muted)]">
              Share Join Code
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-2xl font-extrabold text-[var(--brand)] tracking-widest">
                {session.roomCode}
              </span>
              <button
                onClick={copyRoomCode}
                className="p-1.5 bg-[var(--surface)] hover:bg-[var(--border)] rounded border border-[var(--border)] transition-colors text-xs"
                title="Copy Room Code"
              >
                {copied ? <Check className="w-4 h-4 text-[var(--correct)]" /> : <Copy className="w-4 h-4 text-[var(--ink-muted)]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Room Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-[var(--bg)] rounded-[6px] border border-[var(--border)] flex items-center gap-3 shadow-2xs">
            <Clock className="w-5 h-5 text-[var(--accent)] shrink-0" />
            <div>
              <div className="text-xs font-bold text-[var(--ink)]">{session.timePerQuestion} Secs / Round</div>
              <div className="text-[11px] text-[var(--ink-muted)]">Server deadline enforcement</div>
            </div>
          </div>

          <div className="p-3 bg-[var(--bg)] rounded-[6px] border border-[var(--border)] flex items-center gap-3 shadow-2xs">
            <Layers className="w-5 h-5 text-[var(--brand)] shrink-0" />
            <div>
              <div className="text-xs font-bold text-[var(--ink)]">{session.totalQuestions} Questions</div>
              <div className="text-[11px] text-[var(--ink-muted)]">{session.category}</div>
            </div>
          </div>

          <div className="p-3 bg-[var(--bg)] rounded-[6px] border border-[var(--border)] flex items-center gap-3 shadow-2xs">
            <Shield className="w-5 h-5 text-[var(--correct)] shrink-0" />
            <div>
              <div className="text-xs font-bold text-[var(--ink)]">{session.mode} Mode</div>
              <div className="text-[11px] text-[var(--ink-muted)]">Server-authoritative scoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Players Roster */}
      <div className="card-flat bg-[var(--surface)] p-6 space-y-4 shadow-xs rounded-[8px]">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--brand)]" />
            <h2 className="text-base font-bold font-serif text-[var(--ink)]">
              Connected Competitors ({session.players.length})
            </h2>
          </div>
          <span className="text-xs font-mono font-medium text-[var(--correct)] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[var(--correct)] animate-pulse" />
            Realtime Synced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {session.players.map((p, index) => (
            <div
              key={p.id}
              className={`p-3.5 rounded-[6px] border flex items-center justify-between transition-all duration-200 animate-scale-in stagger-${(index % 4) + 1} shadow-2xs ${
                p.isHost
                  ? 'bg-[var(--brand-tint)] border-[var(--brand)]/40 ring-1 ring-[var(--brand)]/10'
                  : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--brand)]/30'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 font-serif shadow-2xs ${
                  p.isHost ? 'bg-[var(--brand)] text-[#FBFAF7] border border-[var(--brand-hover)]' : 'bg-[var(--surface)] text-[var(--ink)] border border-[var(--border)]'
                }`}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-[var(--ink)] truncate flex items-center gap-1">
                    <span>{p.name}</span>
                    {p.isHost && (
                      <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--brand)] font-semibold">
                        Host
                      </span>
                    )}
                  </div>
                  {p.college && (
                    <div className="text-[10px] text-[var(--ink-muted)] truncate">{p.college}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--correct)] shrink-0">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Ready</span>
              </div>
            </div>
          ))}
        </div>

        {/* Start Game Action */}
        <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-[var(--ink-muted)]">
            Host triggers round launch when all competitors have entered the lobby.
          </p>
          <button
            onClick={onStartGame}
            className="btn-primary flex items-center justify-center gap-2 text-sm py-2.5 px-6 shadow-xs active:scale-[0.98] w-full sm:w-auto"
          >
            <Play className="w-4 h-4 fill-current text-[#FBFAF7]" />
            <span>Launch Round #1</span>
          </button>
        </div>
      </div>
    </div>
  );
};
