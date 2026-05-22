import React, { useEffect, useState } from 'react';
import './Preloader.css';

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="preloader">
      <div className="preloader-glow"></div>
      <div className="preloader-content">
        <div className="preloader-logo-wrap">
          <img src="/assets/preloader.png" alt="Vision Pro LCD" className="preloader-logo" />
        </div>
        <div className="preloader-brand">
          Vision Pro <span>LCD</span>
        </div>
        <p className="preloader-tagline">Premium B2B Parts & Refurbishment</p>
        <div className="preloader-bar">
          <div className="preloader-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
