import React, { useState, useEffect } from 'react'
import { getCrisisResources } from '../utils/api'

function CrisisResources() {
  const [resources, setResources] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadResources = async () => {
      try {
        const response = await getCrisisResources()
        setResources(response.data)
        // Set default to Australia (AU)
        const australia = response.data.find(r => r.code === 'AU')
        if (australia) {
          setSelectedCountry(australia)
        } else if (response.data.length > 0) {
          setSelectedCountry(response.data[0])
        }
      } catch (error) {
        console.error('Error loading crisis resources:', error)
      } finally {
        setLoading(false)
      }
    }
    loadResources()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading crisis resources...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Crisis Support Resources</h1>
        <p className="text-blue-800">
          If you're in immediate danger or having thoughts of self-harm, please contact emergency services or use the resources below.
        </p>
      </div>

      {/* Country Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Select Your Country</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {resources
            .sort((a, b) => a.country.localeCompare(b.country))
            .map((resource) => (
            <button
              key={resource.code}
              onClick={() => setSelectedCountry(resource)}
              className={`p-3 rounded-lg font-semibold transition ${
                selectedCountry?.code === resource.code
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-300 hover:border-blue-600'
              }`}
            >
              <span className="text-lg mr-1">{resource.flag}</span>
              {resource.country}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Country Resources */}
      {selectedCountry && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {selectedCountry.flag} {selectedCountry.country}
          </h2>

          <div className="space-y-4">
            {selectedCountry.resources.map((resource, index) => (
              <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded-lg">
                <div className="mb-3">
                  <h3 className="font-bold text-gray-800 text-lg">{resource.name}</h3>
                  {resource.description && (
                    <p className="text-gray-600 text-sm mt-1">{resource.description}</p>
                  )}
                </div>
                <div className="space-y-2">
                  {resource.phone && (
                    <div>
                      <p className="text-gray-700">
                        <strong>Phone:</strong>{' '}
                        <a href={`tel:${resource.phone}`} className="text-blue-600 hover:text-blue-700 font-semibold">
                          {resource.phone}
                        </a>
                      </p>
                    </div>
                  )}
                  {resource.text && (
                    <div>
                      <p className="text-gray-700">
                        <strong>Text:</strong> {resource.text}
                      </p>
                    </div>
                  )}
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center"
                    >
                      Visit Website →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Crisis Information */}
      <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
        <h3 className="font-bold text-yellow-900 mb-3">What to Do in a Crisis</h3>
        <ul className="text-yellow-800 space-y-2 text-sm">
          <li>• <strong>Call emergency services</strong> (911 in US, 999 in UK, 000 in Australia) if you're in immediate danger</li>
          <li>• <strong>Reach out to someone you trust</strong> - a friend, family member, or counselor</li>
          <li>• <strong>Use the resources above</strong> - trained counselors are available 24/7</li>
          <li>• <strong>Go to the nearest emergency room</strong> if you need immediate medical help</li>
          <li>• <strong>Remove access to means of self-harm</strong> if possible</li>
          <li>• <strong>Stay with someone</strong> until you feel safer</li>
        </ul>
      </div>

      {/* Support Information */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-2">Remember</h3>
        <p className="text-blue-800 text-sm">
          You are not alone. Crisis is temporary, and help is available. Reaching out is a sign of strength, not weakness. 
          Many people have felt the way you do now and have found their way through with support.
        </p>
      </div>
    </div>
  )
}

export default CrisisResources
