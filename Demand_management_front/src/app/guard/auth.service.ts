import { Injectable } from '@angular/core';
import { GuardService } from './guard.service';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user: User | null = null;
  private _role: string | null = null;
  private _loading = true;
  private _redirectUrl: string | null = null;
  private userToken: string = '';

  // Observable para indicar si la sesión ya fue verificada
  private sessionChecked$ = new BehaviorSubject<boolean>(false);

  constructor(private guardService: GuardService, private router: Router) {
    this.checkSession();
  }

  /** Login con token JWT */
  login(token: string) {
    
    this.guardService.verificateLogin({ credential: token }).subscribe({
      next: () => this.checkSession(() => this.router.navigate([this._redirectUrl || '/home'])),
      error: (err) => console.error('Error login:', err)
    });
  }

  /** Logout y limpieza de datos */
  logout() {
    const google = (window as any).google;
    if (google?.accounts?.id) google.accounts.id.disableAutoSelect();

    this.guardService.logout().subscribe({
      next: () => {
        this._user = null;
        this._role = null;
        this.router.navigate(['/login']);
      },
      error: () => {
        this._user = null;
        this._role = null;
        this.router.navigate(['/login']);
      }
    });
  }

  /** Check de sesión */
  checkSession(callback?: () => void) {
    this._loading = true;
    this.guardService.checkSession().subscribe({
      next: (res: any) => {
        if (!res.authenticated || !res.user) {
          this._user = null;
          this._role = null;
        } else {
          this._user = res.user;
          this._role = res.user.role;
        }
        this._loading = false;
        this.sessionChecked$.next(true);
        if (callback) callback();
      },
      error: () => {
        this._user = null;
        this._role = null;
        this._loading = false;
        this.sessionChecked$.next(true);
        if (callback) callback();
      }
    });
  }

  /** Roles */
  getUser(): User | null {
    return this._user;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this._role ?? '');
  }

  /** Getters */
  isAuthenticated(): boolean {
    return !!this._user;
  }

  isLoading(): boolean {
    return this._loading;
  }

  setRedirectUrl(url: string) {
    this._redirectUrl = url;
  }

  getRedirectUrl(): string | null {
    return this._redirectUrl;
  }

  getUserEmail(): string {
    return this._user?.email ?? '';
  }

  

  /** Espera hasta que la sesión sea verificada */
  async waitForSessionCheck(): Promise<void> {
    if (!this.sessionChecked$.value) {
      await firstValueFrom(this.sessionChecked$);
    }
  }
}
