import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import './InfoPages.css';

const Help = () => {
  return (
    <div className="info-page-wrapper">
      <div className="info-background">
        <div className="info-blob info-blob-1" style={{ background: 'rgba(234, 179, 8, 0.15)' }}></div>
        <div className="info-blob info-blob-2" style={{ background: 'rgba(56, 189, 248, 0.1)' }}></div>
      </div>

      <div className="info-container">
        <Link to="/login" className="info-back-btn">
          <ArrowLeft size={20} />
          <span>Kembali ke Beranda</span>
        </Link>

        <motion.div 
          className="info-glass-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="info-header">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}>
                <HelpCircle size={32} />
              </div>
            </div>
            <h1>Pusat Bantuan</h1>
            <p>Temukan jawaban untuk kendala penggunaan platform Sistem Ujian Terpadu (FAQ).</p>
          </div>

          <div className="info-content">
            <h2>Pertanyaan yang Sering Diajukan (FAQ)</h2>
            
            <h3>1. Bagaimana cara login sebagai siswa?</h3>
            <p>
              Silakan masukkan NIS (Nomor Induk Siswa) Anda yang telah didaftarkan oleh admin sekolah, beserta kata sandi standar yang diberikan. 
              Jika Anda belum memiliki akun, harap laporkan kepada guru atau staf administrasi lembaga Anda.
            </p>

            <h3>2. Apa yang terjadi jika koneksi internet saya terputus saat ujian?</h3>
            <p>
              Sistem difasilitasi dengan mekanisme penyimpanan sementara. Jika koneksi terputus, pastikan halaman tidak ditutup (di-refresh). Sistem akan mengupayakan sinkronisasi sisa waktu dan jawaban ketika koneksi internet Anda kembali stabil.
            </p>

            <h3>3. Mengapa saya mendapat pesan peringatan kecurangan?</h3>
            <p>
              Pesan peringatan akan muncul jika Anda membuka tab baru, mengecilkan jendela *browser* (minimize), atau mencoba meminjam *split-screen* selama layar ujian sedang berlangsung. Tindakan ini merupakan mekanisme pencegahan kecurangan *built-in*. Jika terus dilakukan, sistem dapat mencatat anomali pada laporan ujian Anda.
            </p>

            <h3>4. Saya lupa kata sandi akun saya.</h3>
            <p>
              Untuk siswa, mohon hubungi admin (Staf TU atau Guru) di institusi/sekolah Anda masing-masing agar kata sandi Anda dapat di-*reset* ulang. Untuk staf admin institusi, silakan hubungi tim *Support* pusat Sistem Ujian Terpadu.
            </p>
            
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '40px 0' }} />

            <h2>Hubungi Dukungan Teknis</h2>
            <p>
              Jika masalah Anda belum terjawab pada daftar pertanyaan di atas, silakan gunakan halaman <strong><Link to="/feedback">Feedback / Formulir Kontak</Link></strong> 
              untuk mengirimkan laporan kepada tim pengembang kami, atau laporkan kendala ke administrator institusi Anda.
            </p>
            
            <p style={{ marginTop: '40px', textAlign: 'center', opacity: 0.8 }}>
              © 2026 Sistem Ujian Terpadu.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Help;
