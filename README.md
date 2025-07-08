# Chatbot with Ollama

A real-time local chatbot built with React and Node.js, featuring WebSocket streaming and queue management.

## Features

- **Real-time Chat** - Streaming LLM responses via WebSocket
- **Queue System** - Handle multiple concurrent requests
- **Responsive Design** - Works on desktop and mobile
- **Markdown Support** - Rich text rendering

## Tech Stack

**Frontend:** React, TypeScript, Vite, TailwindCSS, Framer Motion  
**Backend:** Node.js HTTP Server + WebSocket  
**LLM:** Running locally with Ollama

## Frontend Structure

```
App.tsx
└── ChatMain.tsx - Logic, WebSocket connection, state management
    ├── ChatButton.tsx
    ├── Modal.tsx - Chat modal wrapper
    └── ChatLayout.tsx - Main chat interface
        ├── ChatHeader.tsx - New chat and close buttons
        ├── MessageItem.tsx - Individual message rendering
        ├── QuickQuestionsSection.tsx - Welcome + desktop/mobile quick questions
        ├── StreamingDisplay.tsx - real-time streaming response and queue status
        ├── ScrollButton.tsx
        ├── InputSection.tsx - Message input and send functionality
        └── types.ts - Shared TypeScript interfaces
```

## Setup

### Prerequisites

- Node.js 18+
- Ollama + model installed
- Computer not made of wood

### Installation

1. **Clone the repo**

```bash
git clone https://github.com/NikoLearnsCode/chatbot.git
cd chatbot

rm -rf .git  # remove existing git history (optional)
git init     # start fresh repo (optional)
```

2. **Install and start Ollama**

```bash
# Install Ollama (if needed)
brew install ollama  # macOS
# or download from https://ollama.ai

# Download LLM model
ollama pull llama3.1:8b
# or browser other models available here: https://ollama.com

# Start Ollama service
ollama serve
```

3. **Edit selected model**

```ts
// Change this line if you chose a different model than 'llama3.1:8b'

// In ChatMain.tsx
const selectedModel = 'llama3.1:8b';
```

4. **Setup backend**

```bash
cd server
npm install
npm run dev  
```

5. **Setup frontend** (new terminal)

```bash
cd client
npm install
npm run dev  
```
