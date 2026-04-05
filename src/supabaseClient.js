import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://roktvtafnwvvtxfdtlfj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJva3R2dGFmbnd2dnR4ZmR0bGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMTA3NTMsImV4cCI6MjA5MDg4Njc1M30.T3zuUN_Vy30QNLEAz6OSQYxwsDhR036pGwGPNIjrGjg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
