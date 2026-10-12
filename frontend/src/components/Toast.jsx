import React, { useEffect } from 'react'

function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const bgColor = {
    success: 'bg-green-50 border-green-500',
    error: 'bg-red-50 border-red-500',
    info: 'bg-blue-50 border-blue-500',
    warning: 'bg-yellow-50 border-yellow-500'
  }[type]

  const textColor = {
    success: 'text-green-700',
    error: 'text-red-700',
    info: 'text-blue-700',
    warning: 'text-yellow-700'
  }[type]

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  }[type]

  return (
    <div className={`fixed top-4 right-4 ${bgColor} border-l-4 p-4 rounded shadow-lg animate-slide-in z-40 max-w-sm`}>
      <p className={`${textColor} font-semibold flex items-center`}>
        <span className="mr-2 text-lg">{icon}</span>
        {message}
      </p>
    </div>
  )
}

export default Toast
