import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener?.subscription?.unsubscribe();
  }, []);

  return user;
};
