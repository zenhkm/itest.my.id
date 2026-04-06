import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Zap, Users, MonitorSmartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import './InfoPages.css';

const About = () => {
  return (
    <div className="info-page-wrapper">
      <div className="info-background">
        <div className="info-blob info-blob-1"></div>
        <div className="info-blob info-blob-2"></div>
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
            <h1>Tentang Kami</h1>
            <p>Mengenal lebih dekat Sistem Ujian Terpadu (iTest) dan komitmen kami dalam menghadirkan evaluasi digital terbaik.</p>
          </div>

          <div className="info-content">
            <p>
              <strong>Sistem Ujian Terpadu</strong> hadir untuk merevolusi cara institusi pendidikan dan lembaga profesional menyelenggarakan evaluasi, ujian, dan seleksi. 
              Berdiri dari visi untuk menciptakan ekosistem pembelajaran yang efisien, transparan, dan adil, platform kami memadukan teknologi web modern dengan pengalaman pengguna yang imersif.
            </p>

            <h2>Visi & Misi</h2>
            <p>
              Visi kami adalah menjadi pionir kemudahan ujian berbasis komputer (CBT) yang andal dan mudah diakses dari mana saja.
              Misi kami berfokus pada:
            </p>
            <ul>
              <li>Menghadirkan interface modern yang minimalis namun berfitur lengkap.</li>
              <li>Memberikan jaminan stabilitas dan keamanan tingkat tinggi bagi setiap klien, baik skala kecil maupun besar.</li>
              <li>Mendukung proses pendidikan dan sertifikasi melalui laporan analitik yang komprehensif.</li>
            </ul>

            <h2>Mengapa Memilih Kami?</h2>
            
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <MonitorSmartphone size={28} />
                </div>
                <h3>Akses Multi-Perangkat</h3>
                <p>Website fleksibel yang dirancang sempurna untuk berbagai ukuran layar (mobile, tablet, desktop).</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Zap size={28} />
                </div>
                <h3>Performa Tinggi</h3>
                <p>Sistem ini dirancang dengan standar kecepatan terbaik, memastikan tidak ada hambatan koneksi saat ujain berlangsung.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <ShieldCheck size={28} />
                </div>
                <h3>Keamanan Anti-Kecurangan</h3>
                <p>Sistem memiliki metode peringatan terintegrasi untuk mencegah tab-switching dan penyalahgunaan selama ujian.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Users size={28} />
                </div>
                <h3>Manajemen Terpusat</h3>
                <p>Khusus dirancang untuk mempermudah administrator dan mentor dalam memantau setiap sesi tes.</p>
              </div>
            </div>

            <h2>Layanan Klien / Lembaga</h2>
            <p>
              Platform ini dipersonalisasi sehingga dapat digunakan oleh beragam lembaga—mulai dari sekolah menengah, universitas, hingga perusahaan yang memerlukan sertifikasi internal. 
              Melalui modul Manajemen Klien Lembaga, setiap entitas dapat dengan mudah menyesuaikan profil dan pengaturan spesifik organisasinya.
            </p>

            <h2>Pengembang Aplikasi</h2>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '4px solid #38bdf8', marginTop: '16px' }}>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong>Nama:</strong> Hakimz
              </p>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong>Instagram:</strong> <a href="https://www.instagram.com/zainul.hakim" target="_blank" rel="noopener noreferrer">@zainul.hakim</a>
              </p>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong>No HP / WA:</strong> <a href="https://wa.me/6285743399595" target="_blank" rel="noopener noreferrer">085743399595</a>
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

export default About;
