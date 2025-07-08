import { useState, useEffect } from 'react'

function ErrorBanner({ error, onRetry, onDismiss, autoHide = 5000 }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (error && autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        if (onDismiss) onDismiss()
      }, autoHide)
      return () => clearTimeout(timer)
    }
  }, [error, autoHide, onDismiss])

  if (!error || !isVisible) return null

  return (
    <div className="fixed top-4 right-4 max-w-md bg-red-900/20 border border-red-500 rounded-lg p-4 backdrop-blur-sm z-50">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-400">Error</h3>
          <p className="text-sm text-gray-300 mt-1">{error}</p>
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
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm text-blue-400 hover:text-blue-300"
        >
          Retry
        </button>
      )}
    </div>
  )
}

export default ErrorBanner