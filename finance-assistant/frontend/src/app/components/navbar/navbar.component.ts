import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Finance Assistant</span>
      <span class="spacer"></span>
      
      <ng-container *ngIf="isLoggedIn; else loggedOut">
        <button mat-button routerLink="/dashboard">Dashboard</button>
        <button mat-button routerLink="/upload">Upload Statement</button>
        
        <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="User menu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item disabled>
            <span>{{ userEmail }}</span>
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </ng-container>
      
      <ng-template #loggedOut>
        <button mat-button routerLink="/auth/login">Login</button>
        <button mat-button routerLink="/auth/register">Register</button>
      </ng-template>
    </mat-toolbar>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    
    button {
      margin-left: 8px;
    }
  `]
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  userEmail = '';
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      const userInfo = this.authService.getUserInfo();
      this.userEmail = userInfo?.email || '';
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/auth/login']);
  }
}
