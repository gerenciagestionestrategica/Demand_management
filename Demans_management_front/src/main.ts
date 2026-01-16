import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app.component';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localeEs);

bootstrapApplication(App, {
      providers: [
        {provide: LOCALE_ID, useValue: 'es'},
        provideRouter(routes),
        provideHttpClient(withFetch())
      ]
    });
 

