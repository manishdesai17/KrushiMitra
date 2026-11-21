import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LanguageCode } from '../i18n/language.service';
import { AppConfigService } from '../config/app-config.service';

export interface AiMessage {
  messageId: number;
  sender: 'FARMER' | 'ASSISTANT';
  content: string;
  language: LanguageCode;
  imageFilename?: string;
  imageContentType?: string;
  imageStatus?: string;
  createdAt: string;
}

export interface AiConversation {
  conversationId: number;
  title: string;
  language: LanguageCode;
  createdAt: string;
  updatedAt: string;
  messages: AiMessage[];
}

@Injectable({ providedIn: 'root' })
export class AssistantService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  private readonly apiUrl = this.config.conversationsUrl;

  create(title: string, language: LanguageCode): Observable<AiConversation> {
    return this.http.post<AiConversation>(this.apiUrl, { title, language });
  }

  list(): Observable<AiConversation[]> {
    return this.http.get<AiConversation[]>(this.apiUrl);
  }

  open(conversationId: number): Observable<AiConversation> {
    return this.http.get<AiConversation>(`${this.apiUrl}/${conversationId}`);
  }

  send(conversationId: number, question: string, language: LanguageCode, image?: File): Observable<AiMessage> {
    if (!image) {
      return this.http.post<AiMessage>(
        `${this.apiUrl}/${conversationId}/messages`,
        { question, language },
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const form = new FormData();
    form.set('question', question);
    form.set('language', language);
    form.set('image', image);
    return this.http.post<AiMessage>(`${this.apiUrl}/${conversationId}/messages`, form);
  }

  delete(conversationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${conversationId}`);
  }
}
