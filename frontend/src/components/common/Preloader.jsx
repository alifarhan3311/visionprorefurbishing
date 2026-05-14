import React, { useEffect, useState } from 'react';
import './Preloader.css';

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="preloader">
      <div className="preloader-content">
        <img src="/src/assets/visionpro-logo.png" alt="visionprorefurbishing" className="preloader-logo" />
        <div className="preloader-bar">
          <div className="preloader-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
