import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  withXsrfConfiguration,
} from '@angular/common/http';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { jwtInterceptor } from './core/interceptors/jwt-interceptor';
import { AuthStore } from './core/store/auth.store';
import { AuthService } from './core/services/Auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      //Registers credentials injector and global exception handler
      withInterceptors([
        credentialsInterceptor, //Sets withCredentioal: true
        jwtInterceptor, //Injects Bearer Authorization header
        errorInterceptor, //Trigers silent token refreshes
      ]),
      //Maps XSRF cookies automatically to outbound HTTP header wrappers
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
    ),
    provideAppInitializer(() => {
      const auth = inject(AuthStore)
      return auth.initializeSession();
    }),
  ],
};
