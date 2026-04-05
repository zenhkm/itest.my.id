import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', opacity: 0.6 }}>
            <div style={{ flex: 1, backgroundColor: 'white', height: '1px' }}></div>
            <span style={{ margin: '0 10px', fontSize: '13px' }}>atau otentikasi staf</span>
            <div style={{ flex: 1, backgroundColor: 'white', height: '1px' }}></div>
          </div>

          <button 
            type="button" 
            className="google-login-button" 
            onClick={handleGoogleLogin}
            style={{ 
              width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '12px', background: 'white', color: '#333', border: 'none', borderRadius: '8px', 
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Login Internal via Google Workspace
          </button>
        </form>
        
        <div className="login-footer">
          <p>Sistem Ujian Terpadu &copy; 2026</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
