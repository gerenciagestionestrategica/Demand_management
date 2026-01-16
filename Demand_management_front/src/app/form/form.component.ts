import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FormService } from './form.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { firstValueFrom } from 'rxjs';
import { stringify } from 'querystring';
import { AuthService } from '../guard/auth.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgSelectModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})

export class FormComponent implements OnInit {
  


  //================================================================================
  //  GLOBAL VARIABLES
  //================================================================================

  /**
   * @description
   * Controls the current step of the form, starting at 1
   */
  public currentStep: number = 1;

   /**
   * @description
   * Error Mensagge appearing when uploading files
   */
  public errorMessage: string = '';

  /**
   * @description
   * Controls de appearance of the model if the user dint complete the form
   */
  public showModal: boolean = false;


  /**
   * @description
   * Loading state (loading) when sending form.
   * 0: No cargando | 1: Cargando
   */
  public currentload: number = 0;


  /**
   * @description
   * Status of the operation in the las shipment.
   * 0: Error in sending | 1: Submission succesful | 2: initial status/To be send
   */
  public statusLoad: number = 2;


  /**
   * @description
   * Dictionary that stores a string of IA messages
   */
  public recomendationMessages: {[key: string]: string } = {

    recomendacion1:'',
    recomendacion2:''

  };


  //========================================================================================================
  // FILES MANAGEMENT
  //========================================================================================================


