import express from "express"
import cors from "cors"
import bodyParser from "body-parser"

const app = express()
const PORT = process.env.PORT || 3003

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5175",
  credentials: true
}))
app.use(bodyParser.json())
app.use(express.json())

// Nordic Runes Data
const RUNES = [
  { id: 1, name: "Fehu", symbol: "ᚠ", meaning: "Cattle, wealth, abundance", reversed: "Loss, poverty, greed" },
  { id: 2, name: "Uruz", symbol: "ᚢ", meaning: "Strength, wild ox, power", reversed: "Weakness, loss of control" },
  { id: 3, name: "Thurisaz", symbol: "ᚦ", meaning: "Thor, protection, challenge", reversed: "Danger, vulnerability" },
  { id: 4, name: "Ansuz", symbol: "ᚨ", meaning: "God, communication, wisdom", reversed: "Miscommunication, confusion" },
  { id: 5, name: "Raido", symbol: "ᚱ", meaning: "Journey, travel, wheel", reversed: "Delay, recklessness" },
  { id: 6, name: "Kenaz", symbol: "ᚲ", meaning: "Torch, light, knowledge", reversed: "Ignorance, darkness" },
  { id: 7, name: "Gebo", symbol: "ᚳ", meaning: "Gift, partnership, balance", reversed: "Debt, imbalance" },
  { id: 8, name: "Wunjo", symbol: "ᚹ", meaning: "Joy, harmony, light", reversed: "Sorrow, discord" },
  { id: 9, name: "Hagalaz", symbol: "ᚼ", meaning: "Hail, disruption, transformation", reversed: "Chaos, destruction" },
  { id: 10, name: "Nauthiz", symbol: "ᚾ", meaning: "Need, necessity, friction", reversed: "Constraint, hardship" },
  { id: 11, name: "Isa", symbol: "ᚣ", meaning: "Ice, stillness, pause", reversed: "Stagnation, frozen situations" },
  { id: 12, name: "Jera", symbol: "ᚤ", meaning: "Year, harvest, cycle", reversed: "Delays, broken cycle" },
  { id: 13, name: "Eihwaz", symbol: "ᚥ", meaning: "Yew, protection, death/rebirth", reversed: "Unreliability, stagnation" },
  { id: 14, name: "Perthro", symbol: "ᚦ", meaning: "Fate, mystery, initiation", reversed: "Misfortune, deception" },
  { id: 15, name: "Algiz", symbol: "ᚨ", meaning: "Protection, defense, shield", reversed: "Vulnerability, danger" },
  { id: 16, name: "Sowilo", symbol: "ᚳ", meaning: "Sun, success, wholeness", reversed: "Failure, lack of energy" },
  { id: 17, name: "Tiwaz", symbol: "ᛏ", meaning: "Tyr, courage, victory", reversed: "Defeat, cowardice" },
  { id: 18, name: "Berkano", symbol: "ᛒ", meaning: "Birch, growth, fertility", reversed: "Stagnation, infertility" },
  { id: 19, name: "Ehwaz", symbol: "ᛖ", meaning: "Horse, movement, partnership", reversed: "Stagnation, conflict" },
  { id: 20, name: "Mannaz", symbol: "ᛘ", meaning: "Man, self, human condition", reversed: "Selfishness, weakness" },
  { id: 21, name: "Laguz", symbol: "ᛚ", meaning: "Water, flow, emotions", reversed: "Stagnation, emotional turmoil" },
  { id: 22, name: "Ingwaz", symbol: "ᛝ", meaning: "Ing, fertility, new beginning", reversed: "Stagnation, lack of progress" },
  { id: 23, name: "Othala", symbol: "ᛟ", meaning: "Inheritance, home, property", reversed: "Loss, displacement" },
  { id: 24, name: "Dagaz", symbol: "ᛞ", meaning: "Day, breakthrough, clarity", reversed: "Confusion, stagnation" }
]

// Question contexts
const QUESTION_CONTEXTS = {
  love: {
    title: "Love & Relationships",
    interpretation: "This reading explores matters of the heart, romance, and personal relationships."
  },
  career: {
    title: "Career & Work",
    interpretation: "This reading provides insight into your professional path and work situation."
  },
  health: {
    title: "Health & Wellness",
    interpretation: "This reading addresses your physical and mental well-being."
  },
  finance: {
    title: "Finance & Wealth",
    interpretation: "This reading explores your financial situation and material prosperity."
  },
  personal: {
    title: "Personal Growth",
    interpretation: "This reading focuses on self-development and personal transformation."
  },
  general: {
    title: "General Guidance",
    interpretation: "This reading provides general insight and guidance for your current situation."
  }
}

