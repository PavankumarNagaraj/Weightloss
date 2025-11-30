import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Hide loading screen instantly when React starts rendering
const loadingScreen = document.getElementById('loading-screen');
if (loadingScreen) {
  loadingScreen.classList.add('hidden');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
