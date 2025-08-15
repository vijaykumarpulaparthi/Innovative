import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
 
  // Get the auth token
  const token = authService.getToken();
 
  // Prepare headers object
  const headers: { [key: string]: string } = {
    'X-API-Key': 'finance-assistant-api-key-123'
  };
 
  // Add Authorization header if token exists and not a login/register request
  // if (token && !req.url.includes('/api/auth/login') && !req.url.includes('/api/auth/register')) {
  //   headers['Authorization'] = `Bearer ${token}`;
  // }


  // Clone the request and add headers
  const authReq = req.clone({
    setHeaders: headers
  });
 
  return next(authReq);
};