import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { HistoryService } from './history.service';
import { AuthService } from '../guard/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { Modal, Offcanvas } from 'bootstrap';

declare var bootstrap: any;

/**
 * @component HistoryComponent
 * @description
 * Component that manages the history of drafts, including
 * listing, filtering, viewing details, approvals, and adjustment requests.
 */
@Component({
  selector: 'app-history',
  standalone: true,
  imports: [NgSelectModule, CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent
  implements OnInit, AfterViewInit, OnDestroy {

  /* =====================================================
   * GLOBAL VARIABLES
   * ===================================================== */

  /**
   * @description
   * List containing all draft records displayed in the table.
   */
  historial: any[] = [];


  /**
   * @description
   * Controls loading spinner visibility.
   */
  cargando: boolean = true;


  /**
   * @description
   * Logged-in user email.
   */
  userEmail: string = '';


  /**
   * @description
   * Selected draft record.
   */
  registroSeleccionado: any = null;


  /**
   * @description
   * Change history of the selected draft.
   */
  historialCambios: any = null;


  /**
   * @description
   * Adjustment request form in the modal.
   */
  ajustesSolicitud = {
    tipoSolicitud: '',
    comentariosAjuste: ''
  };


  /**
   * @description
   * Loading signal for dinamic buttons in all page.
   */
  isLoading = signal(false);

  /**
   * @description
   * Success message signal that appear after acept or creating an adjusment request to a draft in the modals.
   */
  successMessage = signal<string | null>(null);

  statusUpdate:String='';


  /* ==========================================================================================
  * FILTERING 
  * Here youll find all the variables and functions necessary for the  draft filters work.
  * ===========================================================================================*/

  /**
   * @description
   * Search input for filtering by project name or ID.
   */
  busquedaNombreId: string = '';


  /**
   * @description
   * Start date filter.
   */
  fechaFiltroInicio: string = '';


  /**
   * @description
   * End date filter.
   */
  fechaFiltroFin: string = '';


  /**
   * @description
   * Selected status to filtering by status drafts.
   */
  selectedStatuses: string[] = [];


  /**
   * @description
   * Toggles status filter.
   * @param status Draft status
   */
  toggleFilter(status: string): void {
    const index = this.selectedStatuses.indexOf(status);
    index > -1
      ? this.selectedStatuses.splice(index, 1)
      : this.selectedStatuses.push(status);
  }


  /**
   * @description
   * Filtered draft list getter.
   * @returns Filtered drafts
   */
  get historialFiltrado(): any[] {
    return this.historial.filter(r => {
      const matchStatus = this.selectedStatuses.length
        ? this.selectedStatuses.includes(r.estado)
        : true;

      const matchSearch = this.busquedaNombreId
        ? r.id?.toLowerCase().includes(this.busquedaNombreId.toLowerCase()) ||
          r.nombre_proyecto.toLowerCase().includes(this.busquedaNombreId.toLowerCase())
        : true;

      const date = new Date(r.fechaRadicacionISO).getTime();
      const start = this.fechaFiltroInicio
        ? new Date(this.fechaFiltroInicio).getTime()
        : null;
      const end = this.fechaFiltroFin
        ? new Date(this.fechaFiltroFin).getTime()
        : null;

      return matchStatus &&
        matchSearch &&
        (!start || date >= start) &&
        (!end || date <= end);
    });
  }



  /* ===================================================================================
   * LIFECYCLE 
   * =================================================================================== */

  constructor(
    private historyService: HistoryService,
    private router: Router,
    public authService: AuthService
  ) {}

  /**
   * @description
   * Initializes component and loads drafts based on role. If the role is "Radicador, 
   * only load the user's draft. But if the role is different, load all drafts".
   */
  ngOnInit(): void {
    if (this.authService.hasAnyRole(['Radicador'])) {
      this.getDraftsOfAUser();
    } else {
      this.getAllDrafts();
    }
  }

  /**
   * @description
   * Lifecycle hook after view initialization.
   */
  ngAfterViewInit(): void {}


  /**
   * @description
   * Cleans modal backdrops on destroy.
   */
  ngOnDestroy(): void {
    document.body.classList.remove('modal-open');
    document.querySelectorAll('.modal-backdrop')
      .forEach(el => el.remove());
  }


  /* =====================================================
  * MODAL FUNCTIONS (1.DETAILS DRAFT, 2.ACEPT DRAFT AND 3.ADJUSMENT REQUEST TO A DRAFST)
  * All the necessary functions for the modal are here: go to another modal, change the modal's view, 
  * open an accordion inside the modal... ...
  * ===================================================== */

  /**
   * @description
   * Controls extra information visibility in teh Details Modal window.
   */
  infoExtraOpen = false;


  /**
   * @description
   * Currently selected tab inside details modal.
   */
  selectedTab: 'detalle' | 'historial' = 'detalle';


  /**
   * @description
   * Toggles extra info section.
   */
  toggleInfoExtra(): void {
    this.infoExtraOpen = !this.infoExtraOpen;
  }


  /**
   * @description
   * Changes modal tab view.
   * @param tab Selected tab
   */
  cambiarVista(tab: 'detalle' | 'historial'): void {
    this.selectedTab = tab;
  }


  /**
   * @description
   * Opens a modal after closing another.
   * @param targetId Target modal ID
   */
  abrirOtroModal(targetId: string): void {
    const actualModalEl = document.getElementById('modalDetalles');
    const actualModal = Modal.getInstance(actualModalEl!);

    actualModalEl?.addEventListener(
      'hidden.bs.modal',
      () => {
        const modalEl = document.getElementById(targetId);
        const modal2 = new Modal(modalEl!, {
          backdrop: true,
          keyboard: false
        });
        modal2.show();
      },
      { once: true }
    );

    actualModal?.hide();
  }


  /**
   * @description
   * Closes a modal and resets state.
   * @param id Modal ID
   */
  cerrarModal(id: string): void {
    this.registroSeleccionado = null;
    this.selectedTab = 'detalle';
    const modal = Modal.getInstance(document.getElementById(id)!);
    modal?.hide();
  }


  /**
   * @description
   * Navigates to edit view after closing modal.
   * @param id Draft ID
   */
  irAEditar(id: string): void {
    const modal = document.getElementById('modalDetalles');
    const bsModal = bootstrap.Modal.getInstance(modal);
    bsModal?.hide();
    this.router.navigate(['/editar-radicado', id]);
  }

  

  /* =====================================================
  * FUNTIONAL REQUIREMENTS
  * ===================================================== */

  /**
  * @description
  * Loads drafts created by the current user.
  */
  getDraftsOfAUser(): void {
    this.cargando = true;
    this.historyService.getDraftsByUser().subscribe({
      next: dat => {
        this.historial = dat.data.map((r: any) => {
          const seconds = Number(r.createdAt?._seconds);
          const fecha = seconds ? new Date(seconds * 1000) : null;
          this.countDraft(r);

          return {
            ...r,
            fechaRadicacion: fecha
              ? fecha.toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })
              : 'Sin fecha',
            fechaRadicacionISO: fecha
              ? new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
                  .toISOString()
                  .split('T')[0]
              : null
          };
        });
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false
        console.error('Error in obtaining the drafts of a user', error);
      }
    });
  }

  /**
  * @description
  * Loads all drafts (all roles except "Radicador").
  */
  getAllDrafts(): void {
    this.cargando = true;
    this.historyService.getAllDrafts().subscribe({
      next: dat => {
        this.historial = dat.data.map((r: any) => {
          const seconds = Number(r.createdAt?._seconds);
          const fecha = seconds ? new Date(seconds * 1000) : null;
          this.countDraft(r);

          return {
            ...r,
            fechaRadicacion: fecha
              ? fecha.toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })
              : 'Sin fecha',
            fechaRadicacionISO: fecha
              ? new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
                  .toISOString()
                  .split('T')[0]
              : null
          };
        });
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false
        console.error('Error in obtaining all drafts ', error);
      }
    });
  }


  /**
  * @description
  * Logs out the user and redirects to login.
  */
  logout(): void {
    this.authService.logout();
    const google = (window as any).google;
    if (google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
    }
    this.router.navigate(['/login']);
  }


  /**
  * @description
  * Shows draft details modal and loads data.
  * @param id Draft ID
  */
  mostrarDetalles(id: any): void {
    const modalEl = document.getElementById('modalDetalles');
    const modal = Modal.getOrCreateInstance(modalEl!);
    modal.show();

    this.historyService.getDraftDetail(id).subscribe({
      next: dat => {
        this.registroSeleccionado = dat.data;
        this.historialCambios = dat.history;
        this.procesarArchivos(this.registroSeleccionado);
      },
      error: (error)=>{
        console.error('Error in obtaining the information drafts', error);
      }
    });
  }


  /**
   * @description
   * Sends an adjustment request based on the user's role (Vicepresidente, Gerente, or Metodos).
   * Validates that the request type and comments are provided before sending.
   */
  sendAdjusmentRequest() {
    this.isLoading.set(true);
    if (this.ajustesSolicitud.tipoSolicitud && this.ajustesSolicitud.comentariosAjuste) {
      this.successMessage.set(null);

      const req = {
        documentId: this.registroSeleccionado.id,
        inf: this.ajustesSolicitud
      };

      if (this.authService.hasAnyRole(['Vicepresidente'])) {
        this.historyService.adjusmentRequestVicepresidente(req).subscribe({
          next: () => {
            console.log("SUCCESS: Solicitud enviada CORRECTAMENTE");
            this.successMessage.set("¡Solicitud enviada correctamente!");
            this.isLoading.set(false);
            this.ajustesSolicitud.tipoSolicitud = '';
            this.ajustesSolicitud.comentariosAjuste = '';
            setTimeout(() => { window.location.reload(); }, 2000);
          },
          error: (err) => {
            console.error('Error al enviar solicitud de ajuste:', err);
            this.successMessage.set("Error: No se pudo enviar la solicitud. " + (err.message || ''));
            this.isLoading.set(false);
          }
        });
      } else if (this.authService.hasAnyRole(['Gerente'])) {
        this.historyService.adjusmentRequestGerente(req).subscribe({
          next: () => {
            console.log("SUCCESS: Solicitud enviada CORRECTAMENTE");
            this.successMessage.set("¡Solicitud enviada correctamente!");
            this.isLoading.set(false);
            this.ajustesSolicitud.tipoSolicitud = '';
            this.ajustesSolicitud.comentariosAjuste = '';
            setTimeout(() => { window.location.reload(); }, 2000);
          },
          error: (err) => {
            console.error('Error al enviar solicitud de ajuste:', err);
            this.successMessage.set("Error: No se pudo enviar la solicitud. " + (err.message || ''));
            this.isLoading.set(false);
          }
        });
      } else {
        this.historyService.adjusmentRequestMetodos(req).subscribe({
          next: () => {
            console.log("SUCCESS: Solicitud enviada CORRECTAMENTE");
            this.successMessage.set("¡Solicitud enviada correctamente!");
            this.isLoading.set(false);
            this.ajustesSolicitud.tipoSolicitud = '';
            this.ajustesSolicitud.comentariosAjuste = '';
            setTimeout(() => { window.location.reload(); }, 2000);
          },
          error: (err) => {
            console.error('Error al enviar solicitud de ajuste:', err);
            this.successMessage.set("Error: No se pudo enviar la solicitud. " + (err.message || ''));
            this.isLoading.set(false);
          }
        });
      }
    } else {
      this.successMessage.set("Mensaje enviado incorrectamnete");
    }
  }

  /**
   * @description
   * Approves the current initiative. The approval flow changes depending on 
   * whether the draft is in review by a Vice-president, Methods, or Manager.
   */
  approveInitiative() {
    this.isLoading.set(true);
    const data = { id_draft: this.registroSeleccionado.id };

    if (this.registroSeleccionado.estado === "En revisión" && this.allGerentesRequest()) {
      this.historyService.aceptarSolicitudVicepresidente(data).subscribe({
        next: () => {
          console.log("SUCCESS: Solicitud enviada CORRECTAMENTE");
          this.successMessage.set("¡Solicitud enviada correctamente!");
          this.isLoading.set(false);
          setTimeout(() => { window.location.reload(); }, 2000);
        },
        error: (err) => {
          console.error('Error to sending the request adjusment:', err);
          this.successMessage.set("Error: No se pudo enviar la solicitud. " + (err.message || ''));
          this.isLoading.set(false);
        }
      });
    } else if (this.authService.hasAnyRole(['Metodos'])) {
      this.historyService.aceptarSolicitud(data).subscribe({
        next: () => {
          console.log("SUCCESS: Solicitud enviada CORRECTAMENTE");
          this.successMessage.set("¡Solicitud enviada correctamente!");
          this.isLoading.set(false);
          setTimeout(() => { window.location.reload(); }, 2000);
        },
        error: (err) => {
          console.error('Error to sending the request adjusment:', err);
          this.successMessage.set("Error: No se pudo enviar la solicitud. " + (err.message || ''));
          this.isLoading.set(false);
        }
      });
    } else {
      this.historyService.aceptarSolicitudGerente(data).subscribe({
        next: () => {
          console.log("SUCCESS: Solicitud enviada CORRECTAMENTE");
          this.successMessage.set("¡Solicitud enviada correctamente!");
          this.isLoading.set(false);
          setTimeout(() => { window.location.reload(); }, 2000);
        },
        error: (err) => {
          console.error('Error to sending the request adjusment:', err);
          this.successMessage.set("Error: No se pudo enviar la solicitud. " + (err.message || ''));
          this.isLoading.set(false);
        }
      });
    }
  }

  /**
   * @description
   * Updates the overall status of a draft.
   */
  updateStatus() {
    this.isLoading.set(true);
    const data = { id_draft: this.registroSeleccionado.id, statusUpdate: this.statusUpdate };

    this.historyService.updateStatusDraft(data).subscribe({
      next: () => {
        console.log("SUCCESS: Solicitud enviada CORRECTAMENTE");
        this.successMessage.set("¡Solicitud enviada correctamente!");
        this.isLoading.set(false);
        setTimeout(() => { window.location.reload(); }, 2000);
      },
      error: (err) => {
        console.error('Error to updating the status draft:', err);
        this.successMessage.set("Error: No se pudo enviar la solicitud. " + (err.message || ''));
        this.isLoading.set(false);
      }
    });
  }

  /**
   * @description
   * Updates the specific status assigned by a Manager to a draft.
   * @param gerente Object containing manager information and the temporary status.
   */
  updateStatusGerenteDraft(gerente: any) {
    gerente.editando = false;
    const data = { id_draft: this.registroSeleccionado.id, correo: gerente.correo, statusUpdate: gerente.estadoTemp };

    this.historyService.updateStatusGerentesDraft(data).subscribe({
      next: () => {
        console.log("SUCCESS: Solicitud enviada CORRECTAMENTE");
        this.successMessage.set("¡Solicitud enviada correctamente!");
        this.isLoading.set(false);
        setTimeout(() => { window.location.reload(); }, 2000);
      },
      error: (err) => {
        console.error('Error to updating the status gerentes of the draft:', err);
        this.successMessage.set("Error: No se pudo enviar la solicitud. " + (err.message || ''));
        this.isLoading.set(false);
      }
    });
  }

  /**
   * @description
   * Updates the specific status assigned by a Vice-president to a draft.
   * @param vicepresident Object containing vice-president info and temporary status.
   */
  updateStatusVicepresidentDraft(vicepresident: any) {
    vicepresident.editando = false;
    const data = { id_draft: this.registroSeleccionado.id, correo: vicepresident.correo, statusUpdate: vicepresident.estadoTemp };

    this.historyService.updateStatusVicepresidentDraft(data).subscribe({
      next: () => {
        console.log("SUCCESS: Solicitud enviada CORRECTAMENTE");
        this.successMessage.set("¡Solicitud enviada correctamente!");
        this.isLoading.set(false);
        setTimeout(() => { window.location.reload(); }, 2000);
      },
      error: (err) => {
        console.error('Error al enviar solicitud de ajuste:', err);
        this.successMessage.set("Error to updating the status vicepresidente of the draft:" + (err.message || ''));
        this.isLoading.set(false);
      }
    });
  }

  /**
   * @description
   * Removes a Manager's status/association from a specific draft.
   * @param correo The email of the Manager to be removed.
   */
  eliminateStatusGerenteDraft(correo: string) {
    const data = { id_draft: this.registroSeleccionado.id, correo: correo };

    this.historyService.eliminateStatusGerentesDraft(data).subscribe({
      next: () => {
        console.log("SUCCESS: Solicitud enviada CORRECTAMENTE");
        this.successMessage.set("¡Solicitud enviada correctamente!");
        this.isLoading.set(false);
        setTimeout(() => { window.location.reload(); }, 2000);
      },
      error: (err) => {
        console.error('Error to eliminating the status vicepresidente of the draft:', err);
        this.successMessage.set("Error: No se pudo enviar la solicitud. ");
        this.isLoading.set(false);
      }
    });
  }

  /**
   * @description
   * Removes a Vice-president's status/association from a specific draft.
   * @param correo The email of the Vice-president to be removed.
   */
  eliminateStatusVicepresidentDraft(correo: string) {
    const data = { id_draft: this.registroSeleccionado.id, correo: correo };

    this.historyService.eliminateStatusVicepresidentDraft(data).subscribe({
      next: () => {
        console.log("SUCCESS: Solicitud enviada CORRECTAMENTE");
        this.successMessage.set("¡Solicitud enviada correctamente!");
        this.isLoading.set(false);
        setTimeout(() => { window.location.reload(); }, 2000);
      },
      error: (err) => {
        console.error('Error to eliminating the status vicepresidente of the draft:', err);
        this.successMessage.set("Error: No se pudo enviar la solicitud. ");
        this.isLoading.set(false);
      }
    });
  }





  /* =====================================================
  * COUNT DRAFTS PER STATES.
  * we track each draft per state after  loading the draft history into the "History" variable.
  * The informacion stored in the corresponding varible is used to display it on the page.
  * ===================================================== */

  /**
  * @description
  * Draft states.
  */
  casesDraft = [
    'Radicado',
    'En revisión',
    'Pendiente de ajustes',
    'Aprobacion preliminar',
    'Rechazado',
    'Aprobado'
  ];


  /**
   * @description
   * Draft count per state.
   */
  countDf: { [key: string]: number } = {
    'Radicado': 0,
    'En revisión': 0,
    'Pendiente de ajustes': 0,
    'Aprobacion preliminar': 0,
    'Rechazado': 0,
    'Aprobado': 0
  };


  /**
  * @description
  * Counts drafts per state an show in the cards.
  * @param r Draft record
  */
  countDraft(r: any): void {
    this.casesDraft.forEach(state => {
      if (r.estado === state) {
        this.countDf[state]++;
      }
    });
  }





  /* ========================================================================================================
   *  DOCUMENTS PROCESS 
   *  Here we review the selected draft to see the details. The idea is simply to see 
   *  what documents are in the draft and display their details once mapped in the details modal window.
   * ======================================================================================================== */

  /**
   * @description
   * List of available documents for download.
   */
  public documentosPosibles = [
    { label: 'FinOps', campo: 'step2[finops]' },
    { label: 'riesgo', campo: 'step2[riesgo]' },
    { label: 'seguridad de la información', campo: 'step2[seguridad_informacion]' },
    { label: 'jurídica', campo: 'step2[juridica]' },
    { label: 'cumplimiento normativo', campo: 'step2[cumplimiento_normativo]' }
  ];

  /**
   * @description
   * Business case document list.
   */
  public documentosPosibles2 = [
    { label: 'caso de negocio', campo: 'step2[caso_negocio]' }
  ];

  /**
   * @description
   * Files mapped by backend field name.
   */
  archivosPorCampo: { [key: string]: any } = {};

  /**
   * @description
   * Checks if there are downloadable documents.
   */
  get sinDescargas(): boolean {
    return !this.documentosPosibles.some(
      doc => this.archivosPorCampo?.[doc.campo]?.urlDescarga
    );
  }

  /**
   * @description
   * Maps attached files by field name.
   * @param data Draft data
   */
  procesarArchivos(data?: any): void {
    if (data?.archivosAdjuntos) {
      this.archivosPorCampo = data.archivosAdjuntos.reduce(
        (acc: { [key: string]: any }, archivo: any) => {
          acc[archivo.nombreCampo] = archivo;
          return acc;
        },
        {}
      );
    }
  }

  /* =====================================================
   * Auxiliary function
   * ===================================================== */

  /**
   * @description
   * Formats date values safely.
   * @param time Date input
   * @returns Formatted date string
   */
  formatFecha(time: any): string {
    if (!time) return 'Sin fecha';

    if (time.seconds || time._seconds) {
      const seconds = time.seconds ?? time._seconds;
      return new Date(seconds * 1000).toLocaleString('es-CO', {
        dateStyle: 'long',
        timeStyle: 'short'
      });
    }

    if (typeof time === 'string') return time;
    if (time instanceof Date) {
      return time.toLocaleString('es-CO', {
        dateStyle: 'long',
        timeStyle: 'short'
      });
    }

    return JSON.stringify(time);
  }


  /**
   * @description
   * It allows you to know if a "Gerente" or "vicepresidente" has already responded to project.
   * @param time Stirng with the case to be evaluate (Gerente or Vicepresidente)
   * @returns boolean
   */
  yaRespondioGerente(role: string): boolean {

    this.userEmail = this.authService.getUserEmail();

    if(this.authService.hasAnyRole(['Gerente'])){
      const gerente = this.registroSeleccionado.aprobacionGerentes
      ?.find((g: any) => g.correo === this.userEmail);
      return gerente ? gerente.estado !== "En revisión" : false;


    }else if(this.authService.hasAnyRole(['Vicepresidente'])){
      const Vicepresidentes = this.registroSeleccionado.aprobacionVices
      ?.find((g: any) => g.correo === this.userEmail);
      return Vicepresidentes ? Vicepresidentes.estado !== "En revisión" : false;
    }

    return false;
  }

   /**
   * @description
   * It allows you to know if a the vicerpesidente can respond a project or no
   * 2 reasons to allow respond: 1. All Gerentes accepted the proyect 2. The Vicepresidente is in the list of the aprovers
   * @param time Stirng with the case to be evaluate (Gerente or Vicepresidente)
   * @returns boolean
   */
  yaPuedeVicepresidentes(): boolean {

    
    const gerentes = this.registroSeleccionado.aprobacionGerentes;
    const vicepresidentes = this.registroSeleccionado.aprobacionVices;

    let tr = true;

    gerentes.forEach( (gerente : any) =>{
      if(gerente.estado != "Aprobado"){
        tr = false;
      }

    })

    const existe = vicepresidentes.some((v: any) => v.correo === this.authService.getUserEmail());

    if(!existe){
      tr=false
    };
      
    return tr;

  }

  /**
   * @description
   * It allows you to know if all "Gerentes"  has already responded to project.
   * @param time Stirng with the case to be evaluate (Gerente or Vicepresidente)
   * @returns boolean
   */
  allGerentesRequest(): boolean {
    const gerentes = this.registroSeleccionado.aprobacionGerentes;
    let allGerentesRequest = true;

    gerentes.forEach( (gerente: any) => {
        if(gerente.estado !="Aprobado"){
          allGerentesRequest =false;
        };
        
      });

    return allGerentesRequest;
  }

