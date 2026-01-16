// frontend/src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FormService {

  /** 
  * @description
  * URL to call the BackEnd to the API REST
  */
  private baseUrl = environment.apiUrl;
  
 
  /**
  * @description
  * Class constructor used to inject the HTTP CLIENT
  */
  constructor(private http: HttpClient) {}


  /**
  * @description
  * Call to obtain the attributes form information to show in the fields form.
  */
  getInfoFormAttributes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/getInfoForm_Admin`,{withCredentials:true})
  }


  /**
  * @description
  * Call to create a new draft
  */
  createDraft(usuario: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/radicados`,usuario,{ withCredentials: true });
  }


  /**
  * @description
  * Get the anwers of the IA to analyze the information of the form and the business case
  */
  analyzeIa(info: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/analyzeIa`,info,{ withCredentials: true });
  }
}
