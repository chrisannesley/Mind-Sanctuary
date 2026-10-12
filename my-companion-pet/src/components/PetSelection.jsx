import React, { useState } from 'react'
import { AVAILABLE_PETS } from '../data/pets'

/**
 * Pet Selection Screen
 * Allows users to choose their companion pet
 */
export default function PetSelection({ onSelectPet }) {
  const [selectedType, setSelectedType] = useState('All')
  
  const petTypes = ['All', 'Animal', 'Mythical', 'Magical', 'Fantasy', 'Tech', 'Insect']
  
  const filteredPets = selectedType === 'All' 
    ? AVAILABLE_PETS 
    : AVAILABLE_PETS.filter(pet => pet.type === selectedType)

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 py-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 mb-12 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent mb-4">
          🐾 Choose Your Companion!
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Pick your perfect pet friend! You can always get more later.
        </p>

        {/* Type Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {petTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-2 rounded-full font-bold transition ${
                selectedType === type
                  ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:shadow-md border-2 border-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Pet Grid */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPets.map(pet => (
            <div
              key={pet.id}
              onClick={() => onSelectPet(pet.id)}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 overflow-hidden p-6 text-center cursor-pointer"
            >
              {/* Background gradient */}
              <div 
                className="absolute inset-0 opacity-10 group-hover:opacity-20 transition"
                style={{ backgroundColor: pet.color }}
              ></div>

              {/* Content */}
              <div className="relative z-10">
                {/* Pet Emoji */}
                <div className="text-6xl mb-4 group-hover:scale-125 transition-transform">
                  {pet.emoji}
                </div>

                {/* Pet Name */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {pet.name}
                </h3>

                {/* Pet Type Badge */}
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: `${pet.color}20`,
                      color: pet.color
                    }}
                  >
                    {pet.type}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {pet.description}
                </p>

                {/* Select Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectPet(pet.id)
                  }}
                  className="w-full mt-auto bg-gradient-to-r from-rose-500 to-orange-500 text-white py-2 rounded-lg font-bold hover:shadow-lg transition"
                >
                  Choose {pet.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-6xl mx-auto px-4 mt-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">💡 Did you know?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-4">
            Each pet has its own unique personality! Some are playful and energetic, while others are calm and wise. 
            Choose the one that matches YOUR personality best! 🌟
          </p>
          <p className="text-sm text-gray-500">
            You can always create more pets later if you want to try different ones!
          </p>
        </div>
      </div>
    </div>
  )
}
