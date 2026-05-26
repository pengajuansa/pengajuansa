const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fjmhqkxoyxykyfgrayyf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbWhxa3hveXh5a3lmZ3JheXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjUzNjgsImV4cCI6MjA5MzA0MTM2OH0.nxcnM2LNLetnGJV_rE0Yn-ePZdzf3QXyfqWWWgg7_58';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  const { data: users, error: uErr } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'mahasiswa');
    
  if (uErr) {
    console.error("Error fetching users:", uErr);
    return;
  }
  
  console.log("All Mahasiswa Users found:", JSON.stringify(users, null, 2));
}

inspect();
