import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import './InfoPages.css';

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Siswa',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.message) {
      toast.error('Mohon isi nama dan pesan Anda.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert([
          { 
            name: formData.name, 
            email: formData.email, 
            role: formData.role, 
            message: formData.message 
          }
        ]);

      if (error) throw error;

      toast.success('Terima kasih! Feedback Anda telah tersimpan di sistem kami.');
      setFormData({ name: '', email: '', role: 'Siswa', message: '' });
    } catch (error) {
      console.error('Error submitting feedback:', error.message);
      toast.error('Gagal mengirim feedback. Silakan coba lagi nanti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="info-page-wrapper">
      <div className="info-background">
        <div className="info-blob info-blob-1" style={{ background: 'rgba(236, 72, 153, 0.1)' }}></div>
        <div className="info-blob info-blob-2" style={{ background: 'rgba(139, 92, 246, 0.1)' }}></div>
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
              <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
                <MessageSquare size={32} />
              </div>
            </div>
            <h1>Beri Kami Masukan</h1>
            <p>Punya saran, kendala teknis, atau pertanyaan terkait platform? Diskusikan dengan tim kami secara langsung.</p>
          </div>

          <div className="info-content" style={{ display: 'flex', justifyContent: 'center' }}>
            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nama Lengkap <span style={{color: '#ef4444'}}>*</span></label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama Anda..." 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', transition: 'border 0.2s' }} 
                  onFocus={e => e.target.style.borderColor = '#38bdf8'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 min-content' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email (Opsional)</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nama@email.com" 
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', transition: 'border 0.2s' }} 
                    onFocus={e => e.target.style.borderColor = '#38bdf8'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 min-content' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Peran Pengguna</label>
                  <select 
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.9)', color: 'white', outline: 'none', transition: 'border 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#38bdf8'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  >
                    <option value="Siswa">Siswa</option>
                    <option value="Guru">Guru / Pendamping</option>
                    <option value="Admin">Admin Lembaga</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Pesan / Kendala <span style={{color: '#ef4444'}}>*</span></label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Ceritakan pertanyaan, fitur yang diharapkan, atau kendala yang ditemui..." 
                  rows={5}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', resize: 'vertical', fontFamily: 'inherit', transition: 'border 0.2s' }} 
                  onFocus={e => e.target.style.borderColor = '#38bdf8'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  marginTop: '10px', width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '12px', background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', color: 'white', border: 'none', borderRadius: '12px', 
                  fontSize: '1.05rem', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 15px rgba(14, 165, 233, 0.25)',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? (
                  <span>Mengirimkan...</span>
                ) : (
                  <>
                    <span>Kirim Pesan</span>
                    <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Feedback;
