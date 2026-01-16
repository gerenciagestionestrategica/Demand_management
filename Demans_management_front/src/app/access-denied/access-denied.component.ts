import { Component, OnInit } from '@angular/core';
import { AuthService } from '../guard/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'access_denied',
  imports: [RouterModule, CommonModule],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.css'
})
export class AccessDeniedComponent implements OnInit {


  
  /**
   * @description
   * Class constructor used to inject the authentication service and the navigation router.
   */
  constructor(public authService: AuthService, private router: Router) {}



  /**
   * @description
   * Lifecycle hook that is called after Angular has initialized all data properties.
   */
  ngOnInit(): void {}



  /**
   * @description
   * Ends the user session, clears Google authentication states, and redirects to the login view.
   */
  logout() {
    this.authService.logout();
    const google = (window as any).google;
    if (google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
    }
    this.router.navigate(['/login']);
  }

}