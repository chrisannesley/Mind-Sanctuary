# MindWell Quick Start Guide

## ✅ Status: COMPLETE & RUNNING

Both the backend and frontend are now running successfully!

### 🌐 Access the App

**Frontend:** http://localhost:5174
**Backend API:** http://localhost:3002

## 🎯 What's Included

### ✨ Features Ready to Use

1. **Daily Check-In** 📝
   - Track your mood (1-10 scale)
   - Share your thoughts
   - View your history

2. **Mental Health Assessments** 📋
   - 9 evidence-based assessments
   - PHQ-9, GAD-7, PCL-5, MDQ, SPIN, ISI, AUDIT, ASRS, EAT-26
   - Track your results over time

3. **Educational Articles** 📚
   - 10 comprehensive articles
   - Topics: depression, anxiety, PTSD, sleep, mindfulness, resilience, nutrition, exercise, relationships, self-care

4. **Coping Strategies** 🧘
   - 12 practical techniques
   - Breathing, grounding, meditation, journaling, exercise, and more

5. **Daily Inspiration** ✨
   - 25 motivational quotes
   - Personalized by mood and category
   - Get a new quote daily

6. **Crisis Resources** 🆘
   - Emergency contacts for 7 countries
   - US, UK, Australia, New Zealand, Canada, Ireland, Singapore

7. **To-Do List** ✓
   - Create wellness tasks
   - Track progress
   - Celebrate achievements

8. **User Profile** 👤
   - Personalize your experience
   - Set notification preferences
   - Track your main concern

## 🚀 Getting Started

### First Time Users

1. **Visit the app**: http://localhost:5174
2. **Set up your profile**: Enter your name and main mental health concern
3. **Take a daily check-in**: Share how you're feeling
4. **Explore features**: Browse articles, assessments, and coping strategies
5. **Use crisis resources**: Know where to find help if needed

### Navigation

- **Home**: Overview and daily check-in status
- **Daily Check-In**: Track your mood and feelings
- **Assessments**: Take self-assessment tools
- **Articles**: Read educational content
- **Coping**: Learn stress management techniques
- **Inspiration**: Get motivational quotes
- **Crisis Help**: Emergency resources by country
- **To Do List**: Manage wellness tasks
- **Profile**: Personalize your settings

## 📊 Data Storage

- All data is stored locally in `d:\mindwell-app\backend\mindwell.db`
- No data is sent to external servers
- Your privacy is protected

## 🔧 Troubleshooting

### Backend not running?
```bash
cd d:\mindwell-app\backend
npm start
```

### Frontend not running?
```bash
cd d:\mindwell-app\frontend
npm run dev
```

### Port already in use?
- Backend uses port 3002
- Frontend uses port 5174
- Check if other processes are using these ports

### Dependencies missing?
```bash
# Backend
cd d:\mindwell-app\backend
npm install

# Frontend
cd d:\mindwell-app\frontend
npm install
```

## 📝 Features in Development

- [ ] Email/SMS daily notifications
- [ ] User authentication
- [ ] Cloud data sync
- [ ] Expanded assessment questions
- [ ] Audio/video support
- [ ] Progress reports

## ⚠️ Important

**MindWell is not a substitute for professional medical advice.**

If you're in crisis:
1. Contact emergency services (911 in US, 999 in UK, 000 in Australia)
2. Use the Crisis Resources in the app
3. Reach out to a mental health professional
4. Tell someone you trust

## 💡 Tips for Best Experience

1. **Be consistent**: Daily check-ins help track patterns
2. **Be honest**: Your responses are for you alone
3. **Explore resources**: Try different coping strategies
4. **Track progress**: Use the to-do list for wellness goals
5. **Seek help**: Use crisis resources when needed

## 🎨 Customization

The app uses Tailwind CSS for styling. To customize:
- Edit `d:\mindwell-app\frontend\tailwind.config.js`
- Modify colors in the `mindwell` theme
- Restart the frontend server

## 📚 Learn More

See `README.md` for:
- Complete feature list
- API documentation
- Project structure
- Architecture details

## 🆘 Need Help?

If something isn't working:
1. Check the browser console for errors (F12)
2. Check the terminal output for backend errors
3. Verify both servers are running
4. Try refreshing the page
5. Restart both servers

---

**You've got this! Remember: seeking help is a sign of strength.** 💙
