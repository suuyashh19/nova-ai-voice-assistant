# Nova AI — Real-Time Voice Assistant

Nova AI is a browser-based AI voice assistant built with React, TypeScript, Node.js, and LiveKit. It provides a web interface for real-time voice conversations with an AI agent.

## Features

- Real-time audio communication using LiveKit
- Browser microphone access and audio playback
- Animated assistant interface and voice-state visualizer
- Microphone mute and unmute controls
- Backend API for generating room access tokens
- Agent dispatch integration
- Environment-based configuration for credentials

## Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe frontend development |
| Vite | Frontend development and build tooling |
| Node.js | Backend runtime |
| Express | API server |
| LiveKit | Real-time audio and agent communication |

## Project Structure

```text
nova-ai-voice-assistant/
├── public/
├── src/
│   ├── assets/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── server.mjs
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
└── README.md
```

The LiveKit agent runs from a separate project directory.

## Getting Started

### Prerequisites

- Node.js
- pnpm
- A LiveKit Cloud project
- A configured LiveKit agent

### Install dependencies

```bash
pnpm install
```

### Configure environment variables

Create a `.env` file in the project root:

```env
LIVEKIT_URL=your_livekit_server_url
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_AGENT_NAME=my-agent
LIVEKIT_AGENT_DEPLOYMENT=your_development_deployment
```

Use your own LiveKit credentials locally. Never commit real credentials or tokens.

### Start the backend

```bash
node server.mjs
```

### Start the frontend

In a separate terminal:

```bash
pnpm dev
```

Configure the LiveKit agent separately and start it according to its project instructions. The backend deployment setting must match the active development deployment when targeting it explicitly.

## Security

- Keep `.env` and `.env.local` out of Git.
- Never expose API secrets or access tokens in frontend code.
- Use HTTPS and secure environment variables when deploying.

## Future Improvements

- Improve conversational intelligence and error handling
- Add automated tests
- Deploy a public demo
- Improve mobile responsiveness and accessibility

## Project Status

Working prototype — active development.
