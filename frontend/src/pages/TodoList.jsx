import React, { useState, useEffect } from 'react'
import { getTodos, createTodo, updateTodo, deleteTodo } from '../utils/api'

function TodoList({ userId }) {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadTodos()
  }, [userId])

  const loadTodos = async () => {
    try {
      const response = await getTodos(userId)
      setTodos(response.data)
    } catch (error) {
      console.error('Error loading todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    setSubmitting(true)
    try {
      const response = await createTodo(userId, newTodo)
      setTodos([...todos, response.data])
      setNewTodo('')
    } catch (error) {
      console.error('Error adding todo:', error)
      alert('Error adding todo. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleTodo = async (todo) => {
    try {
      const response = await updateTodo(todo.id, { completed: !todo.completed })
      setTodos(todos.map(t => t.id === todo.id ? response.data : t))
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const handleDeleteTodo = async (todoId) => {
    try {
      await deleteTodo(todoId)
      setTodos(todos.filter(t => t.id !== todoId))
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading to-do list...</div>
  }

  const completedCount = todos.filter(t => t.completed).length
  const totalCount = todos.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My To-Do List</h1>
        <p className="text-gray-600 mb-6">Track your mental health and wellness goals</p>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-sm font-semibold text-mindwell-600">{completedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-mindwell-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">{progress}% complete</p>
          </div>
        )}

        {/* Add New Todo */}
        <form onSubmit={handleAddTodo} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mindwell-500"
            />
            <button
              type="submit"
              disabled={submitting || !newTodo.trim()}
              className="bg-mindwell-600 hover:bg-mindwell-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              {submitting ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>

        {/* Todo List */}
        {todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">No tasks yet</p>
            <p className="text-sm">Add a task to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo)}
                  className="w-5 h-5 text-mindwell-600 rounded cursor-pointer"
                />
                <span
                  className={`flex-1 ${
                    todo.completed
                      ? 'line-through text-gray-500'
                      : 'text-gray-800'
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700 font-semibold text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for Your To-Do List</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Start with small, achievable tasks</li>
            <li>• Break larger goals into smaller steps</li>
            <li>• Celebrate completing tasks, no matter how small</li>
            <li>• Be flexible - it's okay to adjust your list</li>
            <li>• Focus on progress, not perfection</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default TodoList
