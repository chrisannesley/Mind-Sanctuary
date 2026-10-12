import React from 'react'

function Modal({ isOpen, title, children, onClose, onConfirm, confirmText = 'Save', cancelText = 'Cancel', showCancel = true }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-mindwell-500 to-mindwell-600 px-6 py-4 rounded-t-lg flex-shrink-0">
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-grow">
          {children}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex gap-3 justify-end border-t flex-shrink-0">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition"
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-white bg-mindwell-600 hover:bg-mindwell-700 rounded-lg font-semibold transition"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Modal
