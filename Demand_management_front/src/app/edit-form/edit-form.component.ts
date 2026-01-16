import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EditFormService } from './edit-form.service';
import { AuthService } from '../guard/auth.service';

@Component({
  selector: 'app-edit-form',
  imports: [CommonModule, FormsModule, RouterModule, NgSelectModule],
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.css'] 
})
export class EditForm implements OnInit {

  //================================================================================
  //  GLOBAL VARIABLES
  //================================================================================
  
  /**
   * @description
   * Stores the selected record to be edited
   */
  registroSeleccionado: any = {};


  /**
   * @description
   * Control the modal Visibility
   */
  public showModal = false;

  
  /**
   * @description
   * Message displayed in modal
   */
  public errorMessage = '';


  /**
   * @description
   * Loading state: 0 = Not loading | 1 = Loading
   */
  public currentload: number = 0;

  
  /**
  * @description
  * Operation status: 0 = Error | 1 = Success | 2 = Initial 
  */
  public statusLoad: number = 2;

 
  /**
  * @description
  *  Route parameter (radicado ID) 
  */
  private id: any;


  /**
  * @description
  * Control de loading of the page
  */
  public loadPage: boolean = true;



  //==================================================================================
  //  FILE HANDLING CONFIGURATION
  //==================================================================================

  /**
  * @description
  * Names of the file fields used in the form.
  * Used to iterate through all the file upload sections.
  */
  public keys: string[] = [
    'juridica', 'cumplimiento_normativo', 'finops',
    'riesgo', 'seguridad_informacion', 'caso_negocio'
  ];

