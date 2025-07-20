import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container">
      <div class="login-container">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Login</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <mat-form-field class="full-width">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email" placeholder="Enter your email">
                <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                  Please enter a valid email address
                </mat-error>
              </mat-form-field>
              
              <mat-form-field class="full-width">
                <mat-label>Password</mat-label>
                <input 
                  matInput 
                  formControlName="password" 
                  [type]="hidePassword ? 'password' : 'text'"
                  placeholder="Enter your password"
                >
                <button 
                  mat-icon-button 
                  matSuffix 
                  (click)="hidePassword = !hidePassword" 
                  [attr.aria-label]="'Hide password'"
                  [attr.aria-pressed]="hidePassword"
                  type="button"
                >
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
              </mat-form-field>
              
              <div *ngIf="errorMessage" class="error-message">
                {{ errorMessage }}
              </div>
              
              <div class="form-actions">
                <button 
                  mat-raised-button 
                  color="primary" 
                  type="submit" 
                  [disabled]="loginForm.invalid || isLoading"
                >
                  <mat-spinner *ngIf="isLoading" diameter="20" class="spinner"></mat-spinner>
                  <span *ngIf="!isLoading">Login</span>
                </button>
              </div>
            </form>
          </mat-card-content>
          
          <mat-card-actions class="card-actions">
            <p>Don't have an account? <a routerLink="/auth/register">Register</a></p>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 20px;
    }
    
    .login-container {
      width: 100%;
      max-width: 400px;
    }
    
    mat-card {
      padding: 20px;
    }
    
    mat-card-header {
      margin-bottom: 20px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
    
    .card-actions {
      display: flex;
      justify-content: center;
      margin-top: 10px;
    }
    
    .error-message {
      color: #f44336;
      margin: 10px 0;
    }
    
    .spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const credentials = {
      username: this.loginForm.value.email,
      password: this.loginForm.value.password
    };
    
    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else {
          this.errorMessage = 'An error occurred. Please try again.';
        }
        console.error('Login error', error);
      }
    });
  }
}
