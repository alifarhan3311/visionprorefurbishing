import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    password: '',
    role: 'user',
    houseAddress: ''
  });
  const [step, setStep] = useState('register'); // 'register' | 'otp'
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { register, verifyEmail, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await register(formData);
    if (result.success) {
      setRegisteredEmail(result.email);
      setMessage(result.message);
      setStep('otp');
    } else {
      setError(result.error);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await verifyEmail(registeredEmail, otp);
    if (result.success) {
      navigate('/dashboard');
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
          <h2>Apply for B2B Account</h2>
          <p>Get access to wholesale pricing</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        {message && <div style={{backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px', border: '1px solid rgba(16,185,129,0.2)'}}>{message}</div>}
        
        {step === 'register' ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name} 
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label>Company / Store Name</label>
              <input 
                type="text" 
                name="companyName"
                value={formData.companyName} 
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label>Account Type</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="user">User</option>
                <option value="retailer">Retailer</option>
              </select>
            </div>

            {formData.role === 'retailer' && (
              <div className="form-group">
                <label>House Address</label>
                <input
                  type="text"
                  name="houseAddress"
                  value={formData.houseAddress}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email} 
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password} 
                onChange={handleChange}
                required 
              />
            </div>
            
            <button type="submit" className="auth-submit-btn">Create Account</button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="auth-form">
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
            <button type="submit" className="auth-submit-btn">Verify Email & Login</button>
          </form>
        )}
        
        <div className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
