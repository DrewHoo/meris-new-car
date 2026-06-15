import React from 'react'
import ReactDOM from 'react-dom/client'
import './analytics' // side-effect: starts the lazy Mixpanel load
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
