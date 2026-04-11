import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';
import './Login.css';

const EmailConfirmation = () => {
  const location = useLocation();
  const email = location.state?.email || '';

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

      <motion.div
        className="login-card glass-panel"
        style={{ padding: '40px 36px', maxWidth: '460px', width: '90%', textAlign: 'center' }}
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4, type: 'spring', stiffness: 200 }}
          style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: '0 8px 28px rgba(99, 102, 241, 0.45)',
          }}
        >
          <Mail size={36} color="#fff" strokeWidth={1.8} />
        </motion.div>

        {/* Title */}
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--text-light)',
          marginBottom: '10px',
          lineHeight: 1.2,
        }}>
          Cek Email Anda!
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          lineHeight: 1.7,
          marginBottom: '8px',
        }}>
          Kami telah mengirimkan tautan konfirmasi ke:
        </p>

        {email && (
          <div style={{
            display: 'inline-block',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: '10px',
            padding: '8px 18px',
            marginBottom: '22px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#a5b4fc',
            wordBreak: 'break-all',
          }}>
            {email}
          </div>
        )}

        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          lineHeight: 1.75,
          marginBottom: '32px',
          padding: '0 4px',
        }}>
          Buka kotak masuk email Anda dan klik tautan konfirmasi yang telah kami kirimkan.
          Jika tidak menemukan email, periksa juga folder <strong style={{ color: 'var(--text-light)' }}>Spam</strong> atau <strong style={{ color: 'var(--text-light)' }}>Promosi</strong>.
        </p>

        {/* Steps */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px',
          padding: '18px 20px',
          marginBottom: '28px',
          textAlign: 'left',
        }}>
          {[
            { num: '1', text: 'Buka aplikasi email Anda' },
            { num: '2', text: 'Cari email dari Supabase / noreply' },
            { num: '3', text: 'Klik tombol "Confirm your email"' },
            { num: '4', text: 'Anda akan diarahkan ke halaman login' },
          ].map((item) => (
            <div key={item.num} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '10px',
            }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}>
                {item.num}
              </div>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <Link
          to="/login"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '13px 20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            transition: 'opacity 0.2s',
            marginBottom: '14px',
          }}
        >
          Mengerti, buka halaman Login <ArrowRight size={16} />
        </Link>

        <Link
          to="/register"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}
        >
          <RefreshCw size={14} /> Kembali ke halaman daftar
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default EmailConfirmation;
