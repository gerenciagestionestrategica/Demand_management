import { Routes, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './guard/auth.service';
import { authGuard } from './guard/auth.guard';
import {EditForm} from './edit-form/edit-form.component'


export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard],
    data: { roles: ['Radicador','Gerente','Vicepresidente','Administrador','Metodos','Visitante']}
  },

  { path: 'editar-radicado/:id',
    loadComponent: () => import('./edit-form/edit-form.component').then(m => m.EditForm),
    canActivate: [authGuard],
    data: { roles: ['Radicador'] }
   },

  {
    path: 'form',
    loadComponent: () => import('./form/form.component').then(m => m.FormComponent),
    canActivate: [authGuard],
    data: { roles: ['Radicador'] }
  },

  {
    path: 'history',
    loadComponent: () => import('./history/history.component').then(m => m.HistoryComponent),
    canActivate: [authGuard],
    data: { roles: ['Radicador','Gerente','Vicepresidente','Administrador','Metodos','Visitante'] }
  },

  {
    path: 'usuario',
    loadComponent: () => import('./usuario/usuario.component').then(m => m.UsuarioComponent),
    canActivate: [authGuard],
    data: { roles: ['Administrador'] }
  },

  {
    path: 'info-form',
    loadComponent: () => import('./info-form/info-form.component').then(m => m.InfoFormComponent),
    canActivate: [authGuard],
    data: { roles: ['Administrador'] }
  },

  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },

  {
    path: 'access_denied',
    loadComponent: ()=> import('./access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
  },

  {
    path: 'loading',
    loadComponent: () => import('./loading/loading.component').then(m => m.LoadingComponent)
  },
  
  { path: '**', redirectTo: 'login' }
];

