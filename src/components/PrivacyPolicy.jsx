import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import './InfoPages.css';

const PrivacyPolicy = () => {
  return (
    <div className="info-page-wrapper">
      <div className="info-background">
        <div className="info-blob info-blob-1"></div>
        <div className="info-blob info-blob-2" style={{ background: 'rgba(16, 185, 129, 0.1)' }}></div>
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
            <h1>Kebijakan Privasi</h1>
            <p>Berlaku efektif sejak Januari 2026. Kami berkomitmen untuk melindungi dan menghargai privasi Anda.</p>
          </div>

          <div className="info-content">
            <p>
              Kebijakan Privasi ini menjelaskan bagaimana Sistem Ujian Terpadu ("kami", "milik kami", atau "Sistem") 
              mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda. 
              Privasi Anda sangat penting bagi kami. Kami mendorong Anda untuk membaca kebijakan ini dengan saksama.
            </p>

            <h2>1. Pengumpulan Informasi</h2>
            <p>Ketika Anda menggunakan layanan kami, kami dapat mengumpulkan berbagai tipe informasi, antara lain:</p>
            <ul>
              <li><strong>Data Profil:</strong> Nama, Nomor Induk (NIS/NPSN), kontak, alamat instansi, dan pasfoto profil.</li>
              <li><strong>Kredensial Login:</strong> Username, kata sandi (di-hash menggunakan standar enkripsi), dan riwayat login.</li>
              <li><strong>Data Analitik Ujian:</strong> Jawaban yang Anda pilih, total skor, durasi pengerjaan, dan catatan indikasi perpindahan tab (anti-cheat).</li>
              <li><strong>Data Perangkat:</strong> Alamat IP, tipe browser, dan log error untuk kebutuhan teknis.</li>
            </ul>

            <h2>2. Penggunaan Informasi</h2>
            <p>Informasi yang terkumpul semata-mata digunakan untuk tujuan berikut:</p>
            <ul>
              <li>Mengautentikasi dan membuktikan identitas pengguna saat mengakses platform.</li>
              <li>Mengelola jalannya ujian dan mengekspor nilai (Data Laporan Analitik) untuk diserahkan kepada instansi yang bersangkutan.</li>
              <li>Memitigasi upaya kecurangan atau manipulasi selama sesi ujian berlangsung.</li>
              <li>Meningkatkan pengalaman dan merespons keluhan pengguna pada layanan kami.</li>
            </ul>

            <h2>3. Keamanan Data</h2>
            <p>
              Sistem kami dibangun di atas infrastruktur cloud modern (Supabase) yang dilengkapi dengan perlindungan Enkripsi 
              sepanjang transit (TLS) dan penyimpanan (At-Rest). Namun, Anda harus menyadari bahwa tidak ada transmisi internet 
              yang dijamin 100% aman tanpa celah. Administrator pengguna wajib menjaga kerahasiaan kata sandi mereka.
            </p>

            <h2>4. Berbagi Data kepada Pihak Ketiga</h2>
            <p>
              Nilai maupun informasi personal hanya dapat diakses oleh Administrator Terdaftar (Kepala Lembaga/Guru/Pengawas)
              yang Anda naungi. Kami <strong>tidak pernah menjual, menukar, maupun menyewakan</strong> data pengguna kepada pihak
              ketiga di luar keperluan penegakan hukum dari otoritas resmi berwenang.
            </p>

            <h2>5. Hak Anda atas Data Kepemilikan</h2>
            <p>
              Setiap pihak (Lembaga/Siswa) memegang kendali atas datanya sendiri. Jika sebuah lembaga berhenti berlangganan, 
              seluruh master data siswa dan rekam penilaian akan dapat dihapus secara permanen dari server aktif kami sesuai dengan 
              permintaan administrator terkait.
            </p>
            
            <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '8px', marginTop: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <ShieldAlert size={24} color="#ef4444" />
                <h3 style={{ margin: 0, color: '#f87171' }}>Peringatan Penting</h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                Dengan melakukan login dan menggunakan platform ini, Anda dianggap telah membaca, memahami, dan menyetujui seluruh ketentuan privasi yang tercantum di halaman ini.
              </p>
            </div>

            <p style={{ marginTop: '40px', textAlign: 'center', opacity: 0.8 }}>
              © 2026 Sistem Ujian Terpadu. Inovasi untuk Evaluasi Digital yang Berintegritas.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
