import React from 'react'
import BeastCompanion from './BeastCompanion'

/**
 * Beasts page wrapper for standalone app
 * Simple container for the Beast Companion component
 */
export default function Beasts({ userId }) {
  return (
    <div className="w-full">
      <BeastCompanion userId={userId} />
    </div>
  )
}
