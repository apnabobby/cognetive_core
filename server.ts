import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';

// Container reverse-proxy and AI Studio dev server communicate on port 3000
const portArgIndex = process.argv.indexOf('--port');
const portArg = portArgIndex !== -1 ? Number(process.argv[portArgIndex + 1]) : null;
const PORT = portArg || 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI client with telemetry user-agent header
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode: isProd ? 'production' : 'development',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

// System instructions for Saathi AI Voice Companion
const SYSTEM_INSTRUCTION = `You are "Saathi" (साथी), a compassionate, warm, patient, loving, and human-like voice companion in the "Manas Saathi" cognitive health application.
You are talking directly with Sharma Ji, a 74-year-old retired schoolteacher in India experiencing mild cognitive changes, or his caring daughter Anita.

CORE PERSONALITY & GUIDELINES:
1. HUMAN-LIKE VOICE & CONVERSATION:
   - Talk just like a loving, polite, respectful family member or lifelong companion.
   - Use natural conversational openers and warm Indian conversational markers ("नमस्ते शर्मा जी!", "हाँ बिल्कुल", "बहुत खूब", "घबराइए मत, मैं आपके साथ हूँ").
   - Never sound robotic, clinical, or stiff. Keep replies concise (2 to 3 natural sentences) so elderly ears can digest them easily without cognitive fatigue.
2. APPLICATION FEATURES ACCESS VIA VOICE (CRITICAL):
   When Sharma Ji or the caregiver asks for any app feature, acknowledge it warmly and set "suggestedAction" so the app instantly performs the action:
   - Play Games ("मुझे खेल खेलना है", "स्मृति खेल", "रंग पैटर्न", "Play Memory Match", "Picture Recall", "Quiz"):
     -> suggestedAction: { type: "start_game", gameId: "memory-match" | "picture-recall" | "number-match" | "color-pattern" | "music-memory" | "simple-quiz", labelEn: "Launch Activity", labelHi: "गतिविधि शुरू करें", autoExecute: true }
   - Check or Mark Medicine ("मेरी दवाएं", "दवा खा ली", "गोली का समय", "Check medicine", "Medicine taken"):
     -> suggestedAction: { type: "mark_medicine", labelEn: "Medication Updated", labelHi: "दवा अनुस्मारक अद्यतित", autoExecute: true }
   - Emergency or Doctor/Hospital Locator ("अस्पताल", "न्यूरोसर्जन", "डॉक्टर", "चक्कर आ रहे हैं", "दर्द", "Hospitals", "Emergency"):
     -> suggestedAction: { type: "show_medical", labelEn: "Open Hospitals & Neuro Care", labelHi: "नजदीकी अस्पताल व न्यूरो केयर देखें", autoExecute: true }
   - Call Anita / Caregiver ("अनीता को फोन लगाओ", "कॉल करो", "Call caregiver", "Call Anita"):
     -> suggestedAction: { type: "call_caregiver", labelEn: "Call Anita Sharma", labelHi: "अनीता को कॉल करें", autoExecute: true }
   - Soothing Melodies / Old Songs ("गाना सुनाओ", "पुराने गीत", "रफी साहब का गाना", "Play music"):
     -> suggestedAction: { type: "play_music", gameId: "music-memory", labelEn: "Play Music Memory", labelHi: "संगीत स्मृति खेलें", autoExecute: true }
   - Deep Breathing / Calm Down ("गहरी सांस लें", "घबराहट हो रही है", "Take a deep breath"):
     -> suggestedAction: { type: "deep_breath", labelEn: "Gentle Breathing Exercise", labelHi: "गहरी सांस व्यायाम", autoExecute: true }
   - Caregiver Dashboard ("अनीता का डैशबोर्ड", "Caregiver dashboard", "रिपोर्ट दिखाओ"):
     -> suggestedAction: { type: "show_caregiver", labelEn: "Caregiver Dashboard", labelHi: "केयरगिवर डैशबोर्ड", autoExecute: true }
   - Switch Language ("हिंदी में बात करो", "Talk in English"):
     -> suggestedAction: { type: "switch_language", targetLang: "hi" or "en", labelEn: "Switch Language", labelHi: "भाषा बदलें", autoExecute: true }
   - Record Mood ("आज बहुत अच्छा लग रहा है", "I feel sad today"):
     -> suggestedAction: { type: "log_mood", targetMood: "happy" | "okay" | "sad" | "worried", labelEn: "Mood Recorded", labelHi: "मूड दर्ज किया गया", autoExecute: true }
3. LANGUAGE ACCURACY:
   - If user speaks in Hindi, reply in pure, natural, respectful Hindi (देवनागरी).
   - If user speaks in English, reply in warm Indian English with natural honorifics.
4. JSON FORMAT: Always return strictly valid JSON matching the requested schema.`;

