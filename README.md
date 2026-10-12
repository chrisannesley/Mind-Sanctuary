# MindWell - Mental Health Support App

A comprehensive mental health support application designed to provide evidence-based assessments, helpful resources, and supportive tools for managing mental well-being.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation & Running

**Backend:**
```bash
cd backend
npm install
npm start
```
Backend runs on: `http://localhost:3002`

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5174`

## 📋 Features

### Daily Check-In
- Track your mood on a scale of 1-10
- Share your thoughts and feelings
- View your check-in history and trends
- Personalized daily prompts

### Mental Health Assessments
- **PHQ-9**: Depression screening
- **GAD-7**: Anxiety assessment
- **PCL-5**: PTSD screening
- **MDQ**: Bipolar disorder screening
- **SPIN**: Social anxiety assessment
- **ISI**: Insomnia severity
- **AUDIT**: Alcohol use assessment
- **ASRS**: ADHD screening
- **EAT-26**: Eating disorder assessment

### Educational Resources
- 10 comprehensive articles on mental health topics
- Information on depression, anxiety, PTSD, sleep, mindfulness, resilience, nutrition, exercise, relationships, and self-care

### Coping Strategies
- 12 evidence-based coping techniques including:
  - Deep breathing
  - Progressive muscle relaxation
  - Grounding techniques
  - Mindfulness meditation
  - Journaling
  - Physical exercise
  - Creative expression
  - Social connection
  - Nature immersion
  - Positive affirmations
  - Being in the moment
  - Gratitude practice

### Inspiration & Motivation
- 25 personalized motivational quotes
- Quotes categorized by mood and theme
- Daily inspiration feature

### Crisis Resources
- Emergency contacts for 7 English-speaking countries:
  - United States
  - United Kingdom
  - Australia
  - New Zealand
  - Canada
  - Ireland
  - Singapore

### To-Do List
- Create and manage personal wellness tasks
- Track progress with visual indicators
- Mark tasks as complete
- Organize your mental health goals

### User Profile
- Personalize your experience
- Set notification preferences
- Track your main mental health concern
- Manage contact information

## 🏗️ Architecture

### Backend
- **Framework**: Express.js
- **Database**: File-based JSON (mindwell.db)
- **Port**: 3002
- **API**: RESTful endpoints for all features

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v6
- **Port**: 5174

## 📁 Project Structure

```
mindwell-app/
├── backend/
│   ├── src/
│   │   └── index.js          # Main server file with all API routes
│   ├── mindwell.db           # File-based database
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navigation.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── CheckIn.jsx
│   │   │   ├── Assessments.jsx
│   │   │   ├── AssessmentDetail.jsx
│   │   │   ├── Articles.jsx
│   │   │   ├── CopingStrategies.jsx
│   │   │   ├── Inspiration.jsx
│   │   │   ├── CrisisResources.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── TodoList.jsx
│   │   ├── utils/
│   │   │   └── api.js        # API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env
└── README.md
```

## 🔌 API Endpoints

### User Management
- `GET /api/user` - Get user profile
- `POST /api/user/setup` - Create new user
- `PUT /api/user` - Update user profile

### Check-Ins
- `GET /api/checkins` - Get all check-ins
- `GET /api/checkins/today` - Get today's check-in
- `POST /api/checkins` - Create new check-in
- `GET /api/checkins/stats` - Get check-in statistics
- `GET /api/checkin-prompt` - Get daily prompt

### Assessments
- `GET /api/assessments` - List all assessments
- `GET /api/assessments/:id` - Get specific assessment
- `POST /api/assessments/:id/submit` - Submit assessment
- `GET /api/assessments/results/:userId` - Get user's results

### Articles
- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get specific article
- `GET /api/articles/category/:category` - Get articles by category

### Coping Strategies
- `GET /api/coping-strategies` - Get all strategies
- `GET /api/coping-strategies/:id` - Get specific strategy

### Quotes
- `GET /api/quotes` - Get all quotes
- `GET /api/quotes/random` - Get random quote
- `GET /api/quotes/mood/:mood` - Get quote by mood

### Crisis Resources
- `GET /api/crisis-resources` - Get all resources
- `GET /api/crisis-resources/:country` - Get resources by country

### To-Do List
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

## 🎨 Design Philosophy

MindWell is built with a supportive, non-judgmental approach to mental health. The app:
- Provides evidence-based information without being prescriptive
- Treats all mental health concerns as equally valid
- Emphasizes self-reflection and personal growth
- Encourages professional help when needed
- Maintains a warm, compassionate tone throughout

## ⚠️ Important Disclaimer

MindWell is **not** a substitute for professional medical advice, diagnosis, or treatment. If you are in crisis or having thoughts of self-harm:
- Contact emergency services immediately
- Use the crisis resources available in the app
- Reach out to a mental health professional
- Tell someone you trust

## 🔐 Privacy & Data

- User data is stored locally in a file-based database
- No data is sent to external servers
- Check-ins and assessments are for personal tracking only
- Email/SMS notification features are currently in development

## 🚀 Future Enhancements

- [ ] User authentication and cloud sync
- [ ] Email/SMS daily notifications
- [ ] Expanded assessment question sets
- [ ] Audio/video support for coping strategies
- [ ] Sentiment analysis for check-ins
- [ ] Progress reports and insights
- [ ] Community support features
- [ ] Integration with healthcare providers

## 📝 License

This project is created for personal mental health support purposes.

## 💙 Support

If you find MindWell helpful, please remember:
- You are not alone
- Seeking help is a sign of strength
- Recovery is possible
- You deserve support and care

---

**Created with care for mental health support** 🧠💚