  /**
   * @description
   * MIME types and image extensions of file allowed for eacth viability section.
   */
  private readonly acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];


  /**
   * @description
   * MIME types and Excel extensions of file allowed for "Caso de Negocio" and "Estimación Detallada".
   */
  private readonly acceptedExcelTypes = ['.xls', '.xlsx', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];


  /**
   * @description
   * Dictionary that stores a string of field-specific file validation error messages
   */
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
   * Diccionaty to store the user-selected 'File' instance for each field
   */
  public selectedFiles: { [key: string]: File | null } = {};


  /**
   * @description
   * Diccionary to controll the drag-and-drop visual status for each field
   */
  public isDragging: { [key: number]: boolean } = {};


  
  /**
   * @description
   * Handle the file selected from the HTML input.
   * Delegate the validation logic to `handleFile`
   * @param event The Selectrd event from the file.
   * @param number Validation typr identifier (1: Excel, 2: Imagen).
   * @param fieldName the field name form  (e.g., 'juridica').
   */
  public onFileSelected(event: Event, number: number, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    const file: File | null = input.files ? input.files[0] : null;

    this.handleFile(file, number, fieldName);
  }

  /**
   * @description
   * Handle the file that has been dragged and dropped.
   * Delegate the validation logic to `handleFile`
   * @param event The drag event (DragEvent).
   * @param number Validation typr identifier (1: Excel, 2: Imagen).
   * @param fieldName the field name form
   */
  public onFileDrag(event: DragEvent, number: number, fieldName: string): void {
    event.preventDefault();
    const file: File | null = event.dataTransfer ? event.dataTransfer.files[0] : null;

    this.handleFile(file, number, fieldName);
  }


  /**
   * @description
   * Lógica interna central para validar el tipo de archivo y actualizar el estado y los errores.
   * @param file El archivo a procesar.
   * @param number Validation typr identifier (1: Excel, 2: Imagen).
   * @param fieldNamethe Field name form
   */
  private handleFile(file: File | null, number: number, fieldName: string): void {
    let errorMessage = '';

    if (file) {
      
      if (number === 1) { 
        
        const isExcelType = this.acceptedExcelTypes.includes(file.type) || this.acceptedExcelTypes.some(ext => file.name.endsWith(ext));

        if (!isExcelType) {
          errorMessage = 'El archivo que subió no es compatible. Por favor, seleccione un archivo de Excel (.xls, .xlsx).';
        }
     
      } else if (number === 2) { 
        if (!this.acceptedImageTypes.includes(file.type)) {
          errorMessage = 'El archivo que subió no es compatible. Por favor, seleccione un archivo en formato JPEG, PNG o GIF.';
        }
      }
    }

  
    this.fileErrors[fieldName] = errorMessage;
    this.selectedFiles[fieldName] = errorMessage ? null : file;

   
  }

  /**
   * @description
   * Handle the event when a item is dragged over the drop zone
   * @param event Drag event.
   * @param index The index for monitoring the drag status (`isDragging`).
   */
  public onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    this.isDragging[index] = true;
  }


  /**
   * @description
   * Handles the event when an item get out the drop zone (drop zone)
   * @param event The drag event.
   * @param index  The index for monitoring the drag status (`isDragging`).
   */
  public onDragLeave(event: DragEvent, index: number): void {
    event.preventDefault();
    this.isDragging[index] = false;
  }


  /**
   * @description
   * Handles the event when an item is dropped in the designated area.
   * @param event The drop event
   * @param index Field index
   * @param caso The type file (1 o 2).
   * @param fieldName field name
   */
  public onDrop(event: DragEvent, index: number, caso: number, fieldName: string): void {
    event.preventDefault();
    this.isDragging[index] = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
    
      this.onFileDrag(event, caso, fieldName);
      
    }
  }


  //=======================================================================================================
  // VIABILITIES AND ACCODION TO THE STEP 2
  //=======================================================================================================


  /**
  * @description
  * Nombres de las claves de los campos de archivo en el formulario. Se utiliza para iterar sobre los archivos a enviar.
  */
  public keys: string[] = ['juridica', 'cumplimiento_normativo', 'finops', 'riesgo', 'seguridad_informacion', 'caso_negocio', 'estimacion_detalle'];


  /** 
   * @description
   * List of selected viability options 
   */
  selectedViabilidades: string[] = [];


  /** 
   * @description
   * Options available for selection 
   */
  viabilityOptions = [
    { value: 'cumplimiento_normativo', label: 'Cumplimiento normativo' },
    { value: 'juridica', label: 'Jurídica' },
    { value: 'seguridad_informacion', label: 'Seguridad de la información' },
    { value: 'riesgo', label: 'Riesgos' },
    { value: 'finops', label: 'Buenas prácticas (FinOps)' }
  ];


  /** 
   * @description
   * Control de list of the viability to upload
   */
  public showViabilityDropdown = false;


  /** 
   * @description
   * Control the open and close to the different accordion that there are in the step 2
   */
  public listAccordion: { [key: string]: boolean } = {
    showValidaciones : false,
    showBussiness :false,
    showInformacionDetalle :false,
    showCasoNegocio :false
  };


  /** 
   * @description
   * Control the open of the accordion to teh step 2. Use the ID to open a spefic accordion
   * @param accordionId This is the ID of the accordion that will be open
   */
  openAccordion(accordionId: string){
    Object.keys(this.listAccordion).forEach(key => {
      this.listAccordion[key] = key === accordionId;
    });
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
   * Returns the label of a viability option by its value 
   */
  getLabel(value: string): string {
    const item = this.viabilityOptions.find(v => v.value === value);
    return item ? item.label : '';
  }


  //======================================================================================
  // DATA OF THE FORM
  //======================================================================================

  
  /**
   * @description
   * Main object that stores all form data, separing steps
   */
  public formData = {
    step1: {
      po: '',
      pot: '',
      vp_sponsor: '',
      lider_negocio: '',
      tribu: '',
      squad: '',
      name_project: '',
      situacion_resolver: '',
      alcance:''
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
      ingreso_q3: '',
      caso_negocio: '',
      start_date:'',
      end_date:'',
      presupuesto: '',
      cantidad_dias:''

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
   * Constructor of the component. Inject the service `FormService` to handle the business logic 
   * @param formService Service for interacting with the API
   */
  constructor(public authService: AuthService,private formService: FormService, private router: Router) {}


  /**
   * @description
   * Angular life-cycle angular. Runs when the component is initialized.
   */
  ngOnInit(): void {

   const savedStep = localStorage.getItem('currentStep');
    if (savedStep) {
      this.currentStep = parseInt(savedStep, 10);
    }

     const savedData = localStorage.getItem('formData');
    if (savedData) {
        this.formData = JSON.parse(savedData);
    }
    
    this.getInfoForm();
    
  }

   getInfoForm() {

    this.formService.getInfoFormAttributes().subscribe({
      
      next: (data) => {
        this.tribus = data.tribus;
        this.sponsors = data.vpSponsors;
        this.squads = data.squads;
      },
      error: (err) => {
        console.error('Error in obtaining information from the Forms:', err);
      }
    });
  }



  //===============================================================
  // FUNTIONAL REQUIREMENTS
  //===============================================================

  /**
   * @description
   * Send all data and files of the form to the service
   * The data is collected in a object "FormData" to handle the files correctly
   */
  public submitForm(): void {
    this.statusLoad = 2;
    this.currentload = 1;

    const dataToSend = new FormData();

    for (const key in this.formData.step1) {
      if (Object.prototype.hasOwnProperty.call(this.formData.step1, key)) {
        dataToSend.append(`step1[${key}]`, this.formData.step1[key as keyof typeof this.formData.step1]);
      }
    }

    for (const key in this.formData.step2) {
      if (Object.prototype.hasOwnProperty.call(this.formData.step2, key)) {
        dataToSend.append(`step2[${key}]`, this.formData.step2[key as keyof typeof this.formData.step2]);
      }
    }

    this.keys.forEach((key: string) => {
      const value = this.selectedFiles[key];
      if (value) {
        dataToSend.append(`step2[${key}]`, value, value.name);
      }
    });

    this.formService.createDraft(dataToSend).subscribe({
      next: (res) => {
       
        this.currentload = 0;
        
        this.statusLoad = 1; // Successfull

        localStorage.removeItem('formData');
        localStorage.removeItem('currentStep');

      },
      error: (err) => {
        
        this.statusLoad = 0; 
        console.error('Error in creating a new project:', err);
      }
    });
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


  //===============================================================
  // AUXILIARY FUNCTION
  //===============================================================

  /**
   * @description
   * Valida que todos los campos del paso actual estén completos. Validate that all field in the current step are complete
   * If successful, proceed to the next step. If not, display an alert.
   */
  public isCurrentStepValid(): boolean {
    let fieldsToCheck: any;
    
 
    if (this.currentStep === 1) {
      fieldsToCheck = this.formData.step1;
    } else if (this.currentStep === 2) {
      fieldsToCheck = this.formData.step2; 
    } else {
      return false;
    }
    console.log(fieldsToCheck)
    for (const key in fieldsToCheck) {
      if (Object.prototype.hasOwnProperty.call(fieldsToCheck, key)) {
        const value = fieldsToCheck[key];
        console.log(key)
        console.log(value)
        
        if (!value) {
          return false;
        }
      }
    }

    return true;
  }

   /**
   * @description
   * Auxily fuction of  "isCurrentStepValid()" to continue with the logic to procced to the next step
   */
  public validateAndNext(): void {

    if (!this.isCurrentStepValid()) {
    
      this.errorMessage = `Por favor, completa todos los campos del Paso ${this.currentStep}.`;
      this.showModal = true;
    } else {
      
      if (this.currentStep === 2) {

       

        const data2 = new FormData();
        const file2 = this.selectedFiles["caso_negocio"];
        if (file2) {
          data2.append("business", JSON.stringify(this.formData));
          data2.append("data",file2, file2.name);
        };
        
        this.currentload = 1;
        
        this.formService.analyzeIa(data2).subscribe({
          next:(res) =>{
           
            this.currentload = 0;
            this.recomendationMessages['recomendacion2'] = res?.data?.content?.parts?.[0]?.text ?? '';

            this.saveState();
            this.currentStep++;
          },
          error:(error) =>{
            console.error('Error in obtaining the answer from the IA:', error);
            this.currentload = 0;
          }
        });

      } else {
        this.currentStep++; // Avanza al siguiente paso (ej. de 1 a 2)
        this.saveState();
      }
    }
  }


  /**
   * @description
   * Close the modal
   */
  public closeModal(): void {
    this.showModal = false;
    this.errorMessage = ''; 
  }

 
  /**
   * @description
   * Go back to the previous step
   */
  public prevStep(): void {
    this.currentStep--;
    this.saveState();
  }


  /**
   * @description
   * go back a step (usually from the final step to step 2) and reste the charnig status.
   */
  public prevStep2(): void {
    this.currentStep--;
    this.currentload = 0;
    this.statusLoad = 2;
  }


  /**
  * @description
  * Send all data and files of the form to the service
  * The data is collected in a object "FormData" to handle the files correctly
  */
  public saveState(): void {
    localStorage.setItem('currentStep', this.currentStep.toString());
    localStorage.setItem('formData', JSON.stringify(this.formData));
  }


  /** 
  * @description
  * Refresh teh page to redirect form
  */
  reloadForm() {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/form']);
    });
  }


  /** 
  * @description
  * Change the time format in the draft to make it easier
  * @param time Time in the format provided by Firebase
  */
  formatDate() {
    const inicioStr = this.formData.step2.start_date;
    const finStr = this.formData.step2.end_date;

    if (!inicioStr || !finStr) return;

    const inicio = new Date(inicioStr);
    const fin = new Date(finStr);

    if (fin < inicio) {
      alert("La fecha de fin no puede ser menor que la fecha de inicio.");

      // truco: esperar al siguiente ciclo para limpiar sin que Angular reescriba
      setTimeout(() => {
        this.formData.step2.end_date = "";
      });
    }

    this.formData.step2.cantidad_dias =this.calcularDiasEntreFechas();
  }


  /** 
  * @description
  * Refresh teh page to redirect form
  */
  calcularDiasEntreFechas(): string {
    const inicioStr = this.formData.step2.start_date;
    const finStr = this.formData.step2.end_date;

    if (!inicioStr || !finStr) return '';

    const inicio = new Date(inicioStr);
    const fin = new Date(finStr);

  
    const diffMs = fin.getTime() - inicio.getTime();


    const diffDias = diffMs / (1000 * 60 * 60 * 24);

    return diffDias >= 0 ? String(diffDias) : '';
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
          this.formData.step2.presupuesto = formattedValue;
          event.target.value = formattedValue;
      } else {
          this.formData.step2.presupuesto = '';
          event.target.value = '';
      }
  }

}
