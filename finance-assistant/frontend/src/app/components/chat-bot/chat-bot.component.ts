import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../models/chat.model';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <div class="chat-container" [class.chat-open]="isOpen">
      <div class="chat-header" (click)="toggleChat()">
        <mat-icon>chat</mat-icon>
        <span>Financial Assistant</span>
        <button mat-icon-button class="toggle-button">
          <mat-icon>{{ isOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</mat-icon>
        </button>
      </div>
      
      <div class="chat-body">
        <div class="chat-messages" #chatMessages>
          <div 
            *ngFor="let message of chatHistory" 
            class="message"
            [class.user-message]="message.isUser"
            [class.bot-message]="!message.isUser"
          >
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ message.timestamp | date:'short' }}</div>
          </div>
          
          <div *ngIf="isLoading" class="bot-message loading-message">
            <div class="loading-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <mat-form-field appearance="outline" class="full-width">
            <input 
              matInput 
              placeholder="Ask me about your finances..." 
              [(ngModel)]="currentMessage"
              (keyup.enter)="sendMessage()"
              [disabled]="isLoading"
            >
            <button 
              mat-icon-button 
              matSuffix 
              (click)="sendMessage()"
              [disabled]="!currentMessage || isLoading"
            >
              <mat-icon>send</mat-icon>
            </button>
          </mat-form-field>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      max-height: 500px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 1000;
      background-color: white;
      transition: height 0.3s ease;
    }
    
    .chat-header {
      display: flex;
      align-items: center;
      padding: 10px 15px;
      background-color: #3f51b5;
      color: white;
      cursor: pointer;
    }
    
    .chat-header mat-icon {
      margin-right: 10px;
    }
    
    .chat-header span {
      flex: 1;
    }
    
    .chat-body {
      display: flex;
      flex-direction: column;
      height: 0;
      overflow: hidden;
      transition: height 0.3s ease;
    }
    
    .chat-open .chat-body {
      height: 400px;
    }
    
    .chat-messages {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .message {
      max-width: 80%;
      padding: 10px 15px;
      border-radius: 15px;
      position: relative;
      margin-bottom: 5px;
    }
    
    .user-message {
      align-self: flex-end;
      background-color: #e1f5fe;
      border-bottom-right-radius: 0;
    }
    
    .bot-message {
      align-self: flex-start;
      background-color: #f5f5f5;
      border-bottom-left-radius: 0;
    }
    
    .message-content {
      word-break: break-word;
    }
    
    .message-time {
      font-size: 10px;
      opacity: 0.7;
      text-align: right;
      margin-top: 5px;
    }
    
    .chat-input {
      padding: 10px 15px;
      border-top: 1px solid #eee;
    }
    
    .full-width {
      width: 100%;
    }
    
    .loading-message {
      padding: 15px;
    }
    
    .loading-dots {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 5px;
    }
    
    .loading-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #999;
      animation: bounce 1.5s infinite ease-in-out;
    }
    
    .loading-dots span:nth-child(1) {
      animation-delay: 0s;
    }
    
    .loading-dots span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .loading-dots span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }
  `]
})
export class ChatBotComponent implements OnInit {
  isOpen = false;
  chatHistory: ChatMessage[] = [];
  currentMessage = '';
  isLoading = false;
  
  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.chatService.getChatHistory().subscribe(history => {
      this.chatHistory = history;
    });
    
    // If first time user, show welcome message
    if (this.chatHistory.length === 0) {
      this.chatHistory = [{
        id: 'welcome',
        content: 'Hello! I\'m your financial assistant. How can I help you with your finances today?',
        isUser: false,
        timestamp: new Date()
      }];
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isLoading) {
      return;
    }
    
    const message = this.currentMessage;
    this.currentMessage = '';
    this.isLoading = true;
    
    this.chatService.sendMessage(message).subscribe({
      next: (response) => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
