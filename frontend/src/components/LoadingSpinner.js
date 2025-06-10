import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Chargement en cours...' }) => {
  const spinnerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px'
  };

  const spinnerCircle = {
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #10b981',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  };

  const messageStyle = {
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500'
  };

  return (
    <div style={spinnerStyle}>
      <style>
        {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
      </style>
      <div style={spinnerCircle}></div>
      <p style={messageStyle}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
