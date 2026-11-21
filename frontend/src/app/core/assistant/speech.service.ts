import { Injectable, inject } from '@angular/core';
import { LanguageService } from '../i18n/language.service';

interface SpeechRecognitionEventLike extends Event {
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
      isFinal: boolean;
    };
  };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

@Injectable({ providedIn: 'root' })
export class SpeechService {
  private readonly language = inject(LanguageService);
  private recognition: SpeechRecognitionLike | null = null;

  start(onText: (text: string) => void, onError: (message: string) => void, onEnd: () => void): void {
    const speechWindow = window as typeof window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      onError(this.unsupportedMessage());
      return;
    }

    this.recognition = new Recognition();
    this.recognition.lang = this.language.locale();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.onresult = event => {
      const text = event.results[0]?.[0]?.transcript?.trim();
      if (text) onText(text);
    };
    this.recognition.onerror = event => onError(this.errorMessage(event.error));
    this.recognition.onend = onEnd;

    try {
      this.recognition.start();
    } catch {
      onError(this.errorMessage('not-allowed'));
    }
  }

  stop(): void {
    this.recognition?.stop();
  }

  speak(text: string, onEnd?: () => void): void {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.language.locale();
    const voice = window.speechSynthesis.getVoices().find(candidate =>
      candidate.lang.toLowerCase().startsWith(this.language.language())
    );
    if (voice) utterance.voice = voice;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  }

  pause(): void {
    if ('speechSynthesis' in window) window.speechSynthesis.pause();
  }

  resume(): void {
    if ('speechSynthesis' in window) window.speechSynthesis.resume();
  }

  stopSpeaking(): void {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  private unsupportedMessage(): string {
    switch (this.language.language()) {
      case 'hi': return 'इस डिवाइस पर आवाज़ पहचान उपलब्ध नहीं है। कृपया टेक्स्ट से प्रश्न लिखें।';
      case 'en': return 'Voice recognition is unavailable on this device. Please type your question.';
      default: return 'આ ઉપકરણ પર વૉઇસ ઓળખ ઉપલબ્ધ નથી. કૃપા કરીને ટેક્સ્ટ લખો.';
    }
  }

  private errorMessage(error: string): string {
    const permissionDenied = error === 'not-allowed' || error === 'service-not-allowed';
    if (permissionDenied) {
      switch (this.language.language()) {
        case 'hi': return 'माइक्रोफोन की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग में अनुमति दें।';
        case 'en': return 'Microphone permission was denied. Please enable it in browser settings.';
        default: return 'માઇક્રોફોનની મંજૂરી મળી નથી. બ્રાઉઝર સેટિંગમાં મંજૂરી આપો.';
      }
    }
    switch (this.language.language()) {
      case 'hi': return 'आवाज़ सुनने में समस्या हुई। फिर प्रयास करें या टेक्स्ट लिखें।';
      case 'en': return 'Voice recognition could not complete. Try again or type the question.';
      default: return 'વૉઇસ ઓળખમાં સમસ્યા આવી. ફરી પ્રયાસ કરો અથવા ટેક્સ્ટ લખો.';
    }
  }
}
