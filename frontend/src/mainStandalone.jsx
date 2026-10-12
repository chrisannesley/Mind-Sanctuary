/**
 * Standalone Entry Point
 * Use this for standalone Beast Companion deployment
 * 
 * To run standalone:
 * npm run dev:standalone
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import AppStandalone from './AppStandalone.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppStandalone />
  </React.StrictMode>,
)
