// frontend/src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EditFormService {


  
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
  * Call to obtain the draft information by id (only the drafts with access to edit).
  */
  getDraft(id_draft: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/getDraft/${id_draft}`,{ withCredentials: true });
  }

  
  /**
  * @description
  * Call to obtain the attributes form information to show in the fields form.
  */
  getInfoFormAttributes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/getInfoForm_Admin`,{withCredentials:true})
  }
  

  /**
  * @description
  * Call to update the draft
  */
  updateDraft(id_draft: string, data: FormData): Observable<any> {
  return this.http.put(`${this.baseUrl}/radicadoUpdate/${id_draft}`, data, {
    withCredentials: true
  });

  
}

  
}