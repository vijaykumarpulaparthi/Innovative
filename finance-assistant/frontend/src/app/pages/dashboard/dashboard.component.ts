import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>Finance Dashboard</h1>
      <div class="dashboard-content">
        <p>Welcome to your finance dashboard!</p>
        <!-- Dashboard content will go here -->
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
    .dashboard-content {
      margin-top: 20px;
    }
  `]
})
export class DashboardComponent {
  constructor() { }
}
