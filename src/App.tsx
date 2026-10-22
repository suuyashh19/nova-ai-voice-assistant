
import { useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  useConnectionState,
  useParticipants,
  useVoiceAssistant,
  useLocalParticipant,
} from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import '@livekit/components-styles';
import './App.css';

type Connection = {
  serverUrl: string;
  participantToken: string;
};

function ConnectedAssistant({
  onDisconnect,
}: {
  onDisconnect: () => void;
}) {
  const state = useConnectionState();
  const participants = useParticipants();
  const { state: assistantState } = useVoiceAssistant();
  const { localParticipant, isMicrophoneEnabled } =
    useLocalParticipant();

  const isConnected = state === ConnectionState.Connected;
  const assistantJoined = participants.length > 1;

  const statusText = !isConnected
    ? 'Connecting to Nova…'
    : !assistantJoined
      ? 'Waiting for Nova to join the room…'
      : assistantState === 'speaking'
        ? 'Nova is speaking'
        : assistantState === 'listening'
          ? 'Listening to you…'
          : assistantState === 'thinking'
            ? 'Nova is thinking…'
            : 'Nova is ready. Start speaking.';

  const orbState = assistantState || 'idle';

  const visualizerState =
    assistantState === 'speaking'
      ? 'speaking'
      : assistantState === 'listening'
        ? 'listening'
        : 'idle';

  async function toggleMicrophone() {
    try {
      await localParticipant.setMicrophoneEnabled(
        !isMicrophoneEnabled,
      );
    } catch (err) {
      console.error('Could not change microphone state:', err);
    }
  }

  return (
    <div className="assistant-panel">
      <div className={`orb active orb-${orbState}`}>
        <div className="orb-core">N</div>
      </div>

      <p className="eyebrow">NOVA AI</p>

      <h2>{isConnected ? 'You are connected' : 'Connecting…'}</h2>

      <p className="muted" aria-live="polite">
        {!isMicrophoneEnabled
          ? 'Microphone is muted'
          : statusText}
      </p>

      <div
        className={`voice-visualizer ${visualizerState}`}
        aria-label={`Nova voice state: ${visualizerState}`}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} />
        ))}
      </div>

      <div className="audio-help">
        <StartAudio label="Enable audio" />
        <RoomAudioRenderer />
      </div>

      <button
        className="connect-button"
        onClick={toggleMicrophone}
        disabled={!isConnected}
      >
        {isMicrophoneEnabled
          ? '🎙 Mute Microphone'
          : '🔇 Unmute Microphone'}
      </button>

      <button
        className="disconnect-button"
        onClick={onDisconnect}
      >
        Disconnect
      </button>
    </div>
  );
}

export default function App() {
  const [connection, setConnection] =
    useState<Connection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function connectToNova() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/token', {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || 'Could not connect to Nova.',
        );
      }

      setConnection({
        serverUrl: result.serverUrl,
        participantToken: result.participantToken,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not connect to Nova.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <header className="topbar">
        <a className="brand" href="/">
          NOVA<span className="brand-light">AI</span>
        </a>
        <span className="topbar-label">
          YOUR AI VOICE ASSISTANT
        </span>
      </header>

      <section className="hero">
        <p className="eyebrow">A NEW WAY TO CONVERSE</p>

        <h1>
          Meet your AI.
          <br />
          <span>Just speak.</span>
        </h1>

        <p className="subtitle">
          Have a natural conversation with Nova.
          <br />
          No typing required. Just your voice.
        </p>

        {connection ? (
          <LiveKitRoom
            serverUrl={connection.serverUrl}
            token={connection.participantToken}
            connect={true}
            audio={true}
            video={false}
            onDisconnected={() => setConnection(null)}
          >
            <ConnectedAssistant
              onDisconnect={() => setConnection(null)}
            />
          </LiveKitRoom>
        ) : (
          <div className="connect-panel">
            <div className="orb">
              <div className="orb-core">N</div>
            </div>

            <p className="panel-title">Ready when you are</p>

            <p className="muted">
              Connect to start your voice session.
            </p>

            <button
              className="connect-button"
              onClick={connectToNova}
              disabled={loading}
            >
              {loading ? 'Connecting…' : '🎙 Talk to Nova'}
            </button>

            {error && (
              <p className="error-message">{error}</p>
            )}

            <p className="fine-print">
              Your browser may ask for microphone permission.
            </p>
          </div>
        )}
      </section>

      <footer>
        <span>BUILT WITH LIVEKIT</span>
        <span>VOICE. INTELLIGENCE. SIMPLICITY.</span>
      </footer>
    </main>
  );
}