// POST /api/voice-companion
app.post('/api/voice-companion', async (req, res) => {
  try {
    const {
      prompt,
      language = 'en',
      history = [],
      currentMood = 'happy',
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    if (!apiKey) {
      // Offline fallback if no API key is supplied
      const fallbackResponse = getOfflineVoiceResponse(prompt, language, currentMood);
      res.json(fallbackResponse);
      return;
    }

    // Build chat conversation context
    const formattedHistory = (history as ChatHistoryItem[])
      .slice(-6)
      .map((item) => `${item.role === 'user' ? 'Sharma Ji' : 'Saathi'}: ${item.text}`)
      .join('\n');

    const conversationPrompt = `Current Language Preference: ${language === 'hi' ? 'Hindi' : 'English'}
Current Mood: ${currentMood}
Recent conversation:
${formattedHistory ? formattedHistory + '\n' : ''}
Sharma Ji says: "${prompt}"

Respond as Saathi following your system instructions. Provide a heartwarming, concise reply, detect the emotional sentiment, note a short topic for caregiver summary, and suggest follow-up voice prompts or an in-app activity if suitable.`;

    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
    let textOutput = '';

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: conversationPrompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: {
                  type: Type.STRING,
                  description: 'The spoken response from Saathi to Sharma Ji (2-3 concise sentences).',
                },
                sentiment: {
                  type: Type.STRING,
                  description: 'One of: warm, calm, reflective, cheerful, encouraging.',
                },
                topic: {
                  type: Type.STRING,
                  description: 'Short 2-4 word theme of the conversation for caregiver monitoring.',
                },
                suggestedAction: {
                  type: Type.OBJECT,
                  description: 'Optional in-app action triggered by conversation.',
                  properties: {
                    type: {
                      type: Type.STRING,
                      description: 'start_game, call_caregiver, deep_breath, play_music, show_medical, mark_medicine, open_pharmacy, show_caregiver, switch_language, log_mood',
                    },
                    gameId: {
                      type: Type.STRING,
                      description: 'One of memory-match, picture-recall, number-match, color-pattern, music-memory, simple-quiz',
                    },
                    targetLang: {
                      type: Type.STRING,
                      description: 'hi or en for switch_language',
                    },
                    targetMood: {
                      type: Type.STRING,
                      description: 'happy, okay, neutral, sad, worried for log_mood',
                    },
                    autoExecute: {
                      type: Type.BOOLEAN,
                      description: 'True if Sharma Ji directly requested this action to run immediately',
                    },
                    labelEn: {
                      type: Type.STRING,
                      description: 'English button label, e.g. "Play Music Memory"',
                    },
                    labelHi: {
                      type: Type.STRING,
                      description: 'Hindi button label, e.g. "संगीत स्मृति खेलें"',
                    },
                  },
                },
                quickFollowUps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2 to 3 short voice prompts Sharma Ji can tap or say next.',
                },
              },
              required: ['reply', 'sentiment', 'topic', 'quickFollowUps'],
            },
          },
        });

        textOutput = response.text?.trim() || '';
        if (textOutput) break;
      } catch (modelErr: unknown) {
        const errMsg = modelErr instanceof Error ? modelErr.message : String(modelErr);
        console.log(`[voice-companion] Model ${model} unavailable (${errMsg.slice(0, 80)}), trying fallback model...`);
      }
    }

    if (!textOutput) {
      console.log('[voice-companion] Using empathetic offline response generator');
      const lang = req.body?.language === 'hi' ? 'hi' : 'en';
      const fallback = getOfflineVoiceResponse(req.body?.prompt || '', lang, req.body?.currentMood);
      res.json(fallback);
      return;
    }

    let cleanJson = textOutput;
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    }

    try {
      const parsed = JSON.parse(cleanJson);
      // Sanitize suggestedAction if model provided raw string or formatting variation
      if (parsed.suggestedAction && typeof parsed.suggestedAction === 'object') {
        const actionType = String(parsed.suggestedAction.type || '').toLowerCase();
        if (actionType.includes('pharmacy') || actionType.includes('order') || actionType.includes('store') || actionType.includes('refill')) {
          parsed.suggestedAction.type = 'open_pharmacy';
          parsed.suggestedAction.labelEn = 'Open Medicine Store';
          parsed.suggestedAction.labelHi = 'दवा स्टोर खोलें';
        } else if (actionType.includes('start_game')) {
          parsed.suggestedAction.type = 'start_game';
          if (!parsed.suggestedAction.gameId) {
            parsed.suggestedAction.gameId = 'memory-match';
          }
        } else if (actionType.includes('call')) {
          parsed.suggestedAction.type = 'call_caregiver';
        } else if (actionType.includes('medicine') || actionType.includes('med') || actionType.includes('pill')) {
          parsed.suggestedAction.type = 'mark_medicine';
        } else if (actionType.includes('music') || actionType.includes('song')) {
          parsed.suggestedAction.type = 'play_music';
          parsed.suggestedAction.gameId = 'music-memory';
        } else if (actionType.includes('medical') || actionType.includes('hospital') || actionType.includes('doctor')) {
          parsed.suggestedAction.type = 'show_medical';
        } else if (actionType.includes('caregiver')) {
          parsed.suggestedAction.type = 'show_caregiver';
        } else if (actionType.includes('breath')) {
          parsed.suggestedAction.type = 'deep_breath';
        } else if (actionType.includes('language') || actionType.includes('lang')) {
          parsed.suggestedAction.type = 'switch_language';
        } else if (actionType.includes('mood')) {
          parsed.suggestedAction.type = 'log_mood';
        }

        if (!parsed.suggestedAction.labelEn) {
          parsed.suggestedAction.labelEn = 'Open Activity';
        }
        if (!parsed.suggestedAction.labelHi) {
          parsed.suggestedAction.labelHi = 'सुविधा शुरू करें';
        }
        if (parsed.suggestedAction.autoExecute === undefined) {
          parsed.suggestedAction.autoExecute = true;
        }
      }
      res.json(parsed);
    } catch {
      console.log('[voice-companion] Response parsing notice, using structured fallback');
      const lang = req.body?.language === 'hi' ? 'hi' : 'en';
      const fallback = getOfflineVoiceResponse(req.body?.prompt || '', lang, req.body?.currentMood);
      res.json(fallback);
    }
  } catch (err: unknown) {
    const errSummary = err instanceof Error ? err.message : String(err);
    console.log('[voice-companion] Handled error notice:', errSummary.slice(0, 80));
    // Graceful fallback response
    const lang = req.body?.language === 'hi' ? 'hi' : 'en';
    const fallback = getOfflineVoiceResponse(req.body?.prompt || '', lang, req.body?.currentMood);
    res.json(fallback);
  }
});

