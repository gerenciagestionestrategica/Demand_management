
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GuardService {

  private baseUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

  verificateLogin(usuario: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/validateLogin`, usuario, { withCredentials: true });
  }

  checkSession() {
    return this.http.get(`${this.baseUrl}/checkSession`, { withCredentials: true });
  }

  logout() {
    return this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true });
  }
}