// Health endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Nordic Runes backend is running" })
})

// Get all runes
app.get("/api/runes", (req, res) => {
  res.json(RUNES)
})

// Get single rune by ID
app.get("/api/runes/:id", (req, res) => {
  const rune = RUNES.find(r => r.id === parseInt(req.params.id))
  if (!rune) return res.status(404).json({ error: "Rune not found" })
  res.json(rune)
})

// Get question contexts
app.get("/api/contexts", (req, res) => {
  res.json(QUESTION_CONTEXTS)
})

// Generate comprehensive rune interpretation
function generateRuneInterpretation(stones, context, contextKey) {
  const contextData = QUESTION_CONTEXTS[contextKey]
  let reading = ""

  if (stones.length === 1) {
    const stone = stones[0]
    const meaning = stone.reversed ? stone.reversed : stone.meaning
    
    reading = `
## Your Single Rune Reading

**The Rune: ${stone.name} (${stone.symbol})**

In the context of **${contextData.title}**, this rune draws your attention to:

**Core Message:** ${meaning}

**In-Depth Interpretation:**
${generateSingleRuneInsight(stone, contextKey)}

**What This Means For You:**
${generateContextualAdvice(stone, contextKey)}

**Guidance:**
${generateGuidance(stone, contextKey)}
    `.trim()
  } else if (stones.length === 2) {
    const current = stones[0]
    const outcome = stones[1]
    
    reading = `
## Your Two Rune Reading

**Position 1 - Current Situation: ${current.name} (${current.symbol})**
${current.reversed ? "*(Reversed)*" : "*(Upright)*"}

${generateRuneDetail(current, "current", contextKey)}

**Position 2 - Potential Outcome: ${outcome.name} (${outcome.symbol})**
${outcome.reversed ? "*(Reversed)*" : "*(Upright)*"}

${generateRuneDetail(outcome, "outcome", contextKey)}

**The Relationship Between These Runes:**
${generateCombinationInsight([current, outcome], contextKey)}

**Your Path Forward:**
${generateTwoRuneAdvice([current, outcome], contextKey)}

**Overall Message:**
${generateOverallMessage([current, outcome], contextKey)}
    `.trim()
  } else {
    const past = stones[0]
    const present = stones[1]
    const future = stones[2]
    
    reading = `
## Your Three Rune Reading

**Position 1 - Past Influence: ${past.name} (${past.symbol})**
${past.reversed ? "*(Reversed)*" : "*(Upright)*"}

${generateRuneDetail(past, "past", contextKey)}

**Position 2 - Present Situation: ${present.name} (${present.symbol})**
${present.reversed ? "*(Reversed)*" : "*(Upright)*"}

${generateRuneDetail(present, "present", contextKey)}

**Position 3 - Future Guidance: ${future.name} (${future.symbol})**
${future.reversed ? "*(Reversed)*" : "*(Upright)*"}

${generateRuneDetail(future, "future", contextKey)}

**How These Three Runes Connect:**
${generateThreeRuneFlow([past, present, future], contextKey)}

**Your Journey Revealed:**
${generateThreeRuneAdvice([past, present, future], contextKey)}

**The Complete Picture:**
${generateCompleteNarrative([past, present, future], contextKey)}
    `.trim()
  }

  return reading
}

function generateSingleRuneInsight(stone, context) {
  const contextInsights = {
    love: `This rune speaks directly to your romantic situation. ${stone.meaning || stone.reversed} suggests deep truths about connection and intimacy.`,
    career: `In your professional life, this rune indicates ${stone.meaning || stone.reversed}. Pay attention to how this energy manifests in your work.`,
    health: `Regarding your well-being, this rune advises focus on ${stone.meaning || stone.reversed}. Consider both physical and emotional aspects.`,
    finance: `Your financial path is illuminated by ${stone.meaning || stone.reversed}. This suggests ${stone.reversed ? "caution and reassessment" : "opportunity and growth"}.`,
    personal: `In your personal growth, this rune emphasizes ${stone.meaning || stone.reversed}. This is a key area for your development.`,
    general: `The universe draws your attention to ${stone.meaning || stone.reversed}. This wisdom applies broadly to your current situation.`
  }
  return contextInsights[context] || contextInsights.general
}

