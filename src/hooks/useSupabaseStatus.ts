import { useState, useEffect, useCallback } from 'react';
import { getSupabaseConfigStatus, testSupabaseConnection } from '../lib/supabase';
import { ConnectionState } from '../types';

export function useSupabaseStatus() {
  const [state, setState] = useState<ConnectionState>(() => {
    const config = getSupabaseConfigStatus();
    if (!config.isConfigured) {
      return {
        status: 'unconfigured',
        message: `Environment setup required: ${config.missingVars.join(', ')} missing in .env.local`,
        missingVars: config.missingVars,
        displayUrl: null,
      };
    }
    return {
      status: 'checking',
      message: 'Initialising connection check...',
      displayUrl: config.displayUrl,
    };
  });

  const checkConnection = useCallback(async () => {
    const config = getSupabaseConfigStatus();
    if (!config.isConfigured) {
      setState({
        status: 'unconfigured',
        message: `Environment setup required: ${config.missingVars.join(', ')} missing in .env.local`,
        missingVars: config.missingVars,
        displayUrl: null,
        lastCheckedAt: new Date(),
      });
      return;
    }

    setState(prev => ({ ...prev, status: 'checking', message: 'Testing Supabase endpoint...' }));
    
    const res = await testSupabaseConnection();
    setState({
      status: res.success ? 'connected' : 'error',
      message: res.message,
      displayUrl: config.displayUrl,
      latencyMs: res.latencyMs,
      lastCheckedAt: new Date(),
    });
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    ...state,
    refreshStatus: checkConnection,
  };
}
