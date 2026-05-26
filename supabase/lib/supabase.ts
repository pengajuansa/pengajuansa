import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fjmhqkxoyxykyfgrayyf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbWhxa3hveXh5a3lmZ3JheXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjUzNjgsImV4cCI6MjA5MzA0MTM2OH0.nxcnM2LNLetnGJV_rE0Yn-ePZdzf3QXyfqWWWgg7_58';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Secondary client for creating users/dosen/mahasiswa without overriding current admin session
let _supabaseAuthClient: any = null;

const getAuthClient = () => {
  if (!_supabaseAuthClient) {
    _supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }
    });
  }
  return _supabaseAuthClient;
};

export const supabaseAuthClient = new Proxy({} as any, {
  get(target, prop, receiver) {
    const client = getAuthClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});


