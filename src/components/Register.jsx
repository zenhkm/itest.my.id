import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, BookOpen, ArrowRight, Briefcase, Mail } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import './Login.css'; // Reusing Login's CSS structure

const Register = () => {
  const navigate = useNavigate();
  const { registerUser } = useContext(AppContext);
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'admin' // Force as admin
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.name || !formData.password) {
      toast.error('Mohon isi semua bidang yang diperlukan.');
      return;
    }
    if (!formData.email.includes('@')) {
      toast.error('Alamat email tidak valid.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Kata sandi terlalu pendek. Supabase membutuhkan minimal 6 karakter.');
      return;
    }

    setIsSubmitting(true);
    const success = await registerUser(formData);
    setIsSubmitting(false);

    if (success) {
      // Don't navigate directly, wait for them to check email.
    }
  };

  return (
    <motion.div 
      className="login-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="login-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2" style={{ background: 'rgba(139, 92, 246, 0.4)' }}></div>
      </div>

      <div className="login-card glass-panel" style={{ padding: '30px', maxWidth: '420px', width: '90%' }}>
        <div className="login-header">
          <div className="logo-container">
            <BookOpen size={30} className="logo-icon" />
          </div>
          <h1>Daftar Akun Baru</h1>
          <p>Daftarkan akun sebagai pegiat edukasi dan kelola berbagai ujian dengan efisien.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" style={{ marginTop: '20px' }}>
          
          <div className="input-group">
            <label>Pengaturan Peran (Akses)</label>
            <div className="input-wrapper">
              <Briefcase size={20} className="input-icon" />
              <div 
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 42px',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '12px',
                  color: '#38bdf8',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Kepala Lembaga (Administrator)
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>Posisi ini mengizinkan Anda untuk mengatur sekolah, staff, dan memantau ujian secara eksklusif dan terisolasi.</p>
          </div>

          <div className="input-group" style={{ marginTop: '16px' }}>
            <label>Alamat Email</label>
            <div className="input-wrapper">
              <Mail size={20} className="input-icon" />
              <input 
                type="email" 
                placeholder="Masukkan email aktif Anda"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="input-group" style={{ marginTop: '16px' }}>
            <label>Nama Lengkap</label>
            <div className="input-wrapper">
              <User size={20} className="input-icon" />
              <input 
                type="text" 
                placeholder="Masukkan nama lengkap Anda"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>


          <div className="input-group" style={{ marginTop: '16px' }}>
            <label>Kata Sandi</label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input 
                type="password" 
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-button" disabled={isSubmitting} style={{ marginTop: '24px' }}>
            {isSubmitting ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span>Daftar Akun</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Sudah memiliki akun? </span>
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Kembali Login</Link>
          </div>
        </form>
        
        <div className="login-footer" style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px' }}>
            <Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>Tentang Kami</Link>
            <Link to="/privacy-policy" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>Kebijakan Privasi</Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;
