import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChatMessage, ChatRequest, ChatResponse } from '../models/chat.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;
  private chatHistorySubject = new BehaviorSubject<ChatMessage[]>([]);
  
  constructor(private http: HttpClient) {
    // Load chat history from local storage if available
    const savedHistory = localStorage.getItem('chat_history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        this.chatHistorySubject.next(history);
      } catch (error) {
        console.error('Error parsing chat history from localStorage', error);
      }
    }
  }

  // Get chat history as observable
  getChatHistory(): Observable<ChatMessage[]> {
    return this.chatHistorySubject.asObservable();
  }

  // Send a message to the AI assistant
  sendMessage(message: string): Observable<string> {
    // Add user message to history
    this.addMessageToHistory({
      id: uuidv4(),
      content: message,
      isUser: true,
      timestamp: new Date()
    });

    // Send request to API
    const request: ChatRequest = { message };
    return new Observable<string>(observer => {
      this.http.post<ChatResponse>(`${this.apiUrl}/message`, request).subscribe({
        next: (response) => {
          // Add AI response to history
          this.addMessageToHistory({
            id: uuidv4(),
            content: response.response,
            isUser: false,
            timestamp: new Date()
          });
          
          observer.next(response.response);
          observer.complete();
        },
        error: (error) => {
          console.error('Error sending chat message', error);
          
          // Add error message to history
          this.addMessageToHistory({
            id: uuidv4(),
            content: 'Sorry, I encountered an error. Please try again later.',
            isUser: false,
            timestamp: new Date()
          });
          
          observer.error(error);
        }
      });
    });
  }

  // Clear chat history
  clearChatHistory(): void {
    this.chatHistorySubject.next([]);
    localStorage.removeItem('chat_history');
  }

  // Private method to add a message to history
  private addMessageToHistory(message: ChatMessage): void {
    const currentHistory = this.chatHistorySubject.value;
    const updatedHistory = [...currentHistory, message];
    
    // Update the subject
    this.chatHistorySubject.next(updatedHistory);
    
    // Save to localStorage
    localStorage.setItem('chat_history', JSON.stringify(updatedHistory));
  }
}
