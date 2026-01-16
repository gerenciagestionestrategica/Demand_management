// frontend/src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  

  
  
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}


   /**
   * Get all user in the base data except the administrator user
   */
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/getAllUsers_Admin`,{withCredentials:true})
  }


  /**
   * update the information of the a user.
   * @param infoUserUpdate form data with the information to be updating 
   */
  updateUser(infoUserUpdate: any): Observable<any> {
     return this.http.post(`${this.baseUrl}/updateUser_Admin`,infoUserUpdate,{withCredentials:true})
  }


  /**
   * Creates a new user
   * @param nuevoUsuario form data with the new user information
   */
  crearUsuario(nuevoUsuario: any): Observable <any>{
    return this.http.post(`${this.baseUrl}/createUser_Admin`,nuevoUsuario,{withCredentials: true});
  }

  
  /**
   * Deletes a user by its id
   * @param id_user Name of the squad to be deleted
   */
  eliminateUser(id_user: string):  Observable<any> {
    return this.http.delete(`${this.baseUrl}/deleteUser_Admin/${id_user}`,{ withCredentials: true});
  }

  
}