function generateContextualAdvice(stone, context) {
  if (context === "love") {
    return stone.reversed 
      ? `There may be communication barriers or unresolved feelings. Take time to reflect on what you truly need in relationships.`
      : `This is a time of positive energy in matters of the heart. Trust your intuition and be open to connection.`
  } else if (context === "career") {
    return stone.reversed
      ? `You may face obstacles or delays in your career path. Stay adaptable and focus on skill development.`
      : `Professional opportunities are aligned in your favor. Take bold steps forward with confidence.`
  }
  return "Reflect on this rune's message and how it applies to your unique situation."
}

function generateGuidance(stone, context) {
  return stone.reversed
    ? `The reversed energy suggests you're being called to work with this rune's shadow aspects. Consider what fears or limitations might be surfacing.`
    : `Embrace this rune's positive energy. It represents a natural flow that supports your current path.`
}

function generateRuneDetail(stone, position, context) {
  const positionDescriptions = {
    current: "This represents what is happening right now in your situation.",
    outcome: "This shows where things are moving or what will likely manifest.",
    past: "This shows the foundation and influences that brought you here.",
    present: "This represents the energies and forces acting upon you now.",
    future: "This reveals the direction of unfoldment and the wisdom needed."
  }

  let detail = `\n${positionDescriptions[position]}\n\n`
  detail += `**${stone.reversed ? "Reversed" : "Upright"} Energy:** ${stone.reversed ? stone.reversed : stone.meaning}\n\n`
  
  if (stone.reversed) {
    detail += `This rune appears reversed, suggesting challenges, hidden lessons, or the need to integrate its shadow aspects.\n`
  } else {
    detail += `This rune appears upright, bringing its full positive potential to your situation.\n`
  }

  return detail
}

function generateCombinationInsight(stones, context) {
  const stone1 = stones[0]
  const stone2 = stones[1]
  
  const isPositive = !stone1.reversed && !stone2.reversed
  const hasChallenge = stone1.reversed || stone2.reversed
  
  let insight = `\n`
  
  if (isPositive) {
    insight += `Both runes appear upright, suggesting a harmonious flow. ${stone1.name} supports the emergence of ${stone2.name}, indicating aligned energies moving toward positive resolution.`
  } else if (hasChallenge) {
    insight += `One or more runes appear reversed, suggesting tension or transformation. This indicates growth requiring effort—${stone1.name} and ${stone2.name} together reveal what needs to shift.`
  }
  
  insight += `\n\nTogether, these runes suggest: ${combineRuneMeanings(stone1, stone2)}`
  
  return insight
}

function generateTwoRuneAdvice(stones, context) {
  const current = stones[0]
  const outcome = stones[1]
  
  let advice = `The current rune (${current.name}) suggests where you are, while the outcome rune (${current.name}) shows the direction of movement.\n\n`
  
  if (current.reversed && !outcome.reversed) {
    advice += `You're moving from challenge toward resolution. Trust the process and keep moving forward despite current difficulties.`
  } else if (!current.reversed && outcome.reversed) {
    advice += `Be cautious as you move forward. What seems positive now may require adjustment or reconsideration.`
  } else if (current.reversed && outcome.reversed) {
    advice += `Both positions suggest significant transformation. This may be a time of deep change leading to breakthrough.`
  } else {
    advice += `The positive flow from current to outcome suggests confidence is warranted. Your path is clear.`
  }
  
  return advice
}

function generateThreeRuneFlow(stones, context) {
  const past = stones[0]
  const present = stones[1]
  const future = stones[2]
  
  return `\n${past.name} has brought you to this moment with ${present.name}, and now you're invited into ${future.name}. This represents your unfolding story. ${past.reversed ? "Past challenges" : "Past strengths"} have shaped you; ${present.reversed ? "current obstacles" : "present opportunities"} test and develop you; and ${future.reversed ? "future growth comes through integration" : "the future unfolds with clarity"}.\n`
}

function generateThreeRuneAdvice(stones, context) {
  const past = stones[0]
  const present = stones[1]
  const future = stones[2]
  
  let advice = `\n`
  
  const reversedCount = [past.reversed, present.reversed, future.reversed].filter(r => r).length
  
  if (reversedCount === 0) {
    advice += `All three runes appear upright—a rare and powerful alignment. You have momentum. Your past wisdom, present clarity, and future potential are all in positive flow. Move forward with confidence.`
  } else if (reversedCount === 1) {
    advice += `One rune appears reversed, suggesting a specific area requiring attention. Navigate this consciously while leveraging the positive energy of the other two.`
  } else if (reversedCount === 2) {
    advice += `Two runes reversed indicate significant transition. You're being asked to release old patterns and embrace deep change. The upright rune offers guidance through this transformation.`
  } else {
    advice += `All three appear reversed—a powerful invitation to transformation. What seems blocked is actually inviting you to completely reorient your approach. This is profound medicine.`
  }
  
  return advice
}

