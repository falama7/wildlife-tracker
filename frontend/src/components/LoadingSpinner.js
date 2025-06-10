import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', message = 'Chargement en cours...' }) => {
  return (
    <div className={`loading-container ${size}`}>
      <div className="spinner-wrapper">
        <div className="spinner"></div>
        <div className="spinner-dots">
          <div className="dot dot1"></div>
          <div className="dot dot2"></div>
          <div className="dot dot3"></div>
        </div>
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default LoadingSpinner;