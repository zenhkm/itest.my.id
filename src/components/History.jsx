import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Award, Calendar, FileText, CheckCircle, XCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import './History.css';

const History = () => {
  const navigate = useNavigate();
  const { history, exams } = useContext(AppContext);
  const [selectedDiscussion, setSelectedDiscussion] = React.useState(null);

  const passingScore = 70;

  // Calculate Average
  const totalScore = history.reduce((acc, curr) => acc + curr.score, 0);
  const averageScore = history.length > 0 ? (totalScore / history.length).toFixed(1) : "0";

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div 
      className="history-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background Blobs */}
      <div className="history-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="history-content">
        {/* Header */}
        <header className="history-header">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            <ChevronLeft size={20} />
            <span>Kembali ke Dashboard</span>
          </button>
          <h2>Riwayat Skor</h2>
        </header>

        {/* Overview Cards */}
        <section className="history-overview">
          <div className="overview-card glass-panel">
            <div className="icon-wrapper bg-blue">
              <FileText size={24} />
            </div>
            <div className="overview-info">
              <p>Total Ujian</p>
              <h3>{history.length}</h3>
            </div>
          </div>
          
          <div className="overview-card glass-panel">
            <div className="icon-wrapper bg-purple">
              <Award size={24} />
            </div>
            <div className="overview-info">
              <p>Nilai Rata-rata</p>
              <h3>{averageScore}</h3>
            </div>
          </div>
        </section>

        {/* History Table */}
        <section className="history-table-section glass-panel">
          <div className="table-header-title">
            <h3>Daftar Nilai Ujian</h3>
            <span className="kkm-info">KKM (Batas Lulus): {passingScore}</span>
          </div>

          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Mata Pelajaran & Judul</th>
                  <th>Jawaban Benar</th>
                  <th>Skor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  const isPassed = item.score >= passingScore;
                  const linkedExam = exams.find(e => e.id === item.examId);
                  const canShowDiscussion = linkedExam?.show_discussion && item.details_snapshot;

                  return (
                    <tr key={item.id} className="table-row">
                      <td className="col-date">
                        <div className="date-cell">
                          <Calendar size={16} />
                          <span>{formatDate(item.date)}</span>
                        </div>
                      </td>
                      <td className="col-title">
                        <div className="title-cell">
                          <span className="subject-badge">{item.subject}</span>
                          <span className="exam-title">{item.examTitle}</span>
                        </div>
                      </td>
                      <td className="col-stats">
                        {item.correctAnswers} / {item.totalQuestions}
                      </td>
                      <td className="col-score">
                        <span className={`score-text ${isPassed ? 'text-success' : 'text-danger'}`}>
                          {item.score}
                        </span>
                      </td>
                      <td className="col-status">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                          <div className={`status-badge ${isPassed ? 'badge-passed' : 'badge-failed'}`}>
                            {isPassed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            <span>{isPassed ? 'Lulus' : 'Tidak Lulus'}</span>
                          </div>
                          {canShowDiscussion && (
                            <button 
                              style={{ fontSize: '0.75rem', padding: '6px 10px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '8px', cursor: 'pointer', display: 'flex', whiteSpace: 'nowrap' }}
                              onClick={() => setSelectedDiscussion(item)}
                            >
                              Lihat Pembahasan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Belum ada riwayat ujian.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Discussion Modal */}
      {selectedDiscussion && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.7)', zIndex: 9999, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel" style={{ width: '95%', maxWidth: '700px', maxHeight: '90vh', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text-light)', margin: 0 }}>Evaluasi Pembahasan</h2>
              <button className="action-btn" onClick={() => setSelectedDiscussion(null)}><XCircle size={20} /></button>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
              {selectedDiscussion.details_snapshot?.map((d, i) => (
                <div key={i} style={{ padding: '16px', marginBottom: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', borderLeft: `4px solid ${d.isCorrect ? '#10b981' : '#ef4444'}` }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.95rem', lineHeight: '1.5' }}><strong>Soal {i+1}.</strong> {d.questionText}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', fontSize: '0.85rem' }}>
                    <div style={{ padding: '10px 14px', background: d.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: `1px solid ${d.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` }}>
                      <span style={{ color: 'var(--text-muted)' }}>Jawaban Anda:</span> 
                      <span style={{ display: 'block', color: d.isCorrect ? '#10b981' : '#ef4444', fontWeight: 'bold', marginTop: '4px' }}>{d.studentAnswer}</span>
                    </div>
                    
                    {!d.isCorrect && (
                      <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px dashed rgba(16, 185, 129, 0.3)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Kunci Jawaban Tepat:</span> 
                        <span style={{ display: 'block', color: '#10b981', fontWeight: 'bold', marginTop: '4px' }}>{d.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button onClick={() => setSelectedDiscussion(null)} className="btn-primary" style={{ width: '100%', maxWidth: '200px' }}>Tutup Jendela</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default History;
