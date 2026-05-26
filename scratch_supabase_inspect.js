const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fjmhqkxoyxykyfgrayyf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbWhxa3hveXh5a3lmZ3JheXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjUzNjgsImV4cCI6MjA5MzA0MTM2OH0.nxcnM2LNLetnGJV_rE0Yn-ePZdzf3QXyfqWWWgg7_58';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  console.log("=== INSPECTING DATABASE ===");
  
  // Find user Dea
  const { data: users, error: uErr } = await supabase
    .from('users')
    .select('*')
    .or('nama_lengkap.ilike.%dea%,nim_nip.eq.220202028');
    
  if (uErr) {
    console.error("Error fetching users:", uErr);
    return;
  }
  
  console.log("Users found:", JSON.stringify(users, null, 2));
  
  if (users && users.length > 0) {
    const user = users[0];
    const uid = user.id;
    
    // Find pendaftaran
    const { data: pendaftarans, error: pErr } = await supabase
      .from('pendaftaran_sa')
      .select('*')
      .eq('mahasiswa_id', uid);
      
    console.log(`Pendaftarans for uid ${uid}:`, JSON.stringify(pendaftarans, null, 2));
    
    if (pendaftarans && pendaftarans.length > 0) {
      const pids = pendaftarans.map(p => p.id);
      
      // Find items
      const { data: items, error: iErr } = await supabase
        .from('pendaftaran_items')
        .select('*')
        .in('pendaftaran_id', pids);
        
      console.log(`Pendaftaran Items:`, JSON.stringify(items, null, 2));
      
      // Find alokasi
      const { data: alokasi, error: aErr } = await supabase
        .from('alokasi_dosen')
        .select('*')
        .in('pendaftaran_id', pids);
        
      console.log(`Alokasi Dosen:`, JSON.stringify(alokasi, null, 2));
    }
    
    // Find tasks
    const { data: tasks, error: tErr } = await supabase
      .from('tugas')
      .select('*')
      .eq('mahasiswa_id', uid);
      
    console.log(`Tugas specifically for student uid ${uid}:`, JSON.stringify(tasks, null, 2));

    // Find general tasks
    const { data: allTasks, error: atErr } = await supabase
      .from('tugas')
      .select('*');
      
    console.log(`All Tasks in database:`, JSON.stringify(allTasks, null, 2));
  }
}

inspect();
