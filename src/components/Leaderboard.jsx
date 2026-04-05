import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ChevronLeft, Medal, Star, Clock } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import './Leaderboard.css';

const Leaderboard = () => {
  const navigate = useNavigate();
  const { exams, fetchLeaderboard, user } = useContext(AppContext);
  
  const [selectedExamId, setSelectedExamId] = useState('');
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Jika admin/guru, filter semua ujian aktif
  // Jika murid, bisa lihat apa saja yang tersedia
  const availableExams = exams;

  useEffect(() => {
    const fetchRanking = async () => {
      if (!selectedExamId) {
        setLeaders([]);
        return;
      }
      setIsLoading(true);
      const data = await fetchLeaderboard(selectedExamId);
      setLeaders(data);
      setIsLoading(false);
    };

    fetchRanking();
  }, [selectedExamId, fetchLeaderboard]);

  const handleBack = () => {
    if (user?.role === 'admin' || user?.role === 'guru') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div 
      className="leaderboard-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <header className="leaderboard-header">
        <button onClick={handleBack} className="back-button">
          <ChevronLeft size={20} />
          <span>Kembali</span>
        </button>
        <h2><Trophy size={28} style={{ color: '#fbbf24' }} /> Papan Peringkat Top 10</h2>
        <div style={{ width: '100px' }}></div> {/* Spacer */}
      </header>

      <section className="filter-section">
        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pilih Ujian untuk Melihat Juara</label>
        <select 
          value={selectedExamId} 
          onChange={(e) => setSelectedExamId(e.target.value)}
        >
          <option value="" disabled>-- Silakan Pilih Ujian --</option>
          {availableExams.map(ex => (
            <option key={ex.id} value={ex.id}>{ex.subject} - {ex.title}</option>
          ))}
        </select>
      </section>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loader" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Menganalisis papan skor...</p>
        </div>
      ) : (
        <div className="leaders-list">
          {!selectedExamId && (
            <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
              <Trophy size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Pilih ujian di atas untuk membongkar daftar peraih nilai tertinggi.</p>
            </div>
          )}

          {selectedExamId && leaders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Belum ada kandidat yang mensubmit nilai untuk ujian ini.</p>
            </div>
          )}

          {selectedExamId && leaders.length > 0 && leaders.map((leader, index) => {
            let rankClass = "rank-badge";
            let rankIcon = <span style={{ fontSize: '1.2rem' }}>{index + 1}</span>;

            if (index === 0) {
              rankClass += " rank-gold";
              rankIcon = <Medal size={24} />;
            } else if (index === 1) {
              rankClass += " rank-silver";
            } else if (index === 2) {
              rankClass += " rank-bronze";
            }

            return (
              <motion.div 
                key={index} 
                className="leader-row"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={rankClass}>
                  {rankIcon}
                </div>
                
                <div className="leader-info">
                  <div className="leader-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {leader.studentname}
                    {index === 0 && <Star size={14} style={{ color: '#fbbf24', fill: '#fbbf24' }} />}
                  </div>
                  <div className="leader-date">
                    <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Diserahkan: {formatDate(leader.date)}
                  </div>
                </div>

                <div className={`leader-score ${index === 0 ? 'gold-glow' : ''}`}>
                  {leader.score}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Leaderboard;
