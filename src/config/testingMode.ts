/**
 * AptiQuiz Testing Mode Configuration
 * 
 * When VITE_TESTING_MODE=true:
 * - Unauthenticated visitors can freely test room creation, room joining, and quiz rounds.
 * - Sign-in prompts are hidden from primary testing flows.
 * - Database RLS and security RPC rules remain strictly enforced on Supabase.
 * - Local session state is used for room creation when host auth is required by DB policy.
 */

export function isTestingModeEnabled(): boolean {
  return import.meta.env.VITE_TESTING_MODE === 'true';
}

export function getTestingModeNotice(): string | null {
  if (!isTestingModeEnabled()) return null;
  return 'Testing Mode Enabled: Explore all quiz features as a guest without signing in.';
}
