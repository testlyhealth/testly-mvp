import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://dicrvakkiopimvoumtat.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpY3J2YWtraW9waW12b3VtdGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDkyMDIsImV4cCI6MjA2NDYyNTIwMn0.rbqgBdab9nJn_ilhuR5IMvoqMPZNbZcrETr6jpL9vGE'

export const supabase = createClient(supabaseUrl, supabaseKey) 