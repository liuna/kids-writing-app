import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface HeaderProps {
  title: string
  showBack?: boolean
  rightElement?: React.ReactNode
  onBack?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  rightElement,
  onBack,
}) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 safe-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 mr-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-ink">{title}</h1>
        </div>
        {rightElement && (
          <div>{rightElement}</div>
        )}
      </div>
    </header>
  )
}
