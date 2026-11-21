import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { AppConfigService } from '../config/app-config.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthService).token();
  const apiUrl = inject(AppConfigService).apiUrl;
  if (!token || !request.url.startsWith(`${apiUrl}/api/`)) return next(request);
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};