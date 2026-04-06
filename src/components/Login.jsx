import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, BookOpen, ArrowRight } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user, handleCloudLogin, handleGoogleLogin } = useContext(AppContext);

  // Jika sudah login, redirect sesuai peran
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error('Mohon lengkapi NIS dan Kata Sandi Anda.');
      return;
    }
    
    setIsLoading(true);
    const roleAssigned = await handleCloudLogin(formData.username.toLowerCase(), formData.password);
    setIsLoading(false);
    
    if (roleAssigned) {
      if (roleAssigned !== 'student') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <motion.div 
      className="login-container"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="login-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <BookOpen className="logo-icon" size={32} />
          </div>
          <h1>Ujian Online</h1>
          <p>Silakan masuk untuk memulai sesi Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">NIS / Username</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Masukkan NIS atau Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Kata Sandi</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Masukkan Kata Sandi"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Ingat saya</span>
            </label>
            <a href="#" className="forgot-password">Lupa kata sandi?</a>
          </div>

          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loader"></div>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>


        </form>
        
        <div className="login-footer">
          <p>Sistem Ujian Terpadu &copy; 2026</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px' }}>
            <Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-light)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>Tentang Kami</Link>
            <Link to="/privacy-policy" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-light)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>Kebijakan Privasi</Link>
            <Link to="/help" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-light)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>Bantuan</Link>
            <Link to="/feedback" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-light)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>Feedback</Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
