// frontend/src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HistoryService {

  
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
  * Get only all user drafts through credentials.
  */
  getDraftsByUser(): Observable<any> {
    return this.http.get(`${this.baseUrl}/getDrafts`,{ withCredentials: true });
  }


  /**
  * @description
  * Get all drafts that have been created.
  */
  getAllDrafts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/getAllDrafts`,{withCredentials:true})
  }


  /**
  * @description
  * Get an specif drafts through the id to view its details.
  * @param id ID of the draft to be searched.
  */
  getDraftDetail(id: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/getDraftDetails`,{id_draft:id},{ withCredentials: true });
  }

  //===========================================================================================================
  //ADJUSMENT REQUEST 
  //===========================================================================================================

  /**
  * @description
  * Create an adjusmenet request to a draft by Metodos
  * @param resgistro The informacion of the adjusmenet request with the messages of the request and the request type.
  */
  adjusmentRequestMetodos(registro: any):  Observable<any>{
    return this.http.post(`${this.baseUrl}/createRequestAdjustments`,registro,{ withCredentials: true });
  }

  /**
  * @description
  * Create an adjusmenet request to a draft by Gerentes
  * @param resgistro The informacion of the adjusmenet request with the messages of the request and the request type.
  */
 adjusmentRequestGerente(registro: any):  Observable<any>{
    return this.http.post(`${this.baseUrl}/createRequestAdjustments_gerente`,registro,{ withCredentials: true });
  }


  /**
  * @description
  * Create an adjusmenet request to a draft by Vicepresidentes
  * @param resgistro The informacion of the adjusmenet request with the messages of the request and the request type.
  */
  adjusmentRequestVicepresidente(registro: any):  Observable<any>{
    return this.http.post(`${this.baseUrl}/createRequestAdjustmentsVicepresidente`,registro,{ withCredentials: true });
  }

  //===========================================================================================================
  //ACCEPT DRAFTS
  //===========================================================================================================

  /**
  * @description
  * Create an adjusmenet request to a draft by Vicepresidentes
  * @param resgistro The informacion of the adjusmenet request with the messages of the request and the request type.
  */
  aceptarSolicitud(registroSeleccionado: any): Observable<any> {
   return this.http.post(`${this.baseUrl}/aceptDrafts`,registroSeleccionado,{ withCredentials: true });
  }


  /**
  * @description
  * Create an adjusmenet request to a draft by Vicepresidentes
  * @param resgistro The informacion of the adjusmenet request with the messages of the request and the request type.
  */
  aceptarSolicitudGerente(registroSeleccionado: any): Observable<any> {
   return this.http.post(`${this.baseUrl}/aceptDrafts_gerente`,registroSeleccionado,{ withCredentials: true });
  }


  /**
  * @description
  * Create an adjusmenet request to a draft by Vicepresidentes
  * @param resgistro The informacion of the adjusmenet request with the messages of the request and the request type.
  */
  aceptarSolicitudVicepresidente(registroSeleccionado: any): Observable<any> {
   return this.http.post(`${this.baseUrl}/aceptDraftsVicepresidente`,registroSeleccionado,{ withCredentials: true });
  }

  //===========================================================================================================
  //STATUS DRAFTS
  //===========================================================================================================

  /**
  * @description
  * Update the status of a specific draft
  * @param registroSeleccionado The necessary informacion to updating the status of the draft (id draft and the new status)
  */
  updateStatusDraft(registroSeleccionado: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/updateStatusDraft_Admin`,registroSeleccionado,{ withCredentials: true });
  }


  //===========================================================================================================
  //STATUS GERENTES OF THE DRAFTS
  //===========================================================================================================
  
  /**
  * @description
  * Update the status of gerentes for a specific draft
  * @param data The necessary informacion to updating the status of gerentes (id draft, the new status and email)
  */
  updateStatusGerentesDraft(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/updateStatusGerentesDraft_Admin`,data,{ withCredentials: true });
  }


  /**
  * @description
  * Eliminate the status of gerentes for a specific draft
  * @param data The necessary information to eliminating the status of gerentes (id draft, the new status)< and email)
  */
  eliminateStatusGerentesDraft(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/eliminateStatusGerentesDraft_Admin`,data,{ withCredentials: true });
  }

  //===========================================================================================================
  //STATUS VICEPRESIDENTES OF THE DRAFTS
  //===========================================================================================================

  /**
  * @description
  * Update the status of vicepresidentes for a specific draft
  * @param data The necessary informacion to updating the status of vicepresidentes (id draft and the new status and email)
  */
  updateStatusVicepresidentDraft(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/updateStatusVicepresidentDraft_Admin`,data,{ withCredentials: true });
  }

  
  /**
  * @description
  * Eliminate the status of vicepresidentes for a specific draft
  * @param data The necessary information to eliminating the status of vicepresidentes (id draft and email)
  */
  eliminateStatusVicepresidentDraft(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/eliminateStatusVicepresidentDraft_Admin`,data,{ withCredentials: true });
  }

 
}
