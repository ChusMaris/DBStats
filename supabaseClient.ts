import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zvojniiaftqwdaggfvma.supabase.co';
// Ideally this should be in an env var, but per instructions we include provided key
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2b2puaWlhZnRxd2RhZ2dmdm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTE0MDYsImV4cCI6MjA4MzYyNzQwNn0.9Xht9Z_Bmfp05U6G-_JrETIqsE87RFd-JXQMpaHrmzM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);