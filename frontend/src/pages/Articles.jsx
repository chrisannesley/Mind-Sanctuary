import React, { useState, useEffect } from 'react'
import { getArticles } from '../utils/api'

function Articles() {
  const [articles, setArticles] = useState([])
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await getArticles()
        setArticles(response.data)
      } catch (error) {
        console.error('Error loading articles:', error)
      } finally {
        setLoading(false)
      }
    }
    loadArticles()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading articles...</div>
  }

  const categoryEmojis = {
    depression: '😔',
    anxiety: '😰',
    ptsd: '⚠️',
    sleep: '😴',
    mindfulness: '🧘',
    resilience: '💪',
    wellness: '🌟',
    relationships: '❤️'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Mental Health Articles</h1>
      <p className="text-gray-600 mb-8">Learn more about mental health topics and find helpful information</p>

      {selectedArticle ? (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <button
            onClick={() => setSelectedArticle(null)}
            className="text-mindwell-600 hover:text-mindwell-700 font-semibold mb-4"
          >
            ← Back to Articles
          </button>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{selectedArticle.title}</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedArticle.tags.map((tag) => (
              <span key={tag} className="bg-mindwell-100 text-mindwell-700 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedArticle.content}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 cursor-pointer border-l-4 border-mindwell-500 hover:scale-105 transform"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-800 flex-1">{article.title}</h3>
                <span className="text-2xl ml-2">{categoryEmojis[article.category] || '📚'}</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.content}</p>
              <div className="flex flex-wrap gap-2">
                {article.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Articles
