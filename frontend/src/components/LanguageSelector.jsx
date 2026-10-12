import React, { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
]

export default function LanguageSelector({ onLanguageChange, defaultLanguage = 'en-US' }) {
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLanguageSelect = (languageCode) => {
    setSelectedLanguage(languageCode)
    setShowDropdown(false)
    if (onLanguageChange) {
      onLanguageChange(languageCode)
    }
    localStorage.setItem('preferredLanguage', languageCode)
  }

  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        title="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLanguage?.flag} {currentLanguage?.name}</span>
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="max-h-96 overflow-y-auto">
            {SUPPORTED_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center gap-2 transition ${
                  selectedLanguage === lang.code ? 'bg-indigo-100 text-indigo-900 font-semibold' : ''
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {selectedLanguage === lang.code && <span className="ml-auto">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
