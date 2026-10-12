import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingDown, TrendingUp, Calendar, ChevronRight, Trash2 } from 'lucide-react'
import { getAssessmentResults, deleteAssessmentResult } from '../utils/api'
import Modal from '../components/Modal'

export default function AssessmentHistory({ userId = 1 }) {
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expandedResult, setExpandedResult] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [resultToDelete, setResultToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Load assessment results on mount
  useEffect(() => {
    const loadResults = async () => {
      try {
        const response = await getAssessmentResults(userId)
        setResults(response.data || [])
      } catch (error) {
        console.error('Error loading assessment results:', error)
      } finally {
        setLoading(false)
      }
    }
    loadResults()
  }, [userId])

  // Handle delete result
  const handleDeleteResult = async (resultId) => {
    setResultToDelete(resultId)
    setDeleteModalOpen(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!resultToDelete) return

    setDeleting(true)
    try {
      await deleteAssessmentResult(resultToDelete)
      setResults(results.filter(r => r.id !== resultToDelete))
      setDeleteModalOpen(false)
      setResultToDelete(null)
    } catch (error) {
      console.error('Error deleting assessment result:', error)
      alert('Error deleting result. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  // Get severity color class based on severity level
  const getSeverityColor = (severity) => {
    const colors = {
      minimal: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-900', badge: 'bg-green-100 text-green-800' },
      mild: { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-900', badge: 'bg-yellow-100 text-yellow-800' },
      moderate: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-900', badge: 'bg-orange-100 text-orange-800' },
      high: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-900', badge: 'bg-red-100 text-red-800' }
    }
    return colors[severity] || colors.minimal
  }

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get unique assessment types
  const assessmentTypes = Array.from(new Set(results.map(r => r.assessmentName)))

  // Filter results — most recent first
  const filteredResults = (filter === 'all'
    ? results
    : results.filter(r => r.assessmentName === filter)
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  if (loading) {
    return <div className="text-center py-8">Loading assessment history...</div>
  }

  if (results.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Assessment History</h1>
          <p className="text-gray-600 mb-8">You haven't completed any assessments yet.</p>
          <button
            onClick={() => navigate('/assessments')}
            className="bg-mindwell-600 hover:bg-mindwell-700 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            Take Your First Assessment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Assessment History</h1>
          <button
            onClick={() => navigate('/assessments')}
            className="bg-mindwell-600 hover:bg-mindwell-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Take New Assessment
          </button>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'all'
                ? 'bg-mindwell-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All Assessments ({results.length})
          </button>
          {assessmentTypes.map(type => {
            const count = results.filter(r => r.assessmentName === type).length
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                  filter === type
                    ? 'bg-mindwell-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {type} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Summary statistics */}
      {filteredResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Latest score */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Latest Score</p>
            <div className="text-3xl font-bold text-mindwell-600">
              {filteredResults[0]?.percentage}%
            </div>
            <p className="text-gray-500 text-xs mt-2">{formatDate(filteredResults[0]?.timestamp)}</p>
          </div>

          {/* Average score */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Average Score</p>
            <div className="text-3xl font-bold text-mindwell-600">
              {Math.round(filteredResults.reduce((sum, r) => sum + r.percentage, 0) / filteredResults.length)}%
            </div>
            <p className="text-gray-500 text-xs mt-2">Across {filteredResults.length} assessments</p>
          </div>

          {/* Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Trend</p>
            <div className="flex items-center gap-2">
              {filteredResults.length >= 2 ? (
                <>
                  {filteredResults[0].percentage > filteredResults[1].percentage ? (
                    <>
                      <TrendingUp className="w-6 h-6 text-red-500" />
                      <span className="text-lg font-bold text-red-600">↑ {filteredResults[0].percentage - filteredResults[1].percentage}%</span>
                    </>
                  ) : filteredResults[0].percentage < filteredResults[1].percentage ? (
                    <>
                      <TrendingDown className="w-6 h-6 text-green-500" />
                      <span className="text-lg font-bold text-green-600">↓ {filteredResults[1].percentage - filteredResults[0].percentage}%</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-600">→ Stable</span>
                  )}
                </>
              ) : (
                <span className="text-gray-500">Only one result</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results timeline */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Detailed Results</h2>
        {filteredResults.map((result) => {
          const colors = getSeverityColor(result.severity)
          const isExpanded = expandedResult === result.id

          return (
            <div
              key={result.id}
              className={`${colors.bg} border-l-4 ${colors.border} rounded-lg p-6 cursor-pointer transition hover:shadow-md`}
              onClick={() => setExpandedResult(isExpanded ? null : result.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{result.assessmentName}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
                      {result.severity?.charAt(0).toUpperCase() + result.severity?.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                    <Calendar className="w-4 h-4" />
                    {formatDate(result.timestamp)}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {result.percentage}%
                  </div>
                  <p className="text-gray-600 text-sm">
                    Score: {result.totalScore} out of {result.maxScore}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <ChevronRight className={`w-6 h-6 text-gray-600 transition ${isExpanded ? 'rotate-90' : ''}`} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteResult(result.id)
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition hover:text-red-700"
                    title="Delete this result"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-current border-opacity-20">
                  <h4 className="font-semibold text-gray-800 mb-3">Your Answers</h4>
                  <div className="space-y-2 mb-4">
                    {result.answers && result.answers.map((answer, idx) => (
                      <div key={idx} className="text-sm text-gray-700">
                        <span className="font-medium">Q{idx + 1}:</span> Answer index {answer}
                      </div>
                    ))}
                  </div>
                  <div className="bg-white bg-opacity-50 rounded p-3 text-sm text-gray-700">
                    <p className="mb-2">
                      <strong>What this means:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>A higher score indicates more symptoms or concerns in this area</li>
                      <li>Track your progress by comparing scores over time</li>
                      <li>Share results with a healthcare provider if helpful</li>
                      <li>This is not a medical diagnosis - consult a professional</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        title="Delete Assessment Result"
        onClose={() => {
          setDeleteModalOpen(false)
          setResultToDelete(null)
        }}
        onConfirm={confirmDelete}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        showCancel={true}
      >
        <div className="space-y-3">
          <p className="text-gray-700 font-semibold">Are you sure you want to delete this assessment result?</p>
          <p className="text-gray-600 text-sm">
            This action cannot be undone. The result and all your answers will be permanently removed.
          </p>
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
            <p className="text-red-800 text-sm">
              <strong>Warning:</strong> You will not be able to recover this data.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
