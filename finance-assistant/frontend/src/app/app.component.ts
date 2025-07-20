import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ChatBotComponent } from './components/chat-bot/chat-bot.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ChatBotComponent, CommonModule],
  template: `
    <app-navbar></app-navbar>
    <div class="container">
      <router-outlet></router-outlet>
    </div>
    <app-chat-bot></app-chat-bot>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .container {
      flex: 1;
      padding: 20px;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Finance Assistant';

  constructor() {}

  ngOnInit(): void {
    // Initialization logic
  }
}
