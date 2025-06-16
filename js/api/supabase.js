import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://zqgycplvddubvuuwkdrd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxZ3ljcGx2ZGR1YnZ1dXdrZHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDIyODksImV4cCI6MjA2NTQxODI4OX0.UKfMP5qtEt7aOjmTXbs8eUVuS5BYwda1k48EZIOsbyo'

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
    }
})

// Log initialization
console.log('Supabase client initialized with URL:', supabaseUrl);

// Add auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
}); 