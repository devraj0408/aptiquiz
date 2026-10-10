import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { DashboardLanding } from './pages/DashboardLanding';
import { PracticeMode } from './components/practice/PracticeMode';
import { LobbyView } from './components/gameplay/LobbyView';
import { ArenaQuizRunner } from './components/gameplay/ArenaQuizRunner';
import { PodiumView } from './components/gameplay/PodiumView';
import { AuthModal } from './components/auth/AuthModal';
import { ActiveGameSession, QuizSessionConfig, JoinSessionPayload, ActivePlayer } from './types';
import { sampleQuestions } from './data/sampleQuestions';
import { questionBank } from './data/questionBank';
import { sessionService } from './services/sessionService';
import { supabase, getSupabaseConfigStatus } from './lib/supabase';

export const App: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [viewState, setViewState] = useState<'dashboard' | 'practice' | 'lobby' | 'arena' | 'podium'>('dashboard');

  const [activeSession, setActiveSession] = useState<ActiveGameSession | null>(null);

  // Realtime & Database Player Sync Effect for Cross-Device Session Joining
  useEffect(() => {
    if (!activeSession?.roomId || activeSession.roomId.startsWith('local_')) return;
    const roomId = activeSession.roomId;
    const configStatus = getSupabaseConfigStatus();
    if (!configStatus.isConfigured) return;

    // Helper to refresh player list from Supabase DB
    const refreshRoomState = async () => {
      const dbPlayers = await sessionService.fetchRoomPlayers(roomId);
      if (dbPlayers && dbPlayers.length > 0) {
        const formattedPlayers: ActivePlayer[] = dbPlayers.map(p => ({
          id: p.id,
          name: p.display_name,
          college: p.college_name || undefined,
          isHost: Boolean(p.is_host),
          score: 0,
          status: p.status === 'ready' || p.status === 'joined' ? 'ready' : p.status,
        }));

        setActiveSession(prev => {
          if (!prev || prev.roomId !== roomId) return prev;
          return {
            ...prev,
            players: formattedPlayers,
          };
        });
      }
    };

    // Initial sync from DB
    refreshRoomState();

    // Subscribe to Realtime postgres_changes on room_players and rooms tables
    const channel = supabase
      .channel(`room_sync_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_players',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          refreshRoomState();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        payload => {
          const updatedRoom = payload.new as { status?: string };
          if (updatedRoom.status === 'in_game') {
            setViewState(current => {
              if (current === 'lobby') {
                setActiveSession(prev => prev ? { ...prev, status: 'active_round', currentRoundIndex: 0 } : null);
                return 'arena';
              }
              return current;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSession?.roomId]);

  // Handle session creation from modal or category select
  const handleSessionCreated = async (config: QuizSessionConfig) => {
    const res = await sessionService.createSession(config);
    if (res.success && res.code) {
      let sessionQuestions = sampleQuestions;

      if (config.customQuestions && config.customQuestions.length > 0) {
        sessionQuestions = config.customQuestions;
      } else {
        const bankCategoryQs = questionBank.filter(q => q.category === config.category);
        if (bankCategoryQs.length > 0) {
          sessionQuestions = bankCategoryQs.slice(0, config.questionCount);
        }
      }

      const hostPlayer: ActivePlayer = {
        id: res.roomPlayerId || 'p_host',
        name: config.hostName || 'Host',
        college: config.collegeName,
        isHost: true,
        score: 0,
        status: 'ready',
      };

      const newSession: ActiveGameSession = {
        roomId: res.roomId,
        roomCode: res.code,
        title: config.title,
        category: config.category,
        mode: config.mode,
        timePerQuestion: config.timePerQuestionSec,
        totalQuestions: sessionQuestions.length,
        currentRoundIndex: 0,
        status: 'lobby',
        hostName: config.hostName || 'Host',
        players: [hostPlayer],
        questions: sessionQuestions,
      };

      setActiveSession(newSession);
      setIsCreateOpen(false);
      setViewState('lobby');
    }
  };

  // Handle session join from modal or quick code
  const handleSessionJoined = async (payload: JoinSessionPayload) => {
    const res = await sessionService.joinSession(payload);
    if (res.success && res.code && res.roomId) {
      const joinQuestions = questionBank.slice(0, 10);

      // Fetch persisted players from Supabase DB if available
      const dbPlayers = await sessionService.fetchRoomPlayers(res.roomId);
      let initialPlayers: ActivePlayer[] = [
        { id: 'p_host', name: 'Prof. Ramanujan', college: 'IIT Madras', isHost: true, score: 0, status: 'ready' },
        { id: res.roomPlayerId || 'p_self', name: payload.participantName, college: payload.collegeName, isHost: false, score: 0, status: 'ready' },
      ];

      if (dbPlayers && dbPlayers.length > 0) {
        initialPlayers = dbPlayers.map(p => ({
          id: p.id,
          name: p.display_name,
          college: p.college_name || undefined,
          isHost: Boolean(p.is_host),
          score: 0,
          status: p.status === 'ready' || p.status === 'joined' ? 'ready' : p.status,
        }));
      }

      const newSession: ActiveGameSession = {
        roomId: res.roomId,
        roomCode: res.code,
        title: `Placement Arena Session (${res.code})`,
        category: 'Quantitative Aptitude',
        mode: 'Standard',
        timePerQuestion: 30,
        totalQuestions: joinQuestions.length,
        currentRoundIndex: 0,
        status: 'lobby',
        hostName: 'Host',
        players: initialPlayers,
        questions: joinQuestions,
      };

      setActiveSession(newSession);
      setIsJoinOpen(false);
      setViewState('lobby');
    }
  };

  const handleStartGame = async () => {
    if (activeSession) {
      if (activeSession.roomId) {
        await sessionService.updateRoomStatus(activeSession.roomId, 'in_game');
      }
      setActiveSession({ ...activeSession, status: 'active_round', currentRoundIndex: 0 });
      setViewState('arena');
    }
  };


  const handleAnswerSubmitted = (optionId: string, latencyMs: number) => {
    if (!activeSession) return;
    const currentQ = activeSession.questions[activeSession.currentRoundIndex];
    const isCorrect = optionId === currentQ.correctOptionId;

    const maxTime = activeSession.timePerQuestion * 1000;
    const speedRatio = Math.max(0, 1 - latencyMs / maxTime);
    const scoreAwarded = isCorrect ? Math.round(10 + 5 * speedRatio) : 0;

    // Simulate competitor score updates for dynamic live leaderboard motion
    const updatedPlayers = activeSession.players.map(p => {
      if (p.isHost || p.id === 'p_self') {
        return {
          ...p,
          score: p.score + scoreAwarded,
          lastAnswerCorrect: isCorrect,
        };
      }
      const compCorrect = Math.random() > 0.3;
      const compPts = compCorrect ? Math.floor(Math.random() * 5) + 10 : 0;
      return {
        ...p,
        score: p.score + compPts,
        lastAnswerCorrect: compCorrect,
      };
    });

    setActiveSession({
      ...activeSession,
      players: updatedPlayers,
    });
  };

  const handleNextRound = () => {
    if (activeSession && activeSession.currentRoundIndex + 1 < activeSession.totalQuestions) {
      setActiveSession({
        ...activeSession,
        currentRoundIndex: activeSession.currentRoundIndex + 1,
      });
    }
  };

  const handleCompleteSession = () => {
    if (activeSession) {
      setActiveSession({ ...activeSession, status: 'completed' });
      setViewState('podium');
    }
  };

  const handleReturnDashboard = () => {
    setActiveSession(null);
    setViewState('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] font-sans">
      <Header
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onOpenJoinModal={() => setIsJoinOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenPractice={() => setViewState('practice')}
      />

      <main className="flex-1">
        {viewState === 'dashboard' && (
          <DashboardLanding
            isCreateOpen={isCreateOpen}
            isJoinOpen={isJoinOpen}
            onOpenCreate={() => setIsCreateOpen(true)}
            onOpenJoin={() => setIsJoinOpen(true)}
            onCloseCreate={() => setIsCreateOpen(false)}
            onCloseJoin={() => setIsJoinOpen(false)}
            onSessionCreated={handleSessionCreated}
            onSessionJoined={handleSessionJoined}
            onOpenPractice={() => setViewState('practice')}
          />
        )}

        {viewState === 'practice' && (
          <PracticeMode onReturnDashboard={() => setViewState('dashboard')} />
        )}

        {viewState === 'lobby' && activeSession && (
          <LobbyView
            session={activeSession}
            onStartGame={handleStartGame}
            onLeaveRoom={handleReturnDashboard}
          />
        )}

        {viewState === 'arena' && activeSession && (
          <ArenaQuizRunner
            session={activeSession}
            onAnswerSubmitted={handleAnswerSubmitted}
            onNextRound={handleNextRound}
            onCompleteSession={handleCompleteSession}
          />
        )}

        {viewState === 'podium' && activeSession && (
          <PodiumView
            session={activeSession}
            onReturnDashboard={handleReturnDashboard}
            onPlayAgain={() => {
              setActiveSession({
                ...activeSession,
                status: 'lobby',
                currentRoundIndex: 0,
                players: activeSession.players.map(p => ({ ...p, score: 0 })),
              });
              setViewState('lobby');
            }}
          />
        )}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default App;

