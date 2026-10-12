# 👤 Human Avatar - Visual Guide

## What You'll See

### Before Starting Chat

```
┌─────────────────────────────────────┐
│  Chat with Your Support Companion   │
│                                     │
│         [Realistic Face]            │
│         (AI-Generated)              │
│                                     │
│  [Generate New Avatar] [Start Chat] │
└─────────────────────────────────────┘
```

### During Chat

```
┌─────────────────────────────────────┐
│                                     │
│  Avatar: "Hi Sarah! How are you?"   │
│  [Avatar Message Bubble]            │
│                                     │
│  You: "I'm feeling anxious"         │
│  [Your Message Bubble]              │
│                                     │
│  Avatar: "I hear you. That sounds..." │
│  [Avatar Message Bubble]            │
│                                     │
│         [Realistic Face]            │
│                                     │
│  [Text Input Area]        [Send]    │
│                                     │
│  [End Conversation]                 │
└─────────────────────────────────────┘
```

## Avatar Display

### Avatar Circle

```
    ┌─────────────────┐
    │                 │
    │   [Real Face]   │
    │   (Circular)    │
    │                 │
    └─────────────────┘
    
    Features:
    - Circular frame
    - Blue border
    - Shadow effect
    - High quality image
```

### Avatar Info

```
┌──────────────────────────┐
│   [Avatar Image]         │
│                          │
│  Your Support Companion  │
│  Always here to listen   │
└──────────────────────────┘
```

## Chat Interface

### Message Bubbles

```
User Message (Right):
┌─────────────────────┐
│ I'm feeling anxious │
│ about work today    │
└─────────────────────┘
(Blue background, white text)

Avatar Message (Left):
┌─────────────────────┐
│ I hear you. That    │
│ sounds challenging. │
└─────────────────────┘
(White background, gray text)
```

### Thinking Indicator

```
Avatar is thinking:
┌─────────────────────┐
│ ● ● ●               │
│ (bouncing dots)     │
└─────────────────────┘
```

## User Flow

### Step 1: Avatar Generation

```
Click "Generate New Avatar"
         ↓
    [Loading...]
         ↓
  [New Face Appears]
         ↓
  Like it? Start Chat!
```

### Step 2: Start Conversation

```
Click "Start Conversation"
         ↓
    [Modal Appears]
         ↓
  Confirm in modal
         ↓
  Avatar greets you
```

### Step 3: Chat

```
You type message
         ↓
  Press Enter
         ↓
  Avatar thinks (● ● ●)
         ↓
  Avatar responds
         ↓
  Continue chatting
```

### Step 4: End Chat

```
Click "End Conversation"
         ↓
  Chat cleared
         ↓
  Back to start screen
         ↓
  Generate new avatar or start again
```

## Visual Elements

### Colors

```
Primary (Blue):
- Avatar border: #0284c7
- Buttons: #0284c7
- User messages: #0284c7

Secondary (Gray):
- Avatar messages: #f8fafc
- Text: #1f2937
- Borders: #e5e7eb
```

### Spacing

```
Avatar Circle:
- Size: 128px × 128px
- Border: 4px
- Margin: 16px

Message Bubbles:
- Padding: 16px
- Border radius: 8px
- Max width: 320px

Chat Area:
- Height: 384px (24rem)
- Padding: 24px
- Border: 1px
```

### Animations

```
Avatar Generation:
- Loading spinner
- Fade in effect

Message Typing:
- Character by character
- Cursor blink

Thinking:
- Bouncing dots
- 0.1s delay between dots

Scroll:
- Auto-scroll to latest message
- Smooth animation
```

## Responsive Design

### Desktop (1024px+)

```
┌─────────────────────────────────────┐
│  [Avatar Chat Page]                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Chat Messages Area         │   │
│  │  (Large, full width)        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [Avatar Image]             │   │
│  │  (Centered)                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [Input] [Send]             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Tablet (768px)

```
┌──────────────────────────┐
│  [Avatar Chat]           │
│                          │
│  ┌────────────────────┐  │
│  │  Chat Messages     │  │
│  │  (Medium)          │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │  [Avatar]          │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │  [Input] [Send]    │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

### Mobile (320px)

```
┌──────────────┐
│ Avatar Chat  │
│              │
│ ┌──────────┐ │
│ │ Messages │ │
│ │ (Small)  │ │
│ └──────────┘ │
│              │
│ ┌──────────┐ │
│ │ [Avatar] │ │
│ └──────────┘ │
│              │
│ ┌──────────┐ │
│ │ [Input]  │ │
│ │ [Send]   │ │
│ └──────────┘ │
└──────────────┘
```

## Button States

### Normal State
```
┌─────────────────────┐
│  Start Conversation │
│  (Blue background)  │
└─────────────────────┘
```

### Hover State
```
┌─────────────────────┐
│  Start Conversation │
│  (Darker blue)      │
│  (Cursor: pointer)  │
└─────────────────────┘
```

### Disabled State
```
┌─────────────────────┐
│  Already Checked In │
│  (Gray background)  │
│  (Cursor: default)  │
└─────────────────────┘
```

## Modal Appearance

### Start Conversation Modal

```
┌─────────────────────────────────┐
│ Start a Conversation (Blue Bar) │
├─────────────────────────────────┤
│                                 │
│ Welcome to your support chat! 👋│
│                                 │
│ Your companion is here to       │
│ listen and support you...       │
│                                 │
│ [Note about crisis support]     │
│                                 │
├─────────────────────────────────┤
│              [Cancel] [Start]   │
└─────────────────────────────────┘
```

## Example Conversation

```
┌─────────────────────────────────┐
│  Chat with Your Support         │
│  Companion                       │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Hi Sarah! 👋 I'm here   │   │
│  │ to support you. How     │   │
│  │ have you been sleeping? │   │
│  └─────────────────────────┘   │
│                                 │
│                                 │
│                    ┌──────────┐ │
│                    │ Not well,│ │
│                    │ I'm very │ │
│                    │ anxious  │ │
│                    └──────────┘ │
│                                 │
│  ┌─────────────────────────┐   │
│  │ I hear you. That sounds │   │
│  │ difficult. Have you     │   │
│  │ tried grounding?        │   │
│  └─────────────────────────┘   │
│                                 │
│         [Avatar Image]          │
│                                 │
│  ┌─────────────────────────┐   │
│  │ [Type your response...] │   │
│  │                    [Send]   │
│  └─────────────────────────┘   │
│                                 │
│  [End Conversation]             │
└─────────────────────────────────┘
```

## Accessibility Features

### Visual
- High contrast colors
- Clear readable fonts
- Proper spacing
- Large touch targets

### Keyboard
- Tab navigation
- Enter to send
- Shift+Enter for new line
- Escape to close (future)

### Screen Reader
- Semantic HTML
- Alt text on images
- ARIA labels
- Proper heading hierarchy

## Performance

### Load Times
- Avatar generation: ~1-2 seconds
- Message response: ~1 second
- Chat scroll: Instant
- Image loading: ~500ms

### Optimization
- Image compression
- Lazy loading
- Efficient rendering
- Minimal re-renders

---

**Your human avatar is visually stunning and user-friendly!** 👤✨
