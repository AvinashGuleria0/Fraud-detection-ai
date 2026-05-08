import { createClient } from '@supabase/supabase-js';

// Replace these with your actual keys if they differ
const supabaseUrl = 'https://bznwgmbkswpeautpldwg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bndnbWJrc3dwZWF1dHBsZHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Nzg2NjgsImV4cCI6MjA5MjM1NDY2OH0.KywQwwnUUxgMscLiLSmiML90D00G_FYQY3KgjTtC0WM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function signup() {
  console.log("🚀 Attempting to signup avinash@gmail.com...");
  
  const { data, error } = await supabase.auth.signUp({
    email: 'avinashguleria1009@gmail.com',
    password: '123456',
    options: {
      data: { name: 'Avi' }
    }
  });

  if (error) {
    console.error("❌ Signup failed:", error.message);
  } else {
    console.log("✅ Signup successful!");
    console.log("User ID:", data.user.id);
    console.log("Note: If 'Confirm email' is enabled in your Supabase dashboard, you still need to verify the email before logging in.");
  }
}

signup();
