// =======================================================
// frontend/src/app/services/api.service.ts
// Service responsible for communicating with the backend API
// =======================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Global service used to manage administrative information
 * such as Tribes, Squads, VP Sponsors and salary configuration.
 */
@Injectable({ providedIn: 'root' })
export class InfoFormService {

  /* =====================================================
     BASE CONFIGURATION
     ===================================================== */

  // Base API URL loaded from environment configuration
  private baseUrl = environment.apiUrl;

  /**
   * HttpClient injection used to perform HTTP requests
   * to the backend
   */
  constructor(private http: HttpClient) {}

  /* =====================================================
     GENERAL INFORMATION
     ===================================================== */

  /**
   * Retrieves the general form information for administrators
   */
  getInfoForm(): Observable<any> {
    return this.http.get(`${this.baseUrl}/getInfoForm_Admin`,{ withCredentials: true });
  }


    /* =====================================================
     TRIBUS
     ===================================================== */

  /**
   * Deletes a tribe by its name
   * @param nameTrib Name of the tribe to be deleted
   */
  eliminateTribu(nameTrib: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/eliminateTribu_Admin`,{body: { name: nameTrib },withCredentials: true});
  }

  /**
   * Creates a new tribe
   * @param nameTribu Name of the tribe to be created
   */
  createTribu(nameTribu: any): Observable<any> {
    return this.http.post( `${this.baseUrl}/createTribu_Admin`,{ name: nameTribu },{ withCredentials: true });
  }

  /* =====================================================
     SQUADS
  ===================================================== */

  /**
   * Deletes a squad by its name
   * @param nameSquad Name of the squad to be deleted
   */
  eliminateSquad(nameSquad: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/eliminateSquad_Admin`,{ body: { name: nameSquad },withCredentials: true});
  }

  /**
   * Creates a new squad
   * @param nameSquad Name of the squad to be created
   */
  createSquad(nameSquad: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/createSquad_Admin`,{ name: nameSquad },{ withCredentials: true });
  }


    /* =====================================================
     VP SPONSOR
     ===================================================== */

  /**
   * Deletes a VP Sponsor by its name
   * @param nameVpSponsor Name of the VP Sponsor to be deleted
   */
  eliminateVpSponsor(nameVpSponsor: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/eliminateVpSponsor_Admin`,{ body: { name: nameVpSponsor },withCredentials: true});
  }


  /**
   * Creates a new VP Sponsor
   * @param nameVpSponsor Name of the VP Sponsor to be created
   */
  createVpSponsor(nameVpSponsor: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/createVpSponsor_Admin`,{ name: nameVpSponsor },{ withCredentials: true }
    );
  }

  /* =====================================================
    SALARY
  ===================================================== */

  /**
   * Updates the configured salary value
   * @param salario New salary value
   */
  newSalary(salary: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/updateSalary_Admin`,{ salario: salary },{ withCredentials: true }
    );
  }


  /**
   * Updates the configured Minimum Cutting Quantity value
   * @param minimumCuttingQuantity New Minimum Cutting Quantity value
   */
  newMinimumCuttingQuantity(minimumCuttingQuantity: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/updateMinimumCuttingQuantity_Admin`,{ monto_corte: minimumCuttingQuantity },{ withCredentials: true });
  }


    /* =====================================================
        VICEPRESIDENT BACKUP
    ===================================================== */


    updateViceBackup(vicepresidenciaBackup: any): Observable<any> {
      return this.http.post(`${this.baseUrl}/updateVicepresidentBackup_Admin`,{ vicepresidencia: vicepresidenciaBackup },{ withCredentials: true }
    );
  }

   /* =====================================================
        VICEPRESIDENT APROVERS
    ===================================================== */

     /**
   * Deletes a VP Sponsor by its name
   * @param nameVicepresident Name of the VP Sponsor to be deleted
   */
  eliminateVicepresident(nameVicepresident: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/eliminateVicepresidentAprover_Admin`,{ body: { name: nameVicepresident },withCredentials: true});
  }


  /**
   * Creates a new VP Sponsor
   * @param newVicepresident Name of the VP Sponsor to be created
   */
  createVicepresident(newVicepresident: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/createVicepresidentAprover_Admin`,{ vicepresidencia: newVicepresident },{ withCredentials: true }
    );
  }
}
