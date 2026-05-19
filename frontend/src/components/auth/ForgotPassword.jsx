import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [step, setStep] = useState('request_otp'); // 'request_otp' | 'reset_password'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/forgotpassword', { email });
      if (res.data.success) {
        setMessage('OTP has been sent to your email.');
        setStep('reset_password');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. User may not exist.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/resetpassword', { email, otp, password });
      if (res.data.success) {
        alert('Password has been successfully reset! You can now login.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. OTP may be invalid or expired.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Password Recovery</h2>
          <p>{step === 'request_otp' ? 'Enter your email to receive an OTP' : 'Enter the OTP and your new password'}</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        {message && <div style={{backgroundColor: '#ecfdf5', color: '#047857', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '13px'}}>{message}</div>}
        
        {step === 'request_otp' ? (
          <form onSubmit={handleRequestOtp} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="auth-submit-btn">Send OTP</button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label>Enter 6-Digit OTP</label>
              <input 
                type="text" 
                maxLength="6"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required 
                style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '20px', fontWeight: 'bold' }}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required 
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="auth-submit-btn">Reset Password</button>
          </form>
        )}
        
        <div className="auth-footer">
          Remember your password? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
