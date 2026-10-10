import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  missingVars: string[];
  displayUrl: string | null;
  hasValidFormat: boolean;
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const missingVars: string[] = [];
  
  const isUrlProvided = Boolean(supabaseUrl && supabaseUrl.trim() !== '' && !supabaseUrl.includes('your-project-id'));
  const isKeyProvided = Boolean(supabasePublishableKey && supabasePublishableKey.trim() !== '' && !supabasePublishableKey.includes('your-supabase-publishable-key'));

  if (!isUrlProvided) {
    missingVars.push('VITE_SUPABASE_URL');
  }
  if (!isKeyProvided) {
    missingVars.push('VITE_SUPABASE_PUBLISHABLE_KEY');
  }

  let displayUrl: string | null = null;
  if (isUrlProvided && supabaseUrl) {
    try {
      const parsed = new URL(supabaseUrl);
      displayUrl = parsed.hostname;
    } catch {
      displayUrl = supabaseUrl.slice(0, 20) + '...';
    }
  }

  const isConfigured = missingVars.length === 0;

  return {
    isConfigured,
    missingVars,
    displayUrl,
    hasValidFormat: isUrlProvided && isKeyProvided,
  };
}

// Fallback dummy values to prevent runtime crash on initialization if env vars are unconfigured
const fallbackUrl = 'https://unconfigured.supabase.co';
const fallbackKey = 'unconfigured-publishable-key';

export const supabase: SupabaseClient = createClient(
  getSupabaseConfigStatus().isConfigured ? supabaseUrl : fallbackUrl,
  getSupabaseConfigStatus().isConfigured ? supabasePublishableKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

/**
 * Checks connection health to the Supabase endpoint using built-in auth service check.
 * Does not query or assume any application-specific database tables.
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const status = getSupabaseConfigStatus();
  
  if (!status.isConfigured) {
    return {
      success: false,
      message: `Missing configuration: ${status.missingVars.join(', ')} in .env.local`,
    };
  }

  const startTime = performance.now();
  try {
    // Basic Auth service session call - does not require custom tables
    const { error } = await supabase.auth.getSession();
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    if (error) {
      return {
        success: false,
        message: `Supabase Error: ${error.message}`,
        latencyMs,
      };
    }

    return {
      success: true,
      message: `Connected to Supabase endpoint (${status.displayUrl})`,
      latencyMs,
    };
  } catch (err) {
    return {
      success: false,
      message: `Network or configuration error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
