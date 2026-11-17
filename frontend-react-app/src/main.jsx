import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import TourProvider from './tour/TourProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TourProvider>
      <App />
    </TourProvider>
  </React.StrictMode>,
);
