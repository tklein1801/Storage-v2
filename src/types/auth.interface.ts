import type { Session } from '@supabase/supabase-js';

export interface IAuthContext {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
}
