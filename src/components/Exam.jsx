import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, ChevronLeft, ChevronRight, CheckCircle, Flag, MapPin } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import './Exam.css';

const Exam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exams, saveResult, isFetching, showConfirm, fetchExamSession, upsertExamSession, deleteExamSession } = useContext(AppContext);

  const examData = exams.find(e => e.id === id);

  // States
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: optionIndex }
  const [flagged, setFlagged] = useState({}); // { questionId: boolean }
  const [timeLeft, setTimeLeft] = useState(examData ? parseInt(examData.duration) * 60 : 0);
  const [isFinished, setIsFinished] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState(null);
  const [violations, setViolations] = useState(0);
  const VIOLATION_LIMIT = 3;
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const initSession = async () => {
      if (examData && !isSessionLoaded) {
        const session = await fetchExamSession(examData.id);
        if (!isMounted) return;

        if (session) {
          // Restore from DB session
          setShuffledQuestions(session.shuffled_questions);
          setAnswers(session.answers || {});
          setFlagged(session.flagged || {});
          setTimeLeft(session.time_left);
          setCurrentIdx(session.current_idx || 0);
          toast.success('Melanjutkan sesi ujian sebelumnya...', { icon: '🔄', duration: 4000 });
        } else {
          // Initialize fresh
          let questionsCopy = Array.isArray(examData.questions) ? [...examData.questions] : [];
          if (questionsCopy.length > 0 && examData.shuffle_questions) {
            questionsCopy = questionsCopy.sort(() => Math.random() - 0.5);
          }
          const processedQuestions = questionsCopy.map(q => {
            let processedQ = { ...q, originalCorrectOption: q.correctOption };
            if (examData.shuffle_options && Array.isArray(q.options)) {
              let optMap = q.options.map((text, idx) => ({ text, isCorrect: idx === q.correctOption }));
              optMap = optMap.sort(() => Math.random() - 0.5);
              processedQ.options = optMap.map(o => o.text);
              processedQ.correctOption = optMap.findIndex(o => o.isCorrect);
            }
            return processedQ;
          });
          setShuffledQuestions(processedQuestions);
        }
        setIsSessionLoaded(true);
      }
    };
    initSession();
    return () => { isMounted = false; };
  }, [examData, isSessionLoaded, fetchExamSession]);

  const stateRef = React.useRef({ answers, flagged, timeLeft, currentIdx, shuffledQuestions });
  useEffect(() => {
    stateRef.current = { answers, flagged, timeLeft, currentIdx, shuffledQuestions };
  }, [answers, flagged, timeLeft, currentIdx, shuffledQuestions]);

  // Debounced explicit sync on user action
  useEffect(() => {
    if (!isSessionLoaded || isFinished || !shuffledQuestions) return;
    const timerId = setTimeout(() => {
      upsertExamSession({ examId: examData.id, ...stateRef.current });
    }, 1500); // 1.5s debounce
    return () => clearTimeout(timerId);
  }, [answers, flagged, currentIdx, isSessionLoaded, isFinished, shuffledQuestions, examData, upsertExamSession]);

  // Periodic strict backup (every 10s for timer and states)
  useEffect(() => {
    if (!isSessionLoaded || isFinished || !shuffledQuestions) return;
    const intervalId = setInterval(() => {
      upsertExamSession({ examId: examData.id, ...stateRef.current });
    }, 10000);
    return () => clearInterval(intervalId);
  }, [isSessionLoaded, isFinished, shuffledQuestions, examData, upsertExamSession]);

  // === ALL HOOKS MUST PRECEED EARLY RETURNS ===

  // Timer Countdown Effect
  useEffect(() => {
    if (timeLeft <= 0 || isFinished) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isFinished]);

  // Anti-Cheat Sensors
  useEffect(() => {
    if (isFinished || timeLeft <= 0 || !shuffledQuestions) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.error(`Anda terdeteksi meninggalkan tab ujian! Peringatan ${violations + 1}/${VIOLATION_LIMIT}`, { duration: 4000, icon: '⚠️' });
        setViolations(prev => prev + 1);
      }
    };

    const handleWindowBlur = () => {
      toast.error(`Anda terdeteksi berpindah jendela/aplikasi! Peringatan ${violations + 1}/${VIOLATION_LIMIT}`, { duration: 4000, icon: '⚠️' });
      setViolations(prev => prev + 1);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isFinished, timeLeft, shuffledQuestions, violations]);

  // Submission Handlers
  const forceSubmitResult = async () => {
    if (!shuffledQuestions) return;
    setIsFinished(true);

    let correctAnswers = 0;
    const details = [];
    const totalQs = shuffledQuestions.length;

    shuffledQuestions.forEach(q => {
      const isCorrect = answers[q.id] === q.correctOption || answers[q.id] === q.correctAnswer;
      if (isCorrect) correctAnswers++;

      details.push({
        questionText: q.text,
        studentAnswer: answers[q.id] !== undefined ? q.options[answers[q.id]] : 'Tidak Dijawab',
        correctAnswer: q.options[q.correctOption],
        isCorrect: isCorrect
      });
    });

    const score = Math.round((correctAnswers / totalQs) * 100) || 0;

    await saveResult({
      examId: examData.id,
      examTitle: examData.title,
      subject: examData.subject,
      score: score,
      totalQuestions: totalQs,
      correctAnswers: correctAnswers,
      status: score >= 70 ? 'Lulus' : 'Gagal',
      details: details
    });

    await deleteExamSession(examData.id);
    navigate('/history');
  };

  const handleFinishExam = async () => {
    if (await showConfirm("Selesai Ujian", "Apakah Anda yakin ingin menyelesaikan ujian ini? Jawaban tidak dapat diubah lagi.", "Selesai Sekarang")) {
      await forceSubmitResult();
    }
  };

  // Time's Up / Limit Reached Effect
  useEffect(() => {
    if (timeLeft === 0 && !isFinished && shuffledQuestions && shuffledQuestions.length > 0) {
      forceSubmitResult(); // Auto submit tanpa konfirmasi saat waktu habis
    }
    if (violations >= VIOLATION_LIMIT && !isFinished && shuffledQuestions && shuffledQuestions.length > 0) {
      toast.error("PELANGGARAN MAKSIMAL. Ujian dihentikan paksa!", { duration: 7000, icon: '🚨' });
      forceSubmitResult(); // Kick out abuser
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, violations]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelectOption = (qId, optIdx) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: optIdx
    }));
  };

  const handleToggleFlag = (qId) => {
    setFlagged(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const currentTotal = shuffledQuestions ? shuffledQuestions.length : 0;

  const handleNext = () => {
    if (currentIdx < currentTotal - 1) setCurrentIdx(currentIdx + 1);
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const protectContent = (e) => {
    e.preventDefault();
    toast.error("Aksi Copy/Paste/Klik-Kanan dilarang selama ujian berlangsung!", { icon: '🛑' });
  };

  // === SAFE EARLY RETURNS ===

  if (isFetching) {
    return (
      <div className="exam-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div className="loader" style={{ width: '50px', height: '50px', borderTopColor: 'var(--primary)' }}></div>
        <p style={{ marginTop: 24, fontSize: '1.2rem', color: 'var(--text-light)' }}>Memuat soal dari Cloud Server...</p>
      </div>
    );
  }

  if (!examData || !shuffledQuestions) {
    return (
      <div className="exam-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Konfigurasi soal disiapkan...</h2>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }

  if (shuffledQuestions.length === 0) {
    return (
      <div className="exam-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Ujian ini masih kosong (Tidak ada soal).</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Mohon hubungi guru untuk memuat butir soal.</p>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }

  const currentQuestion = shuffledQuestions[currentIdx];
  const totalQuestions = shuffledQuestions.length;

  if (!currentQuestion) return null;

  return (
    <motion.div
      className="exam-container"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onCopy={protectContent}
      onPaste={protectContent}
      onContextMenu={protectContent}
    >
      {/* Top Navigation / Header */}
      <header className="exam-header">
        <div className="exam-title">
          <MapPin className="title-icon" />
          <h2>{examData.title}</h2>
        </div>
        <div className={`exam-timer ${timeLeft < 300 ? 'timer-warning' : ''}`}>
          <Clock size={24} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </header>

      <div className="exam-layout">
        {/* Main Content Area */}
        <main className="exam-main-panel glass-panel">
          <div className="question-header">
            <h3>Soal No. {currentIdx + 1}</h3>
            <button
              className={`flag-button ${flagged[currentQuestion.id] ? 'active' : ''}`}
              onClick={() => handleToggleFlag(currentQuestion.id)}
            >
              <Flag size={18} />
              <span>{flagged[currentQuestion.id] ? 'Ragu-ragu (Ditandai)' : 'Ragu-ragu'}</span>
            </button>
          </div>

          <div className="question-content">
            {currentQuestion.imageUrl && (
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <img src={currentQuestion.imageUrl} alt="Lampiran Soal" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            )}
            <p className="question-text">{currentQuestion.text}</p>

            <div className="options-list">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentQuestion.id] === idx;
                const optionLabel = String.fromCharCode(65 + idx); // A, B, C...

                return (
                  <div
                    key={idx}
                    className={`option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(currentQuestion.id, idx)}
                  >
                    <div className="option-label">{optionLabel}</div>
                    <div className="option-text">{opt}</div>
                    {isSelected && <CheckCircle size={20} className="check-icon" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="exam-navigation">
            <button
              className="nav-btn btn-secondary"
              onClick={handlePrev}
              disabled={currentIdx === 0}
            >
              <ChevronLeft size={20} />
              <span>Kembali</span>
            </button>

            {currentIdx < totalQuestions - 1 ? (
              <button className="nav-btn btn-primary" onClick={handleNext}>
                <span>Selanjutnya</span>
                <ChevronRight size={20} />
              </button>
            ) : (
              <button className="nav-btn btn-finish" onClick={handleFinishExam}>
                <CheckCircle size={20} />
                <span>Selesai Ujian</span>
              </button>
            )}
          </div>
        </main>

        {/* Right Sidebar - Number Grid */}
        <div className="mobile-nav-toggle-wrapper">
          <button className="mobile-nav-toggle btn-secondary" onClick={() => setIsNavOpen(!isNavOpen)}>
            <span>{isNavOpen ? 'Tutup Peta Navigasi Soal' : 'Lihat Peta Navigasi Soal'}</span>
          </button>
        </div>
        <aside className={`exam-sidebar glass-panel ${isNavOpen ? 'nav-open' : 'nav-closed'}`}>
          <div className="sidebar-header">
            <h4>Navigasi Soal</h4>
            <div className="progress-text">
              {Object.keys(answers).length} / {totalQuestions} Dijawab
            </div>
          </div>

          <div className="question-grid">
            {shuffledQuestions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isFlagged = flagged[q.id];
              const isActive = currentIdx === idx;

              let btnClass = "grid-btn";
              if (isActive) btnClass += " active";
              else if (isFlagged) btnClass += " flagged";
              else if (isAnswered) btnClass += " answered";
              else btnClass += " default";

              return (
                <button
                  key={q.id}
                  className={btnClass}
                  onClick={() => setCurrentIdx(idx)}
                >
                  {idx + 1}
                  {isFlagged && <div className="indicator-dot flag-dot"></div>}
                </button>
              );
            })}
          </div>

          <div className="sidebar-legend">
            <div className="legend-item">
              <div className="legend-color color-answered"></div>
              <span>Sudah Dijawab</span>
            </div>
            <div className="legend-item">
              <div className="legend-color color-flagged"></div>
              <span>Ragu-ragu</span>
            </div>
            <div className="legend-item">
              <div className="legend-color color-default"></div>
              <span>Belum Dijawab</span>
            </div>
            <div className="legend-item">
              <div className="legend-color color-active"></div>
              <span>Sedang Aktif</span>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

export default Exam;
