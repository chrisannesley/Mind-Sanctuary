# 🚀 MindWell App - Quick Reference Guide

## Access the App

```
Frontend: http://localhost:5174
Backend: http://localhost:3002
Avatar Chat: http://localhost:5174/avatar
```

## Start Servers

```bash
# Terminal 1 - Frontend
cd d:\mindwell-app\frontend
npm run dev

# Terminal 2 - Backend
cd d:\mindwell-app\backend
npm start
```

## Avatar System

### How to Use
1. Go to http://localhost:5174
2. Click "🤖 Avatar Chat" in navigation
3. Click "Start Conversation"
4. Type your response and press Enter
5. Click "Generate New Avatar" for different avatars

### Avatar Sources
- This Person Does Not Exist (AI faces)
- Unsplash (real photos)
- Lorem Picsum (realistic photos)
- DiceBear Personas (illustrated)
- DiceBear Lorelei (artistic)
- Pravatar (diverse avatars)

### Question Types
- **Depression**: Sleep, joy, self-care, energy, connection, challenges, improvement
- **Anxiety**: Worries, grounding, breathing, calming, overwhelm, control, communication
- **PTSD**: Feelings, triggers, safety, techniques, support, coping, trauma
- **General**: Feelings, mind, self-care, positivity, support, improvement, health

### Response Types
- **Positive** (good, great, better, happy)
- **Struggling** (bad, worse, sad, struggling)
- **Neutral** (default)

## Key Files

### Avatar System
- `src/utils/avatarGenerator.js` - Avatar generation
- `src/components/HumanAvatar.jsx` - Avatar display
- `src/pages/AvatarChat.jsx` - Chat interface

### Core Features
- `src/pages/CheckIn.jsx` - Daily check-in
- `src/pages/Assessments.jsx` - Mental health assessments
- `src/pages/Articles.jsx` - Information hub
- `src/pages/CopingStrategies.jsx` - Coping techniques
- `src/pages/CrisisResources.jsx` - Crisis help

### Backend
- `backend/src/index.js` - All API routes and data

## Navigation Menu

- 🏠 Home
- 📝 Daily Check-In
- 📋 Assessments
- 📚 Articles
- 🧘 Coping Strategies
- ✨ Inspiration
- 🤖 Avatar Chat (NEW)
- 🆘 Crisis Help
- ✓ To Do List
- 👤 Profile

## Common Tasks

### Test Avatar Generation
```
1. Go to /avatar
2. Click "Generate New Avatar" 5+ times
3. Verify different avatars appear
```

### Test Conversation
```
1. Start conversation
2. Type: "I'm feeling great today!"
3. Verify positive response
4. Type: "I'm struggling"
5. Verify struggling response
```

### Update User Profile
```
1. Go to Profile page
2. Update name and mental health concern
3. Go to Avatar Chat
4. Start new conversation
5. Verify questions match concern
```

### Check Backend
```
1. Open http://localhost:3002
2. Should see "MindWell backend running"
3. Check console for any errors
```

## Troubleshooting

### Avatar Not Loading
- Check internet connection
- Try "Generate New Avatar" button
- Check browser console (F12)
- Verify backend is running

### Messages Not Sending
- Ensure text is entered
- Check backend is running
- Check browser console for errors

### Styling Issues
- Clear cache: Ctrl+Shift+Delete
- Restart dev server: npm run dev
- Check Tailwind CSS config

### Port Already in Use
```bash
# Kill process on port 5174
netstat -ano | findstr :5174
taskkill /PID <PID> /F

# Kill process on port 3002
netstat -ano | findstr :3002
taskkill /PID <PID> /F
```

## Project Status

- **Overall**: 85% complete
- **Avatar System**: 100% ✅
- **Core Features**: 95% ✅
- **UI/UX**: 90% ✅

## Next Steps

1. Avatar selection system
2. Conversation persistence
3. Real AI responses
4. Email notifications
5. User authentication

## Documentation

- `README.md` - Project overview
- `QUICKSTART.md` - Getting started
- `TODO.md` - To-do list
- `CURRENT_STATUS.md` - Detailed status
- `AVATAR_SYSTEM_STATUS.md` - Avatar details
- `LATEST_UPDATE.md` - Recent changes

## Support

For issues or questions:
1. Check browser console (F12)
2. Check server logs
3. Review documentation files
4. Check TODO.md for known issues

---

**Last Updated**: May 28, 2026
**Status**: ✅ OPERATIONAL
