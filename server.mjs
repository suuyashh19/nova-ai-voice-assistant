
import 'dotenv/config';
import express from 'express';
import { AccessToken, LiveKitAPI } from 'livekit-server-sdk';
import { randomUUID } from 'node:crypto';

const app = express();
app.use(express.json());

const port = 3001;

const {
  LIVEKIT_URL,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET,
  LIVEKIT_AGENT_NAME = 'my-agent',
  LIVEKIT_AGENT_DEPLOYMENT,
} = process.env;

if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  throw new Error('Missing LiveKit environment variables in .env');
}

const apiHost = LIVEKIT_URL
  .replace(/^wss:/, 'https:')
  .replace(/^ws:/, 'http:');

const livekit = new LiveKitAPI({
  host: apiHost,
  apiKey: LIVEKIT_API_KEY,
  secret: LIVEKIT_API_SECRET,
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/token', async (_req, res) => {
  const roomName = `nova-${randomUUID()}`;

  try {
    console.log('\n--- Nova connection request ---');
    console.log('Room:', roomName);
    console.log('Agent name:', LIVEKIT_AGENT_NAME);
    console.log('Target deployment:', LIVEKIT_AGENT_DEPLOYMENT || 'production');

    const token = new AccessToken(
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET,
      {
        identity: `user-${randomUUID()}`,
        ttl: '10m',
      },
    );

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const participantToken = await token.toJwt();

    const dispatchOptions = LIVEKIT_AGENT_DEPLOYMENT
      ? { deployment: LIVEKIT_AGENT_DEPLOYMENT }
      : {};

    const dispatch = await livekit.agentDispatch.createDispatch(
      roomName,
      LIVEKIT_AGENT_NAME,
      dispatchOptions,
    );

    console.log('Dispatch request accepted by LiveKit.');
    console.log('Dispatch ID:', dispatch.id);
    console.log('Dispatch room:', dispatch.room);
    console.log('Dispatch agent:', dispatch.agentName);
    console.log('Dispatch deployment:', dispatch.deployment || 'production');
    console.log('Dispatch state:', JSON.stringify(dispatch.state ?? null));

    res.json({
      serverUrl: LIVEKIT_URL,
      participantToken,
    });
  } catch (error) {
    console.error('--- Nova dispatch failed ---');
    console.error(error);

    res.status(500).json({
      error: 'Could not start Nova AI. Check the backend terminal.',
    });
  }
});

app.listen(port, () => {
  console.log(`Nova AI backend running at http://localhost:${port}`);
  console.log('Agent name:', LIVEKIT_AGENT_NAME);
  console.log('Target deployment:', LIVEKIT_AGENT_DEPLOYMENT || 'production');
});
