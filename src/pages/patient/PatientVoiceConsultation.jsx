import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Info } from 'lucide-react';
import { RetellWebClient } from 'retell-client-js-sdk';
import { createWebCall, getLatestCall } from '../../lib/voiceAgentApi';
import VoiceCallCard from '../../components/VoiceCallCard';

const retellWebClient = new RetellWebClient();

export default function PatientVoiceConsultation() {
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
    const shouldPoll = latestCall?.status === 'calling';
    if (!shouldPoll) return undefined;

    const interval = setInterval(() => {
      fetchLatestCall();
    }, 3000);

    return () => clearInterval(interval);
  }, [latestCall?.status]);

  const enableMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicEnabled(true);
      setError(null);
    } catch (err) {
      setError(
        'Microphone access denied. Please enable it in your browser settings to use the voice agent.'
      );
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
      const { access_token: accessToken } = response.data;

      if (accessToken?.startsWith('mock-')) {
        // Mock mode from backend – simulate connection for a nicer UX
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      } else if (accessToken) {
        await retellWebClient.startCall({ accessToken });
        setLoading(false);
      } else {
        throw new Error('Missing access token from API');
      }

      fetchLatestCall();
    } catch (err) {
      const apiError =
        err?.response?.data?.error || err.message || 'Failed to start voice call';
      setError(apiError);
      setIsCalling(false);
      callInitiated.current = false;
    } finally {
      setLoading(false);
    }
  };

  const stopWebCall = () => {
    try {
      retellWebClient.stopCall();
      setIsCalling(false);
      callInitiated.current = false;
    } catch (err) {
      console.error('Stop call error', err);
    }
  };

  const handlePrimaryClick = () => {
    if (!micEnabled) {
      enableMic();
    } else if (isCalling) {
      stopWebCall();
    } else {
      startWebCall();
    }
  };

  const primaryLabel = !micEnabled
    ? 'Enable microphone to start'
    : loading
    ? 'Initializing...'
    : isCalling
    ? 'Click to stop'
    : 'Click to talk';

  const PrimaryIcon = !micEnabled ? Mic : isCalling ? Mic : MicOff;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          AI Voice Booking Agent
        </h2>
        <p className="text-sm text-slate-600">
          Talk to our AI assistant to book or manage your appointments hands‑free.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200/80">
              Voice assistant
            </p>
            <h3 className="text-xl font-semibold tracking-tight">
              Start a voice consultation
            </h3>
            <p className="text-xs text-indigo-100/80 max-w-md">
              We&apos;ll connect you to an AI agent that can help you book, reschedule,
              or cancel appointments using just your voice.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrimaryClick}
            disabled={loading}
            className={`group relative flex w-full max-w-xs flex-col items-center justify-center gap-3 rounded-2xl border-2 px-6 py-6 text-center text-xs font-semibold tracking-[0.22em] uppercase transition-all ${
              isCalling
                ? 'border-red-400 bg-red-500/20 shadow-[0_0_24px_rgba(248,113,113,0.6)]'
                : 'border-indigo-400/80 bg-indigo-500/20 hover:bg-indigo-500/30 shadow-lg'
            }`}
          >
            <div className="relative flex size-12 items-center justify-center rounded-full bg-black/30">
              {loading ? (
                <div className="size-6 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <PrimaryIcon
                  className={`size-6 ${
                    isCalling ? 'text-red-300' : micEnabled ? 'text-indigo-200' : 'text-indigo-200'
                  }`}
                />
              )}
              {isCalling && (
                <span className="absolute -inset-1 rounded-full border border-red-400/60 animate-ping" />
              )}
            </div>
            <span>{primaryLabel}</span>
            <span className="text-[10px] font-normal tracking-[0.28em] text-white/40">
              Mic status: {micEnabled ? 'Ready' : 'Not enabled'}
            </span>
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-100">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </section>

      <VoiceCallCard call={latestCall} />
    </div>
  );
}

