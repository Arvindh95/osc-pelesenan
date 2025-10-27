import React from 'react';
import { createRoot } from 'react-dom/client';

const MinimalApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'green' }}>✅ Minimal React App Working!</h1>
      <p>This confirms React is loading without context issues.</p>
      <div style={{ marginTop: '20px' }}>
        <a 
          href="/login" 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            textDecoration: 'none',
            borderRadius: '5px'
          }}
        >
          Go to Login
        </a>
      </div>
    </div>
  );
};

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<MinimalApp />);
}