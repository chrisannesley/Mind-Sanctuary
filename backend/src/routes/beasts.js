/**
 * Beast Companion API Routes
 * Handles all beast-related endpoints
 */

import express from 'express'
import BeastModel from '../models/Beast.js'

const router = express.Router()

/**
 * GET /api/beasts/:userId
 * Get all beasts for a user
 */
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params
    const beasts = BeastModel.getUserBeasts(userId)
    
    // Apply decay to all beasts
    const updatedBeasts = beasts.map(beast => {
      BeastModel.applyDecay(beast)
      const { beast: evolved } = BeastModel.evolveBeast(beast)
      return evolved
    })
    
    res.json(updatedBeasts)
  } catch (error) {
    console.error('Error getting beasts:', error)
    res.status(500).json({ error: 'Failed to get beasts' })
  }
})

/**
 * GET /api/beasts/:userId/current
 * Get current (alive) beast for a user
 */
router.get('/:userId/current', (req, res) => {
  try {
    const { userId } = req.params
    let beast = BeastModel.getCurrentBeast(userId)
    
    if (beast) {
      BeastModel.applyDecay(beast)
      const { beast: evolved } = BeastModel.evolveBeast(beast)
      beast = evolved
      
      // Add calculated fields
      const age = BeastModel.calculateAge(beast.birthDate)
      beast.age = age
      beast.stage = BeastModel.determineStage(beast.birthDate, age)
    }
    
    res.json(beast)
  } catch (error) {
    console.error('Error getting current beast:', error)
    res.status(500).json({ error: 'Failed to get current beast' })
  }
})

/**
 * POST /api/beasts/:userId/generate
 * Generate a new beast from user data
 */
router.post('/:userId/generate', (req, res) => {
  try {
    const { userId } = req.params
    const userData = req.body || {}
    
    // Check if user already has a living beast
    const currentBeast = BeastModel.getCurrentBeast(userId)
    if (currentBeast && currentBeast.isAlive) {
      return res.status(400).json({ 
        error: 'User already has an active beast. Resurrect or wait for natural death.'
      })
    }
    
    // Generate new beast
    const beast = BeastModel.createBeast(parseInt(userId), userData)
    
    // Add calculated fields
    const age = BeastModel.calculateAge(beast.birthDate)
    beast.age = age
    beast.generatedImage = beast.genetics.archetypeEmoji
    
    res.status(201).json(beast)
  } catch (error) {
    console.error('Error generating beast:', error)
    res.status(500).json({ error: 'Failed to generate beast' })
  }
})

/**
 * GET /api/beasts/:beastId
 * Get specific beast by ID
 */
router.get('/detail/:beastId', (req, res) => {
  try {
    const { beastId } = req.params
    let beast = BeastModel.getBeastById(beastId)
    
    if (!beast) {
      return res.status(404).json({ error: 'Beast not found' })
    }
    
    BeastModel.applyDecay(beast)
    const { beast: evolved } = BeastModel.evolveBeast(beast)
    
    // Add calculated fields
    const age = BeastModel.calculateAge(evolved.birthDate)
    evolved.age = age
    evolved.stage = BeastModel.determineStage(evolved.birthDate, age)
    evolved.generatedImage = evolved.genetics.archetypeEmoji
    
    res.json(evolved)
  } catch (error) {
    console.error('Error getting beast:', error)
    res.status(500).json({ error: 'Failed to get beast' })
  }
})

/**
 * PUT /api/beasts/:beastId/care/:action
 * Record a care action (feed, play, pet, groom, rest, reflect)
 */
router.put('/:beastId/care/:action', (req, res) => {
  try {
    const { beastId, action } = req.params
    
    // Validate action
    const validActions = ['feed', 'play', 'pet', 'groom', 'rest', 'reflect', 'checkin']
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: `Invalid action: ${action}` })
    }
    
    let beast = BeastModel.getBeastById(beastId)
    if (!beast) {
      return res.status(404).json({ error: 'Beast not found' })
    }
    
    // Apply decay first
    BeastModel.applyDecay(beast)
    
    // Record action
    BeastModel.recordCareAction(beast, action)
    
    // Check for evolution
    const { beast: evolved } = BeastModel.evolveBeast(beast)
    
    // Save updates
    const updated = BeastModel.updateBeast(beastId, evolved)
    
    // Add calculated fields
    const age = BeastModel.calculateAge(updated.birthDate)
    updated.age = age
    updated.generatedImage = updated.genetics.archetypeEmoji
    
    res.json(updated)
  } catch (error) {
    console.error('Error recording care action:', error)
    res.status(500).json({ error: 'Failed to record care action' })
  }
})

/**
 * PUT /api/beasts/:beastId/health
 * Update health based on check-in data
 * Body: { moodScore, sleepHours, stressLevel }
 */
router.put('/:beastId/health', (req, res) => {
  try {
    const { beastId } = req.params
    const checkInData = req.body || {}
    
    let beast = BeastModel.getBeastById(beastId)
    if (!beast) {
      return res.status(404).json({ error: 'Beast not found' })
    }
    
    // Apply decay
    BeastModel.applyDecay(beast)
    
    // Update health from check-in
    BeastModel.updateHealthFromCheckIn(beast, checkInData)
    
    // Check for evolution
    const { beast: evolved } = BeastModel.evolveBeast(beast)
    
    // Save updates
    const updated = BeastModel.updateBeast(beastId, evolved)
    
    // Add calculated fields
    const age = BeastModel.calculateAge(updated.birthDate)
    updated.age = age
    updated.generatedImage = updated.genetics.archetypeEmoji
    
    res.json(updated)
  } catch (error) {
    console.error('Error updating health:', error)
    res.status(500).json({ error: 'Failed to update health' })
  }
})

/**
 * POST /api/beasts/:beastId/resurrect
 * Bring a dead beast back to life
 */
router.post('/:beastId/resurrect', (req, res) => {
  try {
    const { beastId } = req.params
    
    let beast = BeastModel.getBeastById(beastId)
    if (!beast) {
      return res.status(404).json({ error: 'Beast not found' })
    }
    
    if (beast.isAlive) {
      return res.status(400).json({ error: 'Beast is still alive' })
    }
    
    const resurrected = BeastModel.resurrectBeast(beastId)
    
    // Add calculated fields
    const age = BeastModel.calculateAge(resurrected.birthDate)
    resurrected.age = age
    resurrected.generatedImage = resurrected.genetics.archetypeEmoji
    
    res.json(resurrected)
  } catch (error) {
    console.error('Error resurrecting beast:', error)
    res.status(500).json({ error: 'Failed to resurrect beast' })
  }
})

/**
 * GET /api/beasts/:userId/gallery
 * Get all past beasts (memorial gallery)
 */
router.get('/:userId/gallery', (req, res) => {
  try {
    const { userId } = req.params
    const beasts = BeastModel.getUserBeasts(userId)
    
    // Add calculated fields to all
    const bestsWithAge = beasts.map(beast => {
      const age = BeastModel.calculateAge(beast.birthDate)
      return {
        ...beast,
        age,
        generatedImage: beast.genetics.archetypeEmoji,
        stage: BeastModel.determineStage(beast.birthDate, age)
      }
    })
    
    res.json(bestsWithAge)
  } catch (error) {
    console.error('Error getting gallery:', error)
    res.status(500).json({ error: 'Failed to get gallery' })
  }
})

export default router
