// Audio synthesizer and Web Speech API utilities for elderly accessibility

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Gentle pleasant click sound
export function playClickSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // ignore
  }
}

// Gentle success chime for correct match
export function playSuccessChime(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.35);
    });
  } catch {
    // ignore
  }
}

// Soft gentle negative/retry sound (non-punitive, warm)
export function playGentleRetry(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(329.63, now); // E4
    osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.2); // C4
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // ignore
  }
}

// Celebration harp for game completion
export function playCelebrationSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.15 },
      { f: 1046.5, d: 0.35 },
      { f: 880.0, d: 0.2 },
      { f: 1046.5, d: 0.5 },
    ];
    let offset = 0;
    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, now + offset);
      gain.gain.setValueAtTime(0.12, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + note.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + note.d);
      offset += note.d * 0.85;
    });
  } catch {
    // ignore
  }
}

// Song Melodies for the Music Memory Activity
let currentMusicSource: { stop: () => void } | null = null;

export function stopMusicSample() {
  if (currentMusicSource) {
    try {
      currentMusicSource.stop();
    } catch {
      // ignore
    }
    currentMusicSource = null;
  }
}

export function playMusicSample(
  category: 'old_hindi' | 'devotional' | 'folk' | 'classic_bollywood',
  volume = 0.5,
  onEnd?: () => void
): boolean {
  stopMusicSample();
  const ctx = getAudioContext();
  if (!ctx) return false;

  let active = true;
  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume * 0.22, now);
  masterGain.connect(ctx.destination);

  // Different melodic phrases evoking cultural familiarity
  let sequence: { note: number; dur: number }[] = [];

  if (category === 'old_hindi') {
    // Nostalgic golden-era Kishore / Rafi warm pentatonic motif
    sequence = [
      { note: 392.0, dur: 0.5 }, // G4
      { note: 440.0, dur: 0.5 }, // A4
      { note: 523.25, dur: 0.8 }, // C5
      { note: 587.33, dur: 0.4 }, // D5
      { note: 523.25, dur: 0.6 }, // C5
      { note: 440.0, dur: 0.5 }, // A4
      { note: 392.0, dur: 0.9 }, // G4
      { note: 329.63, dur: 0.6 }, // E4
      { note: 392.0, dur: 1.2 }, // G4
    ];
  } else if (category === 'devotional') {
    // Soothing devotional Bhajan (Raga Bhupali motif)
    sequence = [
      { note: 261.63, dur: 0.6 }, // Sa (C4)
      { note: 293.66, dur: 0.6 }, // Re (D4)
      { note: 329.63, dur: 0.8 }, // Ga (E4)
      { note: 392.0, dur: 0.7 }, // Pa (G4)
      { note: 440.0, dur: 0.9 }, // Dha (A4)
      { note: 392.0, dur: 0.6 }, // Pa
      { note: 329.63, dur: 0.8 }, // Ga
      { note: 293.66, dur: 0.6 }, // Re
      { note: 261.63, dur: 1.4 }, // Sa
    ];
  } else if (category === 'folk') {
    // Gentle rhythmic Indian folk melody
    sequence = [
      { note: 440.0, dur: 0.35 },
      { note: 493.88, dur: 0.35 },
      { note: 523.25, dur: 0.5 },
      { note: 440.0, dur: 0.35 },
      { note: 392.0, dur: 0.4 },
      { note: 440.0, dur: 0.6 },
      { note: 523.25, dur: 0.4 },
      { note: 587.33, dur: 0.6 },
      { note: 659.25, dur: 1.0 },
    ];
  } else {
    // Classic Bollywood festive warm strings
    sequence = [
      { note: 349.23, dur: 0.4 },
      { note: 392.0, dur: 0.4 },
      { note: 440.0, dur: 0.4 },
      { note: 523.25, dur: 0.7 },
      { note: 587.33, dur: 0.4 },
      { note: 523.25, dur: 0.5 },
      { note: 440.0, dur: 0.5 },
      { note: 392.0, dur: 1.1 },
    ];
  }

  let timeCursor = now;
  const oscillators: OscillatorNode[] = [];

  sequence.forEach((item) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Use warm combination of sine and triangle harmonics
    osc.type = category === 'devotional' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(item.note, timeCursor);

    gain.gain.setValueAtTime(0, timeCursor);
    gain.gain.linearRampToValueAtTime(0.3, timeCursor + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, timeCursor + item.dur);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(timeCursor);
    osc.stop(timeCursor + item.dur);
    oscillators.push(osc);

    timeCursor += item.dur * 0.95;
  });

  const totalDuration = timeCursor - now;

  const timer = setTimeout(() => {
    if (active && onEnd) {
      onEnd();
    }
  }, totalDuration * 1000);

  currentMusicSource = {
    stop: () => {
      active = false;
      clearTimeout(timer);
      oscillators.forEach((o) => {
        try {
          o.stop();
        } catch {
          // ignore
        }
      });
      masterGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    },
  };

  return true;
}

// Text-to-speech for elderly reading aloud
export function speakText(
  text: string,
  lang: 'en' | 'hi' = 'en',
  rate = 0.85,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate; // slightly slower for elderly clarity
    utterance.pitch = 1.0;

    // Pick best voice
    const voices = window.speechSynthesis.getVoices();
    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
      const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('india'));
      if (hindiVoice) utterance.voice = hindiVoice;
    } else {
      utterance.lang = 'en-IN';
      const indEngVoice = voices.find((v) => v.lang === 'en-IN' || v.lang.includes('en-IN'));
      if (indEngVoice) {
        utterance.voice = indEngVoice;
      } else {
        const engVoice = voices.find((v) => v.lang.startsWith('en'));
        if (engVoice) utterance.voice = engVoice;
      }
    }

    if (onStart) utterance.onstart = onStart;
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
