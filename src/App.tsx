import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { DashboardLanding } from './pages/DashboardLanding';
import { LobbyView } from './components/gameplay/LobbyView';
import { ArenaQuizRunner } from './components/gameplay/ArenaQuizRunner';
import { PodiumView } from './components/gameplay/PodiumView';
import { AuthModal } from './components/auth/AuthModal';
import { ActiveGameSession, QuizSessionConfig, JoinSessionPayload } from './types';
import { sampleQuestions } from './data/sampleQuestions';
import { sessionService } from './services/sessionService';

export const App: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [viewState, setViewState] = useState<'dashboard' | 'lobby' | 'arena' | 'podium'>('dashboard');

  const [activeSession, setActiveSession] = useState<ActiveGameSession | null>(null);

  // Handle session creation from modal or category select
  const handleSessionCreated = async (config: QuizSessionConfig) => {
    const res = await sessionService.createSession(config);
    if (res.success && res.code) {
      const filteredQuestions = sampleQuestions.filter(q => q.category === config.category);
      const sessionQuestions = filteredQuestions.length > 0 ? filteredQuestions : sampleQuestions;

      const newSession: ActiveGameSession = {
        roomCode: res.code,
        title: config.title,
        category: config.category,
        mode: config.mode,
        timePerQuestion: config.timePerQuestionSec,
        totalQuestions: Math.min(config.questionCount, sessionQuestions.length),
        currentRoundIndex: 0,
        status: 'lobby',
        hostName: config.hostName || 'Host',
        players: [
          { id: 'p_host', name: config.hostName || 'Host', college: config.collegeName, isHost: true, score: 0, status: 'ready' },
          { id: 'p_1', name: 'Ananya Sharma', college: 'IIT Bombay', isHost: false, score: 0, status: 'ready' },
          { id: 'p_2', name: 'Rahul Verma', college: 'BITS Pilani', isHost: false, score: 0, status: 'ready' },
        ],
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
    if (res.success && res.code) {
      const newSession: ActiveGameSession = {
        roomCode: res.code,
        title: `Placement Arena Session (${res.code})`,
        category: 'Quantitative Aptitude',
        mode: 'Standard',
        timePerQuestion: 30,
        totalQuestions: sampleQuestions.length,
        currentRoundIndex: 0,
        status: 'lobby',
        hostName: 'Prof. Ramanujan',
        players: [
          { id: 'p_host', name: 'Prof. Ramanujan', college: 'IIT Madras', isHost: true, score: 0, status: 'ready' },
          { id: 'p_self', name: payload.participantName, college: payload.collegeName, isHost: false, score: 0, status: 'ready' },
          { id: 'p_1', name: 'Ananya Sharma', college: 'IIT Bombay', isHost: false, score: 0, status: 'ready' },
        ],
        questions: sampleQuestions,
      };

      setActiveSession(newSession);
      setIsJoinOpen(false);
      setViewState('lobby');
    }
  };

  const handleStartGame = () => {
    if (activeSession) {
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
          />
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
