import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment.development';
import { AuthResponse, User, UserCreate, UserLogin } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'access_token';
  
  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) { }

  register(user: UserCreate): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  login(credentials: UserLogin): Observable<AuthResponse> {
    // Temporary mock authentication for specific users
    // Will be replaced with OAuth implementation later
    const mockUsers = [
      { email: 'vijayp2286@gmail.com', password: '12345678' },
      { email: 'testuser@gmail.com', password: '12345678' }
    ];
    
    // Check if credentials match any mock user
    const user = mockUsers.find(u => 
      u.email === credentials.username && 
      u.password === credentials.password
    );
    
    if (user) {
      // Generate a mock token with user info
      const mockToken = this.generateMockToken(user.email);
      
      // Return an observable with mock auth response
      return new Observable<AuthResponse>(observer => {
        const response: AuthResponse = {
          access_token: mockToken,
          token_type: 'bearer',
          expires_in: 3600
        };
        
        // Store the token in local storage
        localStorage.setItem(this.tokenKey, response.access_token);
        
        observer.next(response);
        observer.complete();
      });
    } else {
      // If credentials don't match any mock user, return an error
      return new Observable<AuthResponse>(observer => {
        observer.error({ status: 401, message: 'Invalid credentials' });
      });
    }
    
    // Original OAuth implementation (commented out for now)
    /*
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, formData)
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.access_token);
        })
      );
    */
  }
  
  // Helper method to generate a mock JWT token
  private generateMockToken(email: string): string {
    // Create a simple payload with user info
    const payload = {
      sub: email,
      email: email,
      name: email.split('@')[0],
      role: 'user',
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    };
    
    // Encode the payload (this is not secure, just for mocking)
    const encodedPayload = btoa(JSON.stringify(payload));
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    
    // Return a mock token
    return `${header}.${encodedPayload}.mocksignature`;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    
    if (!token) {
      return false;
    }
    
    // Check if it's a mock token
    if (token.endsWith('.mocksignature')) {
      try {
        // For mock tokens, parse the payload manually
        const parts = token.split('.');
        if (parts.length !== 3) {
          return false;
        }
        
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Check if token is expired
        return payload.exp > currentTime;
      } catch (error) {
        console.error('Error verifying mock token', error);
        return false;
      }
    }
    
    // For real tokens, use the JWT helper
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  getUserInfo(): User | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    
    try {
      // Check if it's a mock token
      if (token.endsWith('.mocksignature')) {
        // For mock tokens, parse the payload manually
        const parts = token.split('.');
        if (parts.length !== 3) {
          return null;
        }
        
        return JSON.parse(atob(parts[1]));
      }
      
      // For real tokens, use the JWT helper
      const decodedToken = this.jwtHelper.decodeToken(token);
      return decodedToken;
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  }
}
