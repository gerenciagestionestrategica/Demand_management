import { Component, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../guard/auth.service';
import { environment } from '../../environments/environment';

/**
 * @description
 * LoginComponent handles user authentication using Google Identity Services.
 * It loads the Google SDK dynamically, initializes the Google login button,
 * and manages login/logout navigation flow.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class LoginComponent implements AfterViewInit {



  /**
   * @description
   * Google OAuth Client ID retrieved from environment configuration.
   */
  private clientId = environment.clienIdGoogle;


  /**
   * @description
   * Creates an instance of LoginComponent.
   *
   * @param ngZone Angular NgZone used to execute external callbacks
   *               inside Angular's change detection context.
   * @param authService Service responsible for authentication logic.
   * @param router Angular Router used for navigation.
   */
  constructor(
    private ngZone: NgZone,
    private authService: AuthService,
    private router: Router
  ) {}


  /**
   * @description
   * Lifecycle hook executed after the component's view has been fully initialized.
   * It ensures the Google Identity Services script is loaded before
   * initializing the Google login button.
   */
  async ngAfterViewInit() {
    try {
      await this.loadGoogleScript();
    } catch (err) {
   
      return;
    }

    this.initializeGoogleButton();
  }


  /**
   * @description
   * Dynamically loads the Google Identity Services SDK.
   * If the Google object already exists in the window,
   * the promise resolves immediately to avoid reloading the script.
   *
   * @returns Promise that resolves when the Google SDK is successfully loaded,
   *          or rejects if an error occurs during loading.
   */
  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);

      document.head.appendChild(script);
    });
  }


  /**
   * @description
   * Initializes the Google Sign-In button and configures
   * the authentication callback.
   *
   * When the user successfully authenticates, the credential
   * token is sent to the AuthService and the user is redirected
   * to the home page.
   */
  private initializeGoogleButton() {
    const google = (window as any).google;

    if (!google?.accounts?.id) {
      
      return;
    }

    google.accounts.id.initialize({
      client_id: this.clientId,
      callback: (response: any) => {

        
        this.ngZone.run(() => {

          this.authService.login(response.credential);
          this.router.navigate(['/home']);
        });

      },
      auto_select: false
    });

    google.accounts.id.renderButton(
      document.getElementById('googleBtn'),
      { theme: 'outline', size: 'large' }
    );
  }

  /**
   * @description
   * Logs the user out of the application and disables
   * Google automatic account selection.
   * After logout, the user is redirected to the login page.
   */
  logout() {
    this.authService.logout();

    const google = (window as any).google;
    if (google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
    }

    this.router.navigate(['/login']);
  }

  
  /**
   * @description
   * Checks whether the user is currently authenticated.
   *
   * @returns True if the user is logged in, otherwise false.
   */
  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }
}