// POST /api/voice-tts (Using gemini-3.8-flash-lite-tts for natural spoken voice)
app.post('/api/voice-tts', async (req, res) => {
  try {
    const { text, language = 'en', voice = 'Kore' } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    if (!apiKey) {
      res.json({ fallback: true, reason: 'No API key provided, use client synthesis' });
      return;
    }

    // Clean text of emojis and special symbols for cleaner audio synthesis
    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: language === 'hi'
                  ? 'Warm, polite, gentle Indian companion speaking respectfully'
                  : 'Warm, calm, respectful elderly companion speaking clearly',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice === 'Puck' ? 'Puck' : 'Kore',
            },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      res.json({
        audio: base64Audio,
        sampleRate: 24000,
        format: 'audio/pcm',
      });
    } else {
      res.json({ fallback: true, reason: 'No audio candidate returned' });
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.log('[voice-tts] Notice: using client voice synthesis fallback (' + errMsg.slice(0, 60) + ')');
    res.json({ fallback: true, reason: 'TTS generation notice, use client synthesis' });
  }
});

// Offline empathetic fallback generator
function getOfflineVoiceResponse(prompt: string, language: 'en' | 'hi', mood?: string) {
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

    if (p.includes('दवा') || p.includes('गोली') || p.includes('मेडिसिन') || p.includes('डोनेपेज़िल') || p.includes('टेल्मीसार्टन')) {
      return {
        reply: 'शर्मा जी, मैंने आपकी दवाओं की स्थिति जांच ली है। डोनेपेज़िल 5mg रात को और टेल्मीसार्टन सुबह निर्धारित है। मैं आपकी दवा को अद्यतित कर रहा हूँ।',
        sentiment: 'warm',
        topic: 'दवा समय-सारिणी व अनुस्मारक',
        suggestedAction: {
          type: 'mark_medicine',
          labelEn: 'Medication Checked',
          labelHi: 'दवा अद्यतित की गई',
          autoExecute: true,
        },
        quickFollowUps: ['हाँ, मैंने दवा खा ली है', '15 मिनट बाद याद दिलाना', 'अनीता को बताओ'],
      };
    }

    if (p.includes('अस्पताल') || p.includes('डॉक्टर') || p.includes('न्यूरो') || p.includes('चक्कर') || p.includes('दर्द') || p.includes('इमरजेंसी')) {
      return {
        reply: 'शर्मा जी, घबराइए नहीं, एम्स और मैक्स हॉस्पिटल हमारे बहुत नजदीक हैं और वरिष्ठ न्यूरोसर्जन ऑन-कॉल उपलब्ध हैं। मैंने अस्पताल और डॉक्टर विवरण खोल दिया है।',
        sentiment: 'calm',
        topic: 'इमरजेंसी मेडिकल व न्यूरो सहायता',
        suggestedAction: {
          type: 'show_medical',
          labelEn: 'View Nearest Hospitals & Neurosurgeons',
          labelHi: 'नजदीकी अस्पताल व न्यूरोसर्जन देखें',
          autoExecute: true,
        },
        quickFollowUps: ['एम्स इमरजेंसी दिखाओ', 'अनीता को कॉल करो', 'मैं ठीक महसूस कर रहा हूँ'],
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

    if (p.includes('उदास') || p.includes('चिंता') || p.includes('अकेला') || p.includes('थक') || mood === 'sad' || mood === 'worried') {
      return {
        reply: 'शर्मा जी, मैं हमेशा आपके साथ हूँ। आइए मिलकर एक गहरी, आरामदायक सांस लेते हैं — धीरे से अंदर... और बाहर। सब बिल्कुल ठीक है।',
        sentiment: 'calm',
        topic: 'भावनात्मक संबल व शांति',
        suggestedAction: {
          type: 'deep_breath',
          labelEn: 'Take Gentle Breath',
          labelHi: 'गहरी सांस लें',
          autoExecute: true,
        },
        quickFollowUps: ['चलो गहरी सांस लेते हैं', 'अनीता से बात कराओ', 'कोई आसान खेल खेलें'],
      };
    }

    if (p.includes('खेल') || p.includes('गतिविधि') || p.includes('क्या करूँ') || p.includes('बोर') || p.includes('स्मृति')) {
      return {
        reply: 'आज का दिन बहुत सुहावना है शर्मा जी! चलिए स्मृति मिलान खेल शुरू करते हैं, यह आपके मन को तरोताजा कर देगा।',
        sentiment: 'encouraging',
        topic: 'दैनिक संज्ञानात्मक गतिविधि',
        suggestedAction: {
          type: 'start_game',
          gameId: 'memory-match',
          labelEn: 'Start Memory Match',
          labelHi: 'स्मृति मिलान शुरू करें',
          autoExecute: true,
        },
        quickFollowUps: ['स्मृति मिलान खेलें', 'चित्र स्मरण दिखाओ', 'आज के रिमाइंडर क्या हैं?'],
      };
    }

    return {
      reply: 'नमस्ते शर्मा जी! आपकी आवाज़ सुनकर बहुत खुशी हुई। आप कैसे हैं, और आज मैं आपके लिए क्या कर सकता हूँ?',
      sentiment: 'warm',
      topic: 'दैनिक संवाद व हालचाल',
      quickFollowUps: ['आज की गतिविधि बताओ', 'कोई पुरानी बात बताओ', 'एक अच्छा गाना सुनाओ'],
    };
  } else {
    // English responses
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

    if (p.includes('medicine') || p.includes('pill') || p.includes('dose') || p.includes('medication') || p.includes('donepezil') || p.includes('telmisartan')) {
      return {
        reply: 'Sharma Ji, I have checked your medication status. Donepezil 5mg is scheduled after dinner and Telmisartan with breakfast. I am updating your medication record now.',
        sentiment: 'warm',
        topic: 'Medication Schedule & Care',
        suggestedAction: {
          type: 'mark_medicine',
          labelEn: 'Medication Checked',
          labelHi: 'दवा अद्यतित की गई',
          autoExecute: true,
        },
        quickFollowUps: ['I took my medicine', 'Snooze for 15 minutes', 'Tell Anita'],
      };
    }

    if (p.includes('hospital') || p.includes('doctor') || p.includes('neuro') || p.includes('surgeon') || p.includes('emergency') || p.includes('headache') || p.includes('dizzy') || p.includes('ambulance')) {
      return {
        reply: 'Please stay calm, Sharma Ji. AIIMS Neurosciences and Max Super Speciality are less than 11 minutes away with neurosurgeons on-duty. I am opening the hospitals and emergency directory now.',
        sentiment: 'calm',
        topic: 'Emergency Neuro & Hospital Locator',
        suggestedAction: {
          type: 'show_medical',
          labelEn: 'View Nearest Hospitals & Neurosurgeons',
          labelHi: 'नजदीकी अस्पताल व न्यूरोसर्जन देखें',
          autoExecute: true,
        },
        quickFollowUps: ['Show AIIMS Neuro ER', 'Call Anita Sharma', 'I feel okay now'],
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

    if (p.includes('song') || p.includes('music') || p.includes('melody') || p.includes('tune')) {
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

    if (p.includes('sad') || p.includes('worried') || p.includes('tired') || p.includes('lonely') || mood === 'sad' || mood === 'worried') {
      return {
        reply: 'Sharma Ji, I am right here by your side. Let us take a slow, gentle breath together — breathing in calm, and gently releasing. You are doing wonderfully today.',
        sentiment: 'calm',
        topic: 'Emotional Reassurance & Breathing',
        suggestedAction: {
          type: 'deep_breath',
          labelEn: 'Take Gentle Breath',
          labelHi: 'गहरी सांस लें',
          autoExecute: true,
        },
        quickFollowUps: ['Take a deep breath', 'Call Anita', 'Play a relaxing game'],
      };
    }

    if (p.includes('game') || p.includes('activity') || p.includes('what should i do') || p.includes('bored') || p.includes('memory')) {
      return {
        reply: 'Today is a wonderful day, Sharma Ji! Let us start Memory Match to give your mind an uplifting boost.',
        sentiment: 'encouraging',
        topic: 'Cognitive Engagement',
        suggestedAction: {
          type: 'start_game',
          gameId: 'memory-match',
          labelEn: 'Start Memory Match',
          labelHi: 'स्मृति मिलान शुरू करें',
          autoExecute: true,
        },
        quickFollowUps: ['Start Memory Match', 'Picture Recall', 'Tell me today’s reminders'],
      };
    }

    return {
      reply: 'Namaste, Sharma Ji! It is wonderful to hear your voice today. How are you feeling, and what can I assist you with?',
      sentiment: 'warm',
      topic: 'Daily Check-in & Companion Chat',
      quickFollowUps: ['What activity should I do?', 'Tell me a nostalgic memory', 'Play some classic music'],
    };
  }
}

// Start server function
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Manas Saathi server running on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
