// AI Voice Companion utilities: Gemini TTS audio decoding, Speech Recognition, and API bridging

import { Language, VoiceMessage, VoiceSuggestedAction, GameId } from '../types';
import { speakText, stopSpeaking } from './sound';

// Web Audio API playback for 24kHz 16-bit PCM returned by Gemini TTS
let ttsAudioCtx: AudioContext | null = null;
let currentSourceNode: AudioBufferSourceNode | null = null;

function getTTSAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ttsAudioCtx || ttsAudioCtx.state === 'closed') {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      try {
        ttsAudioCtx = new AudioContextClass();
      } catch {
        try {
          ttsAudioCtx = new AudioContextClass({ sampleRate: 24000 });
        } catch {
          return null;
        }
      }
    }
  }
  if (ttsAudioCtx && ttsAudioCtx.state === 'suspended') {
    ttsAudioCtx.resume().catch(() => {});
  }
  return ttsAudioCtx;
}

/**
 * Unlock AudioContext & pre-warm speech synthesis on user interaction to avoid browser autoplay blocks
 */
export function unlockAudioContext() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = getTTSAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  } catch {
    // ignore
  }
}

export function stopAnyVoicePlayback() {
  stopSpeaking();
  if (currentSourceNode) {
    try {
      currentSourceNode.onended = null;
      currentSourceNode.stop();
      currentSourceNode.disconnect();
    } catch {
      // ignore
    }
    currentSourceNode = null;
  }
}

/**
 * Decode base64 16-bit PCM (linear PCM, 24kHz, mono) into an AudioBuffer and play it
 */
