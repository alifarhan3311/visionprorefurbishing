import { useEffect, useRef, useState } from 'react';

const CloverPayment = ({ amount, onTokenGenerated, onError, disabled }) => {
  const cloverFrameRef = useRef(null);
  const cloverInstanceRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [cloverReady, setCloverReady] = useState(false);
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [manualToken, setManualToken] = useState('');

  const initializeClover = () => {
    try {
      const publicKey = import.meta.env.VITE_CLOVER_PUBLIC_KEY;
      
      if (!publicKey) {
        onError('Clover public key not configured. Please check VITE_CLOVER_PUBLIC_KEY in .env');
        setShowManualFallback(true);
        return;
      }
      
      if (!window.Clover) {
        onError('Clover.js failed to load. Using manual token mode for testing.');
        setShowManualFallback(true);
        return;
      }
      
      const clover = new window.Clover(publicKey);
      cloverInstanceRef.current = clover;

      const frame = clover.Frame({
        target: '#clover-frame',
        locale: 'en-US',
        amount: Math.round(amount * 100),
        currency: 'USD',
        focus: 'card-number',
        gateway: import.meta.env.VITE_CLOVER_SANDBOX === 'true' 
          ? 'https://scl-sandbox.dev.clover.com' 
          : 'https://scl.clover.com'
      });

      frame.onload = () => {
        setLoading(false);
        setCloverReady(true);
      };

      frame.addEventListener('submit', async () => {
        setLoading(true);
        try {
          const { token } = await frame.tokenize();
          onTokenGenerated(token);
          setManualToken('');
        } catch (error) {
          onError(error?.message || 'Tokenization failed');
        } finally {
          setLoading(false);
        }
      });

      frame.addEventListener('error', (event) => {
        console.error('Clover iframe error:', event);
        onError(event?.error?.message || 'Clover iframe error');
        setLoading(false);
      });
    } catch (error) {
      console.error('Clover init error:', error);
      onError(error?.message || 'Failed to initialize Clover');
      setShowManualFallback(true);
    }
  };

  console.log(import.meta.env.VITE_CLOVER_PUBLIC_KEY);
console.log(window.Clover);

  useEffect(() => {
    const existingScript = document.getElementById('clover-js');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'clover-js';
      script.src = 'https://checkout.clover.com/clover.js';
      script.async = true;
      script.onload = initializeClover;
      script.onerror = () => {
        console.error('Failed to load Clover.js script');
        onError('Failed to load Clover.js - check network tab');
        setShowManualFallback(true);
      };
      document.head.appendChild(script);
    } else if (window.Clover) {
      initializeClover();
    }

    return () => {
      if (cloverInstanceRef.current) {
        try {
          cloverInstanceRef.current.destroy();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [amount, onError]);

  const handleManualTokenSubmit = () => {
    if (manualToken.trim()) {
      onTokenGenerated(manualToken.trim());
      setManualToken('');
    }
  };

  return (
    <div style={{ marginTop: '25px', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-elevated)' }}>
      <h4 style={{ marginBottom: '15px', color: 'var(--text-primary)', fontSize: '15px', fontWeight: '600' }}>
        Clover Payment
      </h4>
      
      {!cloverReady && !loading && !showManualFallback && (
        <div style={{ marginBottom: '15px', color: 'var(--text-secondary)', fontSize: '13px' }}>
          Loading payment form...
        </div>
      )}
      
      {!showManualFallback && (
        <div 
          id="clover-frame" 
          ref={cloverFrameRef}
          style={{ 
            minHeight: '120px',
            opacity: disabled || loading ? 0.6 : 1,
            pointerEvents: disabled || loading ? 'none' : 'auto'
          }}
        />
      )}
      
      {showManualFallback && (
        <div style={{ marginBottom: '15px' }}>
          <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Sandbox Mode - Enter test token manually (use: tok_ or test card token)
          </p>
          <input
            type="text"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="Enter Clover Token (e.g., tok_...)"
            style={{ 
              padding: '10px', 
              border: '1px solid var(--border-color)', 
              borderRadius: '4px', 
              width: '100%',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
          />
          <button
            type="button"
            onClick={handleManualTokenSubmit}
            disabled={!manualToken.trim() || loading}
            style={{ 
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Use Token
          </button>
        </div>
      )}
      
      {loading && (
        <div style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '13px' }}>
          Processing payment...
        </div>
      )}
    </div>
  );
};

export default CloverPayment;