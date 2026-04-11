import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Rocket } from 'lucide-react';
import './Onboarding.css';

const STEPS = [
  {
    key: 'school-data',
    icon: '🏫',
    title: 'Data Sekolah',
    desc: 'Daftarkan instansi sekolah Anda. Informasi ini akan muncul di profil ujian, laporan nilai, dan dokumen ekspor.',
  },
  {
    key: 'question-bank',
    icon: '📚',
    title: 'Bank Soal',
    desc: 'Tambahkan soal-soal ke bank soal berdasarkan mata pelajaran dan kelas. Soal dapat dipakai berulang kali di berbagai ujian.',
  },
  {
    key: 'classes-data',
    icon: '🎓',
    title: 'Data Kelas',
    desc: 'Buat daftar kelas yang ada di sekolah Anda — misalnya 10 IPA 1, 11 IPS 2. Kelas ini digunakan untuk mengelompokkan soal dan siswa.',
  },
  {
    key: 'rooms-data',
    icon: '🚪',
    title: 'Data Ruangan',
    desc: 'Daftarkan ruangan ujian lengkap dengan kapasitas dan statusnya, agar dapat ditugaskan saat menjadwalkan ujian.',
  },
  {
    key: 'students',
    icon: '👨‍🎓',
    title: 'Manajemen Siswa',
    desc: 'Tambahkan daftar siswa beserta NIS dan kata sandi. Siswa bisa login menggunakan NIS dan kata sandi yang Anda tentukan.',
  },
  {
    key: 'add-exam',
    icon: '✏️',
    title: 'Buat Ujian',
    desc: 'Sekarang saatnya membuat ujian pertama Anda! Pilih soal dari bank soal, atur durasi, jadwal, dan kelompok peserta.',
  },
];

const Onboarding = ({ onNavigate, onComplete }) => {
  // -1 = welcome screen, 0-5 = steps
  const [stepIndex, setStepIndex] = useState(-1);
  const [direction, setDirection] = useState(1);

  const goNext = () => {
    const nextIndex = stepIndex + 1;
    setDirection(1);
    if (nextIndex >= STEPS.length) {
      onComplete();
    } else {
      setStepIndex(nextIndex);
    }
  };

  const goPrev = () => {
    if (stepIndex <= 0) {
      setDirection(-1);
      setStepIndex(-1);
    } else {
      setDirection(-1);
      setStepIndex(stepIndex - 1);
    }
  };

  const handleStart = () => {
    if (stepIndex === -1) {
      setDirection(1);
      setStepIndex(0);
    } else {
      onNavigate(STEPS[stepIndex].key);
    }
  };

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  const isWelcome = stepIndex === -1;
  const isLastStep = stepIndex === STEPS.length - 1;

  return (
    <div className="onboarding-overlay">
      <motion.div
        className="onboarding-card"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {/* Progress dots (hidden on welcome) */}
        {!isWelcome && (
          <div className="ob-progress">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`ob-dot ${i === stepIndex ? 'active' : i < stepIndex ? 'done' : ''}`}
              />
            ))}
          </div>
        )}

        <AnimatePresence custom={direction} mode="wait">
          {isWelcome ? (
            <motion.div
              key="welcome"
              className="onboarding-welcome"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <div className="ob-welcome-icon">🚀</div>
              <p className="ob-greeting">Selamat Datang!</p>
              <h1>Mulai Perjalanan Anda</h1>
              <p>
                Panduan singkat ini akan membantu Anda menyiapkan sistem ujian dari awal —
                mulai dari data sekolah, bank soal, daftar siswa, hingga membuat ujian pertama.
              </p>
              <div className="ob-footer">
                <button className="ob-btn-primary" onClick={handleStart}>
                  Mulai Panduan <ArrowRight size={16} />
                </button>
                <button className="ob-skip-all" onClick={onComplete}>
                  Lewati — saya sudah tahu caranya
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`step-${stepIndex}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <div className="ob-step-header">
                <div className="ob-step-icon">{STEPS[stepIndex].icon}</div>
                <div className="ob-step-meta">
                  <div className="ob-step-label">Langkah {stepIndex + 1} dari {STEPS.length}</div>
                  <h2 className="ob-step-title">{STEPS[stepIndex].title}</h2>
                </div>
              </div>

              <p className="ob-step-desc">{STEPS[stepIndex].desc}</p>

              <div className="ob-footer">
                <button className="ob-btn-primary" onClick={handleStart}>
                  <Rocket size={15} />
                  Buka Halaman {STEPS[stepIndex].title}
                </button>
                <button className="ob-btn-secondary" onClick={goNext}>
                  {isLastStep ? 'Selesai — tutup panduan' : `Lewati, lanjut ke langkah berikutnya`}
                </button>
                <button className="ob-skip-all" onClick={onComplete}>
                  Tutup panduan ini
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Onboarding;