export async function playGeminiPCMAudio(
  base64Audio: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<boolean> {
  try {
    stopAnyVoicePlayback();
    const ctx = getTTSAudioContext();
    if (!ctx) return false;

    // Convert base64 to Uint8Array
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert 16-bit signed PCM to 32-bit float PCM [-1.0, 1.0]
    const numSamples = Math.floor(bytes.length / 2);
    const audioBuffer = ctx.createBuffer(1, numSamples, 24000);
    const channelData = audioBuffer.getChannelData(0);
    const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    for (let i = 0; i < numSamples; i++) {
      const int16 = dataView.getInt16(i * 2, true); // little-endian
      channelData[i] = int16 < 0 ? int16 / 32768 : int16 / 32767;
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    source.onended = () => {
      currentSourceNode = null;
      if (onEnd) onEnd();
    };

    if (onStart) onStart();
    source.start(0);
    currentSourceNode = source;
    return true;
  } catch (err) {
    console.warn('Failed to play Gemini PCM audio, falling back to Web Speech synthesis:', err);
    return false;
  }
}

/**
 * Speak text using either Gemini TTS (natural server AI voice) or Web Speech API fallback
 */
export async function playCompanionVoice(
  text: string,
  language: Language = 'en',
  onStart?: () => void,
  onEnd?: () => void,
  voiceName: 'Kore' | 'Puck' = 'Kore',
  rate = 0.85
): Promise<void> {
  stopAnyVoicePlayback();
  unlockAudioContext();

  try {
    const res = await fetch('/api/voice-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        language,
        voice: voiceName,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audio) {
        const played = await playGeminiPCMAudio(data.audio, onStart, onEnd);
        if (played) return;
      }
    }
  } catch {
    // Continue to fallback
  }

  // Graceful fallback to browser speech synthesis
  speakText(text, language, rate, onStart, onEnd);
}

/**
 * Client-side empathetic fallback if server is unreachable
 */
function getClientOfflineVoiceResponse(prompt: string, language: Language): {
  reply: string;
  sentiment: 'warm' | 'calm' | 'reflective' | 'cheerful' | 'encouraging';
  topic: string;
  suggestedAction?: VoiceSuggestedAction;
  quickFollowUps: string[];
} {
  const p = prompt.toLowerCase();
  if (language === 'hi') {
    if (p.includes('ऑर्डर') || p.includes('मंगाओ') || p.includes('मंगाना') || p.includes('स्टोर') || p.includes('दुकान') || p.includes('खरीद') || p.includes('फार्मेसी') || p.includes('रीफिल')) {
      return {
        reply: 'शर्मा जी, मैंने आपके लिए ऑनलाइन दवा स्टोर खोल दिया है। आपकी डोनेपेज़िल 5mg और टेल्मीसार्टन की नई शीशी 2 घंटे के अंदर आपके घर पहुँच जाएगी।',
        sentiment: 'warm',
        topic: 'ऑनलाइन दवा स्टोर व ऑर्डर',
        suggestedAction: {
          type: 'open_pharmacy',
          labelEn: 'Open Medicine Store',
          labelHi: 'दवा स्टोर खोलें',
          autoExecute: true,
        },
        quickFollowUps: ['दवा रीफिल करो', 'ऑर्डर ट्रैक करें', 'पर्चा अपलोड करें'],
      };
    }
    if (p.includes('दवा') || p.includes('गोली') || p.includes('मेडिसिन') || p.includes('डोनेपेज़िल') || p.includes('खा ली')) {
      return {
        reply: 'शर्मा जी, मैंने आपकी दवाओं की स्थिति देख ली है। डोनेपेज़िल 5mg रात को और टेल्मीसार्टन सुबह निर्धारित है। मैं आपकी दवा को अद्यतित कर रहा हूँ।',
        sentiment: 'warm',
        topic: 'दवा अनुस्मारक व समय-सारिणी',
        suggestedAction: {
          type: 'mark_medicine',
          labelEn: 'Medication Checked',
          labelHi: 'दवा अद्यतित की गई',
          autoExecute: true,
        },
        quickFollowUps: ['हाँ, मैंने दवा ले ली', '15 मिनट बाद याद दिलाना', 'अनीता को बताओ'],
      };
    }
    if (p.includes('अस्पताल') || p.includes('डॉक्टर') || p.includes('चक्कर') || p.includes('दर्द') || p.includes('इमरजेंसी')) {
      return {
        reply: 'शर्मा जी, घबराइए नहीं। एम्स और मैक्स हॉस्पिटल हमारे बहुत नजदीक हैं और वरिष्ठ न्यूरोसर्जन ऑन-कॉल उपलब्ध हैं। मैंने अस्पताल डायरेक्टरी खोल दी है।',
        sentiment: 'calm',
        topic: 'स्वास्थ्य व नजदीकी अस्पताल',
        suggestedAction: {
          type: 'show_medical',
          labelEn: 'View Hospitals & Doctors',
          labelHi: 'अस्पताल व डॉक्टर देखें',
          autoExecute: true,
        },
        quickFollowUps: ['अस्पताल विवरण देखें', 'अनीता को कॉल करें', 'गहरी सांस लें'],
      };
    }
    if (p.includes('अनीता') || p.includes('कॉल') || p.includes('फोन') || p.includes('बिटिया')) {
      return {
        reply: 'शर्मा जी, मैं आपकी बेटी अनीता जी को कॉल कनेक्ट कर रहा हूँ। वह हमेशा आपके लिए मौजूद हैं।',
        sentiment: 'warm',
        topic: 'परिवार व केयरगिवर कॉल',
        suggestedAction: {
          type: 'call_caregiver',
          labelEn: 'Call Anita Sharma',
          labelHi: 'अनीता को कॉल करें',
          autoExecute: true,
        },
        quickFollowUps: ['अनीता से बात करो', 'मैसेज भेजें', 'मैं ठीक हूँ'],
      };
    }
    if (p.includes('गाना') || p.includes('संगीत') || p.includes('धुन') || p.includes('गीत')) {
      return {
        reply: 'शर्मा जी, पुराने मधुर गीत मन को बहुत सुकून देते हैं। आइए हम मिलकर संगीत स्मृति का आनंद लेते हैं!',
        sentiment: 'reflective',
        topic: 'पुरानी संगीत स्मृतियां',
        suggestedAction: {
          type: 'play_music',
          gameId: 'music-memory',
          labelEn: 'Play Music Memory',
          labelHi: 'संगीत स्मृति खेलें',
          autoExecute: true,
        },
        quickFollowUps: ['हाँ, संगीत स्मृति शुरू करें', 'मुझे किशोर कुमार पसंद हैं', 'आज मेरा दिन अच्छा है'],
      };
    }
    if (p.includes('सांस') || p.includes('घबराहट') || p.includes('शांत') || p.includes('उदास')) {
      return {
        reply: 'शर्मा जी, मैं हमेशा आपके साथ हूँ। आइए मिलकर एक गहरी, आरामदायक सांस लेते हैं — धीरे से अंदर... और बाहर।',
        sentiment: 'calm',
        topic: 'भावनात्मक संबल व शांति',
        suggestedAction: {
          type: 'deep_breath',
          labelEn: 'Gentle Breathing',
          labelHi: 'गहरी सांस व्यायाम',
          autoExecute: true,
        },
        quickFollowUps: ['गहरी सांस लेते हैं', 'अनीता से बात कराओ', 'कोई खेल खेलें'],
      };
    }
    if (p.includes('खेल') || p.includes('गतिविधि') || p.includes('स्मृति') || p.includes('बोर')) {
      return {
        reply: 'आज का दिन बहुत सुहावना है शर्मा जी! चलिए स्मृति मिलान खेल शुरू करते हैं, यह आपके मन को तरोताजा कर देगा।',
        sentiment: 'encouraging',
        topic: 'दैनिक संज्ञानात्मक गतिविधि',
        suggestedAction: {
          type: 'start_game',
          gameId: 'memory-match',
          labelEn: 'Start Memory Match',
          labelHi: 'स्मृति मिलान खेलें',
          autoExecute: true,
        },
        quickFollowUps: ['स्मृति मिलान खेलें', 'चित्र स्मरण दिखाओ', 'दवा का समय बताओ'],
      };
    }
    return {
      reply: 'नमस्ते शर्मा जी! मैं आपका साथी हूँ। आप कैसा महसूस कर रहे हैं? हम कोई खेल खेल सकते हैं, दवा देख सकते हैं या बात कर सकते हैं।',
      sentiment: 'warm',
      topic: 'दैनिक संवाद व कुशलक्षेम',
      quickFollowUps: ['आज क्या नया है?', 'कोई पुरानी यादें सुनाओ', 'गहरी सांस लें'],
    };
  }

  if (p.includes('order') || p.includes('store') || p.includes('pharmacy') || p.includes('refill') || p.includes('buy') || p.includes('purchase')) {
    return {
      reply: 'Sharma Ji, I have opened your Online Medicine Store. Your routine Donepezil 5mg and Telmisartan prescriptions can be delivered to your doorstep within 2 hours with express dispatch.',
      sentiment: 'warm',
      topic: 'Online Pharmacy & Doorstep Refill',
      suggestedAction: {
        type: 'open_pharmacy',
        labelEn: 'Open Medicine Store',
        labelHi: 'दवा स्टोर खोलें',
        autoExecute: true,
      },
      quickFollowUps: ['Refill Donepezil', 'Track my delivery', 'Upload Doctor Rx'],
    };
  }

  if (p.includes('medicine') || p.includes('pill') || p.includes('dose') || p.includes('medication') || p.includes('taken')) {
    return {
      reply: 'Sharma Ji, I have checked your medication status. Donepezil 5mg is scheduled after dinner and Telmisartan with breakfast. I am updating your record now.',
      sentiment: 'warm',
      topic: 'Medication Schedule',
      suggestedAction: {
        type: 'mark_medicine',
        labelEn: 'Medication Checked',
        labelHi: 'दवा अद्यतित की गई',
        autoExecute: true,
      },
      quickFollowUps: ['I took my medicine', 'Snooze for 15 minutes', 'Tell Anita'],
    };
  }
  if (p.includes('hospital') || p.includes('doctor') || p.includes('dizzy') || p.includes('emergency') || p.includes('neuro')) {
    return {
      reply: 'Please stay calm, Sharma Ji. AIIMS Neurosciences and Max Super Speciality are less than 11 minutes away with neurosurgeons on-duty.',
      sentiment: 'calm',
      topic: 'Emergency & Hospital Care',
      suggestedAction: {
        type: 'show_medical',
        labelEn: 'View Hospitals & Doctors',
        labelHi: 'अस्पताल व डॉक्टर देखें',
        autoExecute: true,
      },
      quickFollowUps: ['View nearby hospitals', 'Call Anita', 'Take a deep breath'],
    };
  }
  if (p.includes('call') || p.includes('anita') || p.includes('phone') || p.includes('daughter')) {
    return {
      reply: 'Connecting you with your daughter Anita right now, Sharma Ji. She is always here for you.',
      sentiment: 'warm',
      topic: 'Family & Caregiver Call',
      suggestedAction: {
        type: 'call_caregiver',
        labelEn: 'Call Anita Sharma',
        labelHi: 'अनीता को कॉल करें',
        autoExecute: true,
      },
      quickFollowUps: ['Call Anita now', 'Send voice note', 'I am doing well'],
    };
  }
  if (p.includes('music') || p.includes('song') || p.includes('melody') || p.includes('tune')) {
    return {
      reply: 'Sharma Ji, classic golden melodies bring so much warmth to the heart. Let us enjoy the Music Memory activity together!',
      sentiment: 'reflective',
      topic: 'Golden Melodies & Music',
      suggestedAction: {
        type: 'play_music',
        gameId: 'music-memory',
        labelEn: 'Play Music Memory',
        labelHi: 'संगीत स्मृति खेलें',
        autoExecute: true,
      },
      quickFollowUps: ['Start Music Memory', 'Tell me about old songs', 'What activities are ready?'],
    };
  }
  if (p.includes('game') || p.includes('activity') || p.includes('play') || p.includes('bored') || p.includes('memory')) {
    return {
      reply: 'Today is a wonderful day, Sharma Ji! Let us start Memory Match to give your mind an uplifting boost.',
      sentiment: 'encouraging',
      topic: 'Cognitive Engagement Activity',
      suggestedAction: {
        type: 'start_game',
        gameId: 'memory-match',
        labelEn: 'Start Memory Match',
        labelHi: 'स्मृति मिलान शुरू करें',
        autoExecute: true,
      },
      quickFollowUps: ['Play Memory Match', 'Try Picture Recall', 'What is next?'],
    };
  }
  return {
    reply: 'Namaste, Sharma Ji! It is wonderful to hear your voice. How are you feeling today, and what would you like to explore together?',
    sentiment: 'warm',
    topic: 'Daily Check-in & Companion Chat',
    quickFollowUps: ['What activity should I do?', 'Check my medications', 'Play classic music'],
  };
}

/**
 * Send user prompt to server-side Gemini API (/api/voice-companion)
 */
export async function askVoiceCompanion(
  prompt: string,
  language: Language,
  history: VoiceMessage[] = [],
  currentMood?: string
): Promise<{
  reply: string;
  sentiment: 'warm' | 'calm' | 'reflective' | 'cheerful' | 'encouraging';
  topic: string;
  suggestedAction?: VoiceSuggestedAction;
  quickFollowUps: string[];
}> {
  const formattedHistory = history.slice(-6).map((m) => ({
    role: m.role === 'user' ? ('user' as const) : ('model' as const),
    text: m.text,
  }));

  try {
    const res = await fetch('/api/voice-companion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        language,
        history: formattedHistory,
        currentMood,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Network or server error calling /api/voice-companion:', err);
  }

  // Resilient fallback so companion never fails
  return getClientOfflineVoiceResponse(prompt, language);
}

/**
 * Check if Web Speech Recognition is supported in user's browser
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
};

/**
 * Create a configured SpeechRecognition instance with live real-time streaming transcripts
 */
export function createSpeechRecognizer(
  language: Language,
  onResult: (transcript: string, isFinal: boolean) => void,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: string) => void
): SpeechRecognitionInstance | null {
  if (typeof window === 'undefined') return null;

  const SpeechRecognitionClass =
    (window as unknown as { SpeechRecognition: new () => SpeechRecognitionInstance }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) return null;

  try {
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => {
      if (onStart) onStart();
    };

    recognition.onresult = (event: unknown) => {
      const e = event as {
        resultIndex: number;
        results: {
          length: number;
          [index: number]: {
            isFinal: boolean;
            [index: number]: { transcript: string };
          };
        };
      };

      let finalStr = '';
      let interimStr = '';

      for (let i = 0; i < e.results.length; ++i) {
        const item = e.results[i];
        if (item.isFinal) {
          finalStr += item[0].transcript + ' ';
        } else {
          interimStr += item[0].transcript;
        }
      }

      const combined = (finalStr + interimStr).trim();
      const hasFinal = Boolean(finalStr.trim());
      if (combined) {
        onResult(combined, hasFinal && !interimStr);
      }
    };

    recognition.onerror = (event: unknown) => {
      const e = event as { error: string };
      console.warn('Speech recognition error:', e?.error);
      if (onError) onError(e?.error || 'speech_error');
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    return recognition;
  } catch (err) {
    console.error('Failed to create speech recognizer:', err);
    return null;
  }
}

