import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAssessment, submitAssessment } from '../utils/api'
import Modal from '../components/Modal'

function AssessmentDetail({ userId }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        const response = await getAssessment(id)
        setAssessment(response.data)
        setAnswers(new Array(response.data.questions.length).fill(null))
      } catch (error) {
        console.error('Error loading assessment:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAssessment()
  }, [id])

  const handleAnswerChange = (questionIndex, answerIndex) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answerIndex
    setAnswers(newAnswers)
  }

  const calculateScore = () => {
    // Simple scoring: sum of all answer indices
    // Most assessments use higher numbers as higher severity
    const totalScore = answers.reduce((sum, answer) => sum + answer, 0)
    const maxScore = answers.length * Math.max(...answers.map((_, i) => assessment.questions[i].options.length - 1))
    const percentage = Math.round((totalScore / maxScore) * 100)
    
    return {
      total: totalScore,
      max: maxScore,
      percentage,
      average: Math.round(totalScore / answers.length * 10) / 10
    }
  }

  const getSeverityLevel = (percentage) => {
    if (percentage >= 75) return { level: 'High', color: 'red', description: 'Consider seeking professional support' }
    if (percentage >= 50) return { level: 'Moderate', color: 'orange', description: 'Some concerns noted' }
    if (percentage >= 25) return { level: 'Mild', color: 'yellow', description: 'Some symptoms present' }
    return { level: 'Minimal', color: 'green', description: 'You seem to be doing well' }
  }

  const handleOpenModal = () => {
    if (answers.includes(null)) {
      alert('Please answer all questions before submitting')
      return
    }
    setShowModal(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await submitAssessment(userId, id, answers)
      setResult(calculateScore())
      setShowModal(false)
    } catch (error) {
      console.error('Error submitting assessment:', error)
      alert('Error submitting assessment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading assessment...</div>
  }

  if (!assessment) {
    return <div className="text-center py-8">Assessment not found</div>
  }

  // Show results if submitted
  if (result) {
    const severity = getSeverityLevel(result.percentage)
    
    // Map severity colors to Tailwind classes
    const severityClasses = {
      red: { bg: 'bg-red-50', border: 'border-red-500', textMain: 'text-red-900', textSub: 'text-red-800' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-500', textMain: 'text-orange-900', textSub: 'text-orange-800' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-500', textMain: 'text-yellow-900', textSub: 'text-yellow-800' },
      green: { bg: 'bg-green-50', border: 'border-green-500', textMain: 'text-green-900', textSub: 'text-green-800' }
    }
    
    const classes = severityClasses[severity.color]
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Assessment Complete</h1>
            <p className="text-gray-600">{assessment.name}</p>
          </div>

          <div className={`${classes.bg} border-l-4 ${classes.border} p-6 rounded-lg mb-6`}>
            <div className="text-center">
              <p className={`${classes.textMain} font-semibold text-xl mb-2`}>
                Severity: {severity.level}
              </p>
              <p className={`${classes.textSub} mb-4`}>
                {severity.description}
              </p>
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {result.percentage}%
              </div>
              <p className="text-gray-600 text-sm">
                Score: {result.total} out of {result.max}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What This Means</h3>
            <p className="text-blue-800 text-sm mb-3">
              Your assessment has been saved. A higher score indicates more symptoms or concerns in this area.
            </p>
            <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
              <li>Track your progress by retaking this assessment over time</li>
              <li>Share these results with a healthcare provider if helpful</li>
              <li>This assessment is not a diagnosis - consult a professional for medical advice</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/assessments')}
              className="flex-1 bg-mindwell-600 hover:bg-mindwell-700 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              Back to Assessments
            </button>
            <button
              onClick={() => {
                setResult(null)
                setAnswers(new Array(assessment.questions.length).fill(null))
              }}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition"
            >
              Retake Assessment
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{assessment.name}</h1>
        <p className="text-gray-600 mb-6">{assessment.description}</p>

        <div className="space-y-8">
          {assessment.questions.map((question, qIndex) => (
            <div key={qIndex} className="border-b pb-6">
              <p className="font-semibold text-gray-800 mb-4">
                {qIndex + 1}. {question.text}
              </p>
              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <label key={oIndex} className="flex items-center p-3 border rounded-lg hover:bg-mindwell-50 cursor-pointer transition">
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      value={oIndex}
                      checked={answers[qIndex] === oIndex}
                      onChange={() => handleAnswerChange(qIndex, oIndex)}
                      className="w-4 h-4 text-mindwell-600"
                    />
                    <span className="ml-3 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleOpenModal}
            className="w-full bg-mindwell-600 hover:bg-mindwell-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            Submit Assessment
          </button>
        </div>

        {/* Modal for Confirmation */}
        <Modal
          isOpen={showModal}
          title="Submit Assessment"
          onClose={() => setShowModal(false)}
          onConfirm={handleSubmit}
          confirmText={submitting ? 'Submitting...' : 'Confirm & Submit'}
          cancelText="Cancel"
          showCancel={true}
        >
          <div className="space-y-3">
            <p className="text-gray-700 font-semibold">Ready to submit your assessment?</p>
            <p className="text-gray-600 text-sm">
              Your responses will be saved for your personal tracking. This assessment is not a diagnosis and should not replace professional medical advice.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> You can retake this assessment anytime to track your progress.
              </p>
            </div>
          </div>
        </Modal>

        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> Your responses are saved for your personal tracking. This assessment is not a diagnosis and should not replace professional medical advice.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AssessmentDetail
