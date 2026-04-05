import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Variabel environment belum ditemukan");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  const dummyContent = "This is a test image file content";
  const filePath = `questions/test-${Math.random()}.txt`;
  
  console.log("Menguji upload ke bucket: question-images");
  
  // Perlu membuat Blob/File dari string karena kita di Node.js, atau gunakan filesystem
  // Supabase JS mendukung Buffer atau File object. Di Nodejs kita bisa pass string/buffer.
  
  const { data, error } = await supabase.storage.from('question-images').upload(filePath, dummyContent, {
    contentType: 'text/plain'
  });
  
  if (error) {
    console.error("Gagal Upload!", error.message, error);
  } else {
    console.log("Upload berhasil!", data);
    
    // Testing URL Get
    const { data: urlData } = supabase.storage.from('question-images').getPublicUrl(filePath);
    console.log("URL Publik:", urlData.publicUrl);
  }
}

testUpload();
