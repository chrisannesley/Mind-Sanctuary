# 🎨 Avatar Customization Guide

## Current Implementation

Your avatar now displays:
- ✅ Realistic human face (AI-generated)
- ✅ Circular profile picture
- ✅ Name and tagline
- ✅ Generate new avatars button
- ✅ Same supportive conversations

## Easy Customizations (No Code)

### 1. Change Avatar Image

**Using a URL:**
```javascript
// In AvatarChat.jsx, add:
const customAvatarUrl = 'https://example.com/your-avatar.jpg'
setAvatarImage(customAvatarUrl)
```

**Using Local Image:**
1. Save image to `frontend/public/avatars/`
2. Reference it:
```javascript
setAvatarImage('/avatars/my-avatar.jpg')
```

### 2. Change Avatar Name

```javascript
// In AvatarChat.jsx
const avatarNames = [
  'Sarah - Your Wellness Coach',
  'Alex - Your Support Friend',
  'Jordan - Your Listening Ear',
  'Casey - Your Mental Health Companion'
]

const randomName = avatarNames[Math.floor(Math.random() * avatarNames.length)]
setAvatarName(randomName)
```

### 3. Change Avatar Tagline

```javascript
// In HumanAvatar.jsx, change:
<p className="text-xs text-gray-500">Always here to listen</p>

// To:
<p className="text-xs text-gray-500">Your personal mental health companion</p>
```

## Medium Customizations (Some Code)

### 1. Add Avatar Selection

Create a new component `AvatarSelector.jsx`:

```javascript
import React from 'react'

function AvatarSelector({ onSelect }) {
  const avatars = [
    {
      id: 1,
      name: 'Sarah',
      image: 'https://api.generated.photos/api/v1/faces?api_key=demo',
      specialty: 'Depression Support',
      bio: 'Warm and nurturing'
    },
    {
      id: 2,
      name: 'Alex',
      image: 'https://example.com/alex.jpg',
      specialty: 'Anxiety Management',
      bio: 'Calm and grounding'
    },
    {
      id: 3,
      name: 'Jordan',
      image: 'https://example.com/jordan.jpg',
      specialty: 'PTSD Support',
      bio: 'Strong and understanding'
    }
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {avatars.map(avatar => (
        <button
          key={avatar.id}
          onClick={() => onSelect(avatar)}
          className="p-4 border-2 border-gray-300 rounded-lg hover:border-mindwell-500 transition"
        >
          <img
            src={avatar.image}
            alt={avatar.name}
            className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
          />
          <h3 className="font-bold">{avatar.name}</h3>
          <p className="text-xs text-gray-600">{avatar.specialty}</p>
        </button>
      ))}
    </div>
  )
}

export default AvatarSelector
```

### 2. Add Image Upload

```javascript
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarImage(e.target.result)
    }
    reader.readAsDataURL(file)
  }
}

// In JSX:
<input
  type="file"
  accept="image/*"
  onChange={handleImageUpload}
  className="mb-4"
/>
```

### 3. Add Avatar Personality

```javascript
const avatarPersonalities = {
  warm: {
    name: 'Sarah',
    style: 'warm and nurturing',
    greeting: 'Hi there! I\'m so glad you\'re here.',
    responses: {
      positive: ['That\'s wonderful! I\'m so happy for you!', ...],
      struggling: ['I hear you. That sounds really tough.', ...]
    }
  },
  calm: {
    name: 'Alex',
    style: 'calm and grounding',
    greeting: 'Welcome. Let\'s take a moment together.',
    responses: {
      positive: ['That\'s great progress!', ...],
      struggling: ['Let\'s breathe through this together.', ...]
    }
  }
}

// Use in conversation:
const personality = avatarPersonalities[selectedPersonality]
```

## Advanced Customizations (More Code)

### 1. 3D Avatar with Three.js

```javascript
import * as THREE from 'three'

function Avatar3D() {
  useEffect(() => {
    // Create 3D scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer()
    
    // Add 3D model
    // ... (complex 3D setup)
  }, [])

  return <div id="canvas"></div>
}
```

### 2. Animated Avatar with Lottie

