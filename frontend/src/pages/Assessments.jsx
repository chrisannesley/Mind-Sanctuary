import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAssessments } from '../utils/api'

function Assessments({ userId }) {
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAssessments = async () => {
      try {
        const response = await getAssessments()
        setAssessments(response.data)
      } catch (error) {
        console.error('Error loading assessments:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAssessments()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading assessments...</div>
  }

  const categoryEmojis = {
    depression: '😔',
    anxiety: '😰',
    ptsd: '⚠️',
    bipolar: '🔄',
    sleep: '😴',
    substance: '🚫',
    adhd: '⚡',
    eating: '🍽️'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mental Health Assessments</h1>
        <p className="text-gray-600">
          These evidence-based assessments can help you understand your mental health better. 
          They are optional tools for self-reflection and should not replace professional medical advice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessments.map((assessment) => (
          <Link
            key={assessment.id}
            to={`/assessments/${assessment.id}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-mindwell-500"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{assessment.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{assessment.description}</p>
              </div>
              <span className="text-3xl">{categoryEmojis[assessment.category] || '📋'}</span>
            </div>
            <div className="mt-4 text-mindwell-600 font-semibold hover:text-mindwell-700">
              Take Assessment →
            </div>
          </Link>
        ))}
      </div>

      {/* Information Box */}
      <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
        <h3 className="font-bold text-yellow-900 mb-2">⚠️ Important Information</h3>
        <p className="text-yellow-800 text-sm mb-2">
          These assessments are self-screening tools and are not diagnostic. They can help you:
        </p>
        <ul className="text-yellow-800 text-sm space-y-1 ml-4">
          <li>• Understand your mental health better</li>
          <li>• Track changes over time</li>
          <li>• Prepare for conversations with healthcare providers</li>
          <li>• Identify areas where you might need support</li>
        </ul>
        <p className="text-yellow-800 text-sm mt-3">
          If you're in crisis or having thoughts of self-harm, please reach out to emergency services or use the crisis resources in the app.
        </p>
      </div>
    </div>
  )
}

export default Assessments
