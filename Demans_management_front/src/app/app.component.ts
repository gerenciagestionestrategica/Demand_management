import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './guard/auth.service';
import { Offcanvas } from 'bootstrap';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HttpClientModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class App implements OnInit {

  user: any;
  showUserMenu = false;
  public isAuthenticated: boolean | undefined;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}
  
  

private getModal(id: string): Modal {
  const el = document.getElementById(id);
  return Modal.getOrCreateInstance(el!);
}



  ngOnInit(): void {
     
  }

  // =====================
  // DROPDOWN (ANGULAR)
  // =====================
  toggleUserMenu(): void {
    this.user = this.authService.getUser();
    this.showUserMenu = !this.showUserMenu;
    
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  // =====================
  // OFFCANVAS (BOOTSTRAP)
  // =====================
  openMenu(): void {
    const element = document.getElementById('sidebarMenu');
    if (element) {
      Offcanvas.getOrCreateInstance(element).show();
    }
  }

  navigate(route: string): void {
    this.closeUserMenu();

    const element = document.getElementById('sidebarMenu');
    if (element) {
      const offcanvas = Offcanvas.getInstance(element);
      if (offcanvas) {
        offcanvas.hide();
        setTimeout(() => this.router.navigate([route]), 150);
        return;
      }
    }
    this.router.navigate([route]);
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
