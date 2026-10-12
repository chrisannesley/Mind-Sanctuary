import React, { useState } from 'react'
import PetCompanionEnhanced from './components/PetCompanionEnhanced'
import './App.css'

function App() {
  const [userId] = useState(1)

  return (
    <div className="bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 min-h-screen">
      <PetCompanionEnhanced userId={userId} />
    </div>
  )
}

export default App