```javascript
import Lottie from 'lottie-react'
import animationData from './avatar-animation.json'

function AnimatedAvatar() {
  return (
    <Lottie
      animationData={animationData}
      loop={true}
      style={{ width: 200, height: 200 }}
    />
  )
}
```

### 3. Video Avatar with D-ID

```javascript
// Requires D-ID API key
const generateVideoAvatar = async (text) => {
  const response = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIDID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source_url: avatarImage,
      script: { type: 'text', input: text }
    })
  })
  return response.json()
}
```

## Preset Avatar Options

### Option 1: Professional Avatars

```javascript
const professionalAvatars = [
  {
    name: 'Dr. Sarah',
    image: '/avatars/professional-1.jpg',
    title: 'Mental Health Counselor',
    style: 'professional'
  },
  {
    name: 'Coach Alex',
    image: '/avatars/professional-2.jpg',
    title: 'Wellness Coach',
    style: 'professional'
  }
]
```

### Option 2: Friendly Avatars

```javascript
const friendlyAvatars = [
  {
    name: 'Sarah',
    image: '/avatars/friendly-1.jpg',
    title: 'Your Friend',
    style: 'friendly'
  },
  {
    name: 'Alex',
    image: '/avatars/friendly-2.jpg',
    title: 'Your Buddy',
    style: 'friendly'
  }
]
```

### Option 3: Diverse Avatars

```javascript
const diverseAvatars = [
  { name: 'Aisha', image: '/avatars/aisha.jpg', origin: 'African' },
  { name: 'Chen', image: '/avatars/chen.jpg', origin: 'Asian' },
  { name: 'Maria', image: '/avatars/maria.jpg', origin: 'Latin' },
  { name: 'Priya', image: '/avatars/priya.jpg', origin: 'Indian' },
  { name: 'Yuki', image: '/avatars/yuki.jpg', origin: 'Japanese' }
]
```

## Implementation Steps

### Step 1: Choose Your Approach

- **Simple**: Use AI-generated faces (current)
- **Medium**: Add avatar selection
- **Advanced**: Add 3D or video avatars

### Step 2: Gather Resources

- Images (if not using AI generation)
- API keys (if using external services)
- 3D models (if using 3D avatars)

### Step 3: Update Components

- Modify `HumanAvatar.jsx`
- Update `AvatarChat.jsx`
- Add new components as needed

### Step 4: Test

- Test avatar display
- Test image loading
- Test on different devices
- Test with different screen sizes

### Step 5: Deploy

- Push changes to repository
- Test in production
- Monitor for issues

## Code Examples

### Example 1: Simple Avatar Change

```javascript
// Before
<img src={avatarImage} alt="Avatar" />

// After - with fallback
<img
  src={avatarImage || '/avatars/default.jpg'}
  alt="Support Companion"
  onError={(e) => e.target.src = '/avatars/default.jpg'}
  className="w-full h-full object-cover"
/>
```

### Example 2: Avatar with Badge

```javascript
<div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-mindwell-500">
  <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
  
  {/* Badge */}
  <div className="absolute bottom-0 right-0 bg-mindwell-600 text-white rounded-full p-2">
    ✓
  </div>
</div>
```

### Example 3: Avatar with Status

```javascript
<div className="relative">
  <img src={avatarImage} className="w-32 h-32 rounded-full" />
  
  {/* Status indicator */}
  <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full ${
    isOnline ? 'bg-green-500' : 'bg-gray-400'
  }`}></div>
</div>
```

## Resources

- [Generated Photos API](https://generated.photos/api)
- [Unsplash API](https://unsplash.com/api)
- [Pexels API](https://www.pexels.com/api)
- [Three.js Documentation](https://threejs.org/docs)
- [Lottie Animation](https://lottiefiles.com)
- [D-ID Video API](https://www.d-id.com)

## Next Steps

1. **Try the current implementation** - AI-generated faces
2. **Decide on customization level** - Simple, medium, or advanced
3. **Implement your choice** - Follow the steps above
4. **Test thoroughly** - Ensure everything works
5. **Gather feedback** - See what users prefer

---

**Your avatar is ready for customization!** 🎨👤
