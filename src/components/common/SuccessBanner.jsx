import { useState, useEffect } from 'react'

function SuccessBanner({ message, onDismiss, autoHide = 5000 }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        if (onDismiss) onDismiss()
      }, autoHide)
      return () => clearTimeout(timer)
    }
  }, [message, autoHide, onDismiss])

  if (!message || !isVisible) return null

  return (
    <div className="fixed top-4 right-4 max-w-md bg-green-900/20 border border-green-500 rounded-lg p-4 backdrop-blur-sm z-50">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-green-400">Success</h3>
          <p className="text-sm text-gray-300 mt-1">{message}</p>
        </div>
        
        <button
          onClick={() => {
            setIsVisible(false)
            if (onDismiss) onDismiss()
          }}
          className="text-gray-400 hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default SuccessBanner