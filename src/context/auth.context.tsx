import * as React from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import type { IAuthContext } from '../types/auth.interface';

export const AuthContext = React.createContext({} as IAuthContext);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [session, setSession] = React.useState<Session | null>(supabase.auth.session());

  React.useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (process.env.NODE_ENV === 'development') console.log(session);
      setSession(session);
    });
  }, [session]);

  return <AuthContext.Provider value={{ session, setSession }}>{children}</AuthContext.Provider>;
};