  /** 
  * @description
  * Allowed MIME types for images 
  */
  private readonly acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];


  /** 
  * @description
  * Allowed MIME types and extensions for Excel files 
  */
  private readonly acceptedExcelTypes = [
    '.xls', '.xlsx',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];


  /**
   * @description 
   * Stores validation error messages for each file field */
  public fileErrors: { [key: string]: string } = {
    caso_negocio: '',
    estimacion_detalle: '',
    cumplimiento_normativo: '',
    juridica: '',
    seguridad_informacion: '',
    finops: '',
    riesgo: ''
  };


  /** 
  * @description
  * Dictionary of selected File objects per field 
  */
  public selectedFiles: { [key: string]: File | null } = {};


  /** 
  * @description
  * Dictionary controlling drag-and-drop visual feedback 
  */
  public isDragging: { [key: number]: boolean } = {};


  // ============================================================================
  // VIABILITIES
  // ============================================================================


  /** 
   * @description
   * List of selected viability options */
  selectedViabilidades: string[] = [];


  /**
  * @description 
  * Options available for selection 
  */
  viabilityOptions = [
    { value: 'cumplimiento_normativo', label: 'Cumplimiento normativo' },
    { value: 'caso_negocio', label: 'Caso de negocio' },
    { value: 'juridica', label: 'Jurídica' },
    { value: 'seguridad_informacion', label: 'Seguridad de la información' },
    { value: 'riesgo', label: 'Riesgos' },
    { value: 'finops', label: 'Buenas prácticas (FinOps)' }
  ];


  /**
  * @description 
  * Options available for selection 
  */
  public showViabilityDropdown = false;



  /**
   * @description
   * Toggles the viability selection.
   * If already selected, removes it and clears the corresponding file.
   */
  toggleViability(value: string): void {
    const index = this.selectedViabilidades.indexOf(value);
    if (index === -1) {
      this.selectedViabilidades.push(value);
    } else {
      this.selectedFiles[value] = null;
      this.selectedViabilidades.splice(index, 1);
    }
  }

  
  /**
   * @description
   * Toggles the visibility of the viability selection.
   */
  toggleDropdown(): void {
    this.showViabilityDropdown = !this.showViabilityDropdown;
  }


  @ViewChild('dropdownRef') dropdownRef!: ElementRef;
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {

    if (!this.showViabilityDropdown) return;
  
    const clickedInside = this.dropdownRef?.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.showViabilityDropdown = false;
    }
  }


  /** 
  * @description
  * Returns the label of a viability option by its value 
  */
  getLabel(value: string): string {
    const item = this.viabilityOptions.find(v => v.value === value);
    return item ? item.label : '';
  }


  // ============================================================================
  // FORM DATA STRUCTURE
  // ============================================================================
  

  /**
   * @description
   * Main object that stores all form data divided by steps
   */
  public formData = {
    step1: {
      po: '',
      pot: '',
      vp_sponsor: '',
      lider_negocio: '',
      tribu: '',
      squad: '',
      nombre_proyecto: '',
      situacion_resolver:'',
      alcance:'',
      presupuesto: '',
      start_date: '',
      end_date: ''
    },
    step2: {
      aliados_q1: '',
      aliados_q2: '',
      aliados_q3: '',
      actividades_q1: '',
      actividades_q2: '',
      propuesta_q1: '',
      propuesta_q2: '',
      propuesta_q3: '',
      relacion_q1: '',
      relacion_q2: '',
      recursos_q1: '',
      canales_q1: '',
      canales_q2: '',
      segmentos_q1: '',
      segmentos_q2: '',
      segmentos_q3: '',
      gastos_q1: '',
      gastos_q2: '',
      gastos_q3: '',
      ingreso_q1: '',
      ingreso_q2: '',
      ingreso_q3: ''
    }
  };

  /**
  * @description
  * list of the tribes, which appear in the edit form as a selection list
  */
  tribus: string[] = [];


  /**
  * @description
  * list of the vp_sponsor, which appear in the edit form as a selection list
  */
  sponsors: string[] = [];


  /**
  * @description
  * list of the squads, which appear in the edit form as a selection list
  */
  squads: string[] = [];


   /**
   * @description
   * Class constructor used to inject the Router, Active Route, Edit form Service and the AuthService.
   */
  constructor(
    private router: ActivatedRoute,
    private route: Router,
    private editFormService: EditFormService,
    public  authService: AuthService
  ) {}


  /** 
  * @description
  * Saves current form state to local storage 
  */
  public saveState(): void {
    localStorage.setItem('formData', JSON.stringify(this.formData));
  }


  /** 
  * @description
  * Angular lifecycle hook - called after component initialization 
  */
  ngOnInit(): void {
      this.id = this.router.snapshot.paramMap.get('id');
      this.loadDraft(this.id!);
      this.getInfoFormAttributes(); 
  }


  /** 
  * @description
  * Get the form attribute information from the Backend. the list of tribes, squads, and VP sponsor to the form
  */
  getInfoFormAttributes() {

    this.editFormService.getInfoFormAttributes().subscribe({
      next: (data) => {
        this.tribus = data.tribus;
        this.sponsors = data.vpSponsors;
        this.squads = data.squads;
        this.loadPage =false;
      },

      error: (err) => {
        this.loadPage =false;
        console.error('Error in obtaining information about the form attributes', err);
        
      }
    });
  }


  //===============================================================
  // FUNTIONAL REQUIREMENTS
  //===============================================================


  /**
  * @description
  * Loads draft data from backend and maps it into form fields
  * @param id - Draft identifier
  */
  loadDraft(id: string): void {

    this.editFormService.getDraft(id ).subscribe({

      next: (req) => {
        
        this.registroSeleccionado = req.data;
        console.log(req);

        this.formData.step1.lider_negocio = this.registroSeleccionado.lider_negocio;
        this.formData.step1.nombre_proyecto = this.registroSeleccionado.nombre_proyecto;
        this.formData.step1.po = this.registroSeleccionado.po;
        this.formData.step1.pot = this.registroSeleccionado.pot;
        this.formData.step1.squad = this.registroSeleccionado.squad;
        this.formData.step1.vp_sponsor = this.registroSeleccionado.vp_sponsor;
        this.formData.step1.tribu = this.registroSeleccionado.tribu;
        this.formData.step1.situacion_resolver = this.registroSeleccionado.situacion_resolver;
        this.formData.step1.alcance = this.registroSeleccionado.alcance;

         this.formData.step1.start_date = this.registroSeleccionado.start_date;
        this.formData.step1.end_date = this.registroSeleccionado.end_date;
        this.formData.step1.presupuesto = this.registroSeleccionado.presupuesto;
        
        Object.keys(this.formData.step2).forEach(key => {
          this.formData.step2[key as keyof typeof this.formData.step2] =
            this.registroSeleccionado[key];
        });
      },

      error: (err) => {
        console.error('Error loading draft', err);
        if (err.status === 401 || err.status === 403 || err.status === 404) {
          this.route.navigate(['/access_denied']); 
        }
      }
    });
  }


  /** 
   * @description
   * Sends data to backend for update */
  public updateData(): void {

    if (this.isCurrentStepValid()) {

      this.currentload = 1;

      const dataToSend = new FormData();

     
      for (const key in this.formData.step1) {
        dataToSend.append(`step1[${key}]`, this.formData.step1[key as keyof typeof this.formData.step1]);
      }


      for (const key in this.formData.step2) {
        dataToSend.append(`step2[${key}]`, this.formData.step2[key as keyof typeof this.formData.step2]);
      }

     
      this.keys.forEach(key => {
        const value = this.selectedFiles[key];
        if (value) dataToSend.append(`step2[${key}]`, value, value.name);
      });


      this.editFormService.updateDraft(this.id, dataToSend).subscribe({

        next: (res) => {
          this.statusLoad = 1;
          localStorage.removeItem('formData');
          localStorage.removeItem('currentStep');
        },
        error: (err) => {
          console.error('Error updating draft:', err);
          this.statusLoad = 0;
        }
      });
    }
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
    this.route.navigate(['/login']);
  }

  // =======================================================================
  // FILE MANAGEMENT
  // =======================================================================
  

  /**
   * Handles the file selected via input.
   * @param event File selection event
   * @param number 1 = Excel | 2 = Image
   * @param fieldName Field name (e.g., "juridica")
   */
  public onFileSelected(event: Event, number: number, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    const file: File | null = input.files ? input.files[0] : null;
    this.handleFile(file, number, fieldName);
  }

  /**
   * Handles a file dragged and dropped into the area.
   * @param event Drag event
   * @param number 1 = Excel | 2 = Image
   * @param fieldName Field name
   */
  public onFileDrag(event: DragEvent, number: number, fieldName: string): void {
    event.preventDefault();
    const file: File | null = event.dataTransfer ? event.dataTransfer.files[0] : null;
    this.handleFile(file, number, fieldName);
  }

  /**
   * Core logic for file validation and state update
   * @param file The file being validated
   * @param number 1 = Excel | 2 = Image
   * @param fieldName Field name
   */
  private handleFile(file: File | null, number: number, fieldName: string): void {
    let errorMessage = '';

    if (file) {

      if (number === 1) {
        const isExcelType =
          this.acceptedExcelTypes.includes(file.type) ||
          this.acceptedExcelTypes.some(ext => file.name.endsWith(ext));

        if (!isExcelType) {
          errorMessage = 'El archivo que subió no es compatible. Por favor, seleccione un archivo de Excel (.xls, .xlsx).';
        }

      } else if (number === 2 && !this.acceptedImageTypes.includes(file.type)) {

        errorMessage = 'El archivo que subió no es compatible. Por favor, seleccione un archivo en formato JPEG, PNG o GIF.';
      }

    }

    this.fileErrors[fieldName] = errorMessage;
    this.selectedFiles[fieldName] = errorMessage ? null : file;  
  }


  /**
   * Triggered when item is dragged over drop zone
   */
  public onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    this.isDragging[index] = true;
  }


  /**
   * Triggered when drag leaves the drop zone
   */
  public onDragLeave(event: DragEvent, index: number): void {
    event.preventDefault();
    this.isDragging[index] = false;
  }


  /**
   * Handles the drop event
   */
  public onDrop(event: DragEvent, index: number, caso: number, fieldName: string): void {
    event.preventDefault();
    this.isDragging[index] = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.onFileDrag(event, caso, fieldName);
    }
  }



  // =======================================================================
  // AUXILIARY FUNCTION
  // =======================================================================


  /** Closes modal and resets message */
  public closeModal(): void {
    this.showModal = false;
    this.errorMessage = '';
  }

  /** 
  * @description
  * Validates all fields is (if it's all complete) before sending 
  */
  public isCurrentStepValid(): boolean {
    
    let fieldsToCheck: any = this.formData.step1;

    for (const key in fieldsToCheck) {
      if (!fieldsToCheck[key]) {
        this.errorMessage = 'Completa todos los campos faltante.';
        this.showModal = true;
        return false;
      }
    }

    fieldsToCheck = this.formData.step2;
    for (const key in fieldsToCheck) {
      if (!fieldsToCheck[key]) {
        this.errorMessage = 'Completa todos los campos faltante.';
        this.showModal = true;
        return false;
      }
    }

    if (this.selectedViabilidades.length > 0) {
      for (const selected of this.selectedViabilidades) {
        if (!this.selectedFiles[selected]) {
          this.errorMessage = 'Completa todos los campos faltante.';
          this.showModal = true;
          return false;
        }
      }
    }
    return true;
  }

  /** 
  * @description
  * Change the time format in the draft to make it easier
  * @param time Time in the format provided by Firebase
  */
  formatDate(time: any): string {
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
      return time.toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
    }

    
    return JSON.stringify(time);
  }


  /** 
  * @description
  * Conttol the field "Presupuesto total" and its way to present the value of the number with ".". 
  * Example: "50000" to "50.000" 
  * @param event Time in the format provided by Firebase
  */
  formatCurrency(event: any): void {
    let value = event.target.value;

    
    value = value.replace(/\D/g, '');

    if (value) {
        
        const numberValue = parseInt(value, 10);
        
        const formatter = new Intl.NumberFormat('es', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        const formattedValue = formatter.format(numberValue);

        this.formData.step1.presupuesto = formattedValue;
        
        event.target.value = formattedValue;
    } else {
        this.formData.step1.presupuesto = '';
        event.target.value = '';
    }
  }
 
 

}
