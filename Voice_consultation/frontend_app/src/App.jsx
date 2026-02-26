import React, { useState, useEffect, useRef } from 'react';
import { Phone, Send, Info, Sparkles, Mic, MicOff } from 'lucide-react';
import { createWebCall, getLatestCall } from './api';
import CallCard from './components/CallCard';
import { RetellWebClient } from 'retell-client-js-sdk';

const retellWebClient = new RetellWebClient();

function App() {
  const [loading, setLoading] = useState(false);
  const [latestCall, setLatestCall] = useState(null);
  const [error, setError] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const callInitiated = useRef(false);

  const fetchLatestCall = async () => {
    try {
      const response = await getLatestCall();
      if (response.data) {
        setLatestCall(response.data);
      }
    } catch (err) {
      console.error('Error fetching latest call:', err);
    }
  };

  useEffect(() => {
    fetchLatestCall();
    const interval = setInterval(() => {
      if (latestCall?.status === 'calling') {
        fetchLatestCall();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [latestCall?.status]);

  // Request Mic Access
  const enableMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicEnabled(true);
    } catch (err) {
      setError("Microphone access denied. Please enable it to use the voice agent.");
    }
  };

  const startWebCall = async () => {
    if (callInitiated.current || !micEnabled) return;
    callInitiated.current = true;
    setLoading(true);
    setError(null);
    setIsCalling(true);

    try {
      const response = await createWebCall();
      const { access_token } = response.data;

      if (access_token.startsWith('mock-')) {
        console.log('Mock Mode: Connection simulated');
        // Fake connection for UI feedback
        setTimeout(() => setLoading(false), 2000);
      } else {
        await retellWebClient.startCall({
          accessToken: access_token,
        });
        setLoading(false);
      }

      fetchLatestCall();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate voice agent');
      setIsCalling(false);
      callInitiated.current = false;
    } finally {
      setLoading(false);
    }
  };

  const stopWebCall = () => {
    if (!retellWebClient) return;
    try {
      retellWebClient.stopCall();
      setIsCalling(false);
      callInitiated.current = false;
    } catch (err) {
      console.error("Stop call error", err);
    }
  };

  return (
    <div className="min-h-screen app-container flex flex-col items-center justify-center p-4">
      <div className="glass-card p-10 w-full max-w-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Sparkles className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight text-center">
          AI Voice Booking Agent
        </h1>
        <p className="text-blue-100/60 mb-8 text-center text-sm">
          Hover over the button to talk to our AI assistant directly
        </p>

        {!micEnabled ? (
          <button
            onClick={enableMic}
            className="glow-button w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white tracking-wide transition-all"
          >
            <Mic className="w-5 h-5" />
            Enable Microphone to Start
          </button>
        ) : (
          <div className="relative">
            <button
              disabled={loading}
              onClick={isCalling ? stopWebCall : startWebCall}
              className={`w-full py-8 rounded-2xl flex flex-col items-center justify-center gap-4 font-bold text-white tracking-widest transition-all overflow-hidden border-2 ${isCalling
                ? 'bg-red-500/20 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse'
                : 'bg-indigo-500/20 border-indigo-500/50 hover:bg-indigo-500/30 shadow-lg'
                }`}
            >
              {loading ? (
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isCalling ? (
                <div className="relative">
                  <Mic className="w-10 h-10 text-red-400" />
                  <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-ping" />
                </div>
              ) : (
                <MicOff className="w-10 h-10 text-indigo-300" />
              )}
              <span className="uppercase text-sm tracking-[0.2em]">
                {loading ? 'Initializing...' : isCalling ? 'Click to Stop' : 'Click to Talk'}
              </span>
            </button>

            {isCalling && (
              <div className="absolute -inset-4 rounded-3xl bg-indigo-500/10 blur-xl -z-10 animate-pulse" />
            )}
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-200 text-sm animate-fade-in">
            <Info className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-8 flex justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${micEnabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-500'}`} />
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
            Mic Status: {micEnabled ? 'Ready' : 'Not Enabled'}
          </span>
        </div>
      </div>

      <CallCard call={latestCall} />

      <div className="mt-12 text-white/20 text-xs font-medium tracking-widest uppercase">
        Powered by Retell AI Web SDK
      </div>
    </div>
  );
}

export default App;
