import React, { useState } from 'react';
import { useSupabaseStatus } from '../../hooks/useSupabaseStatus';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Key, ShieldCheck } from 'lucide-react';

export const SupabaseStatusBadge: React.FC = () => {
  const { status, message, displayUrl, missingVars, latencyMs, refreshStatus } = useSupabaseStatus();
  const [showDetails, setShowDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshStatus();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const maskedUrl = displayUrl
    ? displayUrl.length > 15
      ? `${displayUrl.slice(0, 4)}...${displayUrl.slice(-11)}`
      : displayUrl
    : 'Connected';

  return (
    <div className="relative inline-block text-left text-xs shrink-0">
      <div 
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[5px] border cursor-pointer select-none transition-colors ${
          status === 'connected'
            ? 'bg-[var(--correct-tint)] border-[var(--correct)] text-[var(--correct)]'
            : status === 'error'
            ? 'bg-[var(--wrong-tint)] border-[var(--wrong)] text-[var(--wrong)]'
            : 'bg-[var(--surface)] border-[var(--border)] text-[var(--ink-muted)]'
        }`}
        onClick={() => setShowDetails(!showDetails)}
        title="Click for Supabase connection details"
      >
        <Database className="w-3.5 h-3.5 shrink-0" />
        <span className="font-semibold hidden lg:inline">
          {status === 'connected' && 'Supabase: Connected'}
          {status === 'checking' && 'Supabase: Checking...'}
          {status === 'unconfigured' && 'Supabase: Pending'}
          {status === 'error' && 'Supabase: Error'}
        </span>
        <span className="font-semibold lg:hidden">
          {status === 'connected' && 'Connected'}
          {status === 'checking' && 'Checking'}
          {status === 'unconfigured' && 'Pending'}
          {status === 'error' && 'Error'}
        </span>
        
        {status === 'connected' && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--correct)] shrink-0" />}
        {status === 'unconfigured' && <AlertCircle className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />}
        {status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-[var(--wrong)] shrink-0" />}

        {latencyMs !== undefined && status === 'connected' && (
          <span className="text-[10px] opacity-75 font-mono hidden xl:inline">{latencyMs}ms</span>
        )}
      </div>

      {showDetails && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--surface)] border border-[var(--border)] rounded-[6px] shadow-sm p-4 z-50 text-[var(--ink)] animate-scale-in">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-3">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-[var(--brand)]" />
              <span>Backend Connection</span>
            </div>
            <button
              onClick={handleRefresh}
              className="p-1 rounded hover:bg-[var(--bg)] text-[var(--ink-muted)] transition-colors"
              title="Re-check connection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[var(--border)]/50">
              <span className="text-[var(--ink-muted)]">Status:</span>
              <span className="font-semibold uppercase tracking-wider text-[11px] text-[var(--correct)]">
                {status}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[var(--border)]/50">
              <span className="text-[var(--ink-muted)]">Project Ref:</span>
              <span className="font-mono text-[11px] truncate max-w-[170px]" title={displayUrl || 'Not configured'}>
                {maskedUrl}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[var(--border)]/50">
              <span className="text-[var(--ink-muted)]">Security:</span>
              <span className="text-[11px] text-[var(--correct)] font-medium">
                Client Anon Key Only
              </span>
            </div>

            {missingVars && missingVars.length > 0 && (
              <div className="p-2.5 bg-[var(--bg)] rounded border border-[var(--border)] mt-2">
                <div className="flex items-center gap-1.5 font-medium text-[var(--accent)] mb-1">
                  <Key className="w-3.5 h-3.5" />
                  <span>Missing Environment Variables:</span>
                </div>
                <ul className="list-disc list-inside font-mono text-[11px] text-[var(--ink-muted)] space-y-0.5">
                  {missingVars.map(v => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] text-[var(--ink-muted)]">
                  Add these to <code className="bg-[var(--surface)] px-1 rounded border border-[var(--border)]">.env.local</code> to link your Supabase project.
                </p>
              </div>
            )}

            <div className="mt-3 pt-2 text-[11px] text-[var(--ink-muted)] border-t border-[var(--border)]">
              {message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
