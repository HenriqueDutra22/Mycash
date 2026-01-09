
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zckpvlegkofpqbzivhvm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpja3B2bGVna29mcHFieml2aHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MzE4MjAsImV4cCI6MjA4MzQwNzgyMH0.njzYllMt4AokVyk_76pMKGrFARm9KEo4xhpZu-HMNJI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
