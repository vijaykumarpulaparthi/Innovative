import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { JWT_OPTIONS, JwtModule } from '@auth0/angular-jwt';
import { authInterceptor } from './interceptors/auth.interceptor';

// Token getter function for JWT module
export function tokenGetter() {
  return localStorage.getItem('access_token');
}

// JWT options factory
export function jwtOptionsFactory() {
  return {
    tokenGetter,
    allowedDomains: ['localhost:8000'], // Replace with your API domain in production
    disallowedRoutes: ['localhost:8000/api/auth'] // Routes that should not receive the token
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(
      JwtModule.forRoot({
        jwtOptionsProvider: {
          provide: JWT_OPTIONS,
          useFactory: jwtOptionsFactory
        }
      })
    )
  ]
};
