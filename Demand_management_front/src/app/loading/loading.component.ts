import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../guard/auth.service';


@Component({
  selector: 'app-loading',

  /**
   * @description
   * Inline HTML template for the loading screen.
   */
  template: `
    <div class="loading-container">
      <p>Cargando...</p>
    </div>
  `,

  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-size: 1.5rem;
    }
  `]
})
export class LoadingComponent implements OnInit {

  /**
   * @description
   * Creates an instance of LoadingComponent.
   */

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  /**
   * @description
   * Lifecycle hook that runs when the component is initialized.
   *
   * It starts a polling interval that checks every 100ms whether
   * the authentication process has finished loading.
   * Once loading is complete, the interval is cleared and the user
   * is redirected based on their authentication status.
   */
  ngOnInit() {
      const interval = setInterval(() => {

        if (!this.auth.isLoading()) {
          clearInterval(interval);

          if (this.auth.isAuthenticated()) {
            const redirect = this.auth.getRedirectUrl() ?? '/home';
            this.router.navigate([redirect]);

          } else {
            this.router.navigate(['/login']);
          }
          
        }
      }, 100);
    }
  }
