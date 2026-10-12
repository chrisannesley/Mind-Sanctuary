import React, { useState, useEffect } from 'react'
import { getCrisisResources } from '../utils/api'

/**
 * CrisisResources Component
 * Displays crisis resources with country selection via buttons
 */
export default function CrisisResources({ collapsed = false, defaultCountry = null }) {
  const [resources, setResources] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadResources = async () => {
      try {
        const res = await getCrisisResources()
        setResources(res.data)
      } catch (error) {
        console.error('Error loading crisis resources:', error)
      } finally {
        setLoading(false)
      }
    }
    loadResources()
  }, [])

  if (loading) return null

  const currentResources = resources?.find(r => r.code === selectedCountry)

  if (collapsed) {
    // Minimal footer version
    return (
      <div className="bg-red-50 border-t-2 border-red-500 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-bold">🆘 Need Help?</span>
            <span className="text-red-700 text-sm">Immediate support available</span>
          </div>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-3 py-1 text-sm border border-red-300 rounded bg-white text-gray-700"
          >
            {resources?.map(r => (
              <option key={r.code} value={r.code}>{r.country}</option>
            ))}
          </select>
        </div>
      </div>
    )
  }

  // Full version with country buttons
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 my-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Crisis Support Resources</h3>
      <p className="text-gray-600 mb-6">Select your country to see local support options:</p>

      {/* Country Buttons */}
      {resources && resources.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {resources
              .sort((a, b) => a.country.localeCompare(b.country))
              .map(r => (
              <button
                key={r.code}
                onClick={() => setSelectedCountry(r.code)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedCountry === r.code
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {r.country} {r.flag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Country Resources - Only show if country is selected */}
      {selectedCountry && currentResources && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">{currentResources.country} {currentResources.flag} Resources</h4>
          <div className="space-y-4">
            {currentResources.resources.map((resource, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                <h5 className="font-semibold text-gray-900 mb-3">{resource.name}</h5>
                <div className="space-y-2 text-sm">
                  {resource.phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">📞</span>
                      <a href={`tel:${resource.phone}`} className="text-blue-600 hover:text-blue-800 font-semibold">
                        Call: {resource.phone}
                      </a>
                    </div>
                  )}
                  {resource.text && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">💬</span>
                      <span className="text-gray-700">{resource.text}</span>
                    </div>
                  )}
                  {resource.url && (
                    <div>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-semibold inline-block mt-2">
                        Learn More →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Message - Only show if country is selected */}
      {selectedCountry && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 text-sm">
            <strong>Remember:</strong> Seeking help is a sign of strength. Reaching out is always the right choice. Your life matters.
          </p>
        </div>
      )}
    </div>
  )
}
