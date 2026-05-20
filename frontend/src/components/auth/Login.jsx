import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './Auth.css'; // Will create basic styles

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const queryParams = new URLSearchParams(window.location.search);
      const redirect = queryParams.get('redirect');
      if (redirect) {
        // Handle redirect correctly whether it starts with a slash or not
        const path = redirect.startsWith('/') ? redirect : `/${redirect}`;
        navigate(path);
      } else {
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      // Process pending booking if present
      const pendingBookingStr = localStorage.getItem('pendingBooking');
      if (pendingBookingStr) {
        try {
          const pendingBooking = JSON.parse(pendingBookingStr);
          await api.post('/appointments', pendingBooking);
          localStorage.removeItem('pendingBooking');
          alert('Your pending repair appointment was successfully synced to your profile!');
        } catch (err) {
          console.error('Error booking pending appointment:', err);
        }
      }
      // Note: We don't call navigate here. AuthContext's state update (setUser)
      // will trigger the useEffect above to handle the redirection cleanly without race conditions.
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <img src="/assets/visionpro-logo.png" alt="logo" style={{ height: '65px' }} />
          </div>
          <h2>Welcome Back</h2>
          <p>Login to your Vision Pro LCD B2B portal</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="admin@visionprolcd.com"
            />
          </div>
          
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '13px', color: '#10b981', textDecoration: 'none' }}>Forgot Password?</Link>
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="auth-submit-btn">Login to Account</button>
        </form>
        
        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Apply for B2B Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