/**
   * @description
   * Reset modal
   */
  reiniciarModal(){
     this.successMessage.set(null);
      this.isLoading.set(false); 
  }


  /**
   * @description
   * Reset modal
   */
  reiniciarModalSolicitud(){
     this.successMessage.set(null);
      this.isLoading.set(false); 
  }



  /**
   * @description
   * Cancels the editing mode for a Manager's status without saving changes.
   * @param gerente The manager object to reset.
   */
  cancelChangeGerente(gerente: any) {
    gerente.editando = false;
  }

  /**
   * @description
   * Cancels the editing mode for a Vice-president's status without saving changes.
   * @param vicepresidente The vice-president object to reset.
   */
  cancelChangeVicepresident(vicepresidente: any) {
    vicepresidente.editando = false;
  }

  /**
   * @description
   * Enables editing mode for a Manager and initializes a temporary status 
   * variable with the current value to allow reversible changes.
   * @param gerente The manager object to be edited.
   */
  editGerente(gerente: any) {
    gerente.editando = true;
    gerente.estadoTemp = gerente.estado; 
  }

  /**
   * @description
   * Enables editing mode for a Vice-president and initializes a temporary status 
   * variable with the current value to allow reversible changes.
   * @param vicepresident The vice-president object to be edited.
   */
  editVicepresident(vicepresident: any) {
    vicepresident.editando = true;
    vicepresident.estadoTemp = vicepresident.estado; 
  }

}
