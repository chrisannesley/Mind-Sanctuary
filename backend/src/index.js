import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import ClaudeReflectionService from "./claudeService.js"
import CompanionService from "./companionService.js"
import ElevenLabsTTSService from "./elevenlabsService.js"
import beastsRouter from "./routes/beasts.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = process.env.DB_PATH || path.join(__dirname, "../mindwell.db")

const app = express()
const PORT = process.env.PORT || 3002

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)
    const allowed = [
      process.env.FRONTEND_URL || 'http://localhost:5180',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5180',
    ]
    // Also allow any Vercel preview URLs
    if (allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true)
    }
    callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true
}))
app.use(bodyParser.json())
app.use(express.json())

// Assessment data
const ASSESSMENTS = {
  phq9: {
    id: "phq9",
    name: "PHQ-9 (Depression)",
    description: "Patient Health Questionnaire - 9 item depression scale",
    category: "depression",
    questions: [
      { id: 1, text: "Little interest or pleasure in doing things", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { id: 2, text: "Feeling down, depressed, or hopeless", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { id: 3, text: "Trouble falling or staying asleep, or sleeping too much", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { id: 4, text: "Feeling tired or having little energy", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { id: 5, text: "Poor appetite or overeating", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { id: 6, text: "Feeling bad about yourself or that you are a failure", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { id: 7, text: "Trouble concentrating on things", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { id: 8, text: "Moving or speaking so slowly that others have noticed", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { id: 9, text: "Thoughts that you would be better off dead", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] }
    ]
  },
  gad7: {
    id: "gad7",
    name: "GAD-7 (Anxiety)",
    description: "Generalized Anxiety Disorder - 7 item anxiety scale",
    category: "anxiety",
    questions: [
      { id: 1, text: "Feeling nervous, anxious or on edge", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { id: 2, text: "Not being able to stop or control worrying", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { id: 3, text: "Worrying too much about different things", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { id: 4, text: "Trouble relaxing", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { id: 5, text: "Being so restless that it is hard to sit still", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { id: 6, text: "Becoming easily annoyed or irritable", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { id: 7, text: "Feeling afraid as if something awful might happen", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] }
    ]
  },
  pcl5: {
    id: "pcl5",
    name: "PCL-5 (PTSD)",
    description: "PTSD Checklist for DSM-5",
    category: "ptsd",
    questions: [
      { id: 1, text: "Repeated, disturbing, and unwanted memories of the stressful experience", options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"] },
      { id: 2, text: "Repeated, disturbing dreams of the stressful experience", options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"] },
      { id: 3, text: "Suddenly feeling or acting as if the stressful experience were happening again", options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"] },
      { id: 4, text: "Feeling very upset when reminded of the stressful experience", options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"] },
      { id: 5, text: "Having strong negative beliefs about yourself, other people, or the world", options: ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"] }
    ]
  },
  mdq: {
    id: "mdq",
    name: "MDQ (Bipolar Disorder)",
    description: "Mood Disorder Questionnaire",
    category: "bipolar",
    questions: [
      { id: 1, text: "Has there ever been a period when you were not your usual self and felt so good or so hyper that other people thought you were not your normal self?", options: ["No", "Yes"] },
      { id: 2, text: "If yes, did this period last several days or longer?", options: ["No", "Yes"] },
      { id: 3, text: "During this period, did you need less sleep than usual?", options: ["No", "Yes"] }
    ]
  },
  spin: {
    id: "spin",
    name: "SPIN (Social Anxiety)",
    description: "Social Phobia Inventory",
    category: "anxiety",
    questions: [
      { id: 1, text: "I am afraid of people in authority", options: ["Not at all", "A little bit", "Somewhat", "Very much", "Extremely"] },
      { id: 2, text: "I am bothered by blushing in front of people", options: ["Not at all", "A little bit", "Somewhat", "Very much", "Extremely"] },
      { id: 3, text: "Parties and social events scare me", options: ["Not at all", "A little bit", "Somewhat", "Very much", "Extremely"] }
    ]
  },
  isi: {
    id: "isi",
    name: "ISI (Insomnia)",
    description: "Insomnia Severity Index",
    category: "sleep",
    questions: [
      { id: 1, text: "How severe is your difficulty falling asleep?", options: ["None", "Mild", "Moderate", "Severe", "Very Severe"] },
      { id: 2, text: "How severe is your difficulty staying asleep?", options: ["None", "Mild", "Moderate", "Severe", "Very Severe"] },
      { id: 3, text: "How satisfied are you with your sleep pattern?", options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"] }
    ]
  },
  audit: {
    id: "audit",
    name: "AUDIT (Alcohol Use)",
    description: "Alcohol Use Disorders Identification Test",
    category: "substance",
    questions: [
      { id: 1, text: "How often do you have a drink containing alcohol?", options: ["Never", "Monthly or less", "2-4 times a month", "2-3 times a week", "4+ times a week"] },
      { id: 2, text: "How many drinks do you have on a typical day when drinking?", options: ["1-2", "3-4", "5-6", "7-9", "10+"] },
      { id: 3, text: "How often do you have 6 or more drinks on one occasion?", options: ["Never", "Less than monthly", "Monthly", "Weekly", "Daily or almost daily"] }
    ]
  },
  asrs: {
    id: "asrs",
    name: "ASRS (ADHD)",
    description: "Adult ADHD Self-Report Scale",
    category: "adhd",
    questions: [
      { id: 1, text: "How often do you have trouble wrapping up the final details of a project?", options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"] },
      { id: 2, text: "How often do you have difficulty getting things in order when you have to do a task?", options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"] },
      { id: 3, text: "How often do you have problems remembering appointments or obligations?", options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"] }
    ]
  },
  eat26: {
    id: "eat26",
    name: "EAT-26 (Eating Disorders)",
    description: "Eating Attitudes Test",
    category: "eating",
    questions: [
      { id: 1, text: "I am terrified about being overweight", options: ["Never", "Rarely", "Sometimes", "Often", "Usually", "Always"] },
      { id: 2, text: "I avoid eating when I am hungry", options: ["Never", "Rarely", "Sometimes", "Often", "Usually", "Always"] },
      { id: 3, text: "I find myself preoccupied with food", options: ["Never", "Rarely", "Sometimes", "Often", "Usually", "Always"] }
    ]
  }
}

// Articles data
const ARTICLES = [
  { id: 1, title: "Understanding Depression", category: "depression", content: "Depression is a common mental health condition characterized by persistent sadness and loss of interest in activities. It affects how you feel, think, and handle daily activities.", tags: ["depression", "mental-health"] },
  { id: 2, title: "Managing Anxiety Effectively", category: "anxiety", content: "Anxiety is a natural response to stress, but when it becomes overwhelming, it can interfere with daily life. Learn practical techniques to manage anxiety symptoms.", tags: ["anxiety", "coping"] },
  { id: 3, title: "PTSD Recovery and Healing", category: "ptsd", content: "Post-Traumatic Stress Disorder (PTSD) can develop after experiencing or witnessing a traumatic event. Recovery is possible with proper support and treatment.", tags: ["ptsd", "trauma"] },
  { id: 4, title: "Sleep Hygiene Tips", category: "sleep", content: "Good sleep is essential for mental health. Establish a consistent sleep schedule, create a relaxing bedtime routine, and optimize your sleep environment.", tags: ["sleep", "wellness"] },
  { id: 5, title: "Mindfulness and Meditation", category: "mindfulness", content: "Mindfulness practices can help reduce stress and anxiety. Start with just 5-10 minutes of daily meditation to experience the benefits.", tags: ["mindfulness", "meditation"] },
  { id: 6, title: "Building Resilience", category: "resilience", content: "Resilience is the ability to bounce back from adversity. Develop coping skills, maintain social connections, and practice self-care to build resilience.", tags: ["resilience", "coping"] },
  { id: 7, title: "Nutrition and Mental Health", category: "wellness", content: "What you eat affects your mental health. A balanced diet rich in nutrients supports brain function and emotional well-being.", tags: ["nutrition", "wellness"] },
  { id: 8, title: "Exercise for Mental Health", category: "wellness", content: "Regular physical activity is a powerful tool for managing mental health. Exercise releases endorphins and reduces stress hormones.", tags: ["exercise", "wellness"] },
  { id: 9, title: "Social Connection and Support", category: "relationships", content: "Strong social connections are vital for mental health. Reach out to friends, family, or support groups to build meaningful relationships.", tags: ["relationships", "support"] },
  { id: 10, title: "Self-Compassion and Self-Care", category: "wellness", content: "Treat yourself with the same kindness you would offer a good friend. Self-compassion and self-care are essential for mental well-being.", tags: ["self-care", "wellness"] }
]

// Coping strategies with guided steps and YouTube links
const COPING_STRATEGIES = [
  { 
    id: 1, 
    name: "Deep Breathing", 
    description: "Slow, deep breathing activates your parasympathetic nervous system, reducing stress and anxiety.", 
    technique: "Breathe in for 4 counts, hold for 4, exhale for 4. Repeat 5-10 times.",
    duration: "5 minutes",
    difficulty: "Easy",
    category: "calming",
    guided: true,
    youtubeUrl: "https://www.youtube.com/embed/Ex2dUEJJGgI",
    youtubeTitle: "4-7-8 Breathing Technique for Anxiety Relief",
    steps: [
      { number: 1, title: "Get Comfortable", instruction: "Sit or lie down in a comfortable position. Ensure your spine is straight and shoulders are relaxed." },
      { number: 2, title: "Breathe In", instruction: "Slowly breathe in through your nose for 4 counts. Feel your belly expand, not just your chest." },
      { number: 3, title: "Hold", instruction: "Hold your breath for 4 counts. Don't tense up—stay relaxed." },
      { number: 4, title: "Breathe Out", instruction: "Slowly exhale through your mouth for 4 counts. Make it deliberate and controlled." },
      { number: 5, title: "Repeat", instruction: "Complete 5-10 full cycles. Notice how you feel more calm and centered." },
      { number: 6, title: "Finish", instruction: "Take a moment to notice the calm in your body. You can use this technique anytime you feel stressed." }
    ]
  },
  { 
    id: 2, 
    name: "Progressive Muscle Relaxation", 
    description: "Tense and release muscle groups to reduce physical tension and anxiety.", 
    technique: "Start with your toes, tense for 5 seconds, then relax. Move up through your body.",
    duration: "10 minutes",
    difficulty: "Medium",
    category: "relaxation",
    guided: true,
    youtubeUrl: "https://www.youtube.com/embed/XZvwfoMm4x8",
    youtubeTitle: "Progressive Muscle Relaxation - Full Body Guided",
    steps: [
      { number: 1, title: "Get Comfortable", instruction: "Lie down or sit in a comfortable chair. Have enough space to move your limbs freely." },
      { number: 2, title: "Feet & Toes", instruction: "Tense all the muscles in your feet and toes for 5 seconds. Feel the tension. Then release and relax for 10 seconds." },
      { number: 3, title: "Calves & Shins", instruction: "Tense your calf and shin muscles for 5 seconds. Release and relax. Notice the difference between tension and relaxation." },
      { number: 4, title: "Thighs", instruction: "Squeeze your thigh muscles for 5 seconds. Release and relax. Feel the heaviness." },
      { number: 5, title: "Glutes & Lower Back", instruction: "Clench your glute muscles and lower back for 5 seconds. Release and feel the relaxation spread." },
      { number: 6, title: "Chest & Stomach", instruction: "Tense your chest and abdominal muscles for 5 seconds. Release and breathe deeply." },
      { number: 7, title: "Arms & Hands", instruction: "Make tight fists and tense your arms for 5 seconds. Release and let your arms feel heavy." },
      { number: 8, title: "Shoulders & Neck", instruction: "Shrug your shoulders up to your ears, tense for 5 seconds. Drop and relax. Feel the tension melt away." },
      { number: 9, title: "Face", instruction: "Tense all facial muscles (squint, clench jaw) for 5 seconds. Release and relax your whole face." },
      { number: 10, title: "Full Body Scan", instruction: "Do a final scan of your entire body. You should feel deeply relaxed and at ease." }
    ]
  },
  { 
    id: 3, 
    name: "Grounding Technique (5-4-3-2-1)", 
    description: "Engage your senses to bring yourself back to the present moment.", 
    technique: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
    duration: "5 minutes",
    difficulty: "Easy",
    category: "grounding",
    guided: true,
    youtubeUrl: "https://www.youtube.com/embed/GFLWhC3lD4Y",
    youtubeTitle: "5-4-3-2-1 Grounding Technique - Anxiety Relief",
    steps: [
      { number: 1, title: "5 Things You See", instruction: "Look around and name 5 specific things you can see. Be descriptive: colors, textures, shapes. Say them out loud if possible." },
      { number: 2, title: "4 Things You Can Touch", instruction: "Identify 4 things you can physically touch. Actually touch them and describe the texture: smooth, rough, warm, cold, soft." },
      { number: 3, title: "3 Things You Hear", instruction: "Listen carefully and name 3 sounds around you. They can be subtle: a fan, birds, traffic, breathing." },
      { number: 4, title: "2 Things You Smell", instruction: "Notice 2 scents in your environment. If nothing obvious, find something to smell: coffee, a plant, your hand." },
      { number: 5, title: "1 Thing You Taste", instruction: "Notice or identify 1 taste. You can eat something (gum, chocolate, fruit) or notice residual taste." },
      { number: 6, title: "Return to Now", instruction: "Take a deep breath. You should feel more grounded and present. Anxiety about the past or future should have lessened." }
    ]
  },
  { 
    id: 4, 
    name: "Mindfulness Meditation", 
    description: "Focus on the present moment without judgment to reduce anxiety and stress.", 
    technique: "Sit quietly, focus on your breath, and observe thoughts without reacting.",
    duration: "10 minutes",
    difficulty: "Medium",
    category: "mindfulness",
    guided: true,
    youtubeUrl: "https://www.youtube.com/embed/inpok4MKVLM",
    youtubeTitle: "10 Minute Guided Meditation for Beginners",
    steps: [
      { number: 1, title: "Choose Your Space", instruction: "Find a quiet place where you won't be disturbed. Silence is ideal, but soft background sounds are okay." },
      { number: 2, title: "Sit Comfortably", instruction: "Sit with your spine straight. You can sit on a chair, cushion, or bed. Keep your hands on your lap." },
      { number: 3, title: "Close Your Eyes", instruction: "Gently close your eyes. This helps reduce distractions and turn attention inward." },
      { number: 4, title: "Focus on Breath", instruction: "Notice your natural breath. Don't try to change it. Simply observe: in through nose, out through mouth." },
      { number: 5, title: "Notice Thoughts", instruction: "Thoughts will come. That's normal. When you notice a thought, gently acknowledge it and return focus to your breath." },
      { number: 6, title: "Let Go of Judgment", instruction: "Don't judge your thoughts as good or bad. Just observe them like clouds passing in the sky." },
      { number: 7, title: "Continue for 10 Minutes", instruction: "Keep focusing on your breath. If your mind wanders, that's okay—just gently bring it back." },
      { number: 8, title: "Slowly Open Eyes", instruction: "When ready, slowly open your eyes. Notice how you feel calm and centered." }
    ]
  },
  { 
    id: 5, 
    name: "Journaling", 
    description: "Write down your thoughts and feelings to process emotions and gain clarity.", 
    technique: "Spend 10-15 minutes writing freely about what's on your mind.",
    duration: "15 minutes",
    difficulty: "Easy",
    category: "reflection",
    guided: true,
    youtubeUrl: "https://www.youtube.com/embed/h1pULPKhwzQ",
    youtubeTitle: "Journaling for Mental Health & Emotional Wellness",
    steps: [
      { number: 1, title: "Gather Materials", instruction: "Get a notebook and pen you like. Having a dedicated journal makes the practice feel more meaningful." },
      { number: 2, title: "Find a Quiet Spot", instruction: "Sit somewhere comfortable and free from distractions. Make it a peaceful ritual." },
      { number: 3, title: "Start Writing", instruction: "Write about what's on your mind. Don't worry about grammar, spelling, or making sense. Just let it flow." },
      { number: 4, title: "Be Honest", instruction: "Write your true feelings. No one will judge. This is for you. Be vulnerable and authentic." },
      { number: 5, title: "Write Freely", instruction: "Continue for 10-15 minutes. Don't stop to think or edit. Keep your hand moving." },
      { number: 6, title: "Read & Reflect", instruction: "After writing, read what you've written. Notice any patterns or insights that emerge." },
      { number: 7, title: "Acknowledge Growth", instruction: "Notice how writing has helped you process. Many people feel relief and clarity after journaling." }
    ]
  },
  { 
    id: 6, 
    name: "Physical Exercise", 
    description: "Movement releases endorphins and reduces stress hormones.", 
    technique: "Take a 20-30 minute walk, run, or do your favorite physical activity.",
    duration: "20-30 minutes",
    difficulty: "Medium",
    category: "physical",
    guided: true,
    youtubeUrl: "https://www.youtube.com/embed/HL1UzIVzOKc",
    youtubeTitle: "20 Minute Home Workout - No Equipment Needed",
    steps: [
      { number: 1, title: "Choose an Activity", instruction: "Pick something you enjoy: walking, jogging, dancing, cycling, swimming, or any sport." },
      { number: 2, title: "Warm Up", instruction: "Spend 2-3 minutes doing light movement to warm up your body and prevent injury." },
      { number: 3, title: "Start Moving", instruction: "Begin your chosen activity at a comfortable pace. You should be able to talk but slightly out of breath." },
      { number: 4, title: "Focus on Movement", instruction: "Pay attention to how your body feels. The rhythmic movement helps clear your mind." },
      { number: 5, title: "Continue for 20-30 Minutes", instruction: "Maintain your activity level. This is when endorphins are released, lifting your mood." },
      { number: 6, title: "Cool Down", instruction: "Gradually slow down. Spend 2-3 minutes returning to normal breathing and heart rate." },
      { number: 7, title: "Notice the Difference", instruction: "You should feel more energized, calm, and positive. This is the mood-boosting effect of exercise." }
    ]
  },
  { 
    id: 7, 
    name: "Creative Expression", 
    description: "Art, music, or writing can help process emotions in a healthy way.", 
    technique: "Draw, paint, play music, or write poetry to express your feelings.",
    duration: "20 minutes",
    difficulty: "Easy",
    category: "creative",
    guided: true,
    youtubeUrl: "https://www.youtube.com/embed/9bZkp7q19f0",
    youtubeTitle: "Easy Drawing Tutorial - Express Your Emotions Through Art",
    steps: [
      { number: 1, title: "Choose Your Medium", instruction: "Pick what resonates: drawing, painting, music, poetry, or any creative outlet." },
      { number: 2, title: "Gather Your Materials", instruction: "Get whatever you need: paper, colors, instruments, or just your hands if dancing." },
      { number: 3, title: "Let Go of Perfection", instruction: "This isn't about being good. It's about expressing yourself. No judgment." },
      { number: 4, title: "Create Freely", instruction: "Use colors, sounds, or words to express your emotions. There's no right or wrong way." },
      { number: 5, title: "Allow Emotions Out", instruction: "Don't hold back. Let your feelings flow through your creation." },
      { number: 6, title: "Finish When Ready", instruction: "Create until it feels complete. There's no time limit." },
      { number: 7, title: "Reflect", instruction: "Step back and look at or listen to your creation. Notice what emotions you've expressed." }
    ]
  },
  { 
    id: 8, 
    name: "Social Connection", 
    description: "Talking to someone you trust can provide support and perspective.", 
    technique: "Call a friend, text a loved one, or join a support group.",
    duration: "15-30 minutes",
    difficulty: "Medium",
    category: "social",
    guided: true,
    youtubeUrl: "https://www.youtube.com/embed/z-IR48Zu9gY",
    youtubeTitle: "The Power of Connection & Mental Health",
    steps: [
      { number: 1, title: "Identify Someone", instruction: "Think of someone you trust and feel comfortable with. This could be a friend, family member, or counselor." },
      { number: 2, title: "Reach Out", instruction: "Send a text, make a call, or send a message. Keep it simple: 'I need to talk to someone.'" },
      { number: 3, title: "Be Vulnerable", instruction: "Share what's on your mind. Be honest about your feelings and struggles." },
      { number: 4, title: "Listen to Their Response", instruction: "Sometimes just being heard helps. Other times they'll offer advice or perspective." },
      { number: 5, title: "Accept Support", instruction: "Allow yourself to receive help. You don't have to solve everything alone." },
      { number: 6, title: "Express Gratitude", instruction: "Thank them for listening. Connection is healing." },
      { number: 7, title: "Feel the Relief", instruction: "You should feel less alone and more supported after sharing." }
    ]
  },
  { 
    id: 9, 
    name: "Nature Immersion", 
    description: "Spending time in nature reduces stress and improves mood.", 
    technique: "Take a walk in a park, sit by water, or spend time in green spaces.",
    duration: "20-30 minutes",
    difficulty: "Easy",
    category: "natural",
    guided: true,
    youtubeUrl: "https://www.youtube.com/embed/xJCn_vj-AxU",
    youtubeTitle: "Relaxing Nature Sounds - Forest with Birds",
    steps: [
      { number: 1, title: "Plan Your Visit", instruction: "Choose a natural setting: park, beach, forest, garden, or even a quiet green space." },
      { number: 2, title: "Get Outside", instruction: "Leave your usual environment. The change of scenery itself is therapeutic." },
      { number: 3, title: "Slow Down", instruction: "Move slowly and deliberately. Notice details: leaves, water, sky, sounds." },
      { number: 4, title: "Engage Your Senses", instruction: "Feel the sun, smell the plants, listen to birds, observe colors and textures." },
      { number: 5, title: "Let Your Mind Wander", instruction: "You don't need to do anything. Just be present in nature. Worries naturally fade." },
      { number: 6, title: "Breathe Deeply", instruction: "Take deep breaths of fresh air. Notice how it fills your body with vitality." },
      { number: 7, title: "Return Refreshed", instruction: "You should feel calmer, more grounded, and connected to something larger than yourself." }
    ]
  },
  { 
    id: 10, 
    name: "Positive Affirmations", 
    description: "Repeating positive statements can shift your mindset and build confidence.", 
    technique: "Say affirmations like 'I am capable' or 'I can handle this' daily.",
    duration: "5 minutes",
    difficulty: "Easy",
    category: "mindset",
    guided: true,
    youtubeUrl: "https://www.youtube.com/embed/5NJKM4eO2nE",
    youtubeTitle: "Positive Affirmations for Self-Confidence & Healing",
    steps: [
      { number: 1, title: "Choose Your Affirmations", instruction: "Pick 3-5 positive statements that resonate with you. Examples: 'I am capable', 'I am worthy', 'I can handle this'." },
      { number: 2, title: "Find a Mirror (Optional)", instruction: "While it feels awkward, looking at yourself while saying affirmations makes them more powerful." },
      { number: 3, title: "Say Them Out Loud", instruction: "Speak clearly and with conviction. Your voice matters. Speaking engages more of your mind than just thinking." },
      { number: 4, title: "Feel the Words", instruction: "Don't just say them mechanically. Really try to believe what you're saying. Feel the confidence building." },
      { number: 5, title: "Repeat Daily", instruction: "Say your affirmations every morning or whenever doubt creeps in. Consistency is key." },
      { number: 6, title: "Personalize Them", instruction: "Over time, create affirmations specific to your challenges or goals." },
      { number: 7, title: "Notice the Shift", instruction: "Over weeks, you'll notice a shift in your mindset. Your inner dialogue becomes more positive." }
    ]
  },
  { 
    id: 11, 
    name: "Being in the Moment", 
    description: "Focus on what's happening right now rather than worrying about the future.", 
    technique: "Engage fully in your current activity, whether eating, walking, or talking.",
    duration: "10 minutes",
    difficulty: "Medium",
    category: "present",
    guided: true,
    youtubeUrl: "https://www.youtube.com/embed/xJCn_vj-AxU",
    youtubeTitle: "Mindfulness in Daily Life - Living in the Present Moment",
    steps: [
      { number: 1, title: "Choose an Activity", instruction: "Pick something you do regularly: eating a meal, taking a walk, having a conversation, or drinking tea." },
      { number: 2, title: "Eliminate Distractions", instruction: "Put your phone away. Turn off notifications. Create space for full presence." },
      { number: 3, title: "Engage Your Senses", instruction: "Focus on the details. Notice textures, flavors, sounds, sights. Be completely present." },
      { number: 4, title: "Slow Down", instruction: "Do the activity intentionally and slowly. Rush pulls you out of the moment." },
      { number: 5, title: "Notice Your Mind Wandering", instruction: "When thoughts about past or future arise, gently bring attention back to now." },
      { number: 6, title: "Appreciate the Present", instruction: "Realize that right now is all you ever have. The present moment is peaceful." },
      { number: 7, title: "Continue This Practice", instruction: "Apply this mindfulness to more activities throughout your day." }
    ]
  },
  { 
    id: 12, 
    name: "Gratitude Practice", 
    description: "Focusing on what you're grateful for can improve mood and perspective.", 
    technique: "Write down 3 things you're grateful for each day.",
    duration: "5 minutes",
    difficulty: "Easy",
    category: "gratitude",
    guided: true,
    youtubeUrl: "https://www.youtube.com/embed/Cw0t5KOkjJ8",
    youtubeTitle: "Gratitude Practice for Daily Happiness & Wellness",
    steps: [
      { number: 1, title: "Get a Notebook", instruction: "Dedicate a notebook as your gratitude journal. Make it special." },
      { number: 2, title: "Daily Ritual", instruction: "Each day (morning or evening), spend a few minutes writing down things you're grateful for." },
      { number: 3, title: "Start Small", instruction: "You don't need big things. Gratitude for a warm cup of tea, a kind message, or sunshine counts." },
      { number: 4, title: "Aim for 3+", instruction: "Write down at least 3 things. More is fine. The key is specificity." },
      { number: 5, title: "Be Specific", instruction: "Instead of 'I'm grateful for friends', write 'I'm grateful for the text Sarah sent me today'." },
      { number: 6, title: "Feel the Gratitude", instruction: "As you write, truly feel appreciation. This isn't just an intellectual exercise." },
      { number: 7, title: "Notice the Shift", instruction: "Over time, you'll naturally notice more things to be grateful for. Your mind becomes more positive." }
    ]
  }
]

// Daily check-in prompts
const CHECK_IN_PROMPTS = [
  "How are you feeling today?",
  "What's one thing that made you smile today?",
  "How would you rate your mood on a scale of 1-10?",
  "What's been on your mind lately?",
  "How are you taking care of yourself today?",
  "What's one thing you're grateful for?",
  "How are you managing stress today?",
  "What would help you feel better right now?"
]

// Simple file-based database
class Database {
  constructor() {
    this.data = {
      users: [{ id: 1, name: "Guest User", mainConcerns: ["General wellness"], email: "", phone: "", notificationsEnabled: false, notificationType: "email", createdDate: new Date().toISOString(), lastCheckIn: null }],
      checkIns: [],
      triggers: [],
      journalEntries: [],
      todos: [
        { id: 1, userId: 1, text: "Practice mindfulness meditation", completed: false },
        { id: 2, userId: 1, text: "Take a mental health assessment", completed: false },
        { id: 3, userId: 1, text: "Read an article about mental health", completed: false }
      ],
      habits: [],
      habitCompletions: [],
      assessmentResults: [],
      nextUserId: 2,
      nextCheckInId: 1,
      nextTriggerId: 1,
      nextJournalEntryId: 1,
      nextTodoId: 4,
      nextHabitId: 1,
      nextHabitCompletionId: 1,
      nextResultId: 1
    }
    this.load()
  }

  load() {
    try {
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, "utf-8")
        this.data = JSON.parse(fileContent)
        // Ensure all required arrays exist
        if (!this.data.triggers) this.data.triggers = []
        if (!this.data.journalEntries) this.data.journalEntries = []
        if (!this.data.checkIns) this.data.checkIns = []
        if (!this.data.assessmentResults) this.data.assessmentResults = []
        if (!this.data.todos) this.data.todos = []
        if (!this.data.habits) this.data.habits = []
        if (!this.data.habitCompletions) this.data.habitCompletions = []
        if (!this.data.users) this.data.users = []
        // Ensure all counters exist
        if (!this.data.nextTriggerId) this.data.nextTriggerId = 1
        if (!this.data.nextJournalEntryId) this.data.nextJournalEntryId = 1
        if (!this.data.nextCheckInId) this.data.nextCheckInId = 1
        if (!this.data.nextResultId) this.data.nextResultId = 1
        if (!this.data.nextTodoId) this.data.nextTodoId = 4
        if (!this.data.nextHabitId) this.data.nextHabitId = 1
        if (!this.data.nextHabitCompletionId) this.data.nextHabitCompletionId = 1
        if (!this.data.nextUserId) this.data.nextUserId = 2
      } else {
        this.save()
      }
    } catch (error) {
      console.error("Error loading database:", error)
    }
  }

  save() {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(this.data, null, 2))
    } catch (error) {
      console.error("Error saving database:", error)
    }
  }

  getUser(id) { return this.data.users.find(u => u.id === id) }
  createUser(userData) {
    const newUser = { id: this.data.nextUserId++, ...userData, createdDate: new Date().toISOString(), lastCheckIn: null }
    this.data.users.push(newUser)
    this.save()
    return newUser
  }
  updateUser(id, updates) {
    const user = this.getUser(id)
    if (user) {
      // Handle backwards compatibility: convert mainConcern to mainConcerns array
      if (updates.mainConcern && !updates.mainConcerns) {
        updates.mainConcerns = [updates.mainConcern]
        delete updates.mainConcern
      }
      Object.assign(user, updates)
    }
    this.save()
    return user
  }

  getCheckIns(userId) { return this.data.checkIns.filter(c => c.userId === userId) }
  getTodayCheckIn(userId) {
    const today = new Date().toDateString()
    return this.data.checkIns.find(c => c.userId === userId && new Date(c.timestamp).toDateString() === today)
  }
  createCheckIn(userId, checkInData) {
    const newCheckIn = { id: this.data.nextCheckInId++, userId, ...checkInData, timestamp: new Date().toISOString() }
    this.data.checkIns.push(newCheckIn)
    const user = this.getUser(userId)
    if (user) user.lastCheckIn = newCheckIn.timestamp
    this.save()
    return newCheckIn
  }

  deleteCheckIn(id) {
    const index = this.data.checkIns.findIndex(c => c.id === id)
    if (index !== -1) {
      this.data.checkIns.splice(index, 1)
      this.save()
      return true
    }
    return false
  }

  getTriggers(userId) { return this.data.triggers.filter(t => t.userId === userId) }
  createTrigger(userId, reason, moodRating) {
    const newTrigger = { id: this.data.nextTriggerId++, userId, reason, moodRating, timestamp: new Date().toISOString() }
    this.data.triggers.push(newTrigger)
    this.save()
    return newTrigger
  }
  getTopTriggers(limit = 20) {
    // Count occurrences of each trigger reason
    const triggerCounts = {}
    this.data.triggers.forEach(t => {
      const reason = t.reason.toLowerCase().trim()
      triggerCounts[reason] = (triggerCounts[reason] || 0) + 1
    })
    
    // Convert to array and sort by count
    const sorted = Object.entries(triggerCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
    
    return sorted
  }
  getTriggerStats() {
    const stats = {}
    this.data.triggers.forEach(t => {
      const reason = t.reason.toLowerCase().trim()
      if (!stats[reason]) {
        stats[reason] = { count: 0, moods: [], avgMood: 0 }
      }
      stats[reason].count++
      stats[reason].moods.push(t.moodRating)
    })
    
    // Calculate average mood for each trigger
    Object.keys(stats).forEach(reason => {
      const moods = stats[reason].moods
      stats[reason].avgMood = (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1)
    })
    
    return stats
  }

  getJournalEntries(userId) { return this.data.journalEntries.filter(j => j.userId === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) }
  createJournalEntry(userId, text) {
    const newEntry = { id: this.data.nextJournalEntryId++, userId, text, timestamp: new Date().toISOString() }
    this.data.journalEntries.push(newEntry)
    this.save()
    return newEntry
  }
  deleteJournalEntry(id) {
    const index = this.data.journalEntries.findIndex(j => j.id === id)
    if (index !== -1) {
      this.data.journalEntries.splice(index, 1)
      this.save()
      return true
    }
    return false
  }

  getTodos(userId) { return this.data.todos.filter(t => t.userId === userId) }
  createTodo(userId, text) {
    const newTodo = { id: this.data.nextTodoId++, userId, text, completed: false }
    this.data.todos.push(newTodo)
    this.save()
    return newTodo
  }
  updateTodo(id, updates) {
    const todo = this.data.todos.find(t => t.id === id)
    if (todo) Object.assign(todo, updates)
    this.save()
    return todo
  }
  deleteTodo(id) {
    const index = this.data.todos.findIndex(t => t.id === id)
    if (index !== -1) {
      this.data.todos.splice(index, 1)
      this.save()
      return true
    }
    return false
  }

  // Habit methods
  getHabits(userId) { return this.data.habits.filter(h => h.userId === userId) }
  createHabit(userId, habitData) {
    const newHabit = { id: this.data.nextHabitId++, userId, ...habitData, createdDate: new Date().toISOString(), streak: 0, lastCompletedDate: null }
    this.data.habits.push(newHabit)
    this.save()
    return newHabit
  }
  updateHabit(id, updates) {
    const habit = this.data.habits.find(h => h.id === id)
    if (habit) Object.assign(habit, updates)
    this.save()
    return habit
  }
  deleteHabit(id) {
    const index = this.data.habits.findIndex(h => h.id === id)
    if (index !== -1) {
      this.data.habits.splice(index, 1)
      // Also delete all completions for this habit
      this.data.habitCompletions = this.data.habitCompletions.filter(c => c.habitId !== id)
      this.save()
      return true
    }
    return false
  }

  // Habit completion methods
  getHabitCompletions(habitId) { return this.data.habitCompletions.filter(c => c.habitId === habitId) }
  createHabitCompletion(habitId, completionDate = new Date().toISOString()) {
    const newCompletion = { id: this.data.nextHabitCompletionId++, habitId, completionDate }
    this.data.habitCompletions.push(newCompletion)
    
    // Update habit streak
    const habit = this.data.habits.find(h => h.id === habitId)
    if (habit) {
      const today = new Date().toDateString()
      const lastCompleted = habit.lastCompletedDate ? new Date(habit.lastCompletedDate).toDateString() : null
      
      if (lastCompleted !== today) {
        // Check if yesterday's completion exists to maintain streak
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toDateString()
        
        const hadYesterdayCompletion = this.data.habitCompletions.some(c => 
          c.habitId === habitId && new Date(c.completionDate).toDateString() === yesterdayStr
        )
        
        habit.streak = hadYesterdayCompletion ? habit.streak + 1 : 1
        habit.lastCompletedDate = completionDate
      }
    }
    
    this.save()
    return newCompletion
  }

  getAssessmentResults(userId) { return this.data.assessmentResults.filter(r => r.userId === userId) }
  createAssessmentResult(userId, resultData) {
    const newResult = { id: this.data.nextResultId++, userId, ...resultData, timestamp: new Date().toISOString() }
    this.data.assessmentResults.push(newResult)
    this.save()
    return newResult
  }
  deleteAssessmentResult(resultId) {
    const index = this.data.assessmentResults.findIndex(r => r.id === resultId)
    if (index !== -1) {
      this.data.assessmentResults.splice(index, 1)
      this.save()
      return true
    }
    return false
  }

  // Safety Plan methods
  getSafetyPlan(userId) {
    return this.data.safetyPlans?.find(p => p.userId === userId) || null
  }
  saveSafetyPlan(userId, planData) {
    if (!this.data.safetyPlans) this.data.safetyPlans = []
    const existing = this.data.safetyPlans.findIndex(p => p.userId === userId)
    const plan = {
      userId,
      ...planData,
      updatedAt: new Date().toISOString()
    }
    if (existing !== -1) {
      this.data.safetyPlans[existing] = { ...this.data.safetyPlans[existing], ...plan }
    } else {
      plan.createdAt = new Date().toISOString()
      this.data.safetyPlans.push(plan)
    }
    this.save()
    return this.getSafetyPlan(userId)
  }
}

// Motivational quotes
const QUOTES = [
  { id: 1, text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne", category: "courage", mood: "low" },
  { id: 2, text: "The only way out is through.", author: "Robert Frost", category: "resilience", mood: "struggling" },
  { id: 3, text: "Your mental health is a priority, not a luxury.", author: "Unknown", category: "self-care", mood: "overwhelmed" },
  { id: 4, text: "Progress, not perfection.", author: "Unknown", category: "growth", mood: "anxious" },
  { id: 5, text: "You've survived 100% of your worst days. You're doing better than you think.", author: "Unknown", category: "encouragement", mood: "low" },
  { id: 6, text: "Healing doesn't mean the damage never existed. It means the damage no longer controls our lives.", author: "Akshay Dubey", category: "healing", mood: "struggling" },
  { id: 7, text: "Be gentle with yourself. You're doing the best you can.", author: "Unknown", category: "self-compassion", mood: "overwhelmed" },
  { id: 8, text: "This too shall pass.", author: "Unknown", category: "perspective", mood: "anxious" },
  { id: 9, text: "You are enough, just as you are.", author: "Unknown", category: "self-worth", mood: "low" },
  { id: 10, text: "One step at a time. You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr.", category: "progress", mood: "overwhelmed" },
  { id: 11, text: "Your struggle is part of your story, but it's not the whole story.", author: "Unknown", category: "perspective", mood: "struggling" },
  { id: 12, text: "You are worthy of love and support.", author: "Unknown", category: "self-worth", mood: "low" },
  { id: 13, text: "Breathe. You're going to be okay.", author: "Unknown", category: "calm", mood: "anxious" },
  { id: 14, text: "Every day is a fresh start.", author: "Unknown", category: "hope", mood: "low" },
  { id: 15, text: "You've got this. One moment at a time.", author: "Unknown", category: "encouragement", mood: "overwhelmed" },
  { id: 16, text: "Your feelings are valid. Your struggles are real. You deserve support.", author: "Unknown", category: "validation", mood: "struggling" },
  { id: 17, text: "Healing is not linear. Be patient with yourself.", author: "Unknown", category: "healing", mood: "anxious" },
  { id: 18, text: "You are not alone in this.", author: "Unknown", category: "connection", mood: "low" },
  { id: 19, text: "Small steps lead to big changes.", author: "Unknown", category: "progress", mood: "overwhelmed" },
  { id: 20, text: "Your mental health matters. You matter.", author: "Unknown", category: "self-worth", mood: "struggling" },
  { id: 21, text: "It's okay to not be okay, but it's not okay to stay that way.", author: "Unknown", category: "encouragement", mood: "low" },
  { id: 22, text: "You are stronger than your struggles.", author: "Unknown", category: "strength", mood: "anxious" },
  { id: 23, text: "Take care of your mind like you would your body.", author: "Unknown", category: "self-care", mood: "overwhelmed" },
  { id: 24, text: "Your past does not define your future.", author: "Unknown", category: "hope", mood: "struggling" },
  { id: 25, text: "You deserve to be happy and healthy.", author: "Unknown", category: "self-worth", mood: "low" }
]

// Crisis resources by country (sorted alphabetically)
const CRISIS_RESOURCES = {
  AU: { 
    country: "Australia", 
    flag: "🇦🇺", 
    resources: [
      { name: "Lifeline", phone: "13 11 14", url: "https://www.lifeline.org.au", description: "24/7 crisis support & suicide prevention" },
      { name: "Beyond Blue", phone: "1300 224 636", url: "https://www.beyondblue.org.au", description: "Anxiety, depression & mental health support" },
      { name: "Kids Helpline", phone: "1800 55 1800", url: "https://www.kidshelpline.com.au", description: "Counselling for young people aged 5-25" },
      { name: "1in3", phone: "1300 998 263", url: "https://www.1in3.com.au", description: "Mental health crisis support" },
      { name: "SANE Australia", phone: "1800 18 7263", url: "https://www.sane.org", description: "Helpline for mental illness information" },
      { name: "Headspace", phone: "1800 650 890", url: "https://headspace.org.au", description: "Youth mental health service (12-25 years)" },
      { name: "Beyondblue Crisis Chat", url: "https://www.beyondblue.org.au/get-support/online-chat", description: "Web-based crisis support chat" }
    ] 
  },
  CA: { 
    country: "Canada", 
    flag: "🇨🇦", 
    resources: [
      { name: "Canada Suicide Prevention Service", phone: "1-833-456-4566", url: "https://suicideprevention.ca", description: "24/7 crisis counselling" },
      { name: "Crisis Text Line Canada", text: "Text HELLO to 741741", url: "https://www.crisistextline.org", description: "Text-based support" },
      { name: "Kids Help Phone", phone: "1-800-668-6868", url: "https://www.kidshelpphone.ca", description: "Counselling for children & youth" },
      { name: "Distress Centre", phone: "416-408-4357", url: "https://distresscentre.com", description: "Peer support & crisis intervention (Ontario)" },
      { name: "Talk Suicide Canada", phone: "1-833-456-4566", url: "https://www.talksuicide.ca", description: "Crisis intervention services" }
    ] 
  },
  IE: { 
    country: "Ireland", 
    flag: "🇮🇪", 
    resources: [
      { name: "Samaritans Ireland", phone: "116 123", url: "https://www.samaritans.org", description: "24/7 emotional support" },
      { name: "Pieta House", phone: "1800 247 247", url: "https://www.pieta.ie", description: "Suicide prevention & self-harm support" },
      { name: "Aware", phone: "1800 80 48 48", url: "https://www.aware.ie", description: "Bipolar disorder & depression support" },
      { name: "Turning Point Ireland", phone: "01 872 1122", url: "https://www.turningpointireland.ie", description: "Counselling & support services" }
    ] 
  },
  NZ: { 
    country: "New Zealand", 
    flag: "🇳🇿", 
    resources: [
      { name: "1737 Need to Talk?", phone: "1737", url: "https://www.1737.org.nz", description: "Free call/text/chat support" },
      { name: "Samaritans NZ", phone: "0800 726 666", url: "https://www.samaritans.org.nz", description: "Emotional support service" },
      { name: "Lifeline Aotearoa", phone: "0800 543 354", url: "https://www.lifeline.org.nz", description: "24/7 crisis support" },
      { name: "Youthline", phone: "0800 376 633", url: "https://www.youthline.co.nz", description: "Support for young people (under 25)" },
      { name: "1 to 1 Counselling", phone: "0800 004 008", url: "https://www.1to1.nz", description: "Free confidential counselling" }
    ] 
  },
  SG: { 
    country: "Singapore", 
    flag: "🇸🇬", 
    resources: [
      { name: "Suicide Prevention Centre", phone: "6389 2222", url: "https://www.spc.sg", description: "24-hour crisis hotline" },
      { name: "Tinkle Friend", phone: "1800 274 4788", url: "https://www.tinklefriend.org", description: "Befriending & emotional support" },
      { name: "SAMH (Singapore Association for Mental Health)", phone: "6389 2500", url: "https://www.samh.org.sg", description: "Mental health support & services" },
      { name: "Community Health & Counselling Services", phone: "1800 353 5800", url: "https://www.chcs.org.sg", description: "Counselling & mental health services" }
    ] 
  },
  UK: { 
    country: "United Kingdom", 
    flag: "🇬🇧", 
    resources: [
      { name: "Samaritans", phone: "116 123", url: "https://www.samaritans.org", description: "24/7 crisis support & emotional listening" },
      { name: "Mind", phone: "0300 123 3393", url: "https://www.mind.org.uk", description: "Mental health information & support" },
      { name: "Rethink Mental Illness", phone: "0300 5000 927", url: "https://www.rethink.org", description: "Support & resources for serious mental illness" },
      { name: "Childline", phone: "0800 1111", url: "https://www.childline.org.uk", description: "Confidential support for children & young people" },
      { name: "Crisis Text Line UK", text: "Text SHOUT to 85258", url: "https://www.crisistext.org.uk", description: "24/7 crisis text support" },
      { name: "The Mix", phone: "0808 808 4994", url: "https://www.themix.org.uk", description: "Support for young people (under 25)" }
    ] 
  },
  US: { 
    country: "United States", 
    flag: "🇺🇸", 
    resources: [
      { name: "988 Suicide & Crisis Lifeline", phone: "988", url: "https://988lifeline.org", description: "24/7 suicide prevention & crisis counselling" },
      { name: "Crisis Text Line", text: "Text HOME to 741741", url: "https://www.crisistextline.org", description: "24/7 text-based crisis support" },
      { name: "NAMI Helpline (National Alliance on Mental Illness)", phone: "1-800-950-NAMI", url: "https://www.nami.org/help", description: "Mental health information & referrals" },
      { name: "SAMHSA National Helpline", phone: "1-800-662-4357", url: "https://www.samhsa.gov/find-help/national-helpline", description: "Free substance abuse & mental health referral" },
      { name: "The National Domestic Violence Hotline", phone: "1-800-799-7233", url: "https://www.thehotline.org", description: "Support for domestic violence & abuse" },
      { name: "Veterans Crisis Line", phone: "988 then press 1", url: "https://www.veteranscrisisline.net", description: "24/7 support for military veterans" }
    ] 
  }
}

const db = new Database()
const claudeService = new ClaudeReflectionService()
const companionService = new CompanionService()
const ttsService = new ElevenLabsTTSService()

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Mind Sanctuary backend is running" })
})

// User routes
app.get("/api/user", (req, res) => {
  const userId = req.query.userId || 1
  const user = db.getUser(parseInt(userId))
  if (!user) return res.status(404).json({ error: "User not found" })
  // Provide default notificationPreferences for legacy users
  if (!user.notificationPreferences) {
    user.notificationPreferences = {
      masterEnabled: false,
      checkIn:  { enabled: true,  time: '09:00' },
      habits:   { enabled: true,  time: '08:00' },
      quote:    { enabled: false, time: '07:30' },
    }
  }
  res.json(user)
})

app.post("/api/user/setup", (req, res) => {
  const { name, mainConcern } = req.body
  if (!name || !mainConcern) return res.status(400).json({ error: "Name and main concern are required" })
  const newUser = db.createUser({ name: name.trim(), mainConcern: mainConcern.trim(), email: "", phone: "", notificationsEnabled: false, notificationType: "email" })
  res.status(201).json(newUser)
})

app.put("/api/user", (req, res) => {
  const userId = req.query.userId || 1
  const { name, mainConcern, mainConcerns, email, phone, notificationsEnabled, notificationType, notificationPreferences } = req.body
  console.log('PUT /api/user called with:', { userId, mainConcerns, name, email, phone })
  const user = db.getUser(parseInt(userId))
  if (!user) return res.status(404).json({ error: "User not found" })
  const updates = {}
  if (name) updates.name = name.trim()
  if (mainConcerns) {
    updates.mainConcerns = Array.isArray(mainConcerns) ? mainConcerns : [mainConcerns]
  } else if (mainConcern) {
    updates.mainConcerns = [mainConcern.trim()]
  }
  if (email !== undefined) updates.email = email.trim()
  if (phone !== undefined) updates.phone = phone.trim()
  if (notificationsEnabled !== undefined) updates.notificationsEnabled = notificationsEnabled
  if (notificationType) updates.notificationType = notificationType

  // Notification preferences — validate time format
  if (notificationPreferences) {
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/
    const times = [
      notificationPreferences.checkIn?.time,
      notificationPreferences.habits?.time,
      notificationPreferences.quote?.time,
    ].filter(Boolean)
    for (const t of times) {
      if (!timeRegex.test(t)) {
        return res.status(400).json({ error: `Invalid time format: ${t}. Expected HH:MM` })
      }
    }
    updates.notificationPreferences = notificationPreferences
  }

  const updatedUser = db.updateUser(parseInt(userId), updates)
  console.log('User updated:', updatedUser)
  res.json(updatedUser)
})

// Check-in routes
app.get("/api/checkins", (req, res) => {
  const userId = req.query.userId || 1
  res.json(db.getCheckIns(parseInt(userId)))
})

app.get("/api/checkins/today", (req, res) => {
  const userId = req.query.userId || 1
  res.json(db.getTodayCheckIn(parseInt(userId)) || null)
})

app.post("/api/checkins", (req, res) => {
  const userId = req.query.userId || 1
  const checkInData = req.body
  
  // Validate required fields
  if (checkInData.mood === undefined) return res.status(400).json({ error: "Mood is required" })
  if (checkInData.mood < 1 || checkInData.mood > 10) return res.status(400).json({ error: "Mood must be between 1 and 10" })
  
  // Create comprehensive check-in object with all fields
  const enrichedData = {
    mood: checkInData.mood,
    energy: checkInData.energy || 5,
    sleep: {
      hours: checkInData.sleep?.hours || 7,
      quality: checkInData.sleep?.quality || 'good'
    },
    stress: {
      level: checkInData.stress?.level || 5,
      source: checkInData.stress?.source || ''
    },
    socialInteraction: checkInData.socialInteraction || 'alone',
    triggers: checkInData.triggers || '',
    physicalSymptoms: checkInData.physicalSymptoms || [],
    couldHelp: checkInData.couldHelp || '',
    journalNote: checkInData.journalNote || ''
  }
  
  const newCheckIn = db.createCheckIn(parseInt(userId), enrichedData)
  res.status(201).json(newCheckIn)
})

app.delete("/api/checkins/:id", (req, res) => {
  const deleted = db.deleteCheckIn(parseInt(req.params.id))
  if (!deleted) return res.status(404).json({ error: "Check-in not found" })
  res.json({ message: "Check-in deleted" })
})

app.get("/api/checkins/stats", (req, res) => {
  const userId = req.query.userId || 1
  const userCheckIns = db.getCheckIns(parseInt(userId))
  if (userCheckIns.length === 0) return res.json({ totalCheckIns: 0, averageMood: 0, moodTrend: [], lastSevenDays: 0 })
  const averageMood = (userCheckIns.reduce((sum, c) => sum + (c.mood || c.moodRating || 0), 0) / userCheckIns.length).toFixed(1)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const lastSevenDays = userCheckIns.filter(c => new Date(c.timestamp) >= sevenDaysAgo)
  res.json({ totalCheckIns: userCheckIns.length, averageMood: parseFloat(averageMood), moodTrend: lastSevenDays.map(c => ({ date: new Date(c.timestamp).toLocaleDateString(), mood: c.mood || c.moodRating || 0 })), lastSevenDays: lastSevenDays.length })
})

// Journal routes
app.get("/api/journal", (req, res) => {
  const userId = req.query.userId || 1
  res.json(db.getJournalEntries(parseInt(userId)))
})

app.post("/api/journal", (req, res) => {
  const userId = req.query.userId || 1
  const { text } = req.body
  if (!text || !text.trim()) return res.status(400).json({ error: "Journal text is required" })
  const newEntry = db.createJournalEntry(parseInt(userId), text.trim())
  res.status(201).json(newEntry)
})

app.delete("/api/journal/:id", (req, res) => {
  const { id } = req.params
  const success = db.deleteJournalEntry(parseInt(id))
  if (success) {
    res.json({ message: "Journal entry deleted" })
  } else {
    res.status(404).json({ error: "Journal entry not found" })
  }
})

// Trigger routes
app.post("/api/triggers", (req, res) => {
  const userId = req.query.userId || 1
  const { reason, moodRating } = req.body
  if (!reason || !reason.trim()) return res.status(400).json({ error: "Trigger reason is required" })
  const newTrigger = db.createTrigger(parseInt(userId), reason.trim(), moodRating)
  res.status(201).json(newTrigger)
})

app.get("/api/triggers/top", (req, res) => {
  const limit = req.query.limit || 20
  const topTriggers = db.getTopTriggers(parseInt(limit))
  res.json(topTriggers)
})

app.get("/api/triggers/stats", (req, res) => {
  const stats = db.getTriggerStats()
  res.json(stats)
})

app.get("/api/triggers", (req, res) => {
  const userId = req.query.userId || 1
  res.json(db.getTriggers(parseInt(userId)))
})

// Todo routes
app.get("/api/todos", (req, res) => {
  const userId = req.query.userId || 1
  res.json(db.getTodos(parseInt(userId)))
})

app.post("/api/todos", (req, res) => {
  const userId = req.query.userId || 1
  const { text } = req.body
  if (!text || !text.trim()) return res.status(400).json({ error: "Todo text is required" })
  const newTodo = db.createTodo(parseInt(userId), text.trim())
  res.status(201).json(newTodo)
})

app.put("/api/todos/:id", (req, res) => {
  const { completed, text } = req.body
  const todo = db.updateTodo(parseInt(req.params.id), { completed, text })
  if (!todo) return res.status(404).json({ error: "Todo not found" })
  res.json(todo)
})

app.delete("/api/todos/:id", (req, res) => {
  const deleted = db.deleteTodo(parseInt(req.params.id))
  if (!deleted) return res.status(404).json({ error: "Todo not found" })
  res.json({ message: "Todo deleted" })
})

// Habit routes
app.get("/api/habits", (req, res) => {
  const userId = req.query.userId || 1
  const habits = db.getHabits(parseInt(userId))
  // Enrich habits with completion data
  const enrichedHabits = habits.map(habit => ({
    ...habit,
    completions: db.getHabitCompletions(habit.id)
  }))
  res.json(enrichedHabits)
})

app.post("/api/habits", (req, res) => {
  try {
    const userId = req.query.userId || 1
    const { name, description, frequency, category, goal } = req.body
    
    console.log('POST /api/habits - userId:', userId, 'body:', req.body)
    
    if (!name || !name.trim()) {
      console.log('Validation error: Habit name is required')
      return res.status(400).json({ error: "Goal name is required" })
    }
    if (!frequency) {
      console.log('Validation error: Frequency is required')
      return res.status(400).json({ error: "Frequency is required" })
    }
    
    const habitData = {
      name: name.trim(),
      description: description?.trim() || '',
      frequency,
      category: category || 'wellness',
      goal: goal || ''
    }
    
    console.log('Creating habit with data:', habitData)
    const newHabit = db.createHabit(parseInt(userId), habitData)
    console.log('Habit created successfully:', newHabit)
    res.status(201).json(newHabit)
  } catch (error) {
    console.error('Error in POST /api/habits:', error)
    res.status(500).json({ error: "Failed to create goal: " + error.message })
  }
})

app.put("/api/habits/:id", (req, res) => {
  const { name, description, frequency, category, goal } = req.body
  const habit = db.updateHabit(parseInt(req.params.id), { name, description, frequency, category, goal })
  if (!habit) return res.status(404).json({ error: "Habit not found" })
  res.json(habit)
})

app.delete("/api/habits/:id", (req, res) => {
  const deleted = db.deleteHabit(parseInt(req.params.id))
  if (!deleted) return res.status(404).json({ error: "Habit not found" })
  res.json({ message: "Habit deleted" })
})

// Mark habit as completed for today
app.post("/api/habits/:id/complete", (req, res) => {
  const habitId = parseInt(req.params.id)
  const habit = db.data.habits.find(h => h.id === habitId)
  if (!habit) return res.status(404).json({ error: "Habit not found" })
  
  // Check if already completed today
  const today = new Date().toDateString()
  const completedToday = db.getHabitCompletions(habitId).some(c => 
    new Date(c.completionDate).toDateString() === today
  )
  
  if (completedToday) {
    return res.status(400).json({ error: "Habit already completed today" })
  }
  
  const completion = db.createHabitCompletion(habitId)
  res.status(201).json(completion)
})

// Safety Plan routes
app.get("/api/safety-plan", (req, res) => {
  const userId = parseInt(req.query.userId || 1)
  const plan = db.getSafetyPlan(userId)
  res.json(plan || null)
})

app.put("/api/safety-plan", (req, res) => {
  const userId = parseInt(req.query.userId || 1)
  const planData = req.body
  if (!planData) return res.status(400).json({ error: "Plan data is required" })
  const saved = db.saveSafetyPlan(userId, planData)
  res.json(saved)
})

// Assessment routes
app.get("/api/assessments", (req, res) => {
  const assessmentList = Object.values(ASSESSMENTS).map(a => ({ id: a.id, name: a.name, description: a.description, category: a.category }))
  res.json(assessmentList)
})

app.get("/api/assessments/:id", (req, res) => {
  const assessment = ASSESSMENTS[req.params.id]
  if (!assessment) return res.status(404).json({ error: "Assessment not found" })
  res.json(assessment)
})

// Get assessment results for a user
app.get("/api/assessments/results/:userId", (req, res) => {
  const results = db.getAssessmentResults(parseInt(req.params.userId))
  res.json(results)
})

// Delete assessment result
app.delete("/api/assessments/results/:resultId", (req, res) => {
  const deleted = db.deleteAssessmentResult(parseInt(req.params.resultId))
  if (!deleted) return res.status(404).json({ error: "Result not found" })
  res.json({ message: "Assessment result deleted successfully" })
})

app.post("/api/assessments/:id/submit", (req, res) => {
  const userId = req.query.userId || 1
  const { answers } = req.body
  if (!answers || !Array.isArray(answers)) return res.status(400).json({ error: "Answers array is required" })
  const assessment = ASSESSMENTS[req.params.id]
  if (!assessment) return res.status(404).json({ error: "Assessment not found" })
  
  // Calculate score properly: sum of all answer indices
  const totalScore = answers.reduce((sum, answer) => sum + (answer || 0), 0)
  
  // Calculate max possible score (highest option index * number of questions)
  const maxScore = assessment.questions.length * Math.max(...assessment.questions.map(q => q.options.length - 1))
  
  // Calculate percentage (0-100)
  const percentage = Math.round((totalScore / maxScore) * 100)
  
  // Get severity level
  let severity = 'minimal'
  let severityColor = 'green'
  if (percentage >= 75) {
    severity = 'high'
    severityColor = 'red'
  } else if (percentage >= 50) {
    severity = 'moderate'
    severityColor = 'orange'
  } else if (percentage >= 25) {
    severity = 'mild'
    severityColor = 'yellow'
  }
  
  const result = db.createAssessmentResult(parseInt(userId), {
    assessmentId: req.params.id,
    assessmentName: assessment.name,
    answers,
    totalScore,
    maxScore,
    percentage,
    severity,
    severityColor
  })
  
  res.status(201).json(result)
})

// Articles routes
app.get("/api/articles", (req, res) => {
  res.json(ARTICLES)
})

app.get("/api/articles/:id", (req, res) => {
  const article = ARTICLES.find(a => a.id === parseInt(req.params.id))
  if (!article) return res.status(404).json({ error: "Article not found" })
  res.json(article)
})

app.get("/api/articles/category/:category", (req, res) => {
  const articles = ARTICLES.filter(a => a.category === req.params.category)
  res.json(articles)
})

// Coping strategies routes
app.get("/api/coping-strategies", (req, res) => {
  res.json(COPING_STRATEGIES)
})

app.get("/api/coping-strategies/:id", (req, res) => {
  const strategy = COPING_STRATEGIES.find(s => s.id === parseInt(req.params.id))
  if (!strategy) return res.status(404).json({ error: "Strategy not found" })
  res.json(strategy)
})

// Quotes routes
app.get("/api/quotes", (req, res) => {
  res.json(QUOTES)
})

app.get("/api/quotes/random", (req, res) => {
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)]
  res.json(randomQuote)
})

app.get("/api/quotes/mood/:mood", (req, res) => {
  const moodQuotes = QUOTES.filter(q => q.mood === req.params.mood)
  if (moodQuotes.length === 0) return res.json(QUOTES[Math.floor(Math.random() * QUOTES.length)])
  res.json(moodQuotes[Math.floor(Math.random() * moodQuotes.length)])
})

// Crisis resources routes
app.get("/api/crisis-resources", (req, res) => {
  const resources = Object.entries(CRISIS_RESOURCES).map(([code, data]) => ({ code, ...data }))
  res.json(resources)
})

app.get("/api/crisis-resources/:country", (req, res) => {
  const resource = CRISIS_RESOURCES[req.params.country.toUpperCase()]
  if (!resource) return res.status(404).json({ error: "Country not found" })
  res.json(resource)
})

// Reflection Session Routes (Bounded, Safe, Pattern-Focused)
app.post("/api/reflection/start", (req, res) => {
  const userId = req.query.userId || 1
  const { sessionMode = 'guided' } = req.body
  
  if (!['guided', 'quick'].includes(sessionMode)) {
    return res.status(400).json({ error: "Invalid session mode. Use 'guided' (15-30 min) or 'quick' (5-10 min)" })
  }

  const sessionId = `${userId}-${Date.now()}`
  const session = {
    id: sessionId,
    userId: parseInt(userId),
    mode: sessionMode,
    startTime: new Date().toISOString(),
    messages: [],
    isClosed: false
  }

  // Store session in memory (in production: use Redis or database)
  if (!global.reflectionSessions) {
    global.reflectionSessions = {}
  }
  global.reflectionSessions[sessionId] = session

  res.status(201).json({
    sessionId,
    mode: sessionMode,
    message: sessionMode === 'quick' 
      ? "Let's reflect for a few minutes. What's on your mind today?"
      : "Welcome to a reflection session. Tell me what's been happening with you."
  })
})

app.post("/api/reflection/message", async (req, res) => {
  const { sessionId, message } = req.body
  
  if (!sessionId || !message) {
    return res.status(400).json({ error: "sessionId and message are required" })
  }

  if (!global.reflectionSessions || !global.reflectionSessions[sessionId]) {
    return res.status(404).json({ error: "Session not found" })
  }

  const session = global.reflectionSessions[sessionId]
  if (session.isClosed) {
    return res.status(400).json({ error: "Session is closed" })
  }

  try {
    // Get user context for Claude
    const user = db.getUser(session.userId)
    const allCheckIns = db.getCheckIns(session.userId)
    
    // Only include today's check-ins
    const today = new Date().toDateString()
    const todaysCheckIns = allCheckIns.filter(c => new Date(c.timestamp).toDateString() === today)
    
    // Get recent check-ins for patterns (from the past week)
    const userCheckIns = allCheckIns.slice(0, 10)
    
    // Get patterns (if available)
    let patterns = []
    if (userCheckIns.length >= 7) {
      // Simple correlation detection
      const recentCheckIns = userCheckIns.slice(0, 7)
      const avgMood = recentCheckIns.reduce((sum, c) => sum + c.mood, 0) / recentCheckIns.length
      const shortSleep = recentCheckIns.filter(c => c.sleep?.hours < 6)
      if (shortSleep.length > 0) {
        const avgMoodShortSleep = shortSleep.reduce((sum, c) => sum + c.mood, 0) / shortSleep.length
        if (avgMoodShortSleep < avgMood - 1) {
          patterns.push({
            description: 'Your mood tends to dip after nights with less than 6 hours of sleep',
            correlation: Math.round((1 - (avgMoodShortSleep / avgMood)) * 100)
          })
        }
      }
    }

    // Add user message to session
    session.messages.push({
      role: 'user',
      content: message
    })

    // Generate reflection response
    const context = {
      avatarName: 'Your Companion',
      avatarPersonality: 'Warm, empathetic, and genuinely curious about understanding your patterns',
      userName: user?.name || 'there',
      recentCheckIns: todaysCheckIns, // Only pass today's check-ins to avoid confusion
      detectedPatterns: patterns,
      mainConcern: user?.mainConcern || 'general wellness',
      clarification: 'Note: Check-ins are mood/wellness surveys the user completes. Multiple check-ins in one day are just data points, not multiple logins.'
    }

    const reflection = await claudeService.continueReflection(
      session.messages,
      context,
      session.mode
    )

    if (reflection.escalate) {
      // Crisis detected - close session and escalate
      session.isClosed = true
      session.endReason = 'crisis_escalation'
      
      return res.status(200).json({
        type: 'CRISIS_ESCALATION',
        message: reflection.message,
        escalate: true,
        sessionEnd: true,
        nextSteps: 'Please reach out to crisis resources immediately'
      })
    }

    // Add assistant response to session
    session.messages.push({
      role: 'assistant',
      content: reflection.message
    })

    // Check session duration for bounded mode
    const sessionDuration = (new Date() - new Date(session.startTime)) / 1000 / 60 // minutes
    const maxDuration = session.mode === 'quick' ? 10 : 30

    const suggestEnd = sessionDuration > (maxDuration * 0.8) // Suggest ending at 80% of max time

    res.json({
      message: reflection.message,
      type: reflection.type,
      sessionEnd: false,
      suggestEnd,
      duration: Math.round(sessionDuration),
      maxDuration,
      messageCount: session.messages.length / 2 // pairs of user/assistant
    })
  } catch (error) {
    console.error('Reflection message error:', error)
    res.status(500).json({ error: 'Error processing reflection message' })
  }
})

app.post("/api/reflection/end", (req, res) => {
  const { sessionId } = req.body
  
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" })
  }

  if (!global.reflectionSessions || !global.reflectionSessions[sessionId]) {
    return res.status(404).json({ error: "Session not found" })
  }

  const session = global.reflectionSessions[sessionId]
  session.isClosed = true
  session.endTime = new Date().toISOString()

  res.json({
    sessionId,
    status: 'closed',
    duration: (new Date(session.endTime) - new Date(session.startTime)) / 1000 / 60,
    messageCount: session.messages.length / 2,
    message: 'Reflection session ended. Remember, I\'m here to help you understand your patterns, not to replace professional support. Take care of yourself.'
  })
})

app.get("/api/reflection/instructions", (req, res) => {
  const instructions = claudeService.getTransparentInstructions()
  res.json(instructions)
})
app.get("/api/checkins/patterns/:userId", (req, res) => {
  const userId = parseInt(req.params.userId)
  const userCheckIns = db.getCheckIns(userId)
  
  if (userCheckIns.length < 2) {
    return res.json({ patterns: [], insights: "Need more check-ins to detect patterns" })
  }

  // Calculate correlations
  let moodStressCorrelation = 0
  let moodSleepCorrelation = 0
  let moodEnergyCorrelation = 0
  
  if (userCheckIns.length >= 7) {
    const recent = userCheckIns.slice(0, 7)
    
    // Simple correlation: if stress high, is mood low?
    const stressHighDays = recent.filter(c => c.stress?.level >= 7)
    if (stressHighDays.length > 0) {
      const avgMoodOnStress = stressHighDays.reduce((sum, c) => sum + c.mood, 0) / stressHighDays.length
      const normalAvgMood = recent.reduce((sum, c) => sum + c.mood, 0) / recent.length
      moodStressCorrelation = Math.round((1 - (avgMoodOnStress / normalAvgMood)) * 100)
    }
    
    // Sleep hours vs mood
    const shortSleepDays = recent.filter(c => c.sleep?.hours < 6)
    if (shortSleepDays.length > 0) {
      const avgMoodShortSleep = shortSleepDays.reduce((sum, c) => sum + c.mood, 0) / shortSleepDays.length
      const normalAvgMood = recent.reduce((sum, c) => sum + c.mood, 0) / recent.length
      moodSleepCorrelation = Math.round((1 - (avgMoodShortSleep / normalAvgMood)) * 100)
    }
    
    // Energy vs mood (typically correlate positively)
    const avgEnergy = recent.reduce((sum, c) => sum + c.energy, 0) / recent.length
    const avgMood = recent.reduce((sum, c) => sum + c.mood, 0) / recent.length
    moodEnergyCorrelation = Math.round((1 - Math.abs(avgEnergy - avgMood) / 5) * 100)
  }

  const patterns = []
  
  if (moodStressCorrelation > 30) {
    patterns.push({
      type: "stress-mood",
      description: "High stress days correlate with lower mood",
      correlation: moodStressCorrelation,
      suggestion: "Notice when stress is high. Consider small stress-relief activities."
    })
  }
  
  if (moodSleepCorrelation > 30) {
    patterns.push({
      type: "sleep-mood",
      description: "Days with less sleep (<6 hours) correlate with lower mood",
      correlation: moodSleepCorrelation,
      suggestion: "Try to maintain consistent sleep. Even 1 extra hour can make a difference."
    })
  }

  res.json({ patterns, correlations: { moodStress: moodStressCorrelation, moodSleep: moodSleepCorrelation, moodEnergy: moodEnergyCorrelation } })
})

// Weekly summary endpoint
app.get("/api/checkins/weekly-summary/:userId", (req, res) => {
  const userId = parseInt(req.params.userId)
  const userCheckIns = db.getCheckIns(userId)
  
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const thisWeek = userCheckIns.filter(c => new Date(c.timestamp) >= sevenDaysAgo)
  
  if (thisWeek.length === 0) {
    return res.json({ checkInCount: 0, summary: "No check-ins this week" })
  }

  const avgMood = (thisWeek.reduce((sum, c) => sum + c.mood, 0) / thisWeek.length).toFixed(1)
  const avgEnergy = (thisWeek.reduce((sum, c) => sum + c.energy, 0) / thisWeek.length).toFixed(1)
  const avgStress = (thisWeek.reduce((sum, c) => sum + c.stress.level, 0) / thisWeek.length).toFixed(1)
  const avgSleep = (thisWeek.reduce((sum, c) => sum + c.sleep.hours, 0) / thisWeek.length).toFixed(1)

  const topTriggers = {}
  thisWeek.forEach(c => {
    if (c.triggers) {
      topTriggers[c.triggers] = (topTriggers[c.triggers] || 0) + 1
    }
  })

  const sortedTriggers = Object.entries(topTriggers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([trigger, count]) => trigger)

  res.json({
    checkInCount: thisWeek.length,
    avgMood: parseFloat(avgMood),
    avgEnergy: parseFloat(avgEnergy),
    avgStress: parseFloat(avgStress),
    avgSleep: parseFloat(avgSleep),
    topTriggers: sortedTriggers,
    moodTrend: thisWeek.slice().reverse().map(c => ({
      date: new Date(c.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      mood: c.mood,
      energy: c.energy,
      stress: c.stress.level,
      sleep: c.sleep.hours
    }))
  })
})

// Crisis resources (with geolocation support)
app.get("/api/crisis-resources/:country", (req, res) => {
  const resources = CRISIS_RESOURCES[req.params.country.toUpperCase()]
  if (!resources) return res.status(404).json({ error: "Country not found" })
  res.json(resources)
})

app.get("/api/crisis-resources", (req, res) => {
  const resources = Object.entries(CRISIS_RESOURCES).map(([code, data]) => ({ code, ...data }))
  res.json(resources)
})

// Check-in prompts (kept for compatibility)
app.get("/api/checkin-prompt", (req, res) => {
  const prompt = CHECK_IN_PROMPTS[Math.floor(Math.random() * CHECK_IN_PROMPTS.length)]
  res.json({ prompt })
})

// Text-to-Speech endpoint
app.post("/api/tts/synthesize", async (req, res) => {
  try {
    const { text, companionId = 'luna' } = req.body
    
    if (!text) {
      return res.status(400).json({ error: "Text is required" })
    }

    if (!ttsService.isAvailable()) {
      return res.status(503).json({ error: "Text-to-Speech service not available" })
    }

    const audioBuffer = await ttsService.synthesizeSpeech(text, companionId)
    
    // Send audio as MP3
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Length', audioBuffer.length)
    res.send(audioBuffer)
  } catch (error) {
    console.error('TTS error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get("/api/tts/voices", async (req, res) => {
  try {
    const voices = ttsService.getAvailableVoiceOptions()
    res.json(voices)
  } catch (error) {
    console.error('Error fetching TTS voices:', error)
    res.status(500).json({ error: error.message })
  }
})

// Mount Beast routes
app.use("/api/beasts", beastsRouter)

// Companion endpoints
app.get("/api/companions", (req, res) => {
  const companions = companionService.getAllCompanions()
  res.json(companions)
})

app.get("/api/companions/:companionId", (req, res) => {
  const companion = companionService.getCompanion(req.params.companionId)
  if (!companion) return res.status(404).json({ error: "Companion not found" })
  res.json(companion)
})

app.post("/api/companions/:companionId/generate-avatar", async (req, res) => {
  try {
    const { companionId } = req.params
    console.log(`Generating avatar for companion: ${companionId}`)
    
    const avatarUrl = await companionService.generateCompanionAvatar(companionId)
    
    if (!avatarUrl) {
      return res.status(500).json({ error: "Failed to generate avatar" })
    }
    
    const companion = companionService.getCompanion(companionId)
    res.json({
      companionId,
      avatar: avatarUrl,
      companion
    })
  } catch (error) {
    console.error("Avatar generation error:", error)
    res.status(500).json({ error: error.message })
  }
})

app.get("/api/companions/recommend/:sessionMode", (req, res) => {
  const companion = companionService.recommendCompanionForMode(req.params.sessionMode)
  res.json(companion)
})

// Start server
app.listen(PORT, () => {
  console.log(`✅ Mind Sanctuary backend running on http://localhost:${PORT}`)
  console.log(`✓ Endpoints available:`)
  console.log(`  - /api/user`)
  console.log(`  - /api/checkins`)
  console.log(`  - /api/journal`)
  console.log(`  - /api/assessments`)
  console.log(`  - /api/articles`)
  console.log(`  - /api/coping-strategies`)
  console.log(`  - /api/quotes`)
  console.log(`  - /api/crisis-resources`)
  console.log(`  - /api/reflection/*`)
  console.log(`✓ Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5180'}`)
})
