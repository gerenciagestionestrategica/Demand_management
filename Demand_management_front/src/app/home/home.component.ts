import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../guard/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ RouterModule,  CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

 

  /**
   * @description
   * Component Constructor . Inject the `AuthService` service to handle the business logic.
   * @param AuthService  Service for interaction with the API and the access.
   * @param router 
   */
  constructor(public authService: AuthService,private router: Router){
  }
  

  /**
   * @description
   * Angular lifecyclo Method . Runs when the component is initialized.
   */
  ngOnInit(): void { 
  }

  
  /**
   * @description
   * user logout of the session.
   * Automatically redirect to the login page view
   */
  logout(){
    this.authService.logout();
    const google = (window as any).google;
    if (google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
    }
    this.router.navigate(['/login']);
  }

    
}
