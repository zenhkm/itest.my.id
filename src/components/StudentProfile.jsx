import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Save, Trash2, Settings } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import './Dashboard.css'; // Reusing dashboard styles for UI consistency

const StudentProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, deleteProfile } = useContext(AppContext);

  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || '',
    password: '',
    avatar_url: user?.avatar_url || ''
  });

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) { 
         toast.error("Ukuran pasfoto terlalu besar. Maksimal 1MB!");
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileSettings({...profileSettings, avatar_url: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    const updates = {};
    if (profileSettings.name && profileSettings.name !== user.name) updates.name = profileSettings.name;
    if (profileSettings.password) updates.password = profileSettings.password; 
    if (profileSettings.avatar_url && profileSettings.avatar_url !== user?.avatar_url) updates.avatar_url = profileSettings.avatar_url;

    if (Object.keys(updates).length > 0) {
      const ok = await updateProfile(updates);
      if (ok) {
         setProfileSettings({...profileSettings, password: ''});
         toast.success('Profil berhasil diperbarui!');
      }
    } else {
      toast('Belum ada perubahan disetel.', { icon: 'ℹ️' });
    }
  };

  const handleDeleteProfile = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus akun ini secara permanen? Tindakan ini tidak dapat dibatalkan.")) {
      await deleteProfile();
    }
  };

  return (
    <motion.div 
      className="dashboard-container"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="dashboard-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <header className="dashboard-header" style={{ width: '100%', maxWidth: '600px' }}>
          <button onClick={() => navigate('/dashboard')} className="back-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}>
            <ChevronLeft size={20} />
            <span>Kembali ke Dashboard</span>
          </button>
        </header>

        <main className="dashboard-main" style={{ width: '100%', maxWidth: '600px', marginTop: '20px' }}>
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Settings size={28} color="var(--primary)" />
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-light)' }}>Pengaturan Akun</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '2px dashed rgba(255,255,255,0.2)' }}>
                {profileSettings.avatar_url ? (
                   <img src={profileSettings.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                ) : (
                   <User size={50} style={{ opacity: 0.3 }} />
                )}
              </div>
              <label htmlFor="student-avatar-page" style={{ fontSize: '0.9rem', padding: '10px 20px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', transition: 'background 0.2s' }}>
                Ubah Pasfoto Baru
              </label>
              <input id="student-avatar-page" type="file" accept="image/*" onChange={handleProfileImageChange} style={{ display: 'none' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.95rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Nama Lengkap Tampilan</label>
              <input type="text" value={profileSettings.name} onChange={e => setProfileSettings({...profileSettings, name: e.target.value})} style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-light)', outline: 'none', fontSize: '1rem' }} />
            </div>
            
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '0.95rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Perbarui Kata Sandi (Opsional)</label>
              <input type="text" value={profileSettings.password} onChange={e => setProfileSettings({...profileSettings, password: e.target.value})} placeholder="Biarkan kosong jika tidak ingin diubah" style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-light)', outline: 'none', fontSize: '1rem' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button onClick={handleSaveProfile} style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)' }}>
                <Save size={20} /> Simpan Perubahan Profil
              </button>
              
              <button onClick={handleDeleteProfile} style={{ width: '100%', padding: '16px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.1)'; e.target.style.borderColor = '#ef4444'; }} onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)'; }}>
                <Trash2 size={20} /> Hapus Akun Permanen
              </button>
            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default StudentProfile;