function generateCompleteNarrative(stones, context) {
  const past = stones[0]
  const present = stones[1]
  const future = stones[2]
  const contextInfo = QUESTION_CONTEXTS[context]
  
  return `\n\nIn the realm of ${contextInfo.title}, your three-rune reading reveals a complete arc. ${past.name} has been your teacher, ${present.name} is your present ally, and ${future.name} is your destiny's whisper. Together, they tell the story of your becoming in this area of your life. The wisdom you carry from the past, the awareness you cultivate now, and the potential you move toward are all expressions of one unified journey toward deeper truth and fulfillment.\n`
}

function combineRuneMeanings(stone1, stone2) {
  return `${stone1.name}'s energy combines with ${stone2.name}'s wisdom to reveal your complete situation.`
}

function generateOverallMessage(stones, context) {
  if (!Array.isArray(stones) || stones.length !== 2) {
    return `Your reading reveals movement and transformation unfolding in your situation.`
  }

  const current = stones[0]
  const outcome = stones[1]

  // Simple, clear messages based on whether runes are reversed
  const currentState = current.reversed 
    ? `facing obstacles or resistance`
    : `in a natural flow`
  
  const outcomeState = outcome.reversed 
    ? `requiring your attention and care`
    : `moving toward clarity and resolution`

  const generalMessages = {
    love: `Your heart's journey is shifting. You're currently ${currentState}, and this is guiding you toward a relationship situation ${outcomeState}. What matters now is staying open and authentic.`,
    
    career: `Your work path is evolving. Right now you're ${currentState}, but this is leading you to ${outcomeState}. Trust that challenges often precede growth.`,
    
    health: `Your wellness is in transition. You're ${currentState}, which is preparing you for a phase ${outcomeState}. Your body and mind are working together for your benefit.`,
    
    finance: `Your financial landscape is shifting. Currently you're ${currentState}, and this is directing you toward circumstances ${outcomeState}. The universe adjusts what needs adjusting.`,
    
    personal: `Your inner world is transforming. You're ${currentState}, which is exactly where you need to be to grow into ${outcomeState}. Trust your journey.`,
    
    general: `Your life is moving through a natural cycle. You're ${currentState}, and this is guiding you toward a phase ${outcomeState}. Every chapter has purpose.`
  }

  return generalMessages[context] || generalMessages.general
}

// Draw runes (1-3 stones)
app.post("/api/draw", (req, res) => {
  const { count, context } = req.body
  
  if (!count || count < 1 || count > 3) {
    return res.status(400).json({ error: "Must draw between 1 and 3 runes" })
  }
  
  if (!context || !QUESTION_CONTEXTS[context]) {
    return res.status(400).json({ error: "Invalid context" })
  }

  const drawn = []
  const usedIds = new Set()
  
  // Draw unique runes
  while (drawn.length < count) {
    const randomId = Math.floor(Math.random() * RUNES.length) + 1
    if (!usedIds.has(randomId)) {
      usedIds.add(randomId)
      const rune = RUNES.find(r => r.id === randomId)
      const isReversed = Math.random() > 0.5
      drawn.push({
        ...rune,
        reversed: isReversed,
        interpretation: isReversed ? rune.reversed : rune.meaning
      })
    }
  }

  // Prepare reading based on number of stones
  let readingType = ""
  let readingDescription = ""
  
  if (count === 1) {
    readingType = "Single Rune"
    readingDescription = "A focused answer to your question"
  } else if (count === 2) {
    readingType = "Two Rune"
    readingDescription = "Shows the current situation and potential outcome"
  } else {
    readingType = "Three Rune"
    readingDescription = "Past influence, present situation, and future guidance"
  }

  // Generate comprehensive reading
  const comprehensiveReading = generateRuneInterpretation(drawn, QUESTION_CONTEXTS[context], context)

  res.json({
    context: QUESTION_CONTEXTS[context],
    readingType,
    readingDescription,
    stones: drawn,
    comprehensiveReading,
    timestamp: new Date().toISOString()
  })
})

// Save a reading (optional, for future implementation)
app.post("/api/readings", (req, res) => {
  const { context, stones, notes } = req.body
  
  if (!context || !stones) {
    return res.status(400).json({ error: "Context and stones are required" })
  }

  const reading = {
    id: Date.now(),
    context,
    stones,
    notes: notes || "",
    timestamp: new Date().toISOString()
  }

  res.status(201).json(reading)
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong" })
})

app.listen(PORT, () => {
  console.log(`✅ Nordic Runes backend running on http://localhost:${PORT}`)
})
