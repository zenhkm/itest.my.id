import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Menu, Clock, BookOpen, FileText, CheckCircle, TrendingUp, PlayCircle, History as HistoryIcon, Settings, X, Save, Trophy, Trash2 } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const { exams, history, user, logout } = useContext(AppContext);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const studentName = user?.name || "Siswa Tanpa Nama";
  const studentClass = user?.class || "12 IPA 1";
  const activeExams = exams.filter(e => e.status === 'Aktif');

  const averageScore = history.length > 0 
    ? (history.reduce((sum, h) => sum + h.score, 0) / history.length).toFixed(1) 
    : "0";

  const stats = [
    { title: "Ujian Selesai", value: history.length.toString(), icon: <CheckCircle size={24} />, color: "success" },
    { title: "Nilai Rata-rata", value: averageScore.toString(), icon: <TrendingUp size={24} />, color: "primary" },
    { title: "Ujian Tersedia", value: activeExams.length.toString(), icon: <FileText size={24} />, color: "warning" }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStartExam = (id) => {
    navigate(`/exam/${id}`);
  };

  return (
    <motion.div 
      className="dashboard-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background Blobs (matching Login) */}
      <div className="dashboard-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="dashboard-content">
        {/* Navigation / Header */}
        <header className="dashboard-header">
          <div className="header-brand">
            <div className="logo-container sm">
              <BookOpen size={20} className="logo-icon" />
            </div>
            <h2>Ujian Online</h2>
          </div>
          
          <button className="mobile-menu-toggle hide-on-desktop" style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }} onClick={() => setIsMobileMenuOpen(true)}>
             <Menu size={28} color="var(--text-light)" />
          </button>
          
          {isMobileMenuOpen && (
            <div className="mobile-sidebar-overlay hide-on-desktop" onClick={() => setIsMobileMenuOpen(false)}></div>
          )}

          <div className={`header-actions ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="mobile-menu-header hide-on-desktop" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
               <h3 style={{ margin: 0, color: 'var(--text-light)' }}>Navigasi Siswa</h3>
               <button className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={24} />
               </button>
            </div>

            <div className="user-profile" onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }} style={{ cursor: 'pointer' }} title="Buka Pengaturan Profil">
              <div className="avatar" style={{ overflow: 'hidden' }}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="user-info">
                <span className="user-name">{studentName}</span>
                <span className="user-kelas">{studentClass}</span>
              </div>
            </div>
            
            <div className="nav-buttons-group">
               <button onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }} className="history-button" title="Setelan Profil" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', color: 'var(--text-light)', fontWeight: '600' }}>
                 <Settings size={20} />
                 <span>Profil</span>
               </button>
               <button onClick={() => navigate('/history')} className="history-button" title="Riwayat Nilai" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', color: 'var(--text-light)', fontWeight: '600' }}>
                 <HistoryIcon size={20} />
                 <span>Riwayat</span>
               </button>
               <button onClick={() => navigate('/leaderboard')} className="history-button" title="Papan Peringkat" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.05))', border: '1px solid rgba(251, 191, 36, 0.4)', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', color: '#fbbf24', fontWeight: 'bold' }}>
                 <Trophy size={20} />
                 <span>Peringkat</span>
               </button>
            </div>
            <button onClick={handleLogout} className="logout-button mobile-mt-auto" title="Keluar">
              <LogOut size={20} />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        <main className="dashboard-main">
          {/* Welcome Banner */}
          <section className="welcome-section glass-panel">
            <div className="welcome-text">
              <h1>Selamat Datang, {studentName}! 👋</h1>
              <p>Siap untuk belajar dan menguji kemampuanmu hari ini?</p>
            </div>
            <div className="welcome-illustration">
              <TrendingUp size={80} className="illustration-icon" />
            </div>
          </section>

          {/* Stats Grid */}
          <section className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className={`stat-card glass-panel badge-${stat.color}`}>
                <div className="stat-icon-wrapper">
                  {stat.icon}
                </div>
                <div className="stat-details">
                  <h3>{stat.value}</h3>
                  <p>{stat.title}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Exam List */}
          <section className="exam-list-section">
            <div className="section-header">
              <h2>Daftar Ujian Tersedia</h2>
              <p>Pilih ujian yang ingin kamu kerjakan sekarang.</p>
            </div>

            <div className="exam-grid">
              {activeExams.map((exam) => {
                let statusText = 'Tersedia';
                let statusColor = '#10b981';
                let canEnter = true;

                const now = Date.now();
                if (exam.start_time || exam.end_time) {
                  const startTime = exam.start_time ? new Date(exam.start_time).getTime() : 0;
                  const endTime = exam.end_time ? new Date(exam.end_time).getTime() : Infinity;

                  if (startTime > 0 && now < startTime) {
                    statusText = `Belum Buka`;
                    statusColor = '#f59e0b';
                    canEnter = false;
                  } else if (endTime !== Infinity && now > endTime) {
                    statusText = 'Ditutup';
                    statusColor = '#ef4444';
                    canEnter = false;
                  }
                }

                return (
                <div key={exam.id} className="exam-card glass-panel" style={{ opacity: canEnter ? 1 : 0.6 }}>
                  <div className="exam-card-header">
                    <span className="subject-badge" style={{ backgroundColor: statusColor }}>{statusText}</span>
                    <div style={{ flex: 1 }}></div>
                    <Clock size={16} className="time-icon" />
                    <span className="time-text">{exam.duration} Min</span>
                  </div>
                  
                  <div className="exam-card-body">
                    <h3>{exam.title}</h3>
                    <div className="exam-meta">
                      <div className="meta-item">
                        <FileText size={16} />
                        <span>{exam.questions?.length || 0} Soal - {exam.subject}</span>
                      </div>
                      {(exam.start_time || exam.end_time) && (
                        <div className="meta-item" style={{ fontSize: '0.75rem', marginTop: '6px', color: '#ffbbaa' }}>
                          Jadwal: {exam.start_time && new Date(exam.start_time).toLocaleString('id-ID', {day: 'numeric', month: 'short', hour:'2-digit', minute:'2-digit'})} - {exam.end_time && new Date(exam.end_time).toLocaleString('id-ID', {day: 'numeric', month: 'short', hour:'2-digit', minute:'2-digit'})}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="exam-card-footer">
                    <button 
                      onClick={() => canEnter ? handleStartExam(exam.id) : toast.error(`Ujian '${exam.title}' sedang terkunci.`, { icon: '🔒' })} 
                      className={`start-exam-button ${!canEnter ? 'disabled' : ''}`}
                      style={{ filter: !canEnter ? 'grayscale(1)' : 'none', cursor: !canEnter ? 'not-allowed' : 'pointer' }}
                    >
                      <PlayCircle size={20} />
                      <span>{canEnter ? 'Mulai Ujian' : 'Terkunci'}</span>
                    </button>
                  </div>
                </div>
                );
              })}
              {activeExams.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Momen ini belum ada ujian yang tersedia untuk Anda.</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </motion.div>
  );
};

export default Dashboard;
