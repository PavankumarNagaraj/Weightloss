import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Hide loading screen as soon as React starts rendering
const loadingScreen = document.getElementById('loading-screen');
if (loadingScreen) {
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
  }, 50);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
