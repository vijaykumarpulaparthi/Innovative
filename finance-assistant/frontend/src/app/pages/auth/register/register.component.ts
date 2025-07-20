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
  selector: 'app-register',
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
      <div class="register-container">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Register</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <mat-form-field class="full-width">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="first_name" placeholder="Enter your first name">
                <mat-error *ngIf="registerForm.get('first_name')?.hasError('required')">
                  First name is required
                </mat-error>
              </mat-form-field>
              
              <mat-form-field class="full-width">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="last_name" placeholder="Enter your last name">
                <mat-error *ngIf="registerForm.get('last_name')?.hasError('required')">
                  Last name is required
                </mat-error>
              </mat-form-field>
              
              <mat-form-field class="full-width">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email" placeholder="Enter your email">
                <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
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
                <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                  Password must be at least 8 characters long
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
                  [disabled]="registerForm.invalid || isLoading"
                >
                  <mat-spinner *ngIf="isLoading" diameter="20" class="spinner"></mat-spinner>
                  <span *ngIf="!isLoading">Register</span>
                </button>
              </div>
            </form>
          </mat-card-content>
          
          <mat-card-actions class="card-actions">
            <p>Already have an account? <a routerLink="/auth/login">Login</a></p>
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
    
    .register-container {
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
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.isLoading) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        
        // After successful registration, login the user
        const credentials = {
          username: this.registerForm.value.email,
          password: this.registerForm.value.password
        };
        
        this.authService.login(credentials).subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            console.error('Auto-login error after registration', error);
            this.router.navigate(['/auth/login']);
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 400 && error.error?.detail === 'Email already registered') {
          this.errorMessage = 'This email is already registered';
        } else {
          this.errorMessage = 'An error occurred. Please try again.';
        }
        console.error('Registration error', error);
      }
    });
  }
}
